/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.router.d.ts"/>

// Heavily inspired by https://github.com/rackt/react-router/ Thanks to authors

interface IRoute {
    name?: string;
    url?: string;
    data?: Object;
    handler: IBobrilComponent;
    keyBuilder?: (params: Params) => string;
    children?: Array<IRoute>;
    isDefault?: boolean;
    isNotFound?: boolean;
}

interface OutFindMatch {
    p: Params
}

((b: IBobrilStatic, window: Window) => {
    function emitOnHashChange() {
        b.invalidate();
        return false;
    }

    b.addEvent("hashchange", 100, emitOnHashChange);

    var PUSH = 0;
    var REPLACE = 1;
    var POP = 2;

    var actionType: number;

    function push(path: string) {
        actionType = PUSH;
        window.location.hash = path;
    }

    function replace(path: string) {
        actionType = REPLACE;
        var l = window.location;
        l.replace(l.pathname + l.search + "#" + path);
    }

    function pop() {
        actionType = POP;
        window.history.back();
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
            var source = pattern.replace(paramCompileMatcher, (match:string, paramName:string) => {
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

        return pattern.replace(paramInjectMatcher, (match:string, paramName:string) => {
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

    var activeRoutes: IRoute[];
    var activeParams: Params;

    function isAbsolute(url: string): boolean {
        return url[0] === "/";
    }

    function noop(): IBobrilNode {
        return null;
    }

    function rootNodeFactory(): IBobrilNode {
        var path = window.location.hash.substr(1);
        if (!isAbsolute(path)) path = "/" + path;
        var out: OutFindMatch = { p: {} };
        var matches = findMatch(path, rootRoutes, out) || [];
        activeRoutes = matches;
        activeParams = out.p;
        var fn: (otherdata?: any) => IBobrilNode = noop;
        for (var i = 0; i < matches.length; i++) {
            ((fninner: Function, r: IRoute, routeParams: Params) => {
                fn = (otherdata?: any) => {
                    var data: any = r.data || {};
                    b.assign(data, otherdata);
                    data.activeRouteHandler = fninner;
                    data.routeParams = routeParams;
                    return { key: r.keyBuilder ? r.keyBuilder(routeParams): undefined, data: data, component: r.handler };
                }
            })(fn, matches[i], activeParams);
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
            if (name) {
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

    function link(node: IBobrilNode, name: string, params?: Params): IBobrilNode {
        var r = nameRouteMap[name];
        var url = injectParams(r.url, params);
        node.data = node.data || {};
        node.data.active = isActive(name, params);
        node.data.url = url;
        b.postEnhance(node, {
            render(ctx: any, me: IBobrilNode) {
                me.attrs = me.attrs || {};
                if (me.tag === "a") {
                    me.attrs.href = "#" + url;
                }
                me.className = me.className || "";
                if (ctx.data.active) {
                    me.className += " active";
                }
            },
            onClick(ctx: any) {
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
