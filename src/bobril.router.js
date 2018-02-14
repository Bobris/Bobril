/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.router.d.ts"/>
/// <reference path="bobril.promise.d.ts"/>
(function (b, window) {
    var waitingForPopHashChange = -1;
    function emitOnHashChange() {
        if (waitingForPopHashChange >= 0)
            clearTimeout(waitingForPopHashChange);
        waitingForPopHashChange = -1;
        b.invalidate();
        return false;
    }
    b.addEvent("hashchange", 10, emitOnHashChange);
    var myAppHistoryDeepness = 0;
    var programPath = '';
    function push(path, inapp) {
        var l = window.location;
        if (inapp) {
            programPath = path;
            l.hash = path.substring(1);
            myAppHistoryDeepness++;
        }
        else {
            l.href = path;
        }
    }
    function replace(path, inapp) {
        var l = window.location;
        if (inapp) {
            programPath = path;
            l.replace(l.pathname + l.search + path);
        }
        else {
            l.replace(path);
        }
    }
    function pop(distance) {
        myAppHistoryDeepness -= distance;
        waitingForPopHashChange = setTimeout(emitOnHashChange, 50);
        window.history.go(-distance);
    }
    var rootRoutes;
    var nameRouteMap = {};
    function encodeUrl(url) {
        return encodeURIComponent(url).replace(/%20/g, "+");
    }
    function decodeUrl(url) {
        return decodeURIComponent(url.replace(/\+/g, " "));
    }
    function encodeUrlPath(path) {
        return String(path).split("/").map(encodeUrl).join("/");
    }
    var paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
    var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;
    var compiledPatterns = {};
    function compilePattern(pattern) {
        if (!(pattern in compiledPatterns)) {
            var paramNames = [];
            var source = pattern.replace(paramCompileMatcher, function (match, paramName) {
                if (paramName) {
                    paramNames.push(paramName);
                    return "([^/?#]+)";
                }
                else if (match === "*") {
                    paramNames.push("splat");
                    return "(.*?)";
                }
                else {
                    return "\\" + match;
                }
            });
            compiledPatterns[pattern] = {
                matcher: new RegExp("^" + source + "$", "i"),
                paramNames: paramNames
            };
        }
        return compiledPatterns[pattern];
    }
    function extractParamNames(pattern) {
        return compilePattern(pattern).paramNames;
    }
    // Extracts the portions of the given URL path that match the given pattern.
    // Returns null if the pattern does not match the given path.
    function extractParams(pattern, path) {
        var object = compilePattern(pattern);
        var match = decodeUrl(path).match(object.matcher);
        if (!match)
            return null;
        var params = {};
        var pn = object.paramNames;
        var l = pn.length;
        for (var i = 0; i < l; i++) {
            params[pn[i]] = match[i + 1];
        }
        return params;
    }
    // Returns a version of the given route path with params interpolated.
    // Throws if there is a dynamic segment of the route path for which there is no param.
    function injectParams(pattern, params) {
        params = params || {};
        var splatIndex = 0;
        return pattern.replace(paramInjectMatcher, function (match, paramName) {
            paramName = paramName || "splat";
            // If param is optional don't check for existence
            if (paramName.slice(-1) !== "?") {
                if (params[paramName] == null)
                    throw new Error("Missing \"" + paramName + "\" parameter for path \"" + pattern + "\"");
            }
            else {
                paramName = paramName.slice(0, -1);
                if (params[paramName] == null) {
                    return "";
                }
            }
            var segment;
            if (paramName === "splat" && Array.isArray(params[paramName])) {
                segment = params[paramName][splatIndex++];
                if (segment == null)
                    throw new Error("Missing splat # " + splatIndex + " for path \"" + pattern + "\"");
            }
            else {
                segment = params[paramName];
            }
            return encodeUrlPath(segment);
        });
    }
    function findMatch(path, rs, outParams) {
        var l = rs.length;
        var notFoundRoute;
        var defaultRoute;
        var params;
        for (var i = 0; i < l; i++) {
            var r = rs[i];
            if (r.isNotFound) {
                notFoundRoute = r;
                continue;
            }
            if (r.isDefault) {
                defaultRoute = r;
                continue;
            }
            if (r.children) {
                var res = findMatch(path, r.children, outParams);
                if (res) {
                    res.push(r);
                    return res;
                }
            }
            if (r.url) {
                params = extractParams(r.url, path);
                if (params) {
                    outParams.p = params;
                    return [r];
                }
            }
        }
        if (defaultRoute) {
            params = extractParams(defaultRoute.url, path);
            if (params) {
                outParams.p = params;
                return [defaultRoute];
            }
        }
        if (notFoundRoute) {
            params = extractParams(notFoundRoute.url, path);
            if (params) {
                outParams.p = params;
                return [notFoundRoute];
            }
        }
        return null;
    }
    ;
    var activeRoutes = [];
    var futureRoutes;
    var activeParams = Object.create(null);
    var nodesArray = [];
    var setterOfNodesArray = [];
    var urlRegex = /\:|\//g;
    function isInApp(name) {
        return !urlRegex.test(name);
    }
    function isAbsolute(url) {
        return url[0] === "/";
    }
    function noop() {
        return null;
    }
    function getSetterOfNodesArray(idx) {
        while (idx >= setterOfNodesArray.length) {
            setterOfNodesArray.push((function (a, i) {
                return (function (n) {
                    if (n)
                        a[i] = n;
                });
            })(nodesArray, idx));
        }
        return setterOfNodesArray[idx];
    }
    var firstRouting = true;
    function rootNodeFactory() {
        if (waitingForPopHashChange >= 0)
            return undefined;
        var browserPath = window.location.hash;
        var path = browserPath.substr(1);
        if (!isAbsolute(path))
            path = "/" + path;
        var out = { p: {} };
        var matches = findMatch(path, rootRoutes, out) || [];
        if (firstRouting) {
            firstRouting = false;
            currentTransition = { inApp: true, type: 2 /* Pop */, name: null, params: null };
            transitionState = -1;
            programPath = browserPath;
        }
        else {
            if (!currentTransition && matches.length > 0 && browserPath != programPath) {
                runTransition(createRedirectPush(matches[0].name, out.p));
            }
        }
        if (currentTransition && currentTransition.type === 2 /* Pop */ && transitionState < 0) {
            programPath = browserPath;
            currentTransition.inApp = true;
            if (currentTransition.name == null && matches.length > 0) {
                currentTransition.name = matches[0].name;
                currentTransition.params = out.p;
                nextIteration();
                if (currentTransition != null)
                    return undefined;
            }
            else
                return undefined;
        }
        if (currentTransition == null) {
            activeRoutes = matches;
            while (nodesArray.length > activeRoutes.length)
                nodesArray.pop();
            while (nodesArray.length < activeRoutes.length)
                nodesArray.push(null);
            activeParams = out.p;
        }
        var fn = noop;
        for (var i = 0; i < activeRoutes.length; i++) {
            (function (fninner, r, routeParams, i) {
                fn = function (otherdata) {
                    var data = r.data || {};
                    b.assign(data, otherdata);
                    data.activeRouteHandler = fninner;
                    data.routeParams = routeParams;
                    var handler = r.handler;
                    var res;
                    if (typeof handler === "function") {
                        res = handler(data);
                    }
                    else {
                        res = { key: undefined, ref: undefined, data: data, component: handler };
                    }
                    if (r.keyBuilder)
                        res.key = r.keyBuilder(routeParams);
                    else
                        res.key = r.name;
                    res.ref = getSetterOfNodesArray(i);
                    return res;
                };
            })(fn, activeRoutes[i], activeParams, i);
        }
        return fn();
    }
    function joinPath(p1, p2) {
        if (isAbsolute(p2))
            return p2;
        if (p1[p1.length - 1] === "/")
            return p1 + p2;
        return p1 + "/" + p2;
    }
    function registerRoutes(url, rs) {
        var l = rs.length;
        for (var i = 0; i < l; i++) {
            var r = rs[i];
            var u = url;
            var name = r.name;
            if (!name && url === "/") {
                name = "root";
                r.name = name;
                nameRouteMap[name] = r;
            }
            else if (name) {
                nameRouteMap[name] = r;
                u = joinPath(u, name);
            }
            if (r.isDefault) {
                u = url;
            }
            else if (r.isNotFound) {
                u = joinPath(url, "*");
            }
            else if (r.url) {
                u = joinPath(url, r.url);
            }
            r.url = u;
            if (r.children)
                registerRoutes(u, r.children);
        }
    }
    function routes(rootroutes) {
        if (!b.isArray(rootroutes)) {
            rootroutes = [rootroutes];
        }
        registerRoutes("/", rootroutes);
        rootRoutes = rootroutes;
        b.init(rootNodeFactory);
    }
    function route(config, nestedRoutes) {
        return { name: config.name, url: config.url, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, children: nestedRoutes };
    }
    function routeDefault(config) {
        return { name: config.name, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, isDefault: true };
    }
    function routeNotFound(config) {
        return { name: config.name, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, isNotFound: true };
    }
    function isActive(name, params) {
        if (params) {
            for (var prop in params) {
                if (params.hasOwnProperty(prop)) {
                    if (activeParams[prop] !== params[prop])
                        return false;
                }
            }
        }
        for (var i = 0, l = activeRoutes.length; i < l; i++) {
            if (activeRoutes[i].name === name) {
                return true;
            }
        }
        return false;
    }
    function urlOfRoute(name, params) {
        if (isInApp(name)) {
            var r = nameRouteMap[name];
            if (DEBUG) {
                if (rootRoutes == null)
                    throw Error('Cannot use urlOfRoute before defining routes');
                if (r == null)
                    throw Error('Route with name ' + name + ' if not defined in urlOfRoute');
            }
            return "#" + injectParams(r.url, params);
        }
        return name;
    }
    function link(node, name, params) {
        node.data = node.data || {};
        node.data.routeName = name;
        node.data.routeParams = params;
        b.postEnhance(node, {
            render: function (ctx, me) {
                var data = ctx.data;
                me.attrs = me.attrs || {};
                if (me.tag === "a") {
                    me.attrs.href = urlOfRoute(data.routeName, data.routeParams);
                }
                me.className = me.className || "";
                if (isActive(data.routeName, data.routeParams)) {
                    me.className += " active";
                }
            },
            onClick: function (ctx) {
                var data = ctx.data;
                runTransition(createRedirectPush(data.routeName, data.routeParams));
                return true;
            }
        });
        return node;
    }
    function createRedirectPush(name, params) {
        return {
            inApp: isInApp(name),
            type: 0 /* Push */,
            name: name,
            params: params || {}
        };
    }
    function createRedirectReplace(name, params) {
        return {
            inApp: isInApp(name),
            type: 1 /* Replace */,
            name: name,
            params: params || {}
        };
    }
    function createBackTransition(distance) {
        distance = distance || 1;
        return {
            inApp: myAppHistoryDeepness >= distance,
            type: 2 /* Pop */,
            name: null,
            params: {},
            distance: distance
        };
    }
    var currentTransition = null;
    var nextTransition = null;
    var transitionState = 0;
    function doAction(transition) {
        switch (transition.type) {
            case 0 /* Push */:
                push(urlOfRoute(transition.name, transition.params), transition.inApp);
                break;
            case 1 /* Replace */:
                replace(urlOfRoute(transition.name, transition.params), transition.inApp);
                break;
            case 2 /* Pop */:
                pop(transition.distance);
                break;
        }
        b.invalidate();
    }
    function nextIteration() {
        while (true) {
            if (transitionState >= 0 && transitionState < activeRoutes.length) {
                var node = nodesArray[transitionState];
                transitionState++;
                if (!node)
                    continue;
                var comp = node.component;
                if (!comp)
                    continue;
                var fn = comp.canDeactivate;
                if (!fn)
                    continue;
                var res = fn.call(comp, node.ctx, currentTransition);
                Promise.resolve(res).then(function (resp) {
                    if (resp === true) { }
                    else if (resp === false) {
                        currentTransition = null;
                        nextTransition = null;
                        if (programPath)
                            replace(programPath, true);
                        return;
                    }
                    else {
                        nextTransition = resp;
                    }
                    nextIteration();
                }).catch(function (err) { if (typeof console !== "undefined" && console.log)
                    console.log(err); });
                return;
            }
            else if (transitionState == activeRoutes.length) {
                if (nextTransition) {
                    if (currentTransition && currentTransition.type == 0 /* Push */) {
                        push(urlOfRoute(currentTransition.name, currentTransition.params), currentTransition.inApp);
                    }
                    currentTransition = nextTransition;
                    nextTransition = null;
                }
                transitionState = -1;
                if (!currentTransition.inApp || currentTransition.type === 2 /* Pop */) {
                    var tr = currentTransition;
                    if (!currentTransition.inApp)
                        currentTransition = null;
                    doAction(tr);
                    return;
                }
            }
            else if (transitionState === -1) {
                var out = { p: {} };
                if (currentTransition.inApp) {
                    futureRoutes = findMatch(urlOfRoute(currentTransition.name, currentTransition.params).substring(1), rootRoutes, out) || [];
                }
                else {
                    futureRoutes = [];
                }
                transitionState = -2;
            }
            else if (transitionState === -2 - futureRoutes.length) {
                if (nextTransition) {
                    transitionState = activeRoutes.length;
                    continue;
                }
                if (currentTransition.type !== 2 /* Pop */) {
                    var tr = currentTransition;
                    currentTransition = null;
                    doAction(tr);
                }
                else {
                    b.invalidate();
                }
                currentTransition = null;
                return;
            }
            else {
                if (nextTransition) {
                    transitionState = activeRoutes.length;
                    continue;
                }
                var rr = futureRoutes[futureRoutes.length + 1 + transitionState];
                transitionState--;
                var handler = rr.handler;
                var comp = null;
                if (typeof handler === "function") {
                    var node = handler({});
                    if (!node)
                        continue;
                    comp = node.component;
                }
                else {
                    comp = handler;
                }
                if (!comp)
                    continue;
                var fn = comp.canActivate;
                if (!fn)
                    continue;
                var res = fn.call(comp, currentTransition);
                if (res === true)
                    continue;
                Promise.resolve(res).then(function (resp) {
                    if (resp === true) { }
                    else if (resp === false) {
                        currentTransition = null;
                        nextTransition = null;
                        return;
                    }
                    else {
                        nextTransition = resp;
                    }
                    nextIteration();
                }).catch(function (err) { if (typeof console !== "undefined" && console.log)
                    console.log(err); });
                return;
            }
        }
    }
    function runTransition(transition) {
        if (currentTransition != null) {
            nextTransition = transition;
            return;
        }
        firstRouting = false;
        currentTransition = transition;
        transitionState = 0;
        nextIteration();
    }
    b.routes = routes;
    b.route = route;
    b.routeDefault = routeDefault;
    b.routeNotFound = routeNotFound;
    b.isRouteActive = isActive;
    b.urlOfRoute = urlOfRoute;
    b.createRedirectPush = createRedirectPush;
    b.createRedirectReplace = createRedirectReplace;
    b.createBackTransition = createBackTransition;
    b.runTransition = runTransition;
    b.link = link;
    b.getRoutes = function () { return rootRoutes; };
    b.getActiveRoutes = function () { return activeRoutes; };
    b.getActiveParams = function () { return activeParams; };
})(b, window);
