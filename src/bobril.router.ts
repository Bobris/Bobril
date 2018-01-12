/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.router.d.ts"/>
/// <reference path="bobril.promise.d.ts"/>

// Heavily inspired by https://github.com/rackt/react-router/ Thanks to authors

interface IRoute {
    name?: string;
    url?: string;
    data?: Object;
    handler: IRouteHandler;
    keyBuilder?: (params: Params) => string;
    children?: Array<IRoute>;
    isDefault?: boolean;
    isNotFound?: boolean;
}

interface OutFindMatch {
    p: Params
}

((b: IBobrilStatic, window: Window) => {
    var waitingForPopHashChange = -1;

    function emitOnHashChange() {
        if (waitingForPopHashChange >= 0) clearTimeout(waitingForPopHashChange);
        waitingForPopHashChange = -1;
        b.invalidate();
        return false;
    }

    b.addEvent("hashchange", 10, emitOnHashChange);

    let myAppHistoryDeepness = 0;
    let programPath = '';

    function push(path: string, inapp: boolean): void {
        var l = window.location;
        if (inapp) {
            programPath = path;
            l.hash = path.substring(1);
            myAppHistoryDeepness++;
        } else {
            l.href = path;
        }
    }

    function replace(path: string, inapp: boolean) {
        var l = window.location;
        if (inapp) {
            programPath = path;
            l.replace(l.pathname + l.search + path);
        } else {
            l.replace(path);
        }
    }

    function pop(distance: number) {
        myAppHistoryDeepness -= distance;
        waitingForPopHashChange = setTimeout(emitOnHashChange, 50);
        window.history.go(-distance);
    }

    var rootRoutes: IRoute[];
    var nameRouteMap: { [name: string]: IRoute } = {};

    function encodeUrl(url: string): string {
        return encodeURIComponent(url).replace(/%20/g, "+");
    }

    function decodeUrl(url: string): string {
        return decodeURIComponent(url.replace(/\+/g, " "));
    }

    function encodeUrlPath(path: string): string {
        return String(path).split("/").map(encodeUrl).join("/");
    }

    var paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
    var paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;

    var compiledPatterns: { [pattern: string]: { matcher: RegExp; paramNames: string[] } } = {};

    function compilePattern(pattern: string) {
        if (!(pattern in <any>compiledPatterns)) {
            var paramNames: Array<string> = [];
            var source = pattern.replace(paramCompileMatcher, (match: string, paramName: string) => {
                if (paramName) {
                    paramNames.push(paramName);
                    return "([^/?#]+)";
                } else if (match === "*") {
                    paramNames.push("splat");
                    return "(.*?)";
                } else {
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

    function extractParamNames(pattern: string): string[] {
        return compilePattern(pattern).paramNames;
    }

    // Extracts the portions of the given URL path that match the given pattern.
    // Returns null if the pattern does not match the given path.
    function extractParams(pattern: string, path: string): Params {
        var object = compilePattern(pattern);
        var match = decodeUrl(path).match(object.matcher);

        if (!match)
            return null;

        var params: { [name: string]: string } = {};

        var pn = object.paramNames;
        var l = pn.length;
        for (var i = 0; i < l; i++) {
            params[pn[i]] = match[i + 1];
        }

        return params;
    }

    // Returns a version of the given route path with params interpolated.
    // Throws if there is a dynamic segment of the route path for which there is no param.
    function injectParams(pattern: string, params?: Params) {
        params = params || {};

        var splatIndex = 0;

        return pattern.replace(paramInjectMatcher, (match: string, paramName: string) => {
            paramName = paramName || "splat";

            // If param is optional don't check for existence
            if (paramName.slice(-1) !== "?") {
                if (params[paramName] == null)
                    throw new Error("Missing \"" + paramName + "\" parameter for path \"" + pattern + "\"");
            } else {
                paramName = paramName.slice(0, -1);
                if (params[paramName] == null) {
                    return "";
                }
            }

            var segment: string;
            if (paramName === "splat" && Array.isArray(params[paramName])) {
                segment = params[paramName][splatIndex++];

                if (segment == null)
                    throw new Error("Missing splat # " + splatIndex + " for path \"" + pattern + "\"");
            } else {
                segment = params[paramName];
            }

            return encodeUrlPath(segment);
        });
    }

    function findMatch(path: string, rs: Array<IRoute>, outParams: OutFindMatch): IRoute[] {
        var l = rs.length;
        var notFoundRoute: IRoute;
        var defaultRoute: IRoute;
        var params: Params;
        for (var i = 0; i < l; i++) {
            var r = rs[i];
            if (r.isNotFound) {
                notFoundRoute = r; continue;
            }
            if (r.isDefault) {
                defaultRoute = r; continue;
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
    };

    var activeRoutes: IRoute[] = [];
    var futureRoutes: IRoute[];
    var activeParams: Params = Object.create(null);
    var nodesArray: IBobrilCacheNode[] = [];
    var setterOfNodesArray: ((node: IBobrilCacheNode) => void)[] = [];
    var urlRegex = /\:|\//g;

    function isInApp(name: string): boolean {
        return !urlRegex.test(name);
    }

    function isAbsolute(url: string): boolean {
        return url[0] === "/";
    }

    function noop(): IBobrilNode {
        return null;
    }

    function getSetterOfNodesArray(idx: number): (node: IBobrilCacheNode) => void {
        while (idx >= setterOfNodesArray.length) {
            setterOfNodesArray.push(((a: IBobrilCacheNode[], i: number) =>
                ((n: IBobrilCacheNode) => {
                    if (n)
                        a[i] = n
                }))(nodesArray, idx));
        }
        return setterOfNodesArray[idx];
    }

    var firstRouting = true;
    function rootNodeFactory(): IBobrilNode {
        if (waitingForPopHashChange >= 0)
            return undefined;
        let browserPath = window.location.hash;
        let path = browserPath.substr(1);
        if (!isAbsolute(path)) path = "/" + path;
        var out: OutFindMatch = { p: {} };
        var matches = findMatch(path, rootRoutes, out) || [];
        if (firstRouting) {
            firstRouting = false;
            currentTransition = { inApp: true, type: RouteTransitionType.Pop, name: null, params: null };
            transitionState = -1;
            programPath = browserPath;
        } else {
            if (!currentTransition && matches.length > 0 && browserPath != programPath) {
                runTransition(createRedirectPush(matches[0].name, out.p));
            }
        }
        if (currentTransition && currentTransition.type === RouteTransitionType.Pop && transitionState < 0) {
            programPath = browserPath;
            currentTransition.inApp = true;
            if (currentTransition.name == null && matches.length > 0) {
                currentTransition.name = matches[0].name;
                currentTransition.params = out.p;
                nextIteration();
                if (currentTransition != null)
                    return undefined;
            } else
                return undefined;
        }
        if (currentTransition == null) {
            activeRoutes = matches;
            while (nodesArray.length > activeRoutes.length) nodesArray.pop();
            while (nodesArray.length < activeRoutes.length) nodesArray.push(null);
            activeParams = out.p;
        }
        var fn: (otherdata?: any) => IBobrilNode = noop;
        for (var i = 0; i < activeRoutes.length; i++) {
            ((fninner: Function, r: IRoute, routeParams: Params, i: number) => {
                fn = (otherdata?: any) => {
                    var data: any = r.data || {};
                    b.assign(data, otherdata);
                    data.activeRouteHandler = fninner;
                    data.routeParams = routeParams;
                    var handler = r.handler;
                    var res: IBobrilNode;
                    if (typeof handler === "function") {
                        res = (<(data: any) => IBobrilNode>handler)(data);
                    } else {
                        res = { key: undefined, ref: undefined, data, component: handler };
                    }
                    if (r.keyBuilder) res.key = r.keyBuilder(routeParams); else res.key = r.name;
                    res.ref = getSetterOfNodesArray(i);
                    return res;
                }
            })(fn, activeRoutes[i], activeParams, i);
        }
        return fn();
    }

    function joinPath(p1: string, p2: string): string {
        if (isAbsolute(p2))
            return p2;
        if (p1[p1.length - 1] === "/")
            return p1 + p2;
        return p1 + "/" + p2;
    }

    function registerRoutes(url: string, rs: Array<IRoute>): void {
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
            } else if (r.isNotFound) {
                u = joinPath(url, "*");
            } else if (r.url) {
                u = joinPath(url, r.url);
            }
            r.url = u;
            if (r.children)
                registerRoutes(u, r.children);
        }
    }

    function routes(rootroutes: any): void {
        if (!b.isArray(rootroutes)) {
            rootroutes = [rootroutes];
        }
        registerRoutes("/", rootroutes);
        rootRoutes = rootroutes;
        b.init(rootNodeFactory);
    }

    function route(config: IRouteConfig, nestedRoutes?: Array<IRoute>): IRoute {
        return { name: config.name, url: config.url, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, children: nestedRoutes };
    }

    function routeDefault(config: IRouteConfig): IRoute {
        return { name: config.name, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, isDefault: true };
    }

    function routeNotFound(config: IRouteConfig): IRoute {
        return { name: config.name, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, isNotFound: true };
    }

    function isActive(name: string, params?: Params): boolean {
        if (params) {
            for (var prop in params) {
                if (params.hasOwnProperty(prop)) {
                    if (activeParams[prop] !== params[prop]) return false;
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

    function urlOfRoute(name: string, params?: Params): string {
        if (isInApp(name)) {
            var r = nameRouteMap[name];
            if (DEBUG) {
                if (rootRoutes == null) throw Error('Cannot use urlOfRoute before defining routes');
                if (r == null) throw Error('Route with name ' + name + ' if not defined in urlOfRoute');
            }
            return "#" + injectParams(r.url, params);
        }
        return name;
    }

    function link(node: IBobrilNode, name: string, params?: Params): IBobrilNode {
        node.data = node.data || {};
        node.data.routeName = name;
        node.data.routeParams = params;
        b.postEnhance(node, {
            render(ctx: any, me: IBobrilNode) {
                let data = ctx.data;
                me.attrs = me.attrs || {};
                if (me.tag === "a") {
                    me.attrs.href = urlOfRoute(data.routeName, data.routeParams);
                }
                me.className = me.className || "";
                if (isActive(data.routeName, data.routeParams)) {
                    me.className += " active";
                }
            },
            onClick(ctx: any) {
                let data = ctx.data;
                runTransition(createRedirectPush(data.routeName, data.routeParams));
                return true;
            }
        });
        return node;
    }

    function createRedirectPush(name: string, params?: Params): IRouteTransition {
        return {
            inApp: isInApp(name),
            type: RouteTransitionType.Push,
            name: name,
            params: params || {}
        }
    }

    function createRedirectReplace(name: string, params?: Params): IRouteTransition {
        return {
            inApp: isInApp(name),
            type: RouteTransitionType.Replace,
            name: name,
            params: params || {}
        }
    }

    function createBackTransition(distance?: number): IRouteTransition {
        distance = distance || 1;
        return {
            inApp: myAppHistoryDeepness >= distance,
            type: RouteTransitionType.Pop,
            name: null,
            params: {},
            distance
        }
    }

    var currentTransition: IRouteTransition = null;
    var nextTransition: IRouteTransition = null;
    var transitionState: number = 0;

    function doAction(transition: IRouteTransition) {
        switch (transition.type) {
            case RouteTransitionType.Push:
                push(urlOfRoute(transition.name, transition.params), transition.inApp);
                break;
            case RouteTransitionType.Replace:
                replace(urlOfRoute(transition.name, transition.params), transition.inApp);
                break;
            case RouteTransitionType.Pop:
                pop(transition.distance);
                break;
        }
        b.invalidate();
    }

    function nextIteration(): void {
        while (true) {
            if (transitionState >= 0 && transitionState < activeRoutes.length) {
                let node = nodesArray[transitionState];
                transitionState++;
                if (!node) continue;
                let comp = node.component;
                if (!comp) continue;
                let fn = comp.canDeactivate;
                if (!fn) continue;
                let res = fn.call(comp, node.ctx, currentTransition);
                (<any>Promise).resolve(res).then((resp: boolean | IRouteTransition) => {
                    if (resp === true) { }
                    else if (resp === false) {
                        currentTransition = null; nextTransition = null; 
                        if (programPath) replace(programPath, true);
                        return;
                    } else {
                        nextTransition = <IRouteTransition>resp;
                    }
                    nextIteration();
                }).catch((err: any) => { if (typeof console !== "undefined" && console.log) console.log(err); });
                return;
            } else if (transitionState == activeRoutes.length) {
                if (nextTransition) {
                    if (currentTransition && currentTransition.type == RouteTransitionType.Push) {
                        push(urlOfRoute(currentTransition.name, currentTransition.params), currentTransition.inApp);
                    }
                    currentTransition = nextTransition;
                    nextTransition = null;
                }
                transitionState = -1;
                if (!currentTransition.inApp || currentTransition.type === RouteTransitionType.Pop) {
                    let tr = currentTransition; if (!currentTransition.inApp) currentTransition = null;
                    doAction(tr);
                    return;
                }
            } else if (transitionState === -1) {
                var out: OutFindMatch = { p: {} };
                if (currentTransition.inApp) {
                    futureRoutes = findMatch(urlOfRoute(currentTransition.name, currentTransition.params).substring(1), rootRoutes, out) || [];
                } else {
                    futureRoutes = [];
                }
                transitionState = -2;
            } else if (transitionState === -2 - futureRoutes.length) {
                if (nextTransition) {
                    transitionState = activeRoutes.length;
                    continue;
                }
                if (currentTransition.type !== RouteTransitionType.Pop) {
                    let tr = currentTransition; currentTransition = null;
                    doAction(tr);
                } else {
                    b.invalidate();
                }
                currentTransition = null;
                return;
            } else {
                if (nextTransition) {
                    transitionState = activeRoutes.length;
                    continue;
                }
                let rr = futureRoutes[futureRoutes.length + 1 + transitionState];
                transitionState--;
                let handler = rr.handler;
                let comp: IBobrilComponent = null;
                if (typeof handler === "function") {
                    let node = (<(data: any) => IBobrilNode>handler)({});
                    if (!node) continue;
                    comp = node.component;
                } else {
                    comp = handler;
                }
                if (!comp) continue;
                let fn = comp.canActivate;
                if (!fn) continue;
                let res = fn.call(comp, currentTransition);
                if (res === true)
                    continue;
                (<any>Promise).resolve(res).then((resp: boolean | IRouteTransition) => {
                    if (resp === true) { }
                    else if (resp === false) {
                        currentTransition = null; nextTransition = null;
                        return;
                    } else {
                        nextTransition = <IRouteTransition>resp;
                    }
                    nextIteration();
                }).catch((err: any) => { if (typeof console !== "undefined" && console.log) console.log(err); });
                return;
            }
        }
    }

    function runTransition(transition: IRouteTransition): void {
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
    b.getRoutes = () => rootRoutes;
    b.getActiveRoutes = () => activeRoutes;
    b.getActiveParams = () => activeParams;
})(b, window);
