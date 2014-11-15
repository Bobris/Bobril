/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.router.d.ts"/>

(function (b, window) {
    function emitOnHashChange(ev, target, node) {
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
        l.replace(l.pathname + l.search + '#' + path);
    }

    function pop() {
        actionType = POP;
        window.history.back();
    }

    var rootRoutes;
    var nameRouteMap = {};

    function encodeURL(url) {
        return encodeURIComponent(url).replace(/%20/g, '+');
    }

    function decodeURL(url) {
        return decodeURIComponent(url.replace(/\+/g, ' '));
    }

    function encodeURLPath(path) {
        return String(path).split('/').map(encodeURL).join('/');
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
                    return '([^/?#]+)';
                } else if (match === '*') {
                    paramNames.push('splat');
                    return '(.*?)';
                } else {
                    return '\\' + match;
                }
            });

            compiledPatterns[pattern] = {
                matcher: new RegExp('^' + source + '$', 'i'),
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
        var match = decodeURL(path).match(object.matcher);

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
            paramName = paramName || 'splat';

            // If param is optional don't check for existence
            if (paramName.slice(-1) !== '?') {
                if (params[paramName] == null)
                    throw new Error('Missing "' + paramName + '" parameter for path "' + pattern + '"');
            } else {
                paramName = paramName.slice(0, -1);
                if (params[paramName] == null) {
                    return '';
                }
            }

            var segment;
            if (paramName === 'splat' && Array.isArray(params[paramName])) {
                segment = params[paramName][splatIndex++];

                if (segment == null)
                    throw new Error('Missing splat # ' + splatIndex + ' for path "' + pattern + '"');
            } else {
                segment = params[paramName];
            }

            return encodeURLPath(segment);
        });
    }

    function findMatch(path, rs, outParams) {
        var l = rs.length;
        for (var i = 0; i < l; i++) {
            var r = rs[i];
            if (r.children) {
                var res = findMatch(path, r.children, outParams);
                if (res) {
                    res.push(r);
                    return res;
                }
            }
            if (r.url) {
                var params = extractParams(r.url, path);
                if (params) {
                    outParams.p = params;
                    return [r];
                }
            }
        }
        return null;
    }
    ;

    function rootNodeFactory() {
        var path = window.location.hash.substr(1);
        if (!isAbsolute(path))
            path = "/" + path;
        var out = { p: {} };
        var matches = findMatch(path, rootRoutes, out) || [];
        var fn = noop;
        for (var i = 0; i < matches.length; i++) {
            (function (fninner, r, routeParams) {
                fn = function (otherdata) {
                    otherdata = otherdata || {};
                    otherdata.activeRouteHandler = fninner;
                    otherdata.routeParams = routeParams;
                    return { data: otherdata, component: r.handler };
                };
            })(fn, matches[i], out.p);
        }
        return fn();
    }

    function noop() {
        return null;
    }

    function isAbsolute(url) {
        return url[0] == "/";
    }

    function joinPath(p1, p2) {
        if (isAbsolute(p2))
            return p2;
        if (p1[p1.length - 1] == "/")
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
            if (r.url) {
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
        return { name: config.name, url: config.url, handler: config.handler, children: nestedRoutes };
    }

    function link(node, name, params) {
        var r = nameRouteMap[name];
        var url = injectParams(r.url, params);
        node.data = node.data || {};
        node.data.url = url;
        b.postEnhance(node, {
            init: function (ctx, me) {
                if (me.tag == "a") {
                    me.attrs = me.attrs || {};
                    me.attrs.href = "#" + url;
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
    b.link = link;
})(b, window);
//# sourceMappingURL=bobril.router.js.map
