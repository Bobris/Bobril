import {
    Component,
    IBobrilCtx,
    IBobrilComponent,
    IBobrilChildren,
    invalidate,
    addEvent,
    IBobrilCacheNode,
    IBobrilNode,
    assign,
    init,
    IBobrilStyles,
    postEnhance,
    IDataWithChildren,
    getCurrentCtx,
    getDomNode,
} from "./core";
import { style, styleDef } from "./cssInJs";
import { isArray, isFunction, isObject } from "./isFunc";
import { newHashObj, noop } from "./localHelpers";
import { preventClickingSpree } from "./mouseEvents";

declare var DEBUG: boolean;

declare module "./core" {
    interface IBobrilComponent<TData = any, TCtx extends IBobrilCtx<TData> = any> extends IBobrilEventsWithCtx<TCtx> {
        // this is "static" function that's why it does not have ctx - because it does not exists
        canActivate?(transition: IRouteTransition): IRouteCanResult;
        canDeactivate?(ctx: IBobrilCtx<TData>, transition: IRouteTransition): IRouteCanResult;
    }

    interface Component {
        //static canActivate?(transition: IRouteTransition): IRouteCanResult;
        canDeactivate?(transition: IRouteTransition): IRouteCanResult;
    }
}

export interface Params extends Record<string, string | undefined> {}

// Just marker interface
export interface IRoute {
    name?: string;
    url?: string;
    data?: Object;
    handler?: IRouteHandler;
    keyBuilder?: (params: Params) => string;
    children?: Array<IRoute>;
    isDefault?: boolean;
    isNotFound?: boolean;
}

export enum RouteTransitionType {
    Push,
    Replace,
    Pop,
}

export interface IRouteTransition {
    inApp: boolean;
    type: RouteTransitionType;
    name: string | undefined;
    params: Params | undefined;
    state: any;
    distance?: number;
}

export type IRouteCanResult = boolean | IRouteTransition | PromiseLike<boolean | IRouteTransition>;

export interface IRouteHandlerData {
    activeRouteHandler: () => IBobrilChildren;
    routeParams: Params;
}

export type IRouteHandler = IBobrilComponent | ((data: IRouteHandlerData | any) => IBobrilChildren);

export interface IRouteConfig {
    // name cannot contain ":" or "/"
    name?: string;
    url?: string;
    data?: Object;
    handler?: IRouteHandler;
    keyBuilder?: (params: Params) => string;
}

// Heavily inspired by https://github.com/rackt/react-router/ Thanks to authors

interface OutFindMatch {
    p: Params;
}

var waitingForPopHashChange = -1;

function emitOnHashChange() {
    if (waitingForPopHashChange >= 0) clearTimeout(waitingForPopHashChange);
    waitingForPopHashChange = -1;
    invalidate();
    return false;
}

addEvent("hashchange", 10, emitOnHashChange);

let historyDeepness = 0;
let programPath = "";

function history() {
    return window.history;
}

function push(path: string, inApp: boolean, state?: any): void {
    var l = window.location;
    if (inApp) {
        programPath = path;
        activeState = state;
        historyDeepness++;
        history().pushState({ historyDeepness, state }, "", path);
        invalidate();
    } else {
        l.href = path;
    }
}

function replace(path: string, inApp: boolean, state?: any) {
    var l = window.location;
    if (inApp) {
        programPath = path;
        activeState = state;
        history().replaceState({ historyDeepness, state }, "", path);
        invalidate();
    } else {
        l.replace(path);
    }
}

function pop(distance: number) {
    waitingForPopHashChange = setTimeout(emitOnHashChange, 50) as unknown as number;
    history().go(-distance);
}

let rootRoutes: IRoute[];
let nameRouteMap: { [name: string]: IRoute } = {};

export function encodeUrl(url: string): string {
    return encodeURIComponent(url).replace(/%20/g, "+");
}

export function decodeUrl(url: string): string {
    return decodeURIComponent(url.replace(/\+/g, " "));
}

export function encodeUrlPath(path: string | undefined): string {
    return String(path).split("/").map(encodeUrl).join("/");
}

const paramCompileMatcher = /(\/?):([a-zA-Z_$][a-zA-Z0-9_$]*)([?]?)|[*.()\[\]\\+|{}^$]/g;
const paramInjectMatcher = /(\/?)(?::([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*])/g;

let compiledPatterns: {
    [pattern: string]: { matcher: RegExp; paramNames: string[] };
} = {};

function compilePattern(pattern: string) {
    if (!(pattern in <any>compiledPatterns)) {
        var paramNames: Array<string> = [];
        var source = pattern.replace(
            paramCompileMatcher,
            (match: string, leadingSlash: string | undefined, paramName: string, optionalParamChar: string = "") => {
                if (paramName) {
                    paramNames.push(paramName);
                    return (leadingSlash ? "(?:/([^/?#]+))" : "([^/?#]+)") + optionalParamChar;
                } else if (match === "*") {
                    paramNames.push("splat");
                    return "(.*?)";
                } else {
                    return "\\" + match;
                }
            }
        );

        compiledPatterns[pattern] = {
            matcher: new RegExp("^" + source + (pattern.endsWith("/") ? "?" : "\\/?") + "$", "i"),
            paramNames: paramNames,
        };
    }

    return compiledPatterns[pattern]!;
}

/// Extracts the portions of the given URL path that match the given pattern.
/// Returns undefined if the pattern does not match the given path.
export function extractParams(pattern: string, path: string): Params | undefined {
    var object = compilePattern(pattern);
    var match = decodeUrl(path).match(object.matcher);

    if (!match) return undefined;

    var params: { [name: string]: string } = {};

    var pn = object.paramNames;
    var l = pn.length;
    for (var i = 0; i < l; i++) {
        params[pn[i]!] = match[i + 1]!;
    }

    return params;
}

/// Returns a version of the given route path with params interpolated.
/// Throws if there is a dynamic segment of the route path for which there is no param.
export function injectParams(pattern: string, params?: Params): string {
    params = params || {};

    var splatIndex = 0;

    return (
        pattern.replace(paramInjectMatcher, (_match: string, leadingSlash: string = "", paramName: string) => {
            paramName = paramName || "splat";

            // If param is optional don't check for existence
            if (paramName.slice(-1) !== "?") {
                if (params![paramName] == undefined)
                    throw new Error('Missing "' + paramName + '" parameter for path "' + pattern + '"');
            } else {
                paramName = paramName.slice(0, -1);
                if (params![paramName] == undefined) {
                    return "";
                }
            }

            var segment: string | undefined;
            if (paramName === "splat" && Array.isArray(params![paramName])) {
                segment = params![paramName]![splatIndex++];

                if (segment == undefined)
                    throw new Error("Missing splat # " + splatIndex + ' for path "' + pattern + '"');
            } else {
                segment = params![paramName];
            }

            return leadingSlash + encodeUrlPath(segment);
        }) || "/"
    );
}

function findMatch(path: string, rs: Array<IRoute>, outParams: OutFindMatch): IRoute[] | undefined {
    var l = rs.length;
    var notFoundRoute: IRoute | undefined;
    var defaultRoute: IRoute | undefined;
    var params: Params | undefined;
    for (var i = 0; i < l; i++) {
        var r = rs[i]!;
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
        params = extractParams(defaultRoute.url || "", path);
        if (params) {
            outParams.p = params;
            return [defaultRoute];
        }
    }
    if (notFoundRoute) {
        params = extractParams(notFoundRoute.url || "", path);
        if (params) {
            outParams.p = params;
            return [notFoundRoute];
        }
    }
    return undefined;
}

let activeRoutes: IRoute[] = [];
let futureRoutes: IRoute[];
let activeParams: Params = newHashObj();
let activeState: any = undefined;
let nodesArray: (IBobrilCacheNode | undefined)[] = [];
let setterOfNodesArray: ((node: IBobrilCacheNode | undefined) => void)[] = [];
const urlRegex = /.*(?:\:|\/).*/;

function isInApp(name: string): boolean {
    return !urlRegex.test(name);
}

function isAbsolute(url: string): boolean {
    return url[0] === "/";
}

const renderActiveRouter: IBobrilComponent = {
    render(_ctx: IBobrilCtx, me: IBobrilNode) {
        me.children = me.data.activeRouteHandler();
    },
};

function getSetterOfNodesArray(idx: number): (node: IBobrilCacheNode | undefined) => void {
    while (idx >= setterOfNodesArray.length) {
        setterOfNodesArray.push(
            ((a: (IBobrilCacheNode | undefined)[], ii: number) => (n: IBobrilCacheNode | undefined) => {
                if (n) {
                    var i = ii;
                    a[i] = n;
                    while (i-- > 0) {
                        a[i] = undefined;
                    }
                }
            })(nodesArray, setterOfNodesArray.length)
        );
    }
    return setterOfNodesArray[idx]!;
}

addEvent("popstate", 5, (ev: PopStateEvent) => {
    let newHistoryDeepness = ev.state?.historyDeepness;
    if (newHistoryDeepness != undefined) {
        activeState = ev.state.state;
        if (newHistoryDeepness != historyDeepness) invalidate();
        historyDeepness = newHistoryDeepness;
    }
    return false;
});

var firstRouting = true;
function rootNodeFactory(): IBobrilNode | undefined {
    if (waitingForPopHashChange >= 0) return undefined;
    if (history().state == undefined && historyDeepness != undefined) {
        history().replaceState({ historyDeepness: historyDeepness, state: activeState }, "");
    }
    let browserPath = window.location.hash;
    let path = browserPath.substr(1);
    if (!isAbsolute(path)) path = "/" + path;
    var out: OutFindMatch = { p: {} };
    var matches = findMatch(path, rootRoutes, out) || [];
    if (firstRouting) {
        firstRouting = false;
        currentTransition = {
            inApp: true,
            type: RouteTransitionType.Pop,
            name: undefined,
            params: undefined,
            state: undefined,
        };
        transitionState = -1;
        programPath = browserPath;
    } else {
        if (!currentTransition && matches.length > 0 && browserPath != programPath) {
            programPath = browserPath;
            runTransition(createRedirectReplace(matches[0]!.name!, out.p));
        }
    }
    if (currentTransition && currentTransition.type === RouteTransitionType.Pop && transitionState < 0) {
        programPath = browserPath;
        currentTransition.inApp = true;
        if (currentTransition.name == undefined && matches.length > 0) {
            currentTransition.name = matches[0]!.name;
            currentTransition.params = out.p;
            nextIteration();
            if (currentTransition != null) return undefined;
        } else return undefined;
    }
    if (currentTransition == undefined) {
        activeRoutes = matches;
        while (nodesArray.length > activeRoutes.length) nodesArray.shift();
        while (nodesArray.length < activeRoutes.length) nodesArray.unshift(undefined);
        activeParams = out.p;
    }
    var fn: (otherData?: any) => IBobrilNode | undefined = noop;
    for (var i = 0; i < activeRoutes.length; i++) {
        ((fnInner: Function, r: IRoute, routeParams: Params, i: number) => {
            fn = (otherData?: any) => {
                var data: any = r.data || {};
                assign(data, otherData);
                data.activeRouteHandler = fnInner;
                data.routeParams = routeParams;
                var handler = r.handler;
                var res: IBobrilNode;
                if (isFunction(handler)) {
                    res = { key: undefined, ref: undefined, children: handler(data) };
                } else {
                    res = {
                        key: undefined,
                        ref: undefined,
                        data,
                        component: handler || renderActiveRouter,
                    };
                }
                if (r.keyBuilder) res.key = r.keyBuilder(routeParams);
                else res.key = r.name;
                res.ref = getSetterOfNodesArray(i);
                return res;
            };
        })(fn, activeRoutes[i]!, activeParams, i);
    }
    return fn();
}

function joinPath(p1: string, p2: string): string {
    if (isAbsolute(p2)) return p2;
    if (p1[p1.length - 1] === "/") return p1 + p2;
    return p1 + "/" + p2;
}

function registerRoutes(url: string, rs: Array<IRoute>): void {
    var l = rs.length;
    for (var i = 0; i < l; i++) {
        var r = rs[i]!;
        var u = url;
        var name = r.name;
        if (!name && url === "/") {
            name = "root";
            r.name = name;
            nameRouteMap[name] = r;
        } else if (name) {
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
        if (r.children) registerRoutes(u, r.children);
    }
}

export function routes(root: IRoute | IRoute[]): void {
    if (!isArray(root)) {
        root = <IRoute[]>[root];
    }
    registerRoutes("/", <IRoute[]>root);
    rootRoutes = <IRoute[]>root;
    init(rootNodeFactory);
}

export function route(config: IRouteConfig, nestedRoutes?: Array<IRoute>): IRoute {
    return {
        name: config.name,
        url: config.url,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        children: nestedRoutes,
    };
}

export function routeDefault(config: IRouteConfig): IRoute {
    return {
        name: config.name,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        isDefault: true,
    };
}

export function routeNotFound(config: IRouteConfig): IRoute {
    return {
        name: config.name,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        isNotFound: true,
    };
}

export function isActive(name: string | undefined, params?: Params): boolean {
    if (params) {
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                if (activeParams[prop] !== params[prop]) return false;
            }
        }
    }
    for (var i = 0, l = activeRoutes.length; i < l; i++) {
        if (activeRoutes[i]!.name === name) {
            return true;
        }
    }
    return false;
}

export function urlOfRoute(name: string, params?: Params): string {
    if (isInApp(name)) {
        var r = nameRouteMap[name]!;
        if (DEBUG) {
            if (rootRoutes == undefined) throw Error("Cannot use urlOfRoute before defining routes");
            if (r == undefined) throw Error("Route with name " + name + " if not defined in urlOfRoute");
        }
        return "#" + injectParams(r.url!, params);
    }
    return name;
}

export const activeStyleDef = styleDef("active");

export function Link(data: {
    name: string;
    params?: Params;
    state?: any;
    replace?: boolean;
    style?: IBobrilStyles;
    activeStyle?: IBobrilStyles;
    children: IBobrilChildren;
}): IBobrilNode {
    return style(
        {
            tag: "a",
            component: {
                id: "link",
                onClick() {
                    runTransition(
                        (data.replace ? createRedirectReplace : createRedirectPush)(data.name, data.params, data.state)
                    );
                    return true;
                },
            },
            children: data.children,
            attrs: { href: urlOfRoute(data.name, data.params) },
        },
        isActive(data.name, data.params)
            ? data.activeStyle != undefined
                ? data.activeStyle
                : [data.style, activeStyleDef]
            : data.style
    );
}

export function link(node: IBobrilNode, name: string, params?: Params, state?: any): IBobrilNode {
    node.data = node.data || {};
    node.data.routeName = name;
    node.data.routeParams = params;
    node.data.routeState = state;
    postEnhance(node, {
        render(ctx: any, me: IBobrilNode) {
            let data = ctx.data;
            if (me.tag === "a") {
                me.attrs = me.attrs || {};
                me.attrs.href = urlOfRoute(data.routeName, data.routeParams);
            }
            me.className = me.className || "";
            if (isActive(data.routeName, data.routeParams)) {
                me.className += " active";
            }
        },
        onClick(ctx: any) {
            let data = ctx.data;
            runTransition(createRedirectPush(data.routeName, data.routeParams, data.routeState));
            return true;
        },
    });
    return node;
}

export function createRedirectPush(name: string, params?: Params, state?: any): IRouteTransition {
    return {
        inApp: isInApp(name),
        type: RouteTransitionType.Push,
        name: name,
        params: params || {},
        state: state ?? activeState,
    };
}

export function createRedirectReplace(name: string, params?: Params, state?: any): IRouteTransition {
    return {
        inApp: isInApp(name),
        type: RouteTransitionType.Replace,
        name: name,
        params: params || {},
        state: state ?? activeState,
    };
}

export function createBackTransition(distance?: number): IRouteTransition {
    distance = distance || 1;
    return {
        inApp: historyDeepness - distance >= 0,
        type: RouteTransitionType.Pop,
        name: undefined,
        params: {},
        state: undefined,
        distance,
    };
}

var currentTransition: IRouteTransition | null = null;
var nextTransition: IRouteTransition | null = null;
var transitionState: number = 0;

function doAction(transition: IRouteTransition) {
    switch (transition.type) {
        case RouteTransitionType.Push:
            push(urlOfRoute(transition.name!, transition.params), transition.inApp, transition.state);
            break;
        case RouteTransitionType.Replace:
            replace(urlOfRoute(transition.name!, transition.params), transition.inApp, transition.state);
            break;
        case RouteTransitionType.Pop:
            pop(transition.distance!);
            break;
    }
}

function nextIteration(): void {
    while (true) {
        if (transitionState >= 0 && transitionState < activeRoutes.length) {
            let node = nodesArray[transitionState];
            transitionState++;
            if (!node) continue;
            let comp = node.component;
            if (!comp && isArray(node.children)) {
                node = node.children[0];
                if (!node) continue;
                comp = node.component;
            }
            if (!comp) continue;
            let fn = comp.canDeactivate;
            if (!fn) continue;
            let res = fn.call(comp, node.ctx!, currentTransition!);
            if (res === true) continue;
            (<any>Promise)
                .resolve(res)
                .then((resp: boolean | IRouteTransition) => {
                    if (resp === true) {
                    } else if (resp === false) {
                        currentTransition = null;
                        nextTransition = null;
                        if (programPath) replace(programPath, true);
                        return;
                    } else {
                        nextTransition = <IRouteTransition>resp;
                    }
                    nextIteration();
                })
                .catch((err: any) => {
                    console.log(err);
                });
            return;
        } else if (transitionState == activeRoutes.length) {
            if (nextTransition) {
                if (currentTransition && currentTransition.type == RouteTransitionType.Push) {
                    push(urlOfRoute(currentTransition.name!, currentTransition.params), currentTransition.inApp);
                }
                currentTransition = nextTransition;
                nextTransition = null;
            }
            transitionState = -1;
            if (!currentTransition!.inApp || currentTransition!.type === RouteTransitionType.Pop) {
                let tr = currentTransition;
                if (!currentTransition!.inApp) currentTransition = null;
                doAction(tr!);
                return;
            }
        } else if (transitionState === -1) {
            var out: OutFindMatch = { p: {} };
            if (currentTransition!.inApp) {
                futureRoutes =
                    findMatch(
                        urlOfRoute(currentTransition!.name!, currentTransition!.params).substring(1),
                        rootRoutes,
                        out
                    ) || [];
            } else {
                futureRoutes = [];
            }
            transitionState = -2;
        } else if (transitionState === -2 - futureRoutes.length) {
            if (nextTransition) {
                transitionState = activeRoutes.length;
                continue;
            }
            if (currentTransition!.type !== RouteTransitionType.Pop) {
                let tr = currentTransition;
                currentTransition = null;
                doAction(tr!);
            } else {
                invalidate();
            }
            currentTransition = null;
            return;
        } else {
            if (nextTransition) {
                transitionState = activeRoutes.length;
                continue;
            }
            let rr = futureRoutes[futureRoutes.length + 1 + transitionState]!;
            transitionState--;
            let handler = rr.handler;
            let comp: IBobrilComponent | undefined = undefined;
            if (isFunction(handler)) {
                let node = handler({ activeRouteHandler: () => undefined, routeParams: currentTransition!.params! });
                if (!node || !isObject(node) || isArray(node)) continue;
                comp = node.component;
            } else {
                comp = handler;
            }
            if (!comp) continue;
            let fn = comp.canActivate;
            if (!fn) continue;
            let res = fn.call(comp, currentTransition!);
            if (res === true) continue;
            Promise.resolve<boolean | IRouteTransition>(res)
                .then((resp: boolean | IRouteTransition) => {
                    if (resp === true) {
                    } else if (resp === false) {
                        currentTransition = null;
                        nextTransition = null;
                        return;
                    } else {
                        nextTransition = resp;
                    }
                    nextIteration();
                })
                .catch((err: any) => {
                    console.log(err);
                });
            return;
        }
    }
}

export let transitionRunCount = 1;

export function runTransition(transition: IRouteTransition): void {
    transitionRunCount++;
    preventClickingSpree();
    if (currentTransition != null) {
        nextTransition = transition;
        return;
    }
    firstRouting = false;
    currentTransition = transition;
    transitionState = 0;
    nextIteration();
}

export interface IAnchorData extends IDataWithChildren {
    name?: string;
    params?: Params;
    onAnchor?: (el: HTMLElement) => boolean;
}

export function Anchor({ children, name, params, onAnchor }: IAnchorData): IBobrilNode {
    return anchor(children, name, params, onAnchor);
}

interface IBobrilAnchorCtx extends IBobrilCtx {
    l: number;
} // shortened lastTransitionRunCount

export function anchor(
    children: IBobrilChildren,
    name?: string,
    params?: Params,
    onAnchor?: (el: HTMLElement) => boolean
): IBobrilNode {
    return {
        children,
        component: {
            id: "anchor",
            postUpdateDom(ctx: IBobrilAnchorCtx, me: IBobrilCacheNode) {
                handleAnchorRoute(ctx, me, name, params, onAnchor);
            },
            postInitDom(ctx: IBobrilAnchorCtx, me: IBobrilCacheNode) {
                handleAnchorRoute(ctx, me, name, params, onAnchor);
            },
        },
    };
}

function handleAnchorRoute(
    ctx: IBobrilAnchorCtx,
    me: IBobrilCacheNode,
    name?: string,
    params?: Params,
    onAnchor?: (el: HTMLElement) => boolean
) {
    let routeName: string | undefined;
    if (name) {
        routeName = name;
    } else {
        const firstChild = (me.children && me.children[0]) as IBobrilCacheNode;
        routeName = firstChild.attrs && firstChild.attrs.id;
    }
    if (!isActive(routeName, params)) {
        ctx.l = 0;
        return;
    }
    if (ctx.l === transitionRunCount) {
        return;
    }

    const element = getDomNode(me) as HTMLElement;
    (onAnchor && onAnchor(element)) || element.scrollIntoView();
    ctx.l = transitionRunCount;
}

export function getRoutes() {
    return rootRoutes;
}

export function getActiveRoutes() {
    return activeRoutes;
}

export function getActiveParams() {
    return activeParams;
}

export function getActiveState() {
    return activeState;
}

export function useCanDeactivate(handler: NonNullable<Component["canDeactivate"]>): void {
    const ctx = getCurrentCtx();

    if (ctx) {
        ctx.me.component.canDeactivate = function (ctx: IBobrilCtx, transition: IRouteTransition): IRouteCanResult {
            return handler.call(ctx, transition);
        };
    }
}
