/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.router.d.ts"/>
(function (b, window) {
    function emitOnHashChange() {
        b.invalidate();
        return false;
    }
    b.addEvent("hashchange", 100, emitOnHashChange);
    var PUSH = 0;
    var REPLACE = 1;
    var POP = 2;
    var actionType;
    function push(path) {
        actionType = PUSH;
        window.location.hash = path;
    }
    function replace(path) {
        actionType = REPLACE;
        var l = window.location;
        l.replace(l.pathname + l.search + "#" + path);
    }
    function pop() {
        actionType = POP;
        window.history.back();
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
    var activeRoutes;
    var activeParams;
    function isAbsolute(url) {
        return url[0] === "/";
    }
    function noop() {
        return null;
    }
    function rootNodeFactory() {
        var path = window.location.hash.substr(1);
        if (!isAbsolute(path))
            path = "/" + path;
        var out = { p: {} };
        var matches = findMatch(path, rootRoutes, out) || [];
        activeRoutes = matches;
        activeParams = out.p;
        var fn = noop;
        for (var i = 0; i < matches.length; i++) {
            (function (fninner, r, routeParams) {
                fn = function (otherdata) {
                    var data = r.data || {};
                    b.assign(data, otherdata);
                    data.activeRouteHandler = fninner;
                    data.routeParams = routeParams;
                    return { key: r.keyBuilder ? r.keyBuilder(routeParams) : undefined, data: data, component: r.handler };
                };
            })(fn, matches[i], activeParams);
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
            if (name) {
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
    function link(node, name, params) {
        var r = nameRouteMap[name];
        var url = injectParams(r.url, params);
        node.data = node.data || {};
        node.data.active = isActive(name, params);
        node.data.url = url;
        b.postEnhance(node, {
            render: function (ctx, me) {
                me.attrs = me.attrs || {};
                if (me.tag === "a") {
                    me.attrs.href = "#" + url;
                }
                me.className = me.className || "";
                if (ctx.data.active) {
                    me.className += " active";
                }
            },
            onClick: function (ctx) {
                push(ctx.data.url);
                return true;
            }
        });
        return node;
    }
    b.routes = routes;
    b.route = route;
    b.routeDefault = routeDefault;
    b.routeNotFound = routeNotFound;
    b.link = link;
})(b, window);
//# sourceMappingURL=bobril.router.js.map