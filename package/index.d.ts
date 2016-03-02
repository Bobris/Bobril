export declare type IBobrilChild = boolean | string | IBobrilNode;
export declare type IBobrilChildren = IBobrilChild | IBobrilChildArray;
export interface IBobrilChildArray extends Array<IBobrilChildren> {
}
export declare type IBobrilCacheChildren = string | IBobrilCacheNode[];
export declare type IBobrilShimStyleMapping = {
    [name: string]: (style: any, value: any, oldName: string) => void;
};
export interface IBobrilRoot {
    f: () => IBobrilChildren;
    e: HTMLElement;
    c: IBobrilCacheNode[];
    p: IBobrilCacheNode;
}
export declare type IBobrilRoots = {
    [id: string]: IBobrilRoot;
};
export interface IBobrilAttributes {
    id?: string;
    href?: string;
    value?: boolean | string | string[];
    tabindex?: number;
    [name: string]: any;
}
export interface IBobrilComponent {
    id?: string;
    init?(ctx: IBobrilCtx, me: IBobrilCacheNode): void;
    render?(ctx: IBobrilCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    postRender?(ctx: IBobrilCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    shouldChange?(ctx: IBobrilCtx, me: IBobrilNode, oldMe: IBobrilCacheNode): boolean;
    postInitDom?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
    postUpdateDom?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
    destroy?(ctx: IBobrilCtx, me: IBobrilNode, element: HTMLElement): void;
    shouldStopBubble?(ctx: IBobrilCtx, name: string, param: Object): boolean;
    shouldStopBroadcast?(ctx: IBobrilCtx, name: string, param: Object): boolean;
    onChange?(ctx: IBobrilCtx, value: any): void;
    onSelectionChange?(ctx: IBobrilCtx, event: ISelectionChangeEvent): void;
    onKeyDown?(ctx: IBobrilCtx, event: IKeyDownUpEvent): boolean;
    onKeyUp?(ctx: IBobrilCtx, event: IKeyDownUpEvent): boolean;
    onKeyPress?(ctx: IBobrilCtx, event: IKeyPressEvent): boolean;
    onClick?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onDoubleClick?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onContextMenu?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onMouseDown?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onMouseUp?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onMouseOver?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onMouseEnter?(ctx: IBobrilCtx, event: IBobrilMouseEvent): void;
    onMouseLeave?(ctx: IBobrilCtx, event: IBobrilMouseEvent): void;
    onMouseIn?(ctx: IBobrilCtx, event: IBobrilMouseEvent): void;
    onMouseOut?(ctx: IBobrilCtx, event: IBobrilMouseEvent): void;
    onMouseMove?(ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onMouseWheel?(ctx: IBobrilCtx, event: IBobrilMouseWheelEvent): boolean;
    onPointerDown?(ctx: IBobrilCtx, event: IBobrilPointerEvent): boolean;
    onPointerMove?(ctx: IBobrilCtx, event: IBobrilPointerEvent): boolean;
    onPointerUp?(ctx: IBobrilCtx, event: IBobrilPointerEvent): boolean;
    onPointerCancel?(ctx: IBobrilCtx, event: IBobrilPointerEvent): boolean;
    onFocus?(ctx: IBobrilCtx): void;
    onBlur?(ctx: IBobrilCtx): void;
    onFocusIn?(ctx: IBobrilCtx): void;
    onFocusOut?(ctx: IBobrilCtx): void;
    onDragStart?(ctx: IBobrilCtx, dndCtx: IDndStartCtx): boolean;
    onDrag?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;
    onDragEnd?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;
    onDragOver?(ctx: IBobrilCtx, dndCtx: IDndOverCtx): boolean;
    onDrop?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;
    canActivate?(transition: IRouteTransition): IRouteCanResult;
    canDeactivate?(ctx: IBobrilCtx, transition: IRouteTransition): IRouteCanResult;
}
export interface IBobrilNodeCommon {
    tag?: string;
    key?: string;
    className?: string;
    style?: any;
    attrs?: IBobrilAttributes;
    children?: IBobrilChildren;
    ref?: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
    cfg?: any;
    component?: IBobrilComponent;
    data?: any;
}
export interface IBobrilNodeWithTag extends IBobrilNodeCommon {
    tag: string;
}
export interface IBobrilNodeWithComponent extends IBobrilNodeCommon {
    component: IBobrilComponent;
}
export interface IBobrilNodeWithChildren extends IBobrilNodeCommon {
    children: IBobrilChildren;
}
export declare type IBobrilNode = IBobrilNodeWithTag | IBobrilNodeWithComponent | IBobrilNodeWithChildren;
export interface IBobrilCacheNode {
    tag: string;
    key: string;
    className: string;
    style: any;
    attrs: IBobrilAttributes;
    children: IBobrilCacheChildren;
    ref: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
    cfg: any;
    component: IBobrilComponent;
    data: any;
    element: Node | Node[];
    parent: IBobrilCacheNode;
    ctx: IBobrilCtx;
}
export interface IBobrilCtx {
    data?: any;
    me?: IBobrilCacheNode;
    cfg?: any;
    refs?: {
        [name: string]: IBobrilCacheNode;
    };
}
export interface IBobrilScroll {
    node: IBobrilCacheNode;
}
export interface ISelectionChangeEvent {
    startPosition: number;
    endPosition: number;
}
export declare let assign: {
    <T, U>(target: T, source: U): T & U;
    <T, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: any, ...sources: any[]): any;
};
export declare function flatten(a: any | any[]): any[];
export declare function setSetValue(callback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void): (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void;
export declare function ieVersion(): any;
export declare function createNode(n: IBobrilNode, parentNode: IBobrilCacheNode, createInto: Element, createBefore: Node): IBobrilCacheNode;
export declare function vdomPath(n: Node): IBobrilCacheNode[];
export declare function deref(n: Node): IBobrilCacheNode;
export declare function updateNode(n: IBobrilNode, c: IBobrilCacheNode, createInto: Element, createBefore: Node, deepness: number): IBobrilCacheNode;
export declare function getDomNode(c: IBobrilCacheNode): Node;
export declare function callPostCallbacks(): void;
export declare function updateChildren(element: Element, newChildren: IBobrilChildren, cachedChildren: IBobrilCacheChildren, parentNode: IBobrilCacheNode, createBefore: Node, deepness: number): IBobrilCacheNode[];
export declare const now: () => number;
export declare function addEvent(name: string, priority: number, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean): void;
export declare function emitEvent(name: string, ev: any, target: Node, node: IBobrilCacheNode): boolean;
export declare function setBeforeFrame(callback: () => void): () => void;
export declare function setAfterFrame(callback: (root: IBobrilCacheChildren) => void): (root: IBobrilCacheChildren) => void;
export declare function ignoreShouldChange(): void;
export declare function setInvalidate(inv: (ctx?: Object, deepness?: number) => void): (ctx?: Object, deepness?: number) => void;
export declare var invalidate: (ctx?: Object, deepness?: number) => void;
export declare function addRoot(factory: () => IBobrilChildren, element?: HTMLElement, parent?: IBobrilCacheNode): string;
export declare function removeRoot(id: string): void;
export declare function getRoots(): IBobrilRoots;
export declare function init(factory: () => any, element?: HTMLElement): void;
export declare function setBeforeInit(callback: (cb: () => void) => void): void;
export declare function bubble(node: IBobrilCacheNode, name: string, param: any): IBobrilCtx;
export declare function broadcast(name: string, param: any): IBobrilCtx;
export declare function preEnhance(node: IBobrilNode, methods: IBobrilComponent): IBobrilNode;
export declare function postEnhance(node: IBobrilNode, methods: IBobrilComponent): IBobrilNode;
export declare function preventDefault(event: Event): void;
export declare function cloneNode(node: IBobrilNode): IBobrilNode;
export declare function setStyleShim(name: string, action: (style: any, value: any, oldName: string) => void): void;
export declare function uptime(): number;
export declare function lastFrameDuration(): number;
export declare function frame(): number;
export declare function invalidated(): boolean;
export declare const enum BobrilDeviceCategory {
    Mobile = 0,
    Tablet = 1,
    Desktop = 2,
    LargeDesktop = 3,
}
export interface IBobrilMedia {
    width: number;
    height: number;
    orientation: number;
    deviceCategory: BobrilDeviceCategory;
    portrait: boolean;
}
export declare function accDeviceBreaks(newBreaks?: number[][]): number[][];
export declare function getMedia(): IBobrilMedia;
export interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}
export declare const asap: (callback: () => void) => void;
export declare function select(node: IBobrilCacheNode, start: number, end?: number): void;
export interface IKeyDownUpEvent {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    which: number;
}
export interface IKeyPressEvent {
    charCode: number;
}
export interface IBobrilMouseEvent {
    x: number;
    y: number;
    button: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}
export declare const enum BobrilPointerType {
    Mouse = 0,
    Touch = 1,
    Pen = 2,
}
export interface IBobrilPointerEvent extends IBobrilMouseEvent {
    id: number;
    type: BobrilPointerType;
}
export interface IBobrilMouseWheelEvent extends IBobrilMouseEvent {
    dx: number;
    dy: number;
}
export declare function isMouseOwner(ctx: any): boolean;
export declare function isMouseOwnerEvent(): boolean;
export declare function registerMouseOwner(ctx: any): void;
export declare function releaseMouseOwner(): void;
export declare function revalidateMouseIn(): void;
export declare function nodeOnPoint(x: number, y: number): IBobrilCacheNode;
export declare const pointersDownCount: () => number;
export declare const firstPointerDownId: () => number;
export declare const ignoreClick: (x: number, y: number) => void;
export declare function focused(): IBobrilCacheNode;
export declare function focus(node: IBobrilCacheNode): boolean;
export declare function addOnScroll(callback: (info?: IBobrilScroll) => void): void;
export declare function removeOnScroll(callback: (info?: IBobrilScroll) => void): void;
export declare function isScrollable(el: Element): [boolean, boolean];
export declare function getWindowScroll(): [number, number];
export declare function nodePagePos(node: IBobrilCacheNode): [number, number];
export declare const enum DndOp {
    None = 0,
    Link = 1,
    Copy = 2,
    Move = 3,
}
export declare const enum DndEnabledOps {
    None = 0,
    Link = 1,
    Copy = 2,
    LinkCopy = 3,
    Move = 4,
    MoveLink = 5,
    MoveCopy = 6,
    MoveCopyLink = 7,
}
export interface IDndCtx {
    id: number;
    listData(): string[];
    hasData(type: string): boolean;
    getData(type: string): any;
    enabledOperations: DndEnabledOps;
    operation: DndOp;
    overNode: IBobrilCacheNode;
    cursor: string;
    started: boolean;
    beforeDrag: boolean;
    system: boolean;
    local: boolean;
    ended: boolean;
    distanceToStart: number;
    startX: number;
    startY: number;
    totalX: number;
    totalY: number;
    lastX: number;
    lastY: number;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}
export interface IDndStartCtx extends IDndCtx {
    addData(type: string, data: any): boolean;
    setEnabledOps(ops: DndEnabledOps): void;
    setDragNodeView(view: (dnd: IDndCtx) => IBobrilNode): void;
}
export interface IDndOverCtx extends IDndCtx {
    setOperation(operation: DndOp): void;
}
export declare function anyActiveDnd(): IDndCtx;
export declare const getDnds: () => IDndCtx[];
export interface Params {
    [name: string]: string;
}
export interface IRoute {
    name?: string;
    url?: string;
    data?: Object;
    handler: IRouteHandler;
    keyBuilder?: (params: Params) => string;
    children?: Array<IRoute>;
    isDefault?: boolean;
    isNotFound?: boolean;
}
export declare const enum RouteTransitionType {
    Push = 0,
    Replace = 1,
    Pop = 2,
}
export interface IRouteTransition {
    inApp: boolean;
    type: RouteTransitionType;
    name: string;
    params: Params;
    distance?: number;
}
export declare type IRouteCanResult = boolean | Thenable<boolean> | IRouteTransition | Thenable<IRouteTransition>;
export declare type IRouteHandler = IBobrilComponent | ((data: any) => IBobrilNode);
export interface IRouteConfig {
    name?: string;
    url?: string;
    data?: Object;
    handler: IRouteHandler;
    keyBuilder?: (params: Params) => string;
}
export declare function routes(rootroutes: IRoute | IRoute[]): void;
export declare function route(config: IRouteConfig, nestedRoutes?: Array<IRoute>): IRoute;
export declare function routeDefault(config: IRouteConfig): IRoute;
export declare function routeNotFound(config: IRouteConfig): IRoute;
export declare function isActive(name: string, params?: Params): boolean;
export declare function urlOfRoute(name: string, params?: Params): string;
export declare function link(node: IBobrilNode, name: string, params?: Params): IBobrilNode;
export declare function createRedirectPush(name: string, params?: Params): IRouteTransition;
export declare function createRedirectReplace(name: string, params?: Params): IRouteTransition;
export declare function createBackTransition(distance?: number): IRouteTransition;
export declare function runTransition(transition: IRouteTransition): void;
export declare function getRoutes(): IRoute[];
export declare function getActiveRoutes(): IRoute[];
export declare function getActiveParams(): Params;
export declare type IBobrilStyleDef = string;
export declare type IBobrilStyle = Object | IBobrilStyleDef | boolean;
export declare type IBobrilStyles = IBobrilStyle | IBobrilStyle[];
export declare function style(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode;
export declare function styleDef(style: any, pseudo?: {
    [name: string]: any;
}, nameHint?: string): IBobrilStyleDef;
export declare function styleDefEx(parent: IBobrilStyleDef | IBobrilStyleDef[], style: any, pseudo?: {
    [name: string]: any;
}, nameHint?: string): IBobrilStyleDef;
export declare function invalidateStyles(): void;
export declare function sprite(url: string, color?: string | (() => string), width?: number, height?: number, left?: number, top?: number): IBobrilStyleDef;
export declare function setBundlePngPath(path: string): void;
export declare function spriteb(width: number, height: number, left: number, top: number): IBobrilStyleDef;
export declare function spritebc(color: () => string, width: number, height: number, left: number, top: number): IBobrilStyleDef;
export declare function injectCss(css: string): void;
export declare function asset(path: string): string;
export declare function svgPie(x: number, y: number, radiusBig: number, radiusSmall: number, startAngle: number, endAngle: number): string;
export declare function svgCircle(x: number, y: number, radius: number): string;
export declare function svgRect(x: number, y: number, width: number, height: number): string;
export declare function withKey(node: IBobrilNode, key: string): IBobrilNode;
export declare function styledDiv(children: IBobrilChildren, ...styles: any[]): IBobrilNode;
export declare function createVirtualComponent<TData>(component: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode;
export declare function createComponent<TData extends Object>(component: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode;
export declare function createDerivedComponent<TData>(original: (data?: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent): (data?: TData, children?: IBobrilChildren) => IBobrilNode;
export declare function createElement(name: any, props: any): IBobrilNode;
export declare const __spread: {
    <T, U>(target: T, source: U): T & U;
    <T, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: any, ...sources: any[]): any;
};
