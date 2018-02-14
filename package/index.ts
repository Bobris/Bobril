// Bobril.Core

export type IBobrilChild<T = any> = boolean | number | string | IBobrilNode<T> | null | undefined;
export type IBobrilChildren = IBobrilChild | IBobrilChildArray | null | undefined;
export interface IBobrilChildArray extends Array<IBobrilChildren> {}
export type IBobrilCacheChildren = string | IBobrilCacheNode[] | undefined;
export type IBobrilShimStyleMapping = {
    [name: string]: null | ((style: any, value: any, oldName: string) => void);
};

export interface IDisposable {
    dispose(): void;
}

export type IDisposeFunction = (ctx?: any) => void;
export type IDisposableLike = IDisposable | IDisposeFunction;

export interface IBobrilRoot {
    // Factory function
    f: (rootData: IBobrilRoot) => IBobrilChildren;
    // Root element
    e: HTMLElement | undefined;
    // Virtual Dom Cache - just for backwards compatibility true cache is in n
    c: IBobrilCacheChildren;
    // Optional Logical parent
    p: IBobrilCacheNode | undefined;
    // Virtual Dom Cache Node
    n: IBobrilCacheNode | undefined;
}

export type ICtxClass = {
    new (data?: any, me?: IBobrilCacheNode): BobrilCtx<any>;
};

export type IBobrilRoots = { [id: string]: IBobrilRoot };

export interface IBobrilAttributes {
    id?: string;
    href?: string;
    value?: boolean | string | string[] | IProp<boolean | string | string[]>;
    tabindex?: number;
    tabIndex?: never;
    [name: string]: any;
}

export interface IBobrilComponent {
    // parent component of derived/overriding component
    super?: IBobrilComponent;
    // if id of old node is different from new node it is considered completely different so init will be called before render directly
    // it does prevent calling render method twice on same node
    id?: string;
    ctxClass?: ICtxClass;
    // called before new node in virtual dom should be created, me members (tag, attrs, children, ...) could be modified, ctx is initialized to { data: me.data||{}, me: me, cfg: fromParent }
    init?(ctx: IBobrilCtx, me: IBobrilCacheNode): void;
    // in case of update after shouldChange returns true, you can do any update/init tasks, ctx.data is updated to me.data and oldMe.component updated to me.component before calling this
    // in case of init this is called after init method, oldMe is equal to undefined in that case
    render?(ctx: IBobrilCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    // called after all children are rendered, but before updating own attrs
    // so this is useful for kind of layout in JS features
    postRender?(ctx: IBobrilCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    // return false when whole subtree should not be changed from last time, you can still update any me members except key, default implementation always return true
    shouldChange?(ctx: IBobrilCtx, me: IBobrilNode, oldMe: IBobrilCacheNode): boolean;
    // called from children to parents order for new nodes
    postInitDom?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
    // called from children to parents order for updated nodes
    postUpdateDom?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
    // called from children to parents order for updated nodes but in every frame even when render was not run
    postUpdateDomEverytime?(ctx: IBobrilCtx, me: IBobrilCacheNode, element: HTMLElement): void;
    // called just before removing node from dom
    destroy?(ctx: IBobrilCtx, me: IBobrilNode, element: HTMLElement): void;
    // called when bubbling event to parent so you could stop bubbling without preventing default handling
    shouldStopBubble?(ctx: IBobrilCtx, name: string, param: Object): boolean;
    // called when broadcast wants to dive in this node so you could silence broadcast for you and your children
    shouldStopBroadcast?(ctx: IBobrilCtx, name: string, param: Object): boolean;

    // called on input element after any change with new value (string|boolean)
    onChange?(ctx: IBobrilCtx, value: any): void;
    // called on string input element when selection or caret position changes
    onSelectionChange?(ctx: IBobrilCtx, event: ISelectionChangeEvent): void;

    onKeyDown?(ctx: IBobrilCtx, event: IKeyDownUpEvent): boolean;
    onKeyUp?(ctx: IBobrilCtx, event: IKeyDownUpEvent): boolean;
    onKeyPress?(ctx: IBobrilCtx, event: IKeyPressEvent): boolean;

    // called on input element after click/tap
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

    // this component gained focus
    onFocus?(ctx: IBobrilCtx): void;
    // this component lost focus
    onBlur?(ctx: IBobrilCtx): void;
    // focus moved from outside of this element to some child of this element
    onFocusIn?(ctx: IBobrilCtx): void;
    // focus moved from inside of this element to some outside element
    onFocusOut?(ctx: IBobrilCtx): void;

    // if drag should start, bubbled
    onDragStart?(ctx: IBobrilCtx, dndCtx: IDndStartCtx): boolean;

    // broadcasted after drag started/moved/changed
    onDrag?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;
    // broadcasted after drag ended even if without any action
    onDragEnd?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;

    // Do you want to allow to drop here? bubbled
    onDragOver?(ctx: IBobrilCtx, dndCtx: IDndOverCtx): boolean;
    // User want to drop dragged object here - do it - onDragOver before had to set you target
    onDrop?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;

    // this is "static" function that's why it does not have ctx - because it does not exists
    canActivate?(transition: IRouteTransition): IRouteCanResult;
    canDeactivate?(ctx: IBobrilCtx, transition: IRouteTransition): IRouteCanResult;
}

// new node should at least have tag or component or children member
export interface IBobrilNodeCommon<T = any> {
    tag?: string;
    key?: string;
    className?: string;
    style?: any;
    attrs?: IBobrilAttributes;
    children?: IBobrilChildren;
    ref?: [IBobrilCtx, string] | ((node: IBobrilCacheNode | undefined) => void);
    /// set this for children to be set to their ctx.cfg, if undefined your own ctx.cfg will be used anyway; but better to use `extendCfg`
    cfg?: any;
    component?: IBobrilComponent;
    // Bobril does not touch this, it is completely for user passing custom data to component
    // It is very similar to props in ReactJs, it must be immutable, you have access to this through ctx.data
    data?: T;
}

export type IBobrilNode<T = any> = IBobrilNodeCommon<T> & object;

export interface IBobrilCacheNode {
    tag: string | undefined;
    key: string | undefined;
    className: string | undefined;
    style: any;
    attrs: IBobrilAttributes | undefined;
    children: IBobrilCacheChildren;
    ref: [IBobrilCtx, string] | ((node: IBobrilCacheNode | undefined) => void);
    cfg: any;
    component: IBobrilComponent;
    data: any;
    element: Node | Node[] | undefined;
    parent: IBobrilCacheNode | undefined;
    ctx: IBobrilCtx | undefined;
    /// Originally created or updated from - used for partial updates
    orig: IBobrilNode;
}

export interface IBobrilCtx {
    // properties passed from parent component, treat it as immutable
    data?: any;
    me: IBobrilCacheNode;
    // properties passed from parent component automatically, but could be extended for children to IBobrilNode.cfg
    cfg?: any;
    refs?: { [name: string]: IBobrilCacheNode | undefined };
    disposables?: IDisposableLike[];
}

export class BobrilCtx<TData> implements IBobrilCtx {
    constructor(data?: TData, me?: IBobrilCacheNode) {
        this.data = data!;
        this.me = me!;
        this.cfg = undefined;
        this.refs = undefined;
        this.disposables = undefined;
        this.$bobxCtx = undefined;
    }
    $bobxCtx: object | undefined;
    data: TData;
    me: IBobrilCacheNode;
    cfg?: any;
    refs?: { [name: string]: IBobrilCacheNode | undefined };
    disposables?: IDisposableLike[];
}

export interface IBobrilScroll {
    node: IBobrilCacheNode | undefined;
}

export interface ISelectionChangeEvent {
    startPosition: number;
    // endPosition tries to be also caret position (does not work on any IE or Edge 12)
    endPosition: number;
}

declare var DEBUG: boolean;

// PureFuncs: assert, isArray, isObject, flatten

function assert(shouldBeTrue: boolean, messageIfFalse?: string) {
    if (DEBUG && !shouldBeTrue) throw Error(messageIfFalse || "assertion failed");
}

export const isArray = Array.isArray;

const emptyComponent = {};

function createTextNode(content: string): Text {
    return document.createTextNode(content);
}

function createEl(name: string): HTMLElement {
    return document.createElement(name);
}

function null2undefined<T>(value: T | null | undefined): T | undefined {
    return value === null ? undefined : value;
}

export function isNumber(val: any): val is number {
    return typeof val == "number";
}

export function isString(val: any): val is string {
    return typeof val == "string";
}

export function isFunction(val: any): val is Function {
    return typeof val == "function";
}

export function isObject(val: any): val is { [name: string]: any } {
    return typeof val === "object";
}

if (Object.assign == null) {
    Object.assign = function assign(target: Object, ..._sources: Object[]): Object {
        if (target == null) throw new TypeError("Target in assign cannot be undefined or null");
        let totalArgs = arguments.length;
        for (let i = 1; i < totalArgs; i++) {
            let source = arguments[i];
            if (source == null) continue;
            let keys = Object.keys(source);
            let totalKeys = keys.length;
            for (let j = 0; j < totalKeys; j++) {
                let key = keys[j];
                (<any>target)[key] = (<any>source)[key];
            }
        }
        return target;
    };
}

export let assign = Object.assign;

export function flatten(a: any | any[]): any[] {
    if (!isArray(a)) {
        if (a == null || a === false || a === true) return [];
        return [a];
    }
    a = a.slice(0);
    let aLen = a.length;
    for (let i = 0; i < aLen; ) {
        let item = a[i];
        if (isArray(item)) {
            a.splice.apply(a, [i, 1].concat(item));
            aLen = a.length;
            continue;
        }
        if (item == null || item === false || item === true) {
            a.splice(i, 1);
            aLen--;
            continue;
        }
        i++;
    }
    return a;
}

var inSvg: boolean = false;
var inNotFocusable: boolean = false;
var updateCall: Array<Function> = [];
var updateInstance: Array<IBobrilCacheNode> = [];
var setValueCallback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void = (
    el: Element,
    _node: IBobrilCacheNode,
    newValue: any,
    oldValue: any
): void => {
    if (newValue !== oldValue) (<any>el)[tValue] = newValue;
};

export function setSetValue(
    callback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void
): (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void {
    var prev = setValueCallback;
    setValueCallback = callback;
    return prev;
}

function newHashObj(): { [name: string]: any } {
    return Object.create(null);
}

var vendors = ["Webkit", "Moz", "ms", "O"];
var testingDivStyle: any = document.createElement("div").style;
function testPropExistence(name: string) {
    return isString(testingDivStyle[name]);
}

var mapping: IBobrilShimStyleMapping = newHashObj();

var isUnitlessNumber = {
    boxFlex: true,
    boxFlexGroup: true,
    columnCount: true,
    flex: true,
    flexGrow: true,
    flexNegative: true,
    flexPositive: true,
    flexShrink: true,
    fontWeight: true,
    lineClamp: true,
    lineHeight: true,
    opacity: true,
    order: true,
    orphans: true,
    strokeDashoffset: true,
    widows: true,
    zIndex: true,
    zoom: true
};

function renamer(newName: string) {
    return (style: any, value: any, oldName: string) => {
        style[newName] = value;
        style[oldName] = undefined;
    };
}

function renamerPx(newName: string) {
    return (style: any, value: any, oldName: string) => {
        if (isNumber(value)) {
            style[newName] = value + "px";
        } else {
            style[newName] = value;
        }
        style[oldName] = undefined;
    };
}

function pxAdder(style: any, value: any, name: string) {
    if (isNumber(value)) style[name] = value + "px";
}

export function ieVersion() {
    return (<any>document).documentMode;
}

function shimStyle(newValue: any) {
    var k = Object.keys(newValue);
    for (var i = 0, l = k.length; i < l; i++) {
        var ki = k[i];
        var mi = mapping[ki];
        var vi = newValue[ki];
        if (vi === undefined) continue; // don't want to map undefined
        if (mi === undefined) {
            if (DEBUG) {
                if (ki === "float" && window.console && console.error)
                    console.error("In style instead of 'float' you have to use 'cssFloat'");
                if (/-/.test(ki) && window.console && console.warn)
                    console.warn("Style property " + ki + " contains dash (must use JS props instead of css names)");
            }
            if (testPropExistence(ki)) {
                mi = (<any>isUnitlessNumber)[ki] === true ? null : pxAdder;
            } else {
                var titleCaseKi = ki.replace(/^\w/, match => match.toUpperCase());
                for (var j = 0; j < vendors.length; j++) {
                    if (testPropExistence(vendors[j] + titleCaseKi)) {
                        mi = ((<any>isUnitlessNumber)[ki] === true ? renamer : renamerPx)(vendors[j] + titleCaseKi);
                        break;
                    }
                }
                if (mi === undefined) {
                    mi = (<any>isUnitlessNumber)[ki] === true ? null : pxAdder;
                    if (
                        DEBUG &&
                        window.console &&
                        console.warn &&
                        ["overflowScrolling", "touchCallout"].indexOf(ki) < 0 // whitelist rare but useful
                    )
                        console.warn("Style property " + ki + " is not supported in this browser");
                }
            }
            mapping[ki] = mi;
        }
        if (mi !== null) mi(newValue, vi, ki);
    }
}

function removeProperty(s: any, name: string) {
    (<any>s)[name] = "";
}

function setStyleProperty(s: any, name: string, value: string) {
    if (isString(value)) {
        let len = value.length;
        if (len > 11 && value.substr(len - 11, 11) === " !important") {
            s.setProperty(hyphenateStyle(name), value.substr(0, len - 11), "important");
            return;
        }
    }
    s[name] = value;
}

function updateStyle(el: HTMLElement, newStyle: any, oldStyle: any) {
    var s = el.style;
    if (isObject(newStyle)) {
        shimStyle(newStyle);
        var rule: string;
        if (isObject(oldStyle)) {
            for (rule in oldStyle) {
                if (!(rule in newStyle)) removeProperty(s, rule);
            }
            for (rule in newStyle) {
                var v = newStyle[rule];
                if (v !== undefined) {
                    if (oldStyle[rule] !== v) setStyleProperty(s, rule, v);
                } else {
                    removeProperty(s, rule);
                }
            }
        } else {
            if (oldStyle) s.cssText = "";
            for (rule in newStyle) {
                var v = newStyle[rule];
                if (v !== undefined) setStyleProperty(s, rule, v);
            }
        }
    } else if (newStyle) {
        s.cssText = newStyle;
    } else {
        if (isObject(oldStyle)) {
            for (rule in oldStyle) {
                removeProperty(s, rule);
            }
        } else if (oldStyle) {
            s.cssText = "";
        }
    }
}

function setClassName(el: Element, className: string) {
    if (inSvg) el.setAttribute("class", className);
    else (<HTMLElement>el).className = className;
}

const focusableTag = /^input$|^select$|^textarea$|^button$/;
const tabindexStr = "tabindex";

function isNaturalyFocusable(tag: string | undefined, attrs: IBobrilAttributes | undefined): boolean {
    if (tag == null) return false;
    if (focusableTag.test(tag)) return true;
    if (tag === "a" && attrs != null && attrs.href != null) return true;
    return false;
}

function updateElement(
    n: IBobrilCacheNode,
    el: Element,
    newAttrs: IBobrilAttributes | undefined,
    oldAttrs: IBobrilAttributes,
    notFocusable: boolean
): IBobrilAttributes {
    var attrName: string, newAttr: any, oldAttr: any, valueOldAttr: any, valueNewAttr: any;
    let wasTabindex = false;
    if (newAttrs != null)
        for (attrName in newAttrs) {
            newAttr = newAttrs[attrName];
            oldAttr = oldAttrs[attrName];
            if (notFocusable && attrName === tabindexStr) {
                newAttr = -1;
                wasTabindex = true;
            } else if (attrName === tValue && !inSvg) {
                if (isFunction(newAttr)) {
                    oldAttrs[bValue] = newAttr;
                    newAttr = newAttr();
                }
                valueOldAttr = oldAttr;
                valueNewAttr = newAttr;
                oldAttrs[attrName] = newAttr;
                continue;
            }
            if (oldAttr !== newAttr) {
                oldAttrs[attrName] = newAttr;
                if (inSvg) {
                    if (attrName === "href") el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);
                    else el.setAttribute(attrName, newAttr);
                } else if (attrName in el && !(attrName === "list" || attrName === "form")) {
                    (<any>el)[attrName] = newAttr;
                } else el.setAttribute(attrName, newAttr);
            }
        }
    if (notFocusable && !wasTabindex && isNaturalyFocusable(n.tag, newAttrs)) {
        el.setAttribute(tabindexStr, "-1");
        oldAttrs[tabindexStr] = -1;
    }
    if (newAttrs == null) {
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined) {
                if (notFocusable && attrName === tabindexStr) continue;
                if (attrName === bValue) continue;
                oldAttrs[attrName] = undefined;
                el.removeAttribute(attrName);
            }
        }
    } else {
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined && !(attrName in newAttrs)) {
                if (notFocusable && attrName === tabindexStr) continue;
                if (attrName === bValue) continue;
                oldAttrs[attrName] = undefined;
                el.removeAttribute(attrName);
            }
        }
    }
    if (valueNewAttr !== undefined) {
        setValueCallback(el, n, valueNewAttr, valueOldAttr);
    }
    return oldAttrs;
}

function pushInitCallback(c: IBobrilCacheNode) {
    var cc = c.component;
    if (cc) {
        let fn = cc.postInitDom;
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
    }
}

function pushUpdateCallback(c: IBobrilCacheNode) {
    var cc = c.component;
    if (cc) {
        let fn = cc.postUpdateDom;
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
        fn = cc.postUpdateDomEverytime;
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
    }
}

function pushUpdateEverytimeCallback(c: IBobrilCacheNode) {
    var cc = c.component;
    if (cc) {
        let fn = cc.postUpdateDomEverytime;
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
    }
}

function findCfg(parent: IBobrilCacheNode | undefined): any {
    var cfg: any;
    while (parent) {
        cfg = parent.cfg;
        if (cfg !== undefined) break;
        if (parent.ctx) {
            cfg = parent.ctx.cfg;
            break;
        }
        parent = parent.parent;
    }
    return cfg;
}

function setRef(
    ref: [IBobrilCtx, string] | ((node: IBobrilCacheNode | undefined) => void),
    value: IBobrilCacheNode | undefined
) {
    if (ref == null) return;
    if (isFunction(ref)) {
        (<(node: IBobrilCacheNode | undefined) => void>ref)(value);
        return;
    }
    var ctx = (<[IBobrilCtx, string]>ref)[0];
    var refs = ctx.refs;
    if (refs == null) {
        refs = newHashObj();
        ctx.refs = refs;
    }
    refs[(<[IBobrilCtx, string]>ref)[1]] = value;
}

let focusRootStack: IBobrilCacheNode[] = [];
let focusRootTop: IBobrilCacheNode | null = null;

export function registerFocusRoot(ctx: IBobrilCtx) {
    focusRootStack.push(ctx.me);
    addDisposable(ctx, unregisterFocusRoot);
    ignoreShouldChange();
}

export function unregisterFocusRoot(ctx: IBobrilCtx) {
    let idx = focusRootStack.indexOf(ctx.me);
    if (idx !== -1) {
        focusRootStack.splice(idx, 1);
        ignoreShouldChange();
    }
}

let currentCtx: IBobrilCtx | undefined;

export function getCurrentCtx() {
    return currentCtx;
}

export function setCurrentCtx(ctx: IBobrilCtx | undefined) {
    currentCtx = ctx;
}

export function createNode(
    n: IBobrilNode,
    parentNode: IBobrilCacheNode | undefined,
    createInto: Element,
    createBefore: Node | null
): IBobrilCacheNode {
    var c = <IBobrilCacheNode>{
        // This makes CacheNode just one object class = fast
        tag: n.tag,
        key: n.key,
        ref: n.ref,
        className: n.className,
        style: n.style,
        attrs: n.attrs,
        children: n.children,
        component: n.component,
        data: n.data,
        cfg: undefined,
        parent: parentNode,
        element: undefined,
        ctx: undefined,
        orig: n
    };
    var backupInSvg = inSvg;
    var backupInNotFocusable = inNotFocusable;
    var component = c.component;
    var el: Node | undefined;
    setRef(c.ref, c);
    if (component) {
        var ctx: IBobrilCtx;
        if (component.ctxClass) {
            ctx = new component.ctxClass(c.data || {}, c);
            if (ctx.data === undefined) ctx.data = c.data || {};
            if (ctx.me === undefined) ctx.me = c;
        } else {
            ctx = { data: c.data || {}, me: c, cfg: undefined };
        }
        ctx.cfg = n.cfg === undefined ? findCfg(parentNode) : n.cfg;
        c.ctx = ctx;
        currentCtx = ctx;
        if (component.init) {
            component.init(ctx, c);
        }
        if (beforeRenderCallback !== emptyBeforeRenderCallback) beforeRenderCallback(n, RenderPhase.Create);
        if (component.render) {
            component.render(ctx, c);
        }
        currentCtx = undefined;
    } else {
        if (DEBUG) Object.freeze(n);
    }
    var tag = c.tag;
    if (tag === "-") {
        // Skip update
        c.tag = undefined;
        c.children = undefined;
        return c;
    }
    var children = c.children;
    var inSvgForeignObject = false;
    if (isNumber(children)) {
        children = "" + children;
        c.children = children;
    }
    if (tag === undefined) {
        if (isString(children)) {
            el = createTextNode(<string>children);
            c.element = el;
            createInto.insertBefore(el, createBefore);
        } else {
            createChildren(c, createInto, createBefore);
        }
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx!, c);
            }
            pushInitCallback(c);
        }
        return c;
    }
    if (tag === "/") {
        var htmlText = <string>children;
        if (htmlText === "") {
            // nothing needs to be created
        } else if (createBefore == null) {
            var before = createInto.lastChild;
            (<HTMLElement>createInto).insertAdjacentHTML("beforeend", htmlText);
            c.element = <Node[]>[];
            if (before) {
                before = before.nextSibling;
            } else {
                before = createInto.firstChild;
            }
            while (before) {
                (<Node[]>c.element).push(before);
                before = before.nextSibling;
            }
        } else {
            el = createBefore;
            var elPrev = createBefore.previousSibling;
            var removeEl = false;
            var parent = createInto;
            if (!(<HTMLElement>el).insertAdjacentHTML) {
                el = parent.insertBefore(createEl("i"), el);
                removeEl = true;
            }
            (<HTMLElement>el).insertAdjacentHTML("beforebegin", htmlText);
            if (elPrev) {
                elPrev = elPrev.nextSibling;
            } else {
                elPrev = parent.firstChild;
            }
            var newElements: Array<Node> = [];
            while (elPrev !== el) {
                newElements.push(elPrev!);
                elPrev = elPrev!.nextSibling;
            }
            c.element = newElements;
            if (removeEl) {
                parent.removeChild(el);
            }
        }
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx!, c);
            }
            pushInitCallback(c);
        }
        return c;
    }
    if (inSvg || tag === "svg") {
        el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        inSvgForeignObject = tag === "foreignObject";
        inSvg = !inSvgForeignObject;
    } else {
        el = createEl(tag);
    }
    createInto.insertBefore(el, createBefore);
    c.element = el;
    createChildren(c, <Element>el, null);
    if (component) {
        if (component.postRender) {
            component.postRender(c.ctx!, c);
        }
    }
    if (inNotFocusable && focusRootTop === c) inNotFocusable = false;
    if (inSvgForeignObject) inSvg = true;
    if (c.attrs || inNotFocusable) c.attrs = updateElement(c, <HTMLElement>el, c.attrs, {}, inNotFocusable);
    if (c.style) updateStyle(<HTMLElement>el, c.style, undefined);
    var className = c.className;
    if (className) setClassName(<HTMLElement>el, className);
    inSvg = backupInSvg;
    inNotFocusable = backupInNotFocusable;
    pushInitCallback(c);
    return c;
}

function normalizeNode(n: any): IBobrilNode | undefined {
    if (n === false || n === true || n === null) return undefined;
    if (isString(n)) {
        return { children: n };
    }
    if (isNumber(n)) {
        return { children: "" + n };
    }
    return <IBobrilNode | undefined>n;
}

function createChildren(c: IBobrilCacheNode, createInto: Element, createBefore: Node | null): void {
    var ch = c.children;
    if (!ch) return;
    if (!isArray(ch)) {
        if (isString(ch)) {
            createInto.textContent = ch;
            return;
        }
        ch = <any>[ch];
    }
    ch = (<any[]>ch).slice(0);
    var i = 0,
        l = (<any[]>ch).length;
    while (i < l) {
        var item = (<any[]>ch)[i];
        if (isArray(item)) {
            (<IBobrilCacheNode[]>ch).splice.apply(ch, (<any>[i, 1]).concat(item));
            l = (<IBobrilCacheNode[]>ch).length;
            continue;
        }
        item = normalizeNode(item);
        if (item == null) {
            (<any[]>ch).splice(i, 1);
            l--;
            continue;
        }
        (<IBobrilCacheNode[]>ch)[i] = createNode(item, c, createInto, createBefore);
        i++;
    }
    c.children = ch;
}

function destroyNode(c: IBobrilCacheNode) {
    setRef(c.ref, undefined);
    let ch = c.children;
    if (isArray(ch)) {
        for (let i = 0, l = ch.length; i < l; i++) {
            destroyNode(ch[i]);
        }
    }
    let component = c.component;
    if (component) {
        let ctx = c.ctx!;
        currentCtx = ctx;
        if (beforeRenderCallback !== emptyBeforeRenderCallback) beforeRenderCallback(c, RenderPhase.Destroy);
        if (component.destroy) component.destroy(ctx, c, <HTMLElement>c.element);
        let disposables = ctx.disposables;
        if (isArray(disposables)) {
            for (let i = disposables.length; i-- > 0; ) {
                let d = disposables[i];
                if (isFunction(d)) d(ctx);
                else d.dispose();
            }
        }
    }
}

export function addDisposable(ctx: IBobrilCtx, disposable: IDisposableLike) {
    let disposables = ctx.disposables;
    if (disposables == null) {
        disposables = [];
        ctx.disposables = disposables;
    }
    disposables.push(disposable);
}

function removeNodeRecursive(c: IBobrilCacheNode) {
    var el = c.element;
    if (isArray(el)) {
        var pa = (<Node[]>el)[0].parentNode;
        if (pa) {
            for (let i = 0; i < (<Node[]>el).length; i++) {
                pa.removeChild((<Node[]>el)[i]);
            }
        }
    } else if (el != null) {
        let p = (<Node>el).parentNode;
        if (p) p.removeChild(<Node>el);
    } else {
        var ch = c.children;
        if (isArray(ch)) {
            for (var i = 0, l = (<IBobrilCacheNode[]>ch).length; i < l; i++) {
                removeNodeRecursive((<IBobrilCacheNode[]>ch)[i]);
            }
        }
    }
}

function removeNode(c: IBobrilCacheNode) {
    destroyNode(c);
    removeNodeRecursive(c);
}

var roots: IBobrilRoots = newHashObj();

function nodeContainsNode(
    c: IBobrilCacheNode,
    n: Node,
    resIndex: number,
    res: (IBobrilCacheNode | null)[]
): IBobrilCacheNode[] | null | undefined {
    var el = c.element;
    var ch = c.children;
    if (isArray(el)) {
        for (var ii = 0; ii < (<Node[]>el).length; ii++) {
            if ((<Node[]>el)[ii] === n) {
                res.push(c);
                if (isArray(ch)) {
                    return <IBobrilCacheNode[]>ch;
                }
                return null;
            }
        }
    } else if (el == null) {
        if (isArray(ch)) {
            for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
                var result = nodeContainsNode((<IBobrilCacheNode[]>ch)[i], n, resIndex, res);
                if (result !== undefined) {
                    res.splice(resIndex, 0, c);
                    return result;
                }
            }
        }
    } else if (el === n) {
        res.push(c);
        if (isArray(ch)) {
            return <IBobrilCacheNode[]>ch;
        }
        return null;
    }
    return undefined;
}

export function vdomPath(n: Node | null | undefined): (IBobrilCacheNode | null)[] {
    var res: (IBobrilCacheNode | null)[] = [];
    if (n == null) return res;
    var rootIds = Object.keys(roots);
    var rootElements = rootIds.map(i => roots[i].e || document.body);
    var nodeStack: Node[] = [];
    rootFound: while (n) {
        for (var j = 0; j < rootElements.length; j++) {
            if (n === rootElements[j]) break rootFound;
        }
        nodeStack.push(n);
        n = n.parentNode;
    }
    if (!n || nodeStack.length === 0) return res;
    var currentCacheArray: IBobrilChildren | null = null;
    var currentNode = nodeStack.pop()!;
    for (j = 0; j < rootElements.length; j++) {
        if (n === rootElements[j]) {
            var rn = roots[rootIds[j]].n;
            if (rn === undefined) continue;
            var findResult = nodeContainsNode(rn, currentNode, res.length, res);
            if (findResult !== undefined) {
                currentCacheArray = findResult;
                break;
            }
        }
    }
    subtreeSearch: while (nodeStack.length) {
        currentNode = nodeStack.pop()!;
        if (currentCacheArray && (<any>currentCacheArray).length)
            for (var i = 0, l = (<any>currentCacheArray).length; i < l; i++) {
                var bn = (<IBobrilCacheNode[]>currentCacheArray)[i];
                var findResult = nodeContainsNode(bn, currentNode, res.length, res);
                if (findResult !== undefined) {
                    currentCacheArray = findResult;
                    continue subtreeSearch;
                }
            }
        res.push(null);
        break;
    }
    return res;
}

// PureFuncs: deref, getDomNode
export function deref(n: Node): IBobrilCacheNode | undefined {
    var p = vdomPath(n);
    var currentNode: IBobrilCacheNode | null | undefined = null;
    while (currentNode === null) {
        currentNode = p.pop();
    }
    return currentNode;
}

function finishUpdateNode(n: IBobrilNode, c: IBobrilCacheNode, component: IBobrilComponent | null | undefined) {
    if (component) {
        if (component.postRender) {
            currentCtx = c.ctx!;
            component.postRender(currentCtx, n, c);
            currentCtx = undefined;
        }
    }
    c.data = n.data;
    pushUpdateCallback(c);
}

function finishUpdateNodeWithoutChange(c: IBobrilCacheNode, createInto: Element, createBefore: Node | null) {
    currentCtx = undefined;
    if (isArray(c.children)) {
        const backupInSvg = inSvg;
        const backupInNotFocusable = inNotFocusable;
        if (c.tag === "svg") {
            inSvg = true;
        } else if (inSvg && c.tag === "foreignObject") inSvg = false;
        if (inNotFocusable && focusRootTop === c) inNotFocusable = false;
        selectedUpdate(
            <IBobrilCacheNode[]>c.children,
            <Element>c.element || createInto,
            c.element != null ? null : createBefore
        );
        inSvg = backupInSvg;
        inNotFocusable = backupInNotFocusable;
    }
    pushUpdateEverytimeCallback(c);
}
export function updateNode(
    n: IBobrilNode,
    c: IBobrilCacheNode,
    createInto: Element,
    createBefore: Node | null,
    deepness: number,
    inSelectedUpdate?: boolean
): IBobrilCacheNode {
    var component = n.component;
    var bigChange = false;
    var ctx = c.ctx;
    if (component != null && ctx != null) {
        let locallyInvalidated = false;
        if ((<any>ctx)[ctxInvalidated] === frameCounter) {
            deepness = Math.max(deepness, (<any>ctx)[ctxDeepness]);
            locallyInvalidated = true;
        }
        if (component.id !== c.component.id) {
            bigChange = true;
        } else {
            currentCtx = ctx;
            if (n.cfg !== undefined) ctx.cfg = n.cfg;
            else ctx.cfg = findCfg(c.parent);
            if (component.shouldChange)
                if (!component.shouldChange(ctx, n, c) && !ignoringShouldChange && !locallyInvalidated) {
                    finishUpdateNodeWithoutChange(c, createInto, createBefore);
                    return c;
                }
            (<any>ctx).data = n.data || {};
            c.component = component;
            if (beforeRenderCallback !== emptyBeforeRenderCallback)
                beforeRenderCallback(n, inSelectedUpdate ? RenderPhase.LocalUpdate : RenderPhase.Update);
            if (component.render) {
                c.orig = n;
                n = assign({}, n); // need to clone me because it should not be modified for next updates
                c.cfg = undefined;
                if (n.cfg !== undefined) n.cfg = undefined;
                component.render(ctx, n, c);
                if (n.cfg !== undefined) {
                    if (c.cfg === undefined) c.cfg = n.cfg;
                    else assign(c.cfg, n.cfg);
                }
            }
            currentCtx = undefined;
        }
    } else {
        // In case there is no component and source is same reference it is considered not changed
        if (c.orig === n) {
            return c;
        }
        c.orig = n;
        if (DEBUG) Object.freeze(n);
    }
    var newChildren = n.children;
    var cachedChildren = c.children;
    var tag = n.tag;
    if (tag === "-") {
        finishUpdateNodeWithoutChange(c, createInto, createBefore);
        return c;
    }
    const backupInSvg = inSvg;
    const backupInNotFocusable = inNotFocusable;
    if (isNumber(newChildren)) {
        newChildren = "" + newChildren;
    }
    if (
        bigChange ||
        (component != null && ctx == null) ||
        (component == null && ctx != null && ctx.me.component !== emptyComponent)
    ) {
        // it is big change of component.id or old one was not even component or old one was component and new is not anymore => recreate
    } else if (tag === "/") {
        if (c.tag === "/" && cachedChildren === newChildren) {
            finishUpdateNode(n, c, component);
            return c;
        }
    } else if (tag === c.tag) {
        if (tag === undefined) {
            if (isString(newChildren) && isString(cachedChildren)) {
                if (newChildren !== cachedChildren) {
                    var el = <Element>c.element;
                    el.textContent = newChildren;
                    c.children = newChildren;
                }
            } else {
                if (inNotFocusable && focusRootTop === c) inNotFocusable = false;
                if (deepness <= 0) {
                    if (isArray(cachedChildren))
                        selectedUpdate(<IBobrilCacheNode[]>c.children, createInto, createBefore);
                } else {
                    c.children = updateChildren(createInto, newChildren, cachedChildren, c, createBefore, deepness - 1);
                }
                inSvg = backupInSvg;
                inNotFocusable = backupInNotFocusable;
            }
            finishUpdateNode(n, c, component);
            return c;
        } else {
            var inSvgForeignObject = false;
            if (tag === "svg") {
                inSvg = true;
            } else if (inSvg && tag === "foreignObject") {
                inSvgForeignObject = true;
                inSvg = false;
            }
            if (inNotFocusable && focusRootTop === c) inNotFocusable = false;
            var el = <Element>c.element;
            if (isString(newChildren) && !isArray(cachedChildren)) {
                if (newChildren !== cachedChildren) {
                    el.textContent = newChildren;
                    cachedChildren = newChildren;
                }
            } else {
                if (deepness <= 0) {
                    if (isArray(cachedChildren)) selectedUpdate(<IBobrilCacheNode[]>c.children, el, createBefore);
                } else {
                    cachedChildren = updateChildren(el, newChildren, cachedChildren, c, null, deepness - 1);
                }
            }
            c.children = cachedChildren;
            if (inSvgForeignObject) inSvg = true;
            finishUpdateNode(n, c, component);
            if (c.attrs || n.attrs || inNotFocusable)
                c.attrs = updateElement(c, el, n.attrs, c.attrs || {}, inNotFocusable);
            updateStyle(<HTMLElement>el, n.style, c.style);
            c.style = n.style;
            var className = n.className;
            if (className !== c.className) {
                setClassName(el, className || "");
                c.className = className;
            }
            inSvg = backupInSvg;
            inNotFocusable = backupInNotFocusable;
            return c;
        }
    }
    var parEl = c.element;
    if (isArray(parEl)) parEl = parEl[0];
    if (parEl == null) parEl = createInto;
    else parEl = <Element>parEl.parentNode;
    var r: IBobrilCacheNode = createNode(n, c.parent, <Element>parEl, getDomNode(c));
    removeNode(c);
    return r;
}

export function getDomNode(c: IBobrilCacheNode | undefined): Node | null {
    if (c === undefined) return null;
    var el: Node | Node[] | null | undefined = c.element;
    if (el != null) {
        if (isArray(el)) return el[0];
        return el;
    }
    var ch = c.children;
    if (!isArray(ch)) return null;
    for (var i = 0; i < ch.length; i++) {
        el = getDomNode(ch[i]);
        if (el) return el;
    }
    return null;
}

function findNextNode(a: IBobrilCacheNode[], i: number, len: number, def: Node | null): Node | null {
    while (++i < len) {
        var ai = a[i];
        if (ai == null) continue;
        var n = getDomNode(ai);
        if (n != null) return n;
    }
    return def;
}

export function callPostCallbacks() {
    var count = updateInstance.length;
    for (var i = 0; i < count; i++) {
        var n = updateInstance[i];
        currentCtx = n.ctx;
        updateCall[i].call(n.component, currentCtx, n, n.element);
    }
    currentCtx = undefined;
    updateCall = [];
    updateInstance = [];
}

function updateNodeInUpdateChildren(
    newNode: IBobrilNode,
    cachedChildren: IBobrilCacheNode[],
    cachedIndex: number,
    cachedLength: number,
    createBefore: Node | null,
    element: Element,
    deepness: number
) {
    cachedChildren[cachedIndex] = updateNode(
        newNode,
        cachedChildren[cachedIndex],
        element,
        findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore),
        deepness
    );
}

function reorderInUpdateChildrenRec(c: IBobrilCacheNode, element: Element, before: Node | null): void {
    var el = c.element;
    if (el != null) {
        if (isArray(el)) {
            for (var i = 0; i < el.length; i++) {
                element.insertBefore(el[i], before);
            }
        } else element.insertBefore(el, before);
        return;
    }
    var ch = c.children;
    if (!isArray(ch)) return;
    for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
        reorderInUpdateChildrenRec((<IBobrilCacheNode[]>ch)[i], element, before);
    }
}

function reorderInUpdateChildren(
    cachedChildren: IBobrilCacheNode[],
    cachedIndex: number,
    cachedLength: number,
    createBefore: Node | null,
    element: Element
) {
    var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
    var cur = cachedChildren[cachedIndex];
    var what = getDomNode(cur);
    if (what != null && what !== before) {
        reorderInUpdateChildrenRec(cur, element, before);
    }
}

function reorderAndUpdateNodeInUpdateChildren(
    newNode: IBobrilNode,
    cachedChildren: IBobrilCacheNode[],
    cachedIndex: number,
    cachedLength: number,
    createBefore: Node | null,
    element: Element,
    deepness: number
) {
    var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
    var cur = cachedChildren[cachedIndex];
    var what = getDomNode(cur);
    if (what != null && what !== before) {
        reorderInUpdateChildrenRec(cur, element, before);
    }
    cachedChildren[cachedIndex] = updateNode(newNode, cur, element, before, deepness);
}

export function updateChildren(
    element: Element,
    newChildren: IBobrilChildren,
    cachedChildren: IBobrilCacheChildren,
    parentNode: IBobrilCacheNode | undefined,
    createBefore: Node | null,
    deepness: number
): IBobrilCacheNode[] {
    if (newChildren == null) newChildren = <IBobrilNode[]>[];
    if (!isArray(newChildren)) {
        newChildren = [newChildren];
    }
    if (cachedChildren == null) cachedChildren = [];
    if (!isArray(cachedChildren)) {
        if (element.firstChild) element.removeChild(element.firstChild);
        cachedChildren = <any>[];
    }
    let newCh = <IBobrilChildArray>newChildren;
    newCh = newCh.slice(0);
    var newLength = newCh.length;
    var newIndex: number;
    for (newIndex = 0; newIndex < newLength; ) {
        var item = newCh[newIndex];
        if (isArray(item)) {
            newCh.splice.apply(newCh, [newIndex, 1].concat(<any>item));
            newLength = newCh.length;
            continue;
        }
        item = normalizeNode(item);
        if (item == null) {
            newCh.splice(newIndex, 1);
            newLength--;
            continue;
        }
        newCh[newIndex] = item;
        newIndex++;
    }
    return updateChildrenCore(
        element,
        <IBobrilNode[]>newCh,
        <IBobrilCacheNode[]>cachedChildren,
        parentNode,
        createBefore,
        deepness
    );
}

function updateChildrenCore(
    element: Element,
    newChildren: IBobrilNode[],
    cachedChildren: IBobrilCacheNode[],
    parentNode: IBobrilCacheNode | undefined,
    createBefore: Node | null,
    deepness: number
): IBobrilCacheNode[] {
    let newEnd = newChildren.length;
    var cachedLength = cachedChildren.length;
    let cachedEnd = cachedLength;
    let newIndex = 0;
    let cachedIndex = 0;
    while (newIndex < newEnd && cachedIndex < cachedEnd) {
        if (newChildren[newIndex].key === cachedChildren[cachedIndex].key) {
            updateNodeInUpdateChildren(
                newChildren[newIndex],
                cachedChildren,
                cachedIndex,
                cachedLength,
                createBefore,
                element,
                deepness
            );
            newIndex++;
            cachedIndex++;
            continue;
        }
        while (true) {
            if (newChildren[newEnd - 1].key === cachedChildren[cachedEnd - 1].key) {
                newEnd--;
                cachedEnd--;
                updateNodeInUpdateChildren(
                    newChildren[newEnd],
                    cachedChildren,
                    cachedEnd,
                    cachedLength,
                    createBefore,
                    element,
                    deepness
                );
                if (newIndex < newEnd && cachedIndex < cachedEnd) continue;
            }
            break;
        }
        if (newIndex < newEnd && cachedIndex < cachedEnd) {
            if (newChildren[newIndex].key === cachedChildren[cachedEnd - 1].key) {
                cachedChildren.splice(cachedIndex, 0, cachedChildren[cachedEnd - 1]);
                cachedChildren.splice(cachedEnd, 1);
                reorderAndUpdateNodeInUpdateChildren(
                    newChildren[newIndex],
                    cachedChildren,
                    cachedIndex,
                    cachedLength,
                    createBefore,
                    element,
                    deepness
                );
                newIndex++;
                cachedIndex++;
                continue;
            }
            if (newChildren[newEnd - 1].key === cachedChildren[cachedIndex].key) {
                cachedChildren.splice(cachedEnd, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                newEnd--;
                reorderAndUpdateNodeInUpdateChildren(
                    newChildren[newEnd],
                    cachedChildren,
                    cachedEnd,
                    cachedLength,
                    createBefore,
                    element,
                    deepness
                );
                continue;
            }
        }
        break;
    }
    if (cachedIndex === cachedEnd) {
        if (newIndex === newEnd) {
            return cachedChildren;
        }
        // Only work left is to add new nodes
        while (newIndex < newEnd) {
            cachedChildren.splice(
                cachedIndex,
                0,
                createNode(
                    newChildren[newIndex],
                    parentNode,
                    element,
                    findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)
                )
            );
            cachedIndex++;
            cachedEnd++;
            cachedLength++;
            newIndex++;
        }
        return cachedChildren;
    }
    if (newIndex === newEnd) {
        // Only work left is to remove old nodes
        while (cachedIndex < cachedEnd) {
            cachedEnd--;
            removeNode(cachedChildren[cachedEnd]);
            cachedChildren.splice(cachedEnd, 1);
        }
        return cachedChildren;
    }
    // order of keyed nodes ware changed => reorder keyed nodes first
    var cachedKeys: { [keyName: string]: number } = newHashObj();
    var newKeys: { [keyName: string]: number } = newHashObj();
    var key: string | undefined;
    var node: IBobrilNode;
    var backupNewIndex = newIndex;
    var backupCachedIndex = cachedIndex;
    var deltaKeyless = 0;
    for (; cachedIndex < cachedEnd; cachedIndex++) {
        node = cachedChildren[cachedIndex];
        key = node.key;
        if (key != null) {
            assert(!(key in <any>cachedKeys));
            cachedKeys[key] = cachedIndex;
        } else deltaKeyless--;
    }
    var keyLess = -deltaKeyless - deltaKeyless;
    for (; newIndex < newEnd; newIndex++) {
        node = newChildren[newIndex];
        key = node.key;
        if (key != null) {
            assert(!(key in <any>newKeys));
            newKeys[key] = newIndex;
        } else deltaKeyless++;
    }
    keyLess += deltaKeyless;
    var delta = 0;
    newIndex = backupNewIndex;
    cachedIndex = backupCachedIndex;
    var cachedKey: string | undefined;
    while (cachedIndex < cachedEnd && newIndex < newEnd) {
        if (cachedChildren[cachedIndex] === null) {
            // already moved somewhere else
            cachedChildren.splice(cachedIndex, 1);
            cachedEnd--;
            cachedLength--;
            delta--;
            continue;
        }
        cachedKey = cachedChildren[cachedIndex].key;
        if (cachedKey == null) {
            cachedIndex++;
            continue;
        }
        key = newChildren[newIndex].key;
        if (key == null) {
            newIndex++;
            while (newIndex < newEnd) {
                key = newChildren[newIndex].key;
                if (key != null) break;
                newIndex++;
            }
            if (key == null) break;
        }
        var akPos = cachedKeys[key];
        if (akPos === undefined) {
            // New key
            cachedChildren.splice(
                cachedIndex,
                0,
                createNode(
                    newChildren[newIndex],
                    parentNode,
                    element,
                    findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)
                )
            );
            delta++;
            newIndex++;
            cachedIndex++;
            cachedEnd++;
            cachedLength++;
            continue;
        }
        if (!(cachedKey in <any>newKeys)) {
            // Old key
            removeNode(cachedChildren[cachedIndex]);
            cachedChildren.splice(cachedIndex, 1);
            delta--;
            cachedEnd--;
            cachedLength--;
            continue;
        }
        if (cachedIndex === akPos + delta) {
            // In-place update
            updateNodeInUpdateChildren(
                newChildren[newIndex],
                cachedChildren,
                cachedIndex,
                cachedLength,
                createBefore,
                element,
                deepness
            );
            newIndex++;
            cachedIndex++;
        } else {
            // Move
            cachedChildren.splice(cachedIndex, 0, cachedChildren[akPos + delta]);
            delta++;
            cachedChildren[akPos + delta] = null!;
            reorderAndUpdateNodeInUpdateChildren(
                newChildren[newIndex],
                cachedChildren,
                cachedIndex,
                cachedLength,
                createBefore,
                element,
                deepness
            );
            cachedIndex++;
            cachedEnd++;
            cachedLength++;
            newIndex++;
        }
    }
    // remove old keyed cached nodes
    while (cachedIndex < cachedEnd) {
        if (cachedChildren[cachedIndex] === null) {
            // already moved somewhere else
            cachedChildren.splice(cachedIndex, 1);
            cachedEnd--;
            cachedLength--;
            continue;
        }
        if (cachedChildren[cachedIndex].key != null) {
            // this key is only in old
            removeNode(cachedChildren[cachedIndex]);
            cachedChildren.splice(cachedIndex, 1);
            cachedEnd--;
            cachedLength--;
            continue;
        }
        cachedIndex++;
    }
    // add new keyed nodes
    while (newIndex < newEnd) {
        key = newChildren[newIndex].key;
        if (key != null) {
            cachedChildren.splice(
                cachedIndex,
                0,
                createNode(
                    newChildren[newIndex],
                    parentNode,
                    element,
                    findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)
                )
            );
            cachedEnd++;
            cachedLength++;
            delta++;
            cachedIndex++;
        }
        newIndex++;
    }
    // Without any keyless nodes we are done
    if (!keyLess) return cachedChildren;
    // calculate common (old and new) keyless
    keyLess = (keyLess - Math.abs(deltaKeyless)) >> 1;
    // reorder just nodes without keys
    newIndex = backupNewIndex;
    cachedIndex = backupCachedIndex;
    while (newIndex < newEnd) {
        if (cachedIndex < cachedEnd) {
            cachedKey = cachedChildren[cachedIndex].key;
            if (cachedKey != null) {
                cachedIndex++;
                continue;
            }
        }
        key = newChildren[newIndex].key;
        if (newIndex < cachedEnd && key === cachedChildren[newIndex].key) {
            if (key != null) {
                newIndex++;
                continue;
            }
            updateNodeInUpdateChildren(
                newChildren[newIndex],
                cachedChildren,
                newIndex,
                cachedLength,
                createBefore,
                element,
                deepness
            );
            keyLess--;
            newIndex++;
            cachedIndex = newIndex;
            continue;
        }
        if (key != null) {
            assert(newIndex === cachedIndex);
            if (keyLess === 0 && deltaKeyless < 0) {
                while (true) {
                    removeNode(cachedChildren[cachedIndex]);
                    cachedChildren.splice(cachedIndex, 1);
                    cachedEnd--;
                    cachedLength--;
                    deltaKeyless++;
                    assert(cachedIndex !== cachedEnd, "there still need to exist key node");
                    if (cachedChildren[cachedIndex].key != null) break;
                }
                continue;
            }
            while (cachedChildren[cachedIndex].key == null) cachedIndex++;
            assert(key === cachedChildren[cachedIndex].key);
            cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
            cachedChildren.splice(cachedIndex + 1, 1);
            reorderInUpdateChildren(cachedChildren, newIndex, cachedLength, createBefore, element);
            // just moving keyed node it was already updated before
            newIndex++;
            cachedIndex = newIndex;
            continue;
        }
        if (cachedIndex < cachedEnd) {
            cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
            cachedChildren.splice(cachedIndex + 1, 1);
            reorderAndUpdateNodeInUpdateChildren(
                newChildren[newIndex],
                cachedChildren,
                newIndex,
                cachedLength,
                createBefore,
                element,
                deepness
            );
            keyLess--;
            newIndex++;
            cachedIndex++;
        } else {
            cachedChildren.splice(
                newIndex,
                0,
                createNode(
                    newChildren[newIndex],
                    parentNode,
                    element,
                    findNextNode(cachedChildren, newIndex - 1, cachedLength, createBefore)
                )
            );
            cachedEnd++;
            cachedLength++;
            newIndex++;
            cachedIndex++;
        }
    }
    while (cachedEnd > newIndex) {
        cachedEnd--;
        removeNode(cachedChildren[cachedEnd]);
        cachedChildren.splice(cachedEnd, 1);
    }
    return cachedChildren;
}

var hasNativeRaf = false;
var nativeRaf = window.requestAnimationFrame;
if (nativeRaf) {
    nativeRaf(param => {
        if (param === +param) hasNativeRaf = true;
    });
}

export const now = Date.now || (() => new Date().getTime());
var startTime = now();
var lastTickTime = 0;

function requestAnimationFrame(callback: (time: number) => void) {
    if (hasNativeRaf) {
        nativeRaf(callback);
    } else {
        var delay = 50 / 3 + lastTickTime - now();
        if (delay < 0) delay = 0;
        window.setTimeout(() => {
            lastTickTime = now();
            callback(lastTickTime - startTime);
        }, delay);
    }
}

var ctxInvalidated = "$invalidated";
var ctxDeepness = "$deepness";
var fullRecreateRequested = true;
var scheduled = false;
let initializing = true;
var uptimeMs = 0;
var frameCounter = 0;
var lastFrameDurationMs = 0;
var renderFrameBegin = 0;

var regEvents: {
    [name: string]: Array<(ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean>;
} = {};
var registryEvents:
    | {
          [name: string]: Array<{
              priority: number;
              callback: (ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean;
          }>;
      }
    | undefined;

export function addEvent(
    name: string,
    priority: number,
    callback: (ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean
): void {
    if (registryEvents == null) registryEvents = {};
    var list = registryEvents[name] || [];
    list.push({ priority: priority, callback: callback });
    registryEvents[name] = list;
}

export function emitEvent(
    name: string,
    ev: any,
    target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var events = regEvents[name];
    if (events)
        for (var i = 0; i < events.length; i++) {
            if (events[i](ev, target, node)) return true;
        }
    return false;
}

var listeningEventDeepness = 0;

function addListener(el: EventTarget, name: string) {
    if (name[0] == "!") return;
    var capture = name[0] == "^";
    var eventName = name;
    if (name[0] == "@") {
        eventName = name.slice(1);
        el = document;
    }
    if (capture) {
        eventName = name.slice(1);
    }
    function enhanceEvent(ev: Event) {
        ev = ev || window.event;
        var t = ev.target || ev.srcElement || el;
        var n = deref(<any>t);
        listeningEventDeepness++;
        emitEvent(name, ev, <Node>t, n);
        listeningEventDeepness--;
        if (listeningEventDeepness == 0 && deferSyncUpdateRequested) syncUpdate();
    }
    if ("on" + eventName in window) el = window;
    el.addEventListener(eventName, enhanceEvent, capture);
}

function initEvents() {
    if (registryEvents === undefined) return;
    var eventNames = Object.keys(registryEvents);
    for (var j = 0; j < eventNames.length; j++) {
        var eventName = eventNames[j];
        var arr = registryEvents[eventName];
        arr = arr.sort((a, b) => a.priority - b.priority);
        regEvents[eventName] = arr.map(v => v.callback);
    }
    registryEvents = undefined;
    var body = document.body;
    for (var i = 0; i < eventNames.length; i++) {
        addListener(body, eventNames[i]);
    }
}

function selectedUpdate(cache: IBobrilCacheNode[], element: Element, createBefore: Node | null) {
    var len = cache.length;
    for (var i = 0; i < len; i++) {
        var node = cache[i];
        var ctx = node.ctx;
        if (ctx != null && (<any>ctx)[ctxInvalidated] === frameCounter) {
            cache[i] = updateNode(node.orig, node, element, createBefore, (<any>ctx)[ctxDeepness], true);
        } else if (isArray(node.children)) {
            var backupInSvg = inSvg;
            var backupInNotFocusable = inNotFocusable;
            if (inNotFocusable && focusRootTop === node) inNotFocusable = false;
            if (node.tag === "svg") inSvg = true;
            else if (inSvg && node.tag === "foreignObject") inSvg = false;
            selectedUpdate(node.children, <Element>node.element || element, findNextNode(cache, i, len, createBefore));
            pushUpdateEverytimeCallback(node);
            inSvg = backupInSvg;
            inNotFocusable = backupInNotFocusable;
        }
    }
}

export const enum RenderPhase {
    Create,
    Update,
    LocalUpdate,
    Destroy
}

const emptyBeforeRenderCallback = () => {};
var beforeRenderCallback: (node: IBobrilNode, phase: RenderPhase) => void = emptyBeforeRenderCallback;
var beforeFrameCallback: () => void = () => {};
var reallyBeforeFrameCallback: () => void = () => {};
var afterFrameCallback: (root: IBobrilCacheChildren | null) => void = () => {};

export function setBeforeRender(
    callback: (node: IBobrilNode, phase: RenderPhase) => void
): (node: IBobrilNode, phase: RenderPhase) => void {
    var res = beforeRenderCallback;
    beforeRenderCallback = callback;
    return res;
}

export function setBeforeFrame(callback: () => void): () => void {
    var res = beforeFrameCallback;
    beforeFrameCallback = callback;
    return res;
}

export function setReallyBeforeFrame(callback: () => void): () => void {
    var res = reallyBeforeFrameCallback;
    reallyBeforeFrameCallback = callback;
    return res;
}

export function setAfterFrame(
    callback: (root: IBobrilCacheChildren | null) => void
): (root: IBobrilCacheChildren | null) => void {
    var res = afterFrameCallback;
    afterFrameCallback = callback;
    return res;
}

function isLogicalParent(
    parent: IBobrilCacheNode,
    child: IBobrilCacheNode | null | undefined,
    rootIds: string[]
): boolean {
    while (child != null) {
        if (parent === child) return true;
        let p = child.parent;
        if (p == null) {
            for (var i = 0; i < rootIds.length; i++) {
                var r = roots[rootIds[i]];
                if (!r) continue;
                if (r.n === child) {
                    p = r.p;
                    break;
                }
            }
        }
        child = p;
    }
    return false;
}

var deferSyncUpdateRequested = false;

export function syncUpdate() {
    deferSyncUpdateRequested = false;
    internalUpdate(now() - startTime);
}

export function deferSyncUpdate() {
    if (listeningEventDeepness > 0) {
        deferSyncUpdateRequested = true;
        return;
    }
    syncUpdate();
}

function update(time: number) {
    scheduled = false;
    internalUpdate(time);
}

var rootIds: string[] | undefined;

const RootComponent = createVirtualComponent<IBobrilRoot>({
    render(ctx: IBobrilCtx, me: IBobrilNode) {
        const r = ctx.data as IBobrilRoot;
        let c = r.f(r);
        if (c === undefined) {
            me.tag = "-"; // Skip render when root factory returns undefined
        } else {
            me.children = c;
        }
    }
});

function internalUpdate(time: number) {
    renderFrameBegin = now();
    initEvents();
    reallyBeforeFrameCallback();
    frameCounter++;
    ignoringShouldChange = nextIgnoreShouldChange;
    nextIgnoreShouldChange = false;
    uptimeMs = time;
    beforeFrameCallback();
    focusRootTop = focusRootStack.length === 0 ? null : focusRootStack[focusRootStack.length - 1];
    inNotFocusable = false;
    var fullRefresh = false;
    if (fullRecreateRequested) {
        fullRecreateRequested = false;
        fullRefresh = true;
    }
    rootIds = Object.keys(roots);
    for (var i = 0; i < rootIds.length; i++) {
        var r = roots[rootIds[i]];
        if (!r) continue;
        var rc = r.n;
        var insertBefore: Node | null = null;
        for (var j = i + 1; j < rootIds.length; j++) {
            let rafter = roots[rootIds[j]];
            if (rafter === undefined) continue;
            insertBefore = getDomNode(rafter.n);
            if (insertBefore != null) break;
        }
        if (focusRootTop) inNotFocusable = !isLogicalParent(focusRootTop, r.p, rootIds);
        if (r.e === undefined) r.e = document.body;
        if (rc) {
            if (fullRefresh || (rc.ctx as any)[ctxInvalidated] === frameCounter) {
                let node = RootComponent(r);
                updateNode(node, rc, r.e, insertBefore, fullRefresh ? 1e6 : (rc.ctx as any)[ctxDeepness]);
            } else {
                if (isArray(r.c)) selectedUpdate(r.c, r.e, insertBefore);
            }
        } else {
            let node = RootComponent(r);
            rc = createNode(node, undefined, r.e, insertBefore);
            r.n = rc;
        }
        r.c = rc.children;
    }
    rootIds = undefined;
    callPostCallbacks();
    let r0 = roots["0"];
    afterFrameCallback(r0 ? r0.c : null);
    lastFrameDurationMs = now() - renderFrameBegin;
}

var nextIgnoreShouldChange = false;
var ignoringShouldChange = false;

export function ignoreShouldChange() {
    nextIgnoreShouldChange = true;
    invalidate();
}

export function setInvalidate(
    inv: (ctx?: Object, deepness?: number) => void
): (ctx?: Object, deepness?: number) => void {
    let prev = invalidate;
    invalidate = inv;
    return prev;
}

export var invalidate = (ctx?: Object, deepness?: number) => {
    if (ctx != null) {
        if (deepness == undefined) deepness = 1e6;
        if ((<any>ctx)[ctxInvalidated] !== frameCounter + 1) {
            (<any>ctx)[ctxInvalidated] = frameCounter + 1;
            (<any>ctx)[ctxDeepness] = deepness;
        } else {
            if (deepness > (<any>ctx)[ctxDeepness]) (<any>ctx)[ctxDeepness] = deepness;
        }
    } else {
        fullRecreateRequested = true;
    }
    if (scheduled || initializing) return;
    scheduled = true;
    requestAnimationFrame(update);
};

var lastRootId = 0;

export function addRoot(
    factory: (root: IBobrilRoot) => IBobrilChildren,
    element?: HTMLElement,
    parent?: IBobrilCacheNode
): string {
    lastRootId++;
    var rootId = "" + lastRootId;
    roots[rootId] = { f: factory, e: element, c: [], p: parent, n: undefined };
    if (rootIds != null) {
        rootIds.push(rootId);
    } else {
        firstInvalidate();
    }
    return rootId;
}

export function removeRoot(id: string): void {
    var root = roots[id];
    if (!root) return;
    if (root.n) removeNode(root.n);
    delete roots[id];
}

export function updateRoot(id: string, factory?: (root: IBobrilRoot) => IBobrilChildren) {
    assert(rootIds != null, "updateRoot could be called only from render");
    var root = roots[id];
    assert(root != null);
    if (factory != null) root.f = factory;
    let rootNode = root.n;
    if (rootNode == null) return;
    let ctx = rootNode.ctx;
    (<any>ctx)[ctxInvalidated] = frameCounter;
    (<any>ctx)[ctxDeepness] = 1e6;
}

export function getRoots(): IBobrilRoots {
    return roots;
}

function finishInitialize() {
    initializing = false;
    invalidate();
}

var beforeInit: () => void = finishInitialize;

function firstInvalidate() {
    initializing = true;
    beforeInit();
    beforeInit = finishInitialize;
}

export function init(factory: () => any, element?: HTMLElement) {
    assert(rootIds == null, "init should not be called from render");
    removeRoot("0");
    roots["0"] = { f: factory, e: element, c: [], p: undefined, n: undefined };
    firstInvalidate();
}

export function setBeforeInit(callback: (cb: () => void) => void): void {
    let prevBeforeInit = beforeInit;
    beforeInit = () => {
        callback(prevBeforeInit);
    };
}

export function bubble(node: IBobrilCacheNode | null | undefined, name: string, param: any): IBobrilCtx | undefined {
    while (node) {
        var c = node.component;
        if (c) {
            var ctx = node.ctx!;
            var m = (<any>c)[name];
            if (m) {
                if (m.call(c, ctx, param)) return ctx;
            }
            m = (<any>c).shouldStopBubble;
            if (m) {
                if (m.call(c, ctx, name, param)) break;
            }
        }
        node = node.parent;
    }
    return undefined;
}

function broadcastEventToNode(
    node: IBobrilCacheNode | null | undefined,
    name: string,
    param: any
): IBobrilCtx | undefined {
    if (!node) return undefined;
    var c = node.component;
    if (c) {
        var ctx = node.ctx!;
        var m = (<any>c)[name];
        if (m) {
            if (m.call(c, ctx, param)) return ctx;
        }
        m = c.shouldStopBroadcast;
        if (m) {
            if (m.call(c, ctx, name, param)) return undefined;
        }
    }
    var ch = node.children;
    if (isArray(ch)) {
        for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
            var res = broadcastEventToNode((<IBobrilCacheNode[]>ch)[i], name, param);
            if (res != null) return res;
        }
    }
    return undefined;
}

export function broadcast(name: string, param: any): IBobrilCtx | undefined {
    var k = Object.keys(roots);
    for (var i = 0; i < k.length; i++) {
        var ch = roots[k[i]].n;
        if (ch != null) {
            var res = broadcastEventToNode(ch, name, param);
            if (res != null) return res;
        }
    }
    return undefined;
}

function merge(f1: Function, f2: Function): Function {
    return function(this: any, ...params: any[]) {
        var result = f1.apply(this, params);
        if (result) return result;
        return f2.apply(this, params);
    };
}

var emptyObject = {};

function mergeComponents(c1: IBobrilComponent, c2: IBobrilComponent): IBobrilComponent {
    let res: IBobrilComponent = Object.create(c1)!;
    res.super = c1;
    for (var i in c2) {
        if (!(i in <any>emptyObject)) {
            var m = (<any>c2)[i];
            var origM = (<any>c1)[i];
            if (i === "id") {
                (<any>res)[i] = (origM != null ? origM : "") + "/" + m;
            } else if (isFunction(m) && origM != null && isFunction(origM)) {
                (<any>res)[i] = merge(origM, m);
            } else {
                (<any>res)[i] = m;
            }
        }
    }
    return res;
}

function overrideComponents(originalComponent: IBobrilComponent, overridingComponent: IBobrilComponent) {
    let res: IBobrilComponent = Object.create(originalComponent)!;
    res.super = originalComponent;
    for (let i in overridingComponent) {
        if (!(i in <any>emptyObject)) {
            let m = (<any>overridingComponent)[i];
            let origM = (<any>originalComponent)[i];
            if (i === "id") {
                (<any>res)[i] = (origM != null ? origM : "") + "/" + m;
            } else {
                (<any>res)[i] = m;
            }
        }
    }
    return res;
}

export function preEnhance(node: IBobrilNode, methods: IBobrilComponent): IBobrilNode {
    var comp = node.component;
    if (!comp) {
        node.component = methods;
        return node;
    }
    node.component = mergeComponents(methods, comp);
    return node;
}

export function postEnhance(node: IBobrilNode, methods: IBobrilComponent): IBobrilNode {
    var comp = node.component;
    if (!comp) {
        node.component = methods;
        return node;
    }
    node.component = mergeComponents(comp, methods);
    return node;
}

export function preventDefault(event: Event) {
    var pd = event.preventDefault;
    if (pd) pd.call(event);
    else (<any>event).returnValue = false;
}

function cloneNodeArray(a: IBobrilChildArray): IBobrilChildArray {
    a = a.slice(0);
    for (var i = 0; i < a.length; i++) {
        var n = a[i];
        if (isArray(n)) {
            a[i] = cloneNodeArray(n);
        } else if (isObject(n)) {
            a[i] = cloneNode(n);
        }
    }
    return a;
}

export function cloneNode(node: IBobrilNode): IBobrilNode {
    var r = <IBobrilNode>assign({}, node);
    if (r.attrs) {
        r.attrs = <IBobrilAttributes>assign({}, r.attrs);
    }
    if (isObject(r.style)) {
        r.style = assign({}, r.style);
    }
    var ch = r.children;
    if (ch) {
        if (isArray(ch)) {
            r.children = cloneNodeArray(ch);
        } else if (isObject(ch)) {
            r.children = cloneNode(ch);
        }
    }
    return r;
}

export function setStyleShim(name: string, action: (style: any, value: any, oldName: string) => void) {
    mapping[name] = action;
}

// PureFuncs: uptime, lastFrameDuration, frame, invalidated

export function uptime() {
    return uptimeMs;
}

export function lastFrameDuration() {
    return lastFrameDurationMs;
}

export function frame() {
    return frameCounter;
}

export function invalidated() {
    return scheduled;
}

// Bobril.Media
export const enum BobrilDeviceCategory {
    Mobile = 0,
    Tablet = 1,
    Desktop = 2,
    LargeDesktop = 3
}

export interface IBobrilMedia {
    width: number;
    height: number;
    orientation: number;
    deviceCategory: BobrilDeviceCategory;
    portrait: boolean;
}

var media: IBobrilMedia | null = null;
var breaks = [
    [414, 800, 900], //portrait widths
    [736, 1280, 1440] //landscape widths
];

function emitOnMediaChange() {
    media = null;
    invalidate();
    return false;
}

var events = ["resize", "orientationchange"];
for (var i = 0; i < events.length; i++) addEvent(events[i], 10, emitOnMediaChange);

export function accDeviceBreaks(newBreaks?: number[][]): number[][] {
    if (newBreaks != null) {
        breaks = newBreaks;
        emitOnMediaChange();
    }
    return breaks;
}

var viewport = window.document.documentElement;
var isAndroid = /Android/i.test(navigator.userAgent);
var weirdPortrait: boolean; // Some android devices provide reverted orientation

export function getMedia(): IBobrilMedia {
    if (media == null) {
        var w = viewport.clientWidth;
        var h = viewport.clientHeight;
        var o: any = (<any>window).orientation;
        var p = h >= w;
        if (o == null) o = p ? 0 : 90;
        if (isAndroid) {
            // without this keyboard change screen rotation because h or w changes
            let op = Math.abs(o) % 180 === 90;
            if (weirdPortrait == null) {
                weirdPortrait = op === p;
            } else {
                p = op === weirdPortrait;
            }
        }
        var device = 0;
        while (w > breaks[+!p][device]) device++;
        media = {
            width: w,
            height: h,
            orientation: o,
            deviceCategory: device,
            portrait: p
        };
    }
    return media;
}

// Bobril.Promise

export interface Thenable<R> {
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => U | Thenable<U>): Thenable<U>;
    then<U>(onFulfilled?: (value: R) => U | Thenable<U>, onRejected?: (error: any) => void): Thenable<U>;
}

export const asap = (() => {
    var callbacks: Array<() => void> = [];

    function executeCallbacks() {
        var cbList = callbacks;
        callbacks = [];
        for (var i = 0, len = cbList.length; i < len; i++) {
            cbList[i]();
        }
    }

    var onreadystatechange = "onreadystatechange";
    // Modern browsers, fastest async
    if ((<any>window).MutationObserver) {
        var hiddenDiv = document.createElement("div");
        new MutationObserver(executeCallbacks).observe(hiddenDiv, {
            attributes: true
        });
        return (callback: () => void) => {
            if (!callbacks.length) {
                hiddenDiv.setAttribute("yes", "no");
            }
            callbacks.push(callback);
        };
        // Browsers that support postMessage
    } else if (!window.setImmediate && window.postMessage && window.addEventListener) {
        var MESSAGE_PREFIX = "basap" + Math.random(),
            hasPostMessage = false;

        var onGlobalMessage = (event: any) => {
            if (event.source === window && event.data === MESSAGE_PREFIX) {
                hasPostMessage = false;
                executeCallbacks();
            }
        };

        window.addEventListener("message", onGlobalMessage, false);

        return (fn: () => void) => {
            callbacks.push(fn);

            if (!hasPostMessage) {
                hasPostMessage = true;
                window.postMessage(MESSAGE_PREFIX, "*");
            }
        };
        // IE browsers without postMessage
    } else if (!window.setImmediate && onreadystatechange in document.createElement("script")) {
        var scriptEl: any;
        return (callback: () => void) => {
            callbacks.push(callback);
            if (!scriptEl) {
                scriptEl = document.createElement("script");
                scriptEl[onreadystatechange] = () => {
                    scriptEl[onreadystatechange] = null;
                    scriptEl.parentNode.removeChild(scriptEl);
                    scriptEl = null;
                    executeCallbacks();
                };
                document.body.appendChild(scriptEl);
            }
        };
        // All other browsers
    } else {
        var timeout: number | undefined;
        var timeoutFn: (cb: () => void, timeout: number) => number = window.setImmediate || setTimeout;
        return (callback: () => void) => {
            callbacks.push(callback);
            if (!timeout) {
                timeout = timeoutFn(() => {
                    timeout = undefined;
                    executeCallbacks();
                }, 0);
            }
        };
    }
})();

if (!(<any>window).Promise) {
    (function() {
        // Polyfill for Function.prototype.bind
        function bind(fn: (args: any) => void, thisArg: any) {
            return function() {
                fn.apply(thisArg, arguments);
            };
        }

        function handle(this: any, deferred: Array<(v: any) => any>) {
            if (this.s /*tate*/ === null) {
                this.d /*eferreds*/
                    .push(deferred);
                return;
            }
            asap(() => {
                var cb = this.s /*tate*/ ? deferred[0] : deferred[1];
                if (cb == null) {
                    (this.s /*tate*/ ? deferred[2] : deferred[3])(this.v /*alue*/);
                    return;
                }
                var ret: any;
                try {
                    ret = cb(this.v /*alue*/);
                } catch (e) {
                    deferred[3](e);
                    return;
                }
                deferred[2](ret);
            });
        }

        function finale(this: any) {
            for (var i = 0, len = this.d /*eferreds*/.length; i < len; i++) {
                handle.call(this, this.d /*eferreds*/[i]);
            }
            this.d /*eferreds*/ = null;
        }

        function reject(this: any, newValue: any) {
            this.s /*tate*/ = false;
            this.v /*alue*/ = newValue;
            finale.call(this);
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(
            fn: (fulfill: (v: any) => void, reject: (r: any) => void) => void,
            onFulfilled: (value: any) => void,
            onRejected: (reason: any) => void
        ) {
            var done = false;
            try {
                fn(
                    (value: any) => {
                        if (done) return;
                        done = true;
                        onFulfilled(value);
                    },
                    (reason: any) => {
                        if (done) return;
                        done = true;
                        onRejected(reason);
                    }
                );
            } catch (ex) {
                if (done) return;
                done = true;
                onRejected(ex);
            }
        }

        function resolve(this: any, newValue: any) {
            try {
                //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === this) throw new TypeError("Promise self resolve");
                if (Object(newValue) === newValue) {
                    var then = newValue.then;
                    if (typeof then === "function") {
                        doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
                        return;
                    }
                }
                this.s /*tate*/ = true;
                this.v /*alue*/ = newValue;
                finale.call(this);
            } catch (e) {
                reject.call(this, e);
            }
        }

        function Promise(
            this: any,
            fn: (onFulfilled: (value: any) => void, onRejected: (reason: any) => void) => void
        ) {
            this.s /*tate*/ = null;
            this.v /*alue*/ = null;
            this.d /*eferreds*/ = <Array<Array<() => void>>>[];

            doResolve(fn, bind(resolve, this), bind(reject, this));
        }

        Promise.prototype.then = function(this: any, onFulfilled: any, onRejected?: any) {
            var me = this;
            return new (<any>Promise)((resolve: any, reject: any) => {
                handle.call(me, [onFulfilled, onRejected, resolve, reject]);
            });
        };

        Promise.prototype["catch"] = function(this: any, onRejected?: any) {
            return this.then(undefined, onRejected);
        };

        (<any>Promise).all = function() {
            var args = (<any>[]).slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

            return new (<any>Promise)((resolve: (value: any) => void, reject: (reason: any) => void) => {
                if (args.length === 0) {
                    resolve(args);
                    return;
                }
                var remaining = args.length;
                function res(i: number, val: any) {
                    try {
                        if (val && (typeof val === "object" || typeof val === "function")) {
                            var then = val.then;
                            if (typeof then === "function") {
                                then.call(
                                    val,
                                    (val: any) => {
                                        res(i, val);
                                    },
                                    reject
                                );
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };

        (<any>Promise).resolve = (value: any) => {
            if (value && typeof value === "object" && value.constructor === Promise) {
                return value;
            }

            return new (<any>Promise)((resolve: (value: any) => void) => {
                resolve(value);
            });
        };

        (<any>Promise).reject = (value: any) =>
            new (<any>Promise)((_resolve: any, reject: (reason: any) => void) => {
                reject(value);
            });

        (<any>Promise).race = (values: any[]) =>
            new (<any>Promise)((resolve: any, reject: any) => {
                for (var i = 0, len = values.length; i < len; i++) {
                    values[i].then(resolve, reject);
                }
            });

        (<any>window)["Promise"] = <any>Promise;
    })();
}
// Bobril.StyleShim

if (ieVersion() === 9) {
    (() => {
        function addFilter(s: any, v: string) {
            if (s.zoom == null) s.zoom = "1";
            var f = s.filter;
            s.filter = f == null ? v : f + " " + v;
        }

        var simpleLinearGradient = /^linear\-gradient\(to (.+?),(.+?),(.+?)\)/gi;

        setStyleShim("background", (s: any, v: any, oldName: string) => {
            var match = simpleLinearGradient.exec(v);
            if (match == null) return;
            var dir = match[1];
            var color1 = match[2];
            var color2 = match[3];
            var tmp: string;
            switch (dir) {
                case "top":
                    dir = "0";
                    tmp = color1;
                    color1 = color2;
                    color2 = tmp;
                    break;
                case "bottom":
                    dir = "0";
                    break;
                case "left":
                    dir = "1";
                    tmp = color1;
                    color1 = color2;
                    color2 = tmp;
                    break;
                case "right":
                    dir = "1";
                    break;
                default:
                    return;
            }
            s[oldName] = "none";
            addFilter(
                s,
                "progid:DXImageTransform.Microsoft.gradient(startColorstr='" +
                    color1 +
                    "',endColorstr='" +
                    color2 +
                    "', gradientType='" +
                    dir +
                    "')"
            );
        });
    })();
} else {
    (() => {
        var testStyle = document.createElement("div").style;
        testStyle.cssText = "background:-webkit-linear-gradient(top,red,red)";
        if (testStyle.background!.length > 0) {
            (() => {
                var startsWithGradient = /^(?:repeating\-)?(?:linear|radial)\-gradient/gi;
                var revDirs = {
                    top: "bottom",
                    bottom: "top",
                    left: "right",
                    right: "left"
                };
                function gradientWebkitConvertor(style: any, value: any, name: string) {
                    if (startsWithGradient.test(value)) {
                        var pos = (<string>value).indexOf("(to ");
                        if (pos > 0) {
                            pos += 4;
                            var posEnd = (<string>value).indexOf(",", pos);
                            var dir = (<string>value).slice(pos, posEnd);
                            dir = dir
                                .split(" ")
                                .map(v => (<any>revDirs)[v] || v)
                                .join(" ");
                            value = (<string>value).slice(0, pos - 3) + dir + (<string>value).slice(posEnd);
                        }
                        value = "-webkit-" + value;
                    }
                    style[name] = value;
                }
                setStyleShim("background", gradientWebkitConvertor);
            })();
        }
    })();
}

// Bobril.OnChange

var bValue = "b$value";
var bSelectionStart = "b$selStart";
var bSelectionEnd = "b$selEnd";
var tValue = "value";

function isCheckboxLike(el: HTMLInputElement) {
    var t = el.type;
    return t === "checkbox" || t === "radio";
}

function stringArrayEqual(a1: string[], a2: string[]): boolean {
    var l = a1.length;
    if (l !== a2.length) return false;
    for (var j = 0; j < l; j++) {
        if (a1[j] !== a2[j]) return false;
    }
    return true;
}

function stringArrayContains(a: string[], v: string): boolean {
    for (var j = 0; j < a.length; j++) {
        if (a[j] === v) return true;
    }
    return false;
}

function selectedArray(options: HTMLSelectElement): string[] {
    var res: string[] = [];
    for (var j = 0; j < options.length; j++) {
        if (options[j].selected) res.push(options[j].value);
    }
    return res;
}

var prevSetValueCallback = setSetValue((el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => {
    var tagName = el.tagName;
    var isSelect = tagName === "SELECT";
    var isInput = tagName === "INPUT" || tagName === "TEXTAREA";
    if (!isInput && !isSelect) {
        prevSetValueCallback(el, node, newValue, oldValue);
        return;
    }
    if (node.ctx === undefined) {
        node.ctx = { me: node };
        node.component = emptyComponent;
    }
    if (oldValue === undefined) {
        (<any>node.ctx)[bValue] = newValue;
    }
    var isMultiSelect = isSelect && (<HTMLSelectElement>el).multiple;
    var emitDiff = false;
    if (isMultiSelect) {
        var options = <HTMLSelectElement>(<HTMLSelectElement>el).options;
        var currentMulti = selectedArray(options);
        if (!stringArrayEqual(newValue, currentMulti)) {
            if (
                oldValue === undefined ||
                stringArrayEqual(currentMulti, oldValue) ||
                !stringArrayEqual(newValue, (<any>node.ctx)[bValue])
            ) {
                for (var j = 0; j < options.length; j++) {
                    options[j].selected = stringArrayContains(newValue, options[j].value);
                }
                currentMulti = selectedArray(options);
                if (stringArrayEqual(currentMulti, newValue)) {
                    emitDiff = true;
                }
            } else {
                emitDiff = true;
            }
        }
    } else if (isInput || isSelect) {
        if (isInput && isCheckboxLike(<HTMLInputElement>el)) {
            var currentChecked = (<any>el).checked;
            if (newValue !== currentChecked) {
                if (oldValue === undefined || currentChecked === oldValue || newValue !== (<any>node.ctx)[bValue]) {
                    (<any>el).checked = newValue;
                } else {
                    emitDiff = true;
                }
            }
        } else {
            var isCombobox = isSelect && (<HTMLSelectElement>el).size < 2;
            var currentValue = (<any>el)[tValue];
            if (newValue !== currentValue) {
                if (oldValue === undefined || currentValue === oldValue || newValue !== (<any>node.ctx)[bValue]) {
                    if (isSelect) {
                        if (newValue === "") {
                            (<HTMLSelectElement>el).selectedIndex = isCombobox ? 0 : -1;
                        } else {
                            (<any>el)[tValue] = newValue;
                        }
                        if (newValue !== "" || isCombobox) {
                            currentValue = (<any>el)[tValue];
                            if (newValue !== currentValue) {
                                emitDiff = true;
                            }
                        }
                    } else {
                        (<any>el)[tValue] = newValue;
                    }
                } else {
                    emitDiff = true;
                }
            }
        }
    }
    if (emitDiff) {
        emitOnChange(undefined, el, node);
    } else {
        (<any>node.ctx)[bValue] = newValue;
    }
});

function emitOnChange(ev: Event | undefined, target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (target && target.nodeName === "OPTION") {
        target = document.activeElement;
        node = deref(target);
    }
    if (!node) {
        return false;
    }
    var c = node.component;
    const hasProp = node.attrs && node.attrs[bValue];
    const hasOnChange = c && c.onChange != null;
    const hasPropOrOnChange = hasProp || hasOnChange;
    const hasOnSelectionChange = c && c.onSelectionChange != null;
    if (!hasPropOrOnChange && !hasOnSelectionChange) return false;
    var ctx = node.ctx!;
    var tagName = (<Element>target).tagName;
    var isSelect = tagName === "SELECT";
    var isMultiSelect = isSelect && (<HTMLSelectElement>target).multiple;
    if (hasPropOrOnChange && isMultiSelect) {
        var vs = selectedArray(<HTMLSelectElement>(<HTMLSelectElement>target).options);
        if (!stringArrayEqual((<any>ctx)[bValue], vs)) {
            (<any>ctx)[bValue] = vs;
            if (hasProp) hasProp(vs);
            if (hasOnChange) c.onChange!(ctx, vs);
        }
    } else if (hasPropOrOnChange && isCheckboxLike(<HTMLInputElement>target)) {
        // Postpone change event so onClick will be processed before it
        if (ev && ev.type === "change") {
            setTimeout(() => {
                emitOnChange(undefined, target, node);
            }, 10);
            return false;
        }
        if ((<HTMLInputElement>target).type === "radio") {
            var radios = document.getElementsByName((<HTMLInputElement>target).name);
            for (var j = 0; j < radios.length; j++) {
                var radio = radios[j];
                var radioNode = deref(radio);
                if (!radioNode) continue;
                const rbHasProp = node.attrs![bValue];
                var radioComponent = radioNode.component;
                const rbHasOnChange = radioComponent && radioComponent.onChange != null;
                if (!rbHasProp && !rbHasOnChange) continue;
                var radioCtx = radioNode.ctx;
                var vrb = (<HTMLInputElement>radio).checked;
                if ((<any>radioCtx)[bValue] !== vrb) {
                    (<any>radioCtx)[bValue] = vrb;
                    if (rbHasProp) rbHasProp(vrb);
                    if (rbHasOnChange) radioComponent.onChange!(radioCtx!, vrb);
                }
            }
        } else {
            var vb = (<HTMLInputElement>target).checked;
            if ((<any>ctx)[bValue] !== vb) {
                (<any>ctx)[bValue] = vb;
                if (hasProp) hasProp(vb);
                if (hasOnChange) c.onChange!(ctx, vb);
            }
        }
    } else {
        if (hasPropOrOnChange) {
            var v = (<HTMLInputElement>target).value;
            if ((<any>ctx)[bValue] !== v) {
                (<any>ctx)[bValue] = v;
                if (hasProp) hasProp(v);
                if (hasOnChange) c.onChange!(ctx, v);
            }
        }
        if (hasOnSelectionChange) {
            let sStart = (<HTMLInputElement>target).selectionStart;
            let sEnd = (<HTMLInputElement>target).selectionEnd;
            let sDir = (<any>target).selectionDirection;
            let swap = false;
            let oStart = (<any>ctx)[bSelectionStart];
            if (sDir == null) {
                if (sEnd === oStart) swap = true;
            } else if (sDir === "backward") {
                swap = true;
            }
            if (swap) {
                let s = sStart;
                sStart = sEnd;
                sEnd = s;
            }
            emitOnSelectionChange(node, sStart, sEnd);
        }
    }
    return false;
}

function emitOnSelectionChange(node: IBobrilCacheNode, start: number, end: number) {
    let c = node.component;
    let ctx = node.ctx;
    if (c && ((<any>ctx)[bSelectionStart] !== start || (<any>ctx)[bSelectionEnd] !== end)) {
        (<any>ctx)[bSelectionStart] = start;
        (<any>ctx)[bSelectionEnd] = end;
        if (c.onSelectionChange)
            c.onSelectionChange(ctx!, {
                startPosition: start,
                endPosition: end
            });
    }
}

export function select(node: IBobrilCacheNode, start: number, end = start): void {
    (<any>node.element).setSelectionRange(
        Math.min(start, end),
        Math.max(start, end),
        start > end ? "backward" : "forward"
    );
    emitOnSelectionChange(node, start, end);
}

function emitOnMouseChange(
    ev: Event | undefined,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    let f = focused();
    if (f) emitOnChange(ev, <Node>f.element, f);
    return false;
}

// click here must have lower priority (higher number) over mouse handlers
var events = ["input", "cut", "paste", "keydown", "keypress", "keyup", "click", "change"];
for (var i = 0; i < events.length; i++) addEvent(events[i], 10, emitOnChange);

var mouseEvents = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel"];
for (var i = 0; i < mouseEvents.length; i++) addEvent(mouseEvents[i], 2, emitOnMouseChange);

// Bobril.OnKey

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

function buildParam(ev: KeyboardEvent): IKeyDownUpEvent {
    return {
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        meta: ev.metaKey || false,
        which: ev.which || ev.keyCode
    };
}

function emitOnKeyDown(ev: KeyboardEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (!node) return false;
    var param: IKeyDownUpEvent = buildParam(ev);
    if (bubble(node, "onKeyDown", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyUp(ev: KeyboardEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (!node) return false;
    var param: IKeyDownUpEvent = buildParam(ev);
    if (bubble(node, "onKeyUp", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyPress(ev: KeyboardEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (!node) return false;
    if (
        ev.which === 0 || // don't want special key presses
        ev.altKey // Ignore Alt+num in Firefox
    )
        return false;
    var param: IKeyPressEvent = { charCode: ev.which || ev.keyCode };
    if (bubble(node, "onKeyPress", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}

addEvent("keydown", 50, emitOnKeyDown);
addEvent("keyup", 50, emitOnKeyUp);
addEvent("keypress", 50, emitOnKeyPress);

// Bobril.Mouse

export interface IBobrilMouseEvent {
    x: number;
    y: number;
    /// 1 - left (or touch), 2 - middle, 3 - right <- it does not make sense but that's W3C
    button: number;
    /// 1 - single click, 2 - double click, 3+ - multi click
    count: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}

export const enum BobrilPointerType {
    Mouse = 0,
    Touch = 1,
    Pen = 2
}

export interface IBobrilPointerEvent extends IBobrilMouseEvent {
    id: number;
    type: BobrilPointerType;
}

export interface IBobrilMouseWheelEvent extends IBobrilMouseEvent {
    dx: number;
    dy: number;
}

const MoveOverIsNotTap = 13;
const TapShouldBeShorterThanMs = 750;
const MaxBustDelay = 500;
const MaxBustDelayForIE = 800;
const BustDistance = 50;

let ownerCtx: any = null;
let invokingOwner: boolean;
const onClickText = "onClick";
const onDoubleClickText = "onDoubleClick";

// PureFuncs: isMouseOwner, isMouseOwnerEvent

export function isMouseOwner(ctx: any): boolean {
    return ownerCtx === ctx;
}

export function isMouseOwnerEvent(): boolean {
    return invokingOwner;
}

export function registerMouseOwner(ctx: any): void {
    ownerCtx = ctx;
}

export function releaseMouseOwner(): void {
    ownerCtx = null;
}

function invokeMouseOwner(handlerName: string, param: any): boolean {
    if (ownerCtx == null) {
        return false;
    }

    var handler = ownerCtx.me.component[handlerName];
    if (!handler) {
        // no handler available
        return false;
    }
    invokingOwner = true;
    var stop = handler(ownerCtx, param);
    invokingOwner = false;
    return stop;
}

function hasPointerEventsNoneB(node: IBobrilCacheNode | null | undefined): boolean {
    while (node) {
        var s = node.style;
        if (s) {
            var e = s.pointerEvents;
            if (e !== undefined) {
                if (e === "none") return true;
                return false;
            }
        }
        node = node.parent;
    }
    return false;
}

function hasPointerEventsNone(target: Node): boolean {
    var bNode = deref(target);
    return hasPointerEventsNoneB(bNode);
}

function revertVisibilityChanges(hiddenEls: { t: HTMLElement; p: string }[]): boolean {
    if (hiddenEls.length) {
        for (var i = hiddenEls.length - 1; i >= 0; --i) {
            hiddenEls[i].t.style.visibility = hiddenEls[i].p;
        }
        return true;
    }
    return false;
}

function pushAndHide(hiddenEls: { t: HTMLElement; p: string | null }[], t: HTMLElement) {
    hiddenEls.push({ t: t, p: t.style.visibility });
    t.style.visibility = "hidden";
}

function pointerThroughIE(ev: MouseEvent, target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var hiddenEls: { t: HTMLElement; p: string }[] = [];
    var t = <HTMLElement>target;
    while (hasPointerEventsNone(t)) {
        pushAndHide(hiddenEls, t);
        t = <HTMLElement>document.elementFromPoint(ev.x, ev.y);
    }
    if (revertVisibilityChanges(hiddenEls)) {
        try {
            t.dispatchEvent(ev);
        } catch (e) {
            return false;
        }
        preventDefault(ev);
        return true;
    }
    return false;
}

function addEvent5(
    name: string,
    callback: (ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean
) {
    addEvent(name, 5, callback);
}

var pointersEventNames = ["PointerDown", "PointerMove", "PointerUp", "PointerCancel"];
var i: number;
if (ieVersion() && ieVersion() < 11) {
    // emulate pointer-events: none in older ie
    var mouseEvents = [
        "click",
        "dblclick",
        "drag",
        "dragend",
        "dragenter",
        "dragleave",
        "dragover",
        "dragstart",
        "drop",
        "mousedown",
        "mousemove",
        "mouseout",
        "mouseover",
        "mouseup",
        "mousewheel",
        "scroll",
        "wheel"
    ];
    for (i = 0; i < mouseEvents.length; ++i) {
        addEvent(mouseEvents[i], 1, pointerThroughIE);
    }
}

function type2Bobril(t: any): BobrilPointerType {
    if (t === "mouse" || t === 4) return BobrilPointerType.Mouse;
    if (t === "pen" || t === 3) return BobrilPointerType.Pen;
    return BobrilPointerType.Touch;
}

function pointerEventsNoneFix(
    x: number,
    y: number,
    target: Node | undefined,
    node: IBobrilCacheNode | undefined
): [Node, IBobrilCacheNode | undefined] {
    var hiddenEls: { t: HTMLElement; p: string }[] = [];
    var t = <HTMLElement>target;
    while (hasPointerEventsNoneB(node)) {
        pushAndHide(hiddenEls, t);
        t = <HTMLElement>document.elementFromPoint(x, y);
        node = deref(t);
    }
    revertVisibilityChanges(hiddenEls);
    return [t, node];
}

function buildHandlerPointer(name: string) {
    return function handlePointerDown(
        ev: PointerEvent,
        target: Node | undefined,
        node: IBobrilCacheNode | undefined
    ): boolean {
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        let button = ev.button + 1;
        let type = type2Bobril(ev.pointerType);
        let buttons = ev.buttons;
        if (button === 0 && type === BobrilPointerType.Mouse && buttons) {
            button = 1;
            while (!(buttons & 1)) {
                buttons = buttons >> 1;
                button++;
            }
        }
        var param: IBobrilPointerEvent = {
            id: ev.pointerId,
            type: type,
            x: ev.clientX,
            y: ev.clientY,
            button: button,
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail
        };
        if (emitEvent("!" + name, param, target, node)) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

function buildHandlerTouch(name: string) {
    return function handlePointerDown(
        ev: TouchEvent,
        target: Node | undefined,
        node: IBobrilCacheNode | undefined
    ): boolean {
        var preventDef = false;
        for (var i = 0; i < ev.changedTouches.length; i++) {
            var t = ev.changedTouches[i];
            target = <HTMLElement>document.elementFromPoint(t.clientX, t.clientY);
            node = deref(target);
            var param: IBobrilPointerEvent = {
                id: t.identifier + 2,
                type: BobrilPointerType.Touch,
                x: t.clientX,
                y: t.clientY,
                button: 1,
                shift: ev.shiftKey,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                meta: ev.metaKey || false,
                count: ev.detail
            };
            if (emitEvent("!" + name, param, target, node)) preventDef = true;
        }
        if (preventDef) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

function buildHandlerMouse(name: string) {
    return function handlePointer(
        ev: MouseEvent,
        target: Node | undefined,
        node: IBobrilCacheNode | undefined
    ): boolean {
        target = <HTMLElement>document.elementFromPoint(ev.clientX, ev.clientY);
        node = deref(target);
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        var param: IBobrilPointerEvent = {
            id: 1,
            type: BobrilPointerType.Mouse,
            x: ev.clientX,
            y: ev.clientY,
            button: decodeButton(ev),
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail
        };
        if (emitEvent("!" + name, param, target, node)) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

function listenMouse() {
    addEvent5("mousedown", buildHandlerMouse(pointersEventNames[0] /*"PointerDown"*/));
    addEvent5("mousemove", buildHandlerMouse(pointersEventNames[1] /*"PointerMove"*/));
    addEvent5("mouseup", buildHandlerMouse(pointersEventNames[2] /*"PointerUp"*/));
}

if ((<any>window).ontouchstart !== undefined) {
    addEvent5("touchstart", buildHandlerTouch(pointersEventNames[0] /*"PointerDown"*/));
    addEvent5("touchmove", buildHandlerTouch(pointersEventNames[1] /*"PointerMove"*/));
    addEvent5("touchend", buildHandlerTouch(pointersEventNames[2] /*"PointerUp"*/));
    addEvent5("touchcancel", buildHandlerTouch(pointersEventNames[3] /*"PointerCancel"*/));
    listenMouse();
} else if (window.onpointerdown !== undefined) {
    for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
        var name = pointersEventNames[i];
        addEvent5(name.toLowerCase(), buildHandlerPointer(name));
    }
} else if (window.onmspointerdown !== undefined) {
    for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
        var name = pointersEventNames[i];
        addEvent5("@MS" + name, buildHandlerPointer(name));
    }
} else {
    listenMouse();
}

for (var j = 0; j < 4 /*pointersEventNames.length*/; j++) {
    ((name: string) => {
        var onName = "on" + name;
        addEvent(
            "!" + name,
            50,
            (ev: IBobrilPointerEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) => {
                return invokeMouseOwner(onName, ev) || bubble(node, onName, ev) != null;
            }
        );
    })(pointersEventNames[j]);
}

var pointersDown: { [id: number]: BobrilPointerType } = newHashObj();
var toBust: Array<number>[] = [];
var firstPointerDown = -1;
var firstPointerDownTime = 0;
var firstPointerDownX = 0;
var firstPointerDownY = 0;
var tapCanceled = false;
var lastMouseEv: IBobrilPointerEvent | undefined;

function diffLess(n1: number, n2: number, diff: number) {
    return Math.abs(n1 - n2) < diff;
}

var prevMousePath: (IBobrilCacheNode | null)[] = [];

export function revalidateMouseIn() {
    if (lastMouseEv) mouseEnterAndLeave(lastMouseEv);
}

function mouseEnterAndLeave(ev: IBobrilPointerEvent) {
    lastMouseEv = ev;
    var t = <HTMLElement>document.elementFromPoint(ev.x, ev.y);
    var toPath = vdomPath(t);
    var node = toPath.length == 0 ? undefined : toPath[toPath.length - 1];
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(ev.x, ev.y, t, node == null ? undefined : node);
        t = <HTMLElement>fixed[0];
        toPath = vdomPath(t);
    }

    bubble(node, "onMouseOver", ev);

    var common = 0;
    while (common < prevMousePath.length && common < toPath.length && prevMousePath[common] === toPath[common])
        common++;

    var n: IBobrilCacheNode | null;
    var c: IBobrilComponent;
    var i = prevMousePath.length;
    if (i > 0) {
        n = prevMousePath[i - 1];
        if (n) {
            c = n.component;
            if (c && c.onMouseOut) c.onMouseOut(n.ctx!, ev);
        }
    }
    while (i > common) {
        i--;
        n = prevMousePath[i];
        if (n) {
            c = n.component;
            if (c && c.onMouseLeave) c.onMouseLeave(n.ctx!, ev);
        }
    }
    while (i < toPath.length) {
        n = toPath[i];
        if (n) {
            c = n.component;
            if (c && c.onMouseEnter) c.onMouseEnter(n.ctx!, ev);
        }
        i++;
    }
    prevMousePath = toPath;
    if (i > 0) {
        n = prevMousePath[i - 1];
        if (n) {
            c = n.component;
            if (c && c.onMouseIn) c.onMouseIn(n.ctx!, ev);
        }
    }
    return false;
}

function noPointersDown(): boolean {
    return Object.keys(pointersDown).length === 0;
}

function bustingPointerDown(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    if (firstPointerDown === -1 && noPointersDown()) {
        firstPointerDown = ev.id;
        firstPointerDownTime = now();
        firstPointerDownX = ev.x;
        firstPointerDownY = ev.y;
        tapCanceled = false;
        mouseEnterAndLeave(ev);
    }
    pointersDown[ev.id] = ev.type;
    if (firstPointerDown !== ev.id) {
        tapCanceled = true;
    }
    return false;
}

function bustingPointerMove(
    ev: IBobrilPointerEvent,
    target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    // Browser forgot to send mouse up? Let's fix it
    if (ev.type === BobrilPointerType.Mouse && ev.button === 0 && pointersDown[ev.id] != null) {
        ev.button = 1;
        emitEvent("!PointerUp", ev, target, node);
        ev.button = 0;
    }
    if (firstPointerDown === ev.id) {
        mouseEnterAndLeave(ev);
        if (
            !diffLess(firstPointerDownX, ev.x, MoveOverIsNotTap) ||
            !diffLess(firstPointerDownY, ev.y, MoveOverIsNotTap)
        )
            tapCanceled = true;
    } else if (noPointersDown()) {
        mouseEnterAndLeave(ev);
    }
    return false;
}

let clickingSpreeStart: number = 0;
let clickingSpreeCount: number = 0;

function shouldPreventClickingSpree(clickCount: number): boolean {
    if (clickingSpreeCount == 0) return false;
    let n = now();
    if (n < clickingSpreeStart + 1000 && clickCount >= clickingSpreeCount) {
        clickingSpreeStart = n;
        clickingSpreeCount = clickCount;
        return true;
    }
    clickingSpreeCount = 0;
    return false;
}

export function preventClickingSpree() {
    clickingSpreeCount = 2;
    clickingSpreeStart = now();
}

function bustingPointerUp(
    ev: IBobrilPointerEvent,
    target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        mouseEnterAndLeave(ev);
        firstPointerDown = -1;
        if (ev.type == BobrilPointerType.Touch && !tapCanceled) {
            if (now() - firstPointerDownTime < TapShouldBeShorterThanMs) {
                emitEvent("!PointerCancel", ev, target, node);
                shouldPreventClickingSpree(1);
                var handled = invokeMouseOwner(onClickText, ev) || bubble(node, onClickText, ev) != null;
                var delay = ieVersion() ? MaxBustDelayForIE : MaxBustDelay;
                toBust.push([ev.x, ev.y, now() + delay, handled ? 1 : 0]);
                return handled;
            }
        }
    }
    return false;
}

function bustingPointerCancel(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        firstPointerDown = -1;
    }
    return false;
}

function bustingClick(ev: MouseEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var n = now();
    for (var i = 0; i < toBust.length; i++) {
        var j = toBust[i];
        if (j[2] < n) {
            toBust.splice(i, 1);
            i--;
            continue;
        }
        if (diffLess(j[0], ev.clientX, BustDistance) && diffLess(j[1], ev.clientY, BustDistance)) {
            toBust.splice(i, 1);
            if (j[3]) preventDefault(ev);
            return true;
        }
    }
    return false;
}

var bustingEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "^click"];
var bustingEventHandlers = [
    bustingPointerDown,
    bustingPointerMove,
    bustingPointerUp,
    bustingPointerCancel,
    bustingClick
];
for (var i = 0; i < 5 /*bustingEventNames.length*/; i++) {
    addEvent(bustingEventNames[i], 3, bustingEventHandlers[i]);
}

function createHandlerMouse(handlerName: string) {
    return (ev: IBobrilPointerEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) => {
        if (firstPointerDown != ev.id && !noPointersDown()) return false;
        if (invokeMouseOwner(handlerName, ev) || bubble(node, handlerName, ev)) {
            return true;
        }
        return false;
    };
}

var mouseHandlerNames = ["Down", "Move", "Up", "Up"];
for (var i = 0; i < 4; i++) {
    addEvent(bustingEventNames[i], 80, createHandlerMouse("onMouse" + mouseHandlerNames[i]));
}

function decodeButton(ev: MouseEvent): number {
    return ev.which || ev.button;
}

function createHandler(handlerName: string, allButtons?: boolean) {
    return (ev: MouseEvent, target: Node | undefined, node: IBobrilCacheNode | undefined) => {
        if (
            listeningEventDeepness == 1 &&
            (target == null || target.nodeName != "INPUT" || ev.clientX != 0 || ev.clientY != 0)
        ) {
            // Fix target node only for browser triggered events + crazy heuristic to ignore click
            target = <HTMLElement>document.elementFromPoint(ev.clientX, ev.clientY);
            node = deref(target);
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
                target = fixed[0];
                node = fixed[1];
            }
        }
        let button = decodeButton(ev) || 1;
        // Ignore non left mouse click/dblclick event, but not for contextmenu event
        if (!allButtons && button !== 1) return false;
        let param: IBobrilMouseEvent = {
            x: ev.clientX,
            y: ev.clientY,
            button: button,
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail || 1
        };
        if (handlerName == onDoubleClickText) param.count = 2;
        if (
            shouldPreventClickingSpree(param.count) ||
            invokeMouseOwner(handlerName, param) ||
            bubble(node, handlerName, param)
        ) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

export function nodeOnPoint(x: number, y: number): IBobrilCacheNode | undefined {
    var target = <HTMLElement>document.elementFromPoint(x, y);
    var node = deref(target);
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(x, y, target, node);
        node = fixed[1];
    }
    return node;
}

function handleSelectStart(ev: any, _target: Node | undefined, node: IBobrilCacheNode | undefined): boolean {
    while (node) {
        var s = node.style;
        if (s) {
            var us = s.userSelect;
            if (us === "none") {
                preventDefault(ev);
                return true;
            }
            if (us) {
                break;
            }
        }
        node = node.parent;
    }
    return false;
}

addEvent5("selectstart", handleSelectStart);

// click must have higher priority over onchange detection
addEvent5("^click", createHandler(onClickText));
addEvent5("^dblclick", createHandler(onDoubleClickText));
addEvent5("contextmenu", createHandler("onContextMenu", true));

let wheelSupport = ("onwheel" in document.createElement("div") ? "" : "mouse") + "wheel";
function handleMouseWheel(ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined): boolean {
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
        target = fixed[0];
        node = fixed[1];
    }
    let button = ev.button + 1;
    let buttons = ev.buttons;
    if (button === 0 && buttons) {
        button = 1;
        while (!(buttons & 1)) {
            buttons = buttons >> 1;
            button++;
        }
    }
    let dx = 0,
        dy: number;
    if (wheelSupport == "mousewheel") {
        dy = -1 / 40 * ev.wheelDelta;
        ev.wheelDeltaX && (dx = -1 / 40 * ev.wheelDeltaX);
    } else {
        dx = ev.deltaX;
        dy = ev.deltaY;
    }
    var param: IBobrilMouseWheelEvent = {
        dx,
        dy,
        x: ev.clientX,
        y: ev.clientY,
        button: button,
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        meta: ev.metaKey || false,
        count: ev.detail
    };
    if (invokeMouseOwner("onMouseWheel", param) || bubble(node, "onMouseWheel", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
addEvent5(wheelSupport, handleMouseWheel);

export const pointersDownCount = () => Object.keys(pointersDown).length;
export const firstPointerDownId = () => firstPointerDown;
export const ignoreClick = (x: number, y: number) => {
    var delay = ieVersion() ? MaxBustDelayForIE : MaxBustDelay;
    toBust.push([x, y, now() + delay, 1]);
};

// Bobril.Focus

let currentActiveElement: Element | undefined = undefined;
let currentFocusedNode: IBobrilCacheNode | undefined = undefined;
let nodeStack: (IBobrilCacheNode | null)[] = [];

function emitOnFocusChange(inFocus: boolean): boolean {
    var newActiveElement = document.hasFocus() || inFocus ? document.activeElement : undefined;
    if (newActiveElement !== currentActiveElement) {
        currentActiveElement = newActiveElement;
        var newStack = vdomPath(currentActiveElement);
        var common = 0;
        while (common < nodeStack.length && common < newStack.length && nodeStack[common] === newStack[common])
            common++;
        var i = nodeStack.length - 1;
        var n: IBobrilCacheNode | null;
        var c: IBobrilComponent;
        if (i >= common) {
            n = nodeStack[i];
            if (n) {
                c = n.component;
                if (c && c.onBlur) c.onBlur(n.ctx!);
            }
            i--;
        }
        while (i >= common) {
            n = nodeStack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocusOut) c.onFocusOut(n.ctx!);
            }
            i--;
        }
        i = common;
        while (i + 1 < newStack.length) {
            n = newStack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocusIn) c.onFocusIn(n.ctx!);
            }
            i++;
        }
        if (i < newStack.length) {
            n = newStack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocus) c.onFocus(n.ctx!);
            }
            i++;
        }
        nodeStack = newStack;
        currentFocusedNode = nodeStack.length == 0 ? undefined : null2undefined(nodeStack[nodeStack.length - 1]);
    }
    return false;
}

function emitOnFocusChangeDelayed(): boolean {
    setTimeout(() => emitOnFocusChange(false), 10);
    return false;
}

addEvent("^focus", 50, () => emitOnFocusChange(true));
addEvent("^blur", 50, emitOnFocusChangeDelayed);

export function focused(): IBobrilCacheNode | undefined {
    return currentFocusedNode;
}

export function focus(node: IBobrilCacheNode): boolean {
    if (node == null) return false;
    if (isString(node)) return false;
    var style = node.style;
    if (style != null) {
        if (style.visibility === "hidden") return false;
        if (style.display === "none") return false;
    }
    var attrs = node.attrs;
    if (attrs != null) {
        var ti = attrs.tabindex;
        if (ti !== undefined || isNaturalyFocusable(node.tag, attrs)) {
            var el = node.element;
            (<HTMLElement>el).focus();
            emitOnFocusChange(false);
            return true;
        }
    }
    var children = node.children;
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            if (focus(children[i])) return true;
        }
        return false;
    }
    return false;
}

// Bobril.Scroll
var callbacks: Array<(info: IBobrilScroll) => void> = [];

function emitOnScroll(_ev: Event, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    let info: IBobrilScroll = {
        node
    };
    for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](info);
    }
    return false;
}

// capturing event to hear everything
addEvent("^scroll", 10, emitOnScroll);

export function addOnScroll(callback: (info?: IBobrilScroll) => void): void {
    callbacks.push(callback);
}

export function removeOnScroll(callback: (info?: IBobrilScroll) => void): void {
    for (var i = 0; i < callbacks.length; i++) {
        if (callbacks[i] === callback) {
            callbacks.splice(i, 1);
            return;
        }
    }
}

const isHtml = /^(?:html)$/i;
const isScrollOrAuto = /^(?:auto)$|^(?:scroll)$/i;
// inspired by https://github.com/litera/jquery-scrollintoview/blob/master/jquery.scrollintoview.js
export function isScrollable(el: Element): [boolean, boolean] {
    var styles: any = window.getComputedStyle(el);
    var res: [boolean, boolean] = [true, true];
    if (!isHtml.test(el.nodeName)) {
        res[0] = isScrollOrAuto.test(styles.overflowX);
        res[1] = isScrollOrAuto.test(styles.overflowY);
    }
    res[0] = res[0] && el.scrollWidth > el.clientWidth;
    res[1] = res[1] && el.scrollHeight > el.clientHeight;
    return res;
}

// returns standard X,Y order
export function getWindowScroll(): [number, number] {
    var left = window.pageXOffset;
    var top = window.pageYOffset;
    return [left, top];
}

// returns node offset on page in standard X,Y order
export function nodePagePos(node: IBobrilCacheNode): [number, number] {
    let rect = (<Element>getDomNode(node)).getBoundingClientRect();
    let res = getWindowScroll();
    res[0] += rect.left;
    res[1] += rect.top;
    return res;
}

type Point = [number, number];
class CSSMatrix {
    data: number[];
    constructor(data: number[]) {
        this.data = data;
    }
    static fromString(s: string): CSSMatrix {
        var c = s.match(/matrix3?d?\(([^\)]+)\)/i)![1].split(",");
        if (c.length === 6) {
            c = [c[0], c[1], "0", "0", c[2], c[3], "0", "0", "0", "0", "1", "0", c[4], c[5], "0", "1"];
        }
        return new CSSMatrix([
            parseFloat(c[0]),
            parseFloat(c[4]),
            parseFloat(c[8]),
            parseFloat(c[12]),
            parseFloat(c[1]),
            parseFloat(c[5]),
            parseFloat(c[9]),
            parseFloat(c[13]),
            parseFloat(c[2]),
            parseFloat(c[6]),
            parseFloat(c[10]),
            parseFloat(c[14]),
            parseFloat(c[3]),
            parseFloat(c[7]),
            parseFloat(c[11]),
            parseFloat(c[15])
        ]);
    }
    static identity(): CSSMatrix {
        return new CSSMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    }
    multiply(m: CSSMatrix): CSSMatrix {
        var a = this.data;
        var b = m.data;
        return new CSSMatrix([
            a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12],
            a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13],
            a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14],
            a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15],

            a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12],
            a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13],
            a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14],
            a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15],

            a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12],
            a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13],
            a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14],
            a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15],

            a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12],
            a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13],
            a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14],
            a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15]
        ]);
    }
    translate(tx: number, ty: number, tz: number): CSSMatrix {
        var z = new CSSMatrix([1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]);
        return this.multiply(z);
    }
    inverse(): CSSMatrix {
        var m = this.data;
        var a = m[0];
        var b = m[1];
        var c = m[2];
        var d = m[4];
        var e = m[5];
        var f = m[6];
        var g = m[8];
        var h = m[9];
        var k = m[10];
        var A = e * k - f * h;
        var B = f * g - d * k;
        var C = d * h - e * g;
        var D = c * h - b * k;
        var E = a * k - c * g;
        var F = b * g - a * h;
        var G = b * f - c * e;
        var H = c * d - a * f;
        var K = a * e - b * d;
        var det = a * A + b * B + c * C;
        var X = new CSSMatrix([
            A / det,
            D / det,
            G / det,
            0,
            B / det,
            E / det,
            H / det,
            0,
            C / det,
            F / det,
            K / det,
            0,
            0,
            0,
            0,
            1
        ]);
        var Y = new CSSMatrix([1, 0, 0, -m[3], 0, 1, 0, -m[7], 0, 0, 1, -m[11], 0, 0, 0, 1]);
        return X.multiply(Y);
    }
    transformPoint(x: number, y: number): Point {
        var m = this.data;
        return [m[0] * x + m[1] * y + m[3], m[4] * x + m[5] * y + m[7]];
    }
}

function getTransformationMatrix(element: Node) {
    var identity = CSSMatrix.identity();
    var transformationMatrix = identity;
    var x: Node | null = element;
    var doc = x.ownerDocument.documentElement;
    while (x != undefined && x !== doc && x.nodeType != 1) x = x.parentNode;
    while (x != undefined && x !== doc) {
        var computedStyle = <any>window.getComputedStyle(<HTMLElement>x, undefined);
        var c = CSSMatrix.fromString(
            (computedStyle.transform ||
                computedStyle.OTransform ||
                computedStyle.WebkitTransform ||
                computedStyle.msTransform ||
                computedStyle.MozTransform ||
                "none"
            ).replace(/^none$/, "matrix(1,0,0,1,0,0)")
        );
        transformationMatrix = c.multiply(transformationMatrix);
        x = x.parentNode;
    }
    var w: number;
    var h: number;
    if ((element.nodeName + "").toLowerCase() === "svg") {
        var cs = getComputedStyle(<Element>element, undefined);
        w = parseFloat(cs.getPropertyValue("width")) || 0;
        h = parseFloat(cs.getPropertyValue("height")) || 0;
    } else {
        w = (<HTMLElement>element).offsetWidth;
        h = (<HTMLElement>element).offsetHeight;
    }
    var i = 4;
    var left = +Infinity;
    var top = +Infinity;
    while (--i >= 0) {
        var p = transformationMatrix.transformPoint(i === 0 || i === 1 ? 0 : w, i === 0 || i === 3 ? 0 : h);
        if (p[0] < left) {
            left = p[0];
        }
        if (p[1] < top) {
            top = p[1];
        }
    }
    var rect = (<HTMLElement>element).getBoundingClientRect();
    transformationMatrix = identity.translate(rect.left - left, rect.top - top, 0).multiply(transformationMatrix);
    return transformationMatrix;
}

export function convertPointFromClientToNode(node: IBobrilCacheNode, pageX: number, pageY: number): [number, number] {
    let element = getDomNode(node);
    if (element == null) element = document.body;
    return getTransformationMatrix(element)
        .inverse()
        .transformPoint(pageX, pageY);
}

// Bobril.Dnd

export const enum DndOp {
    None = 0,
    Link = 1,
    Copy = 2,
    Move = 3
}

export const enum DndEnabledOps {
    None = 0,
    Link = 1,
    Copy = 2,
    LinkCopy = 3,
    Move = 4,
    MoveLink = 5,
    MoveCopy = 6,
    MoveCopyLink = 7
}

export interface IDndCtx {
    id: number;
    listData(): string[];
    hasData(type: string): boolean;
    getData(type: string): any;
    enabledOperations: DndEnabledOps;
    operation: DndOp;
    overNode: IBobrilCacheNode | undefined;
    // way to override mouse cursor, leave null to emulate dnd cursor
    cursor: string | null;
    // dnd is waiting for activation by moving at least distanceToStart pixels
    started: boolean;
    beforeDrag: boolean;
    system: boolean;
    local: boolean;
    ended: boolean;
    // default value is 10, but you can assign to this >=0 number in onDragStart
    distanceToStart: number;
    // drag started at this pointer position
    startX: number;
    startY: number;
    // distance moved - only increasing
    totalX: number;
    totalY: number;
    // previous mouse/touch pointer position
    lastX: number;
    lastY: number;
    // actual mouse/touch pointer position
    x: number;
    y: number;
    // delta of left top position of dragged object when drag started, usually negative
    deltaX: number;
    deltaY: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;

    // internal
    pointerid: number;
    data: any;
    targetCtx: any;
    dragView: ((dnd: IDndCtx) => IBobrilChildren) | undefined;
    destroy(): void;
}

export interface IDndStartCtx extends IDndCtx {
    addData(type: string, data: any): boolean;
    setEnabledOps(ops: DndEnabledOps): void;
    setDragNodeView(view: (dnd: IDndCtx) => IBobrilChildren): void;
}

export interface IDndOverCtx extends IDndCtx {
    setOperation(operation: DndOp): void;
}

var lastDndId = 0;
var dnds: IDndCtx[] = [];
var systemDnd: IDndCtx | null = null;
var rootId: string | null = null;
var bodyCursorBackup: string;
var userSelectBackup: string;
var shimmedStyle = { userSelect: "" };
shimStyle(shimmedStyle);
var shimedStyleKeys = Object.keys(shimmedStyle);
var userSelectPropName = shimedStyleKeys[shimedStyleKeys.length - 1]; // renamed is last

var DndCtx = function(this: IDndCtx, pointerId: number) {
    this.id = ++lastDndId;
    this.pointerid = pointerId;
    this.enabledOperations = DndEnabledOps.MoveCopyLink;
    this.operation = DndOp.None;
    this.started = false;
    this.beforeDrag = true;
    this.local = true;
    this.system = false;
    this.ended = false;
    this.cursor = null;
    this.overNode = undefined;
    this.targetCtx = null;
    this.dragView = undefined;
    this.startX = 0;
    this.startY = 0;
    this.distanceToStart = 10;
    this.x = 0;
    this.y = 0;
    this.deltaX = 0;
    this.deltaY = 0;
    this.totalX = 0;
    this.totalY = 0;
    this.lastX = 0;
    this.lastY = 0;
    this.shift = false;
    this.ctrl = false;
    this.alt = false;
    this.meta = false;
    this.data = newHashObj();
    if (pointerId >= 0) pointer2Dnd[pointerId] = this;
    dnds.push(this);
};

function lazyCreateRoot() {
    if (rootId == null) {
        let dbs = <any>document.body.style;
        bodyCursorBackup = dbs.cursor;
        userSelectBackup = dbs[userSelectPropName];
        dbs[userSelectPropName] = "none";
        rootId = addRoot(dndRootFactory);
    }
}

var DndComp: IBobrilComponent = {
    render(ctx: IBobrilCtx, me: IBobrilNode) {
        var dnd: IDndCtx = ctx.data;
        me.tag = "div";
        me.style = { position: "absolute", left: dnd.x, top: dnd.y };
        me.children = dnd.dragView!(dnd);
    }
};

function currentCursor() {
    let cursor = "no-drop";
    if (dnds.length !== 0) {
        let dnd = dnds[0];
        if (dnd.beforeDrag) return "";
        if (dnd.cursor != null) return dnd.cursor;
        if (dnd.system) return "";
        switch (dnd.operation) {
            case DndOp.Move:
                cursor = "move";
                break;
            case DndOp.Link:
                cursor = "alias";
                break;
            case DndOp.Copy:
                cursor = "copy";
                break;
        }
    }
    return cursor;
}

var DndRootComp: IBobrilComponent = {
    render(_ctx: IBobrilCtx, me: IBobrilNode) {
        var res: IBobrilNode[] = [];
        for (var i = 0; i < dnds.length; i++) {
            var dnd = dnds[i];
            if (dnd.beforeDrag) continue;
            if (dnd.dragView != null && (dnd.x != 0 || dnd.y != 0)) {
                res.push({ key: "" + dnd.id, data: dnd, component: DndComp });
            }
        }
        me.tag = "div";
        me.style = {
            position: "fixed",
            pointerEvents: "none",
            userSelect: "none",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0
        };
        let dbs = document.body.style;
        let cur = currentCursor();
        if (cur && dbs.cursor !== cur) dbs.cursor = cur;
        me.children = res;
    },
    onDrag(ctx: IBobrilCtx): boolean {
        invalidate(ctx);
        return false;
    }
};

function dndRootFactory(): IBobrilChildren {
    return { component: DndRootComp };
}

var dndProto = DndCtx.prototype;
dndProto.setOperation = function(this: IDndCtx, operation: DndOp): void {
    this.operation = operation;
};

dndProto.setDragNodeView = function(this: IDndCtx, view: ((dnd: IDndCtx) => IBobrilChildren) | undefined): void {
    this.dragView = view;
};

dndProto.addData = function(this: IDndCtx, type: string, data: any): boolean {
    this.data[type] = data;
    return true;
};

dndProto.listData = function(this: IDndCtx): string[] {
    return Object.keys(this.data);
};

dndProto.hasData = function(this: IDndCtx, type: string): boolean {
    return this.data[type] !== undefined;
};

dndProto.getData = function(this: IDndCtx, type: string): any {
    return this.data[type];
};

dndProto.setEnabledOps = function(this: IDndCtx, ops: DndEnabledOps): void {
    this.enabledOperations = ops;
};

dndProto.cancelDnd = function(this: IDndCtx): void {
    dndMoved(undefined, this);
    this.destroy();
};

dndProto.destroy = function(this: IDndCtx): void {
    this.ended = true;
    if (this.started) broadcast("onDragEnd", this);
    delete pointer2Dnd[this.pointerid];
    for (var i = 0; i < dnds.length; i++) {
        if (dnds[i] === this) {
            dnds.splice(i, 1);
            break;
        }
    }
    if (systemDnd === this) {
        systemDnd = null;
    }
    if (dnds.length === 0 && rootId != null) {
        removeRoot(rootId);
        rootId = null;
        let dbs = <any>document.body.style;
        dbs.cursor = bodyCursorBackup;
        dbs[userSelectPropName] = userSelectBackup;
    }
};

var pointer2Dnd = newHashObj();

function handlePointerDown(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (dnd) {
        dnd.cancelDnd();
    }
    if (ev.button <= 1) {
        dnd = new (<any>DndCtx)(ev.id);
        dnd.startX = ev.x;
        dnd.startY = ev.y;
        dnd.lastX = ev.x;
        dnd.lastY = ev.y;
        dnd.overNode = node;
        updateDndFromPointerEvent(dnd, ev);
        var sourceCtx = bubble(node, "onDragStart", dnd);
        if (sourceCtx) {
            var htmlNode = getDomNode(sourceCtx.me);
            if (htmlNode == null) {
                dnd.destroy();
                return false;
            }
            dnd.started = true;
            var boundFn = (<Element>htmlNode).getBoundingClientRect;
            if (boundFn) {
                var rect = boundFn.call(htmlNode);
                dnd.deltaX = rect.left - ev.x;
                dnd.deltaY = rect.top - ev.y;
            }
            if (dnd.distanceToStart <= 0) {
                dnd.beforeDrag = false;
                dndMoved(node, dnd);
            }
            lazyCreateRoot();
        } else {
            dnd.destroy();
        }
    }
    return false;
}

function dndMoved(node: IBobrilCacheNode | undefined, dnd: IDndCtx) {
    dnd.overNode = node;
    dnd.targetCtx = bubble(node, "onDragOver", dnd);
    if (dnd.targetCtx == null) {
        dnd.operation = DndOp.None;
    }
    broadcast("onDrag", dnd);
}

function updateDndFromPointerEvent(dnd: IDndCtx, ev: IBobrilPointerEvent) {
    dnd.shift = ev.shift;
    dnd.ctrl = ev.ctrl;
    dnd.alt = ev.alt;
    dnd.meta = ev.meta;
    dnd.x = ev.x;
    dnd.y = ev.y;
}

function handlePointerMove(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
    dnd.totalX += Math.abs(ev.x - dnd.lastX);
    dnd.totalY += Math.abs(ev.y - dnd.lastY);
    if (dnd.beforeDrag) {
        if (dnd.totalX + dnd.totalY <= dnd.distanceToStart) {
            dnd.lastX = ev.x;
            dnd.lastY = ev.y;
            return false;
        }
        dnd.beforeDrag = false;
    }
    updateDndFromPointerEvent(dnd, ev);
    dndMoved(node, dnd);
    dnd.lastX = ev.x;
    dnd.lastY = ev.y;
    return true;
}

function handlePointerUp(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
    if (!dnd.beforeDrag) {
        updateDndFromPointerEvent(dnd, ev);
        dndMoved(node, dnd);
        var t: IBobrilCtx = dnd.targetCtx;
        if (t && bubble(t.me, "onDrop", dnd)) {
            dnd.destroy();
        } else {
            dnd.cancelDnd();
        }
        ignoreClick(ev.x, ev.y);
        return true;
    }
    dnd.destroy();
    return false;
}

function handlePointerCancel(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
    if (dnd.system) return false;
    if (!dnd.beforeDrag) {
        dnd.cancelDnd();
    } else {
        dnd.destroy();
    }
    return false;
}

function updateFromNative(dnd: IDndCtx, ev: DragEvent) {
    dnd.shift = ev.shiftKey;
    dnd.ctrl = ev.ctrlKey;
    dnd.alt = ev.altKey;
    dnd.meta = ev.metaKey;
    dnd.x = ev.clientX;
    dnd.y = ev.clientY;
    dnd.totalX += Math.abs(dnd.x - dnd.lastX);
    dnd.totalY += Math.abs(dnd.y - dnd.lastY);
    var node = nodeOnPoint(dnd.x, dnd.y); // Needed to correctly emulate pointerEvents:none
    dndMoved(node, dnd);
    dnd.lastX = dnd.x;
    dnd.lastY = dnd.y;
}

var effectAllowedTable = ["none", "link", "copy", "copyLink", "move", "linkMove", "copyMove", "all"];

function handleDragStart(ev: DragEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined): boolean {
    var dnd: IDndCtx | null = systemDnd;
    if (dnd != null) {
        (<any>dnd).destroy();
    }
    var activePointerIds = Object.keys(pointer2Dnd);
    if (activePointerIds.length > 0) {
        dnd = pointer2Dnd[activePointerIds[0]];
        dnd!.system = true;
        systemDnd = dnd;
    } else {
        var startX = ev.clientX,
            startY = ev.clientY;
        dnd = new (<any>DndCtx)(-1);
        dnd!.system = true;
        systemDnd = dnd;
        dnd!.x = startX;
        dnd!.y = startY;
        dnd!.lastX = startX;
        dnd!.lastY = startY;
        dnd!.startX = startX;
        dnd!.startY = startY;
        var sourceCtx = bubble(node, "onDragStart", dnd);
        if (sourceCtx) {
            var htmlNode = getDomNode(sourceCtx.me);
            if (htmlNode == null) {
                (<any>dnd).destroy();
                return false;
            }
            dnd!.started = true;
            var boundFn = (<Element>htmlNode).getBoundingClientRect;
            if (boundFn) {
                var rect = boundFn.call(htmlNode);
                dnd!.deltaX = rect.left - startX;
                dnd!.deltaY = rect.top - startY;
            }
            lazyCreateRoot();
        } else {
            (<any>dnd).destroy();
            return false;
        }
    }
    dnd!.beforeDrag = false;
    var eff = effectAllowedTable[dnd!.enabledOperations];
    var dt = ev.dataTransfer;
    dt.effectAllowed = eff;
    if ((<any>dt).setDragImage) {
        var div = document.createElement("div");
        div.style.pointerEvents = "none";
        (<any>dt).setDragImage(div, 0, 0);
    } else {
        // For IE10 and IE11 hack to hide default drag element
        var style = (<HTMLElement>ev.target).style;
        var opacityBackup = style.opacity;
        var widthBackup = style.width;
        var heightBackup = style.height;
        var paddingBackup = style.padding;
        style.opacity = "0";
        style.width = "0";
        style.height = "0";
        style.padding = "0";
        window.setTimeout(() => {
            style.opacity = opacityBackup;
            style.width = widthBackup;
            style.height = heightBackup;
            style.padding = paddingBackup;
        }, 0);
    }
    var data = dnd!.data;
    var dataKeys = Object.keys(data);
    for (var i = 0; i < dataKeys.length; i++) {
        try {
            var k = dataKeys[i];
            var d = data[k];
            if (!isString(d)) d = JSON.stringify(d);
            ev.dataTransfer.setData(k, d);
        } catch (e) {
            if (DEBUG) if (window.console) console.log("Cannot set dnd data to " + dataKeys[i]);
        }
    }
    updateFromNative(dnd!, ev);
    return false;
}

function setDropEffect(ev: DragEvent, op: DndOp) {
    ev.dataTransfer.dropEffect = ["none", "link", "copy", "move"][op];
}

function handleDragOver(ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var dnd = systemDnd;
    if (dnd == null) {
        dnd = new (<any>DndCtx)(-1);
        dnd!.system = true;
        systemDnd = dnd;
        dnd!.x = ev.clientX;
        dnd!.y = ev.clientY;
        dnd!.startX = dnd!.x;
        dnd!.startY = dnd!.y;
        dnd!.local = false;
        var dt = ev.dataTransfer;
        var eff = 0;
        var effectAllowed: string | undefined = undefined;
        try {
            effectAllowed = dt.effectAllowed;
        } catch (e) {}
        for (; eff < 7; eff++) {
            if (effectAllowedTable[eff] === effectAllowed) break;
        }
        dnd!.enabledOperations = eff;
        var dtTypes = dt.types;
        if (dtTypes) {
            for (var i = 0; i < dtTypes.length; i++) {
                var tt = dtTypes[i];
                if (tt === "text/plain") tt = "Text";
                else if (tt === "text/uri-list") tt = "Url";
                (<any>dnd).data[tt] = null;
            }
        } else {
            if (dt.getData("Text") !== undefined) (<any>dnd).data["Text"] = null;
        }
    }
    updateFromNative(dnd!, ev);
    setDropEffect(ev, dnd!.operation);
    if (dnd!.operation != DndOp.None) {
        preventDefault(ev);
        return true;
    }
    return false;
}

function handleDrag(ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var x = ev.clientX;
    var y = ev.clientY;
    var m = getMedia();
    if (systemDnd != null && ((x === 0 && y === 0) || x < 0 || y < 0 || x >= m.width || y >= m.height)) {
        systemDnd.x = 0;
        systemDnd.y = 0;
        systemDnd.operation = DndOp.None;
        broadcast("onDrag", systemDnd);
    }
    return false;
}

function handleDragEnd(_ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    if (systemDnd != null) {
        systemDnd.destroy();
    }
    return false;
}

function handleDrop(ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var dnd = systemDnd;
    if (dnd == null) return false;
    dnd.x = ev.clientX;
    dnd.y = ev.clientY;
    if (!dnd.local) {
        var dataKeys = Object.keys(dnd.data);
        var dt = ev.dataTransfer;
        for (let i = 0; i < dataKeys.length; i++) {
            var k = dataKeys[i];
            var d: any;
            if (k === "Files") {
                d = [].slice.call(dt.files, 0); // What a useless FileList type! Get rid of it.
            } else {
                d = dt.getData(k);
            }
            dnd.data[k] = d;
        }
    }
    updateFromNative(dnd, ev);
    var t: IBobrilCtx = dnd.targetCtx;
    if (t && bubble(t.me, "onDrop", dnd)) {
        setDropEffect(ev, dnd.operation);
        dnd.destroy();
        preventDefault(ev);
    } else {
        (<any>dnd).cancelDnd();
    }
    return true;
}

function justPreventDefault(ev: any, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    preventDefault(ev);
    return true;
}

function handleDndSelectStart(ev: any, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    if (dnds.length === 0) return false;
    preventDefault(ev);
    return true;
}

export function anyActiveDnd(): IDndCtx | undefined {
    for (let i = 0; i < dnds.length; i++) {
        let dnd = dnds[i];
        if (dnd.beforeDrag) continue;
        return dnd;
    }
    return undefined;
}

addEvent("!PointerDown", 4, handlePointerDown);
addEvent("!PointerMove", 4, handlePointerMove);
addEvent("!PointerUp", 4, handlePointerUp);
addEvent("!PointerCancel", 4, handlePointerCancel);
addEvent("selectstart", 4, handleDndSelectStart);

addEvent("dragstart", 5, handleDragStart);
addEvent("dragover", 5, handleDragOver);
addEvent("dragend", 5, handleDragEnd);
addEvent("drag", 5, handleDrag);
addEvent("drop", 5, handleDrop);
addEvent("dragenter", 5, justPreventDefault);
addEvent("dragleave", 5, justPreventDefault);
export const getDnds = () => dnds;

// Bobril.Router

export interface Params {
    [name: string]: string;
}

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

export const enum RouteTransitionType {
    Push,
    Replace,
    Pop
}

export interface IRouteTransition {
    inApp: boolean;
    type: RouteTransitionType;
    name: string | undefined;
    params: Params | undefined;
    distance?: number;
}

export type IRouteCanResult = boolean | Thenable<boolean> | IRouteTransition | Thenable<IRouteTransition>;

export type IRouteHandler = IBobrilComponent | ((data: any) => IBobrilNode);

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

let myAppHistoryDeepness = 0;
let programPath = "";

function push(path: string, inApp: boolean): void {
    var l = window.location;
    if (inApp) {
        programPath = path;
        l.hash = path.substring(1);
        myAppHistoryDeepness++;
    } else {
        l.href = path;
    }
}

function replace(path: string, inApp: boolean) {
    var l = window.location;
    if (inApp) {
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

let rootRoutes: IRoute[];
let nameRouteMap: { [name: string]: IRoute } = {};

function encodeUrl(url: string): string {
    return encodeURIComponent(url).replace(/%20/g, "+");
}

function decodeUrl(url: string): string {
    return decodeURIComponent(url.replace(/\+/g, " "));
}

function encodeUrlPath(path: string): string {
    return String(path)
        .split("/")
        .map(encodeUrl)
        .join("/");
}

const paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
const paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;

let compiledPatterns: {
    [pattern: string]: { matcher: RegExp; paramNames: string[] };
} = {};

function compilePattern(pattern: string) {
    if (!(pattern in <any>compiledPatterns)) {
        var paramNames: Array<string> = [];
        var source = pattern.replace(paramCompileMatcher, (match: string, paramName: string) => {
            if (paramName) {
                paramNames.push(paramName);
                return "([^/]+)";
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

// Extracts the portions of the given URL path that match the given pattern.
// Returns null if the pattern does not match the given path.
function extractParams(pattern: string, path: string): Params | null {
    var object = compilePattern(pattern);
    var match = decodeUrl(path).match(object.matcher);

    if (!match) return null;

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

    return pattern.replace(paramInjectMatcher, (_match: string, paramName: string) => {
        paramName = paramName || "splat";

        // If param is optional don't check for existence
        if (paramName.slice(-1) !== "?") {
            if (params![paramName] == null)
                throw new Error('Missing "' + paramName + '" parameter for path "' + pattern + '"');
        } else {
            paramName = paramName.slice(0, -1);
            if (params![paramName] == null) {
                return "";
            }
        }

        var segment: string;
        if (paramName === "splat" && Array.isArray(params![paramName])) {
            segment = params![paramName][splatIndex++];

            if (segment == null) throw new Error("Missing splat # " + splatIndex + ' for path "' + pattern + '"');
        } else {
            segment = params![paramName];
        }

        return encodeUrlPath(segment);
    });
}

function findMatch(path: string, rs: Array<IRoute>, outParams: OutFindMatch): IRoute[] | undefined {
    var l = rs.length;
    var notFoundRoute: IRoute | undefined;
    var defaultRoute: IRoute | undefined;
    var params: Params | null;
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
let nodesArray: (IBobrilCacheNode | undefined)[] = [];
let setterOfNodesArray: ((node: IBobrilCacheNode | undefined) => void)[] = [];
const urlRegex = /.*(?:\:|\/).*/;

function isInApp(name: string): boolean {
    return !urlRegex.test(name);
}

function isAbsolute(url: string): boolean {
    return url[0] === "/";
}

function noop(): IBobrilNode | undefined {
    return undefined;
}

function getSetterOfNodesArray(idx: number): (node: IBobrilCacheNode | undefined) => void {
    while (idx >= setterOfNodesArray.length) {
        setterOfNodesArray.push(
            ((a: (IBobrilCacheNode | undefined)[], i: number) => (n: IBobrilCacheNode | undefined) => {
                if (n) a[i] = n;
            })(nodesArray, idx)
        );
    }
    return setterOfNodesArray[idx];
}

var firstRouting = true;
function rootNodeFactory(): IBobrilNode | undefined {
    if (waitingForPopHashChange >= 0) return undefined;
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
            params: undefined
        };
        transitionState = -1;
        programPath = browserPath;
    } else {
        if (!currentTransition && matches.length > 0 && browserPath != programPath) {
            runTransition(createRedirectPush(matches[0].name!, out.p));
        }
    }
    if (currentTransition && currentTransition.type === RouteTransitionType.Pop && transitionState < 0) {
        programPath = browserPath;
        currentTransition.inApp = true;
        if (currentTransition.name == null && matches.length > 0) {
            currentTransition.name = matches[0].name;
            currentTransition.params = out.p;
            nextIteration();
            if (currentTransition != null) return undefined;
        } else return undefined;
    }
    if (currentTransition == null) {
        activeRoutes = matches;
        while (nodesArray.length > activeRoutes.length) nodesArray.pop();
        while (nodesArray.length < activeRoutes.length) nodesArray.push(undefined);
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
                    res = handler(data);
                } else {
                    res = {
                        key: undefined,
                        ref: undefined,
                        data,
                        component: handler
                    };
                }
                if (r.keyBuilder) res.key = r.keyBuilder(routeParams);
                else res.key = r.name;
                res.ref = getSetterOfNodesArray(i);
                return res;
            };
        })(fn, activeRoutes[i], activeParams, i);
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
        var r = rs[i];
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
        children: nestedRoutes
    };
}

export function routeDefault(config: IRouteConfig): IRoute {
    return {
        name: config.name,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        isDefault: true
    };
}

export function routeNotFound(config: IRouteConfig): IRoute {
    return {
        name: config.name,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        isNotFound: true
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
        if (activeRoutes[i].name === name) {
            return true;
        }
    }
    return false;
}

export function urlOfRoute(name: string, params?: Params): string {
    if (isInApp(name)) {
        var r = nameRouteMap[name];
        if (DEBUG) {
            if (rootRoutes == null) throw Error("Cannot use urlOfRoute before defining routes");
            if (r == null) throw Error("Route with name " + name + " if not defined in urlOfRoute");
        }
        return "#" + injectParams(r.url!, params);
    }
    return name;
}

export function link(node: IBobrilNode, name: string, params?: Params): IBobrilNode {
    node.data = node.data || {};
    node.data.routeName = name;
    node.data.routeParams = params;
    postEnhance(node, {
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

export function createRedirectPush(name: string, params?: Params): IRouteTransition {
    return {
        inApp: isInApp(name),
        type: RouteTransitionType.Push,
        name: name,
        params: params || {}
    };
}

export function createRedirectReplace(name: string, params?: Params): IRouteTransition {
    return {
        inApp: isInApp(name),
        type: RouteTransitionType.Replace,
        name: name,
        params: params || {}
    };
}

export function createBackTransition(distance?: number): IRouteTransition {
    distance = distance || 1;
    return {
        inApp: myAppHistoryDeepness >= distance,
        type: RouteTransitionType.Pop,
        name: undefined,
        params: {},
        distance
    };
}

var currentTransition: IRouteTransition | null = null;
var nextTransition: IRouteTransition | null = null;
var transitionState: number = 0;

function doAction(transition: IRouteTransition) {
    switch (transition.type) {
        case RouteTransitionType.Push:
            push(urlOfRoute(transition.name!, transition.params), transition.inApp);
            break;
        case RouteTransitionType.Replace:
            replace(urlOfRoute(transition.name!, transition.params), transition.inApp);
            break;
        case RouteTransitionType.Pop:
            pop(transition.distance!);
            break;
    }
    invalidate();
}

declare var Promise: any;

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
                    if (typeof console !== "undefined" && console.log) console.log(err);
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
            let rr = futureRoutes[futureRoutes.length + 1 + transitionState];
            transitionState--;
            let handler = rr.handler;
            let comp: IBobrilComponent | undefined = undefined;
            if (isFunction(handler)) {
                let node = handler({});
                if (!node) continue;
                comp = node.component;
            } else {
                comp = handler;
            }
            if (!comp) continue;
            let fn = comp.canActivate;
            if (!fn) continue;
            let res = fn.call(comp, currentTransition);
            if (res === true) continue;
            Promise.resolve(res)
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
                    if (typeof console !== "undefined" && console.log) console.log(err);
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

interface IBobrilAnchorCtx extends IBobrilCtx {
    l: number;
} // shortened lastTransitionRunCount

export function anchor(children: IBobrilChildren, name?: string, params?: Params): IBobrilNode {
    return {
        children,
        component: {
            id: "anchor",
            postUpdateDom(ctx: IBobrilAnchorCtx, me: IBobrilCacheNode) {
                let routeName: string | undefined;
                if (name) {
                    routeName = name;
                } else {
                    let firstChild = (me.children && me.children[0]) as IBobrilCacheNode;
                    routeName = firstChild.attrs && firstChild.attrs.id;
                }
                if (!isActive(routeName, params)) {
                    ctx.l = 0;
                    return;
                }
                if (ctx.l === transitionRunCount) return;
                (getDomNode(me) as HTMLElement).scrollIntoView();
                ctx.l = transitionRunCount;
            }
        }
    };
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

// Bobril.Style

// definition for Bobril defined class
export type IBobrilStyleDef = string;
// object case if for inline style declaration, undefined, null, true and false values are ignored
export type IBobrilStyle = Object | IBobrilStyleDef | boolean | null | undefined;
// place inline styles at end for optimal speed
export type IBobrilStyles = IBobrilStyle | IBobrilStyle[];

interface ISprite {
    styleId: IBobrilStyleDef;
    url: string;
    width: number | undefined;
    height: number | undefined;
    left: number;
    top: number;
}

interface IDynamicSprite extends ISprite {
    color: () => string;
    lastColor: string;
    lastUrl: string;
}

interface IInternalStyle {
    name: string | null;
    realName: string | null;
    parent?: IBobrilStyleDef | IBobrilStyleDef[];
    style: any;
    inlStyle?: any;
    pseudo?: { [name: string]: string };
}

var allStyles: { [id: string]: IInternalStyle } = newHashObj();
var allSprites: { [key: string]: ISprite } = newHashObj();
var allNameHints: { [name: string]: boolean } = newHashObj();
var dynamicSprites: IDynamicSprite[] = [];
var imageCache: { [url: string]: HTMLImageElement | null } = newHashObj();
var injectedCss = "";
var rebuildStyles = false;
var htmlStyle: HTMLStyleElement | null = null;
var globalCounter: number = 0;
const isIE9 = ieVersion() === 9;

var chainedBeforeFrame = setBeforeFrame(beforeFrame);

const cssSubRuleDelimiter = /\:|\ |\>/;

function buildCssSubRule(parent: string): string | null {
    let matchSplit = cssSubRuleDelimiter.exec(parent);
    if (!matchSplit) return allStyles[parent].name;
    let posSplit = matchSplit.index;
    return allStyles[parent.substring(0, posSplit)].name + parent.substring(posSplit);
}

function buildCssRule(parent: string | string[] | undefined, name: string): string {
    let result = "";
    if (parent) {
        if (isArray(parent)) {
            for (let i = 0; i < parent.length; i++) {
                if (i > 0) {
                    result += ",";
                }
                result += "." + buildCssSubRule(parent[i]) + "." + name;
            }
        } else {
            result = "." + buildCssSubRule(<string>parent) + "." + name;
        }
    } else {
        result = "." + name;
    }
    return result;
}

function flattenStyle(cur: any, curPseudo: any, style: any, stylePseudo: any): void {
    if (isString(style)) {
        let externalStyle = allStyles[style];
        if (externalStyle === undefined) {
            throw new Error("Unknown style " + style);
        }
        flattenStyle(cur, curPseudo, externalStyle.style, externalStyle.pseudo);
    } else if (isFunction(style)) {
        style(cur, curPseudo);
    } else if (isArray(style)) {
        for (let i = 0; i < style.length; i++) {
            flattenStyle(cur, curPseudo, style[i], undefined);
        }
    } else if (typeof style === "object") {
        for (let key in style) {
            if (!Object.prototype.hasOwnProperty.call(style, key)) continue;
            let val = style[key];
            if (isFunction(val)) {
                val = val(cur, key);
            }
            cur[key] = val;
        }
    }
    if (stylePseudo != null && curPseudo != null) {
        for (let pseudoKey in stylePseudo) {
            let curPseudoVal = curPseudo[pseudoKey];
            if (curPseudoVal === undefined) {
                curPseudoVal = newHashObj();
                curPseudo[pseudoKey] = curPseudoVal;
            }
            flattenStyle(curPseudoVal, undefined, stylePseudo[pseudoKey], undefined);
        }
    }
}

let firstStyles = false;
function beforeFrame() {
    var dbs = document.body.style;
    if (firstStyles && uptimeMs >= 150) {
        dbs.opacity = "1";
        firstStyles = false;
    }
    if (rebuildStyles) {
        // Hack around bug in Chrome to not have flash of unstyled content
        if (frameCounter === 1 && "webkitAnimation" in dbs) {
            firstStyles = true;
            dbs.opacity = "0";
            setTimeout(invalidate, 200);
        }
        for (let i = 0; i < dynamicSprites.length; i++) {
            let dynSprite = dynamicSprites[i];
            let image = imageCache[dynSprite.url];
            if (image == null) continue;
            let colorStr = dynSprite.color();
            if (colorStr !== dynSprite.lastColor) {
                dynSprite.lastColor = colorStr;
                if (dynSprite.width == null) dynSprite.width = image.width;
                if (dynSprite.height == null) dynSprite.height = image.height;
                let lastUrl = recolorAndClip(
                    image,
                    colorStr,
                    dynSprite.width,
                    dynSprite.height,
                    dynSprite.left,
                    dynSprite.top
                );
                var stDef = allStyles[dynSprite.styleId];
                stDef.style = {
                    backgroundImage: `url(${lastUrl})`,
                    width: dynSprite.width,
                    height: dynSprite.height,
                    backgroundPosition: 0
                };
            }
        }
        var styleStr = injectedCss;
        for (var key in allStyles) {
            var ss = allStyles[key];
            let parent = ss.parent;
            let name = ss.name;
            let ssPseudo = ss.pseudo;
            let ssStyle = ss.style;
            if (isFunction(ssStyle) && ssStyle.length === 0) {
                [ssStyle, ssPseudo] = ssStyle();
            }
            if (isString(ssStyle) && ssPseudo == null) {
                ss.realName = ssStyle;
                assert(name != null, "Cannot link existing class to selector");
                continue;
            }
            ss.realName = name;
            let style = newHashObj();
            let flattenPseudo = newHashObj();
            flattenStyle(undefined, flattenPseudo, undefined, ssPseudo);
            flattenStyle(style, flattenPseudo, ssStyle, undefined);
            var extractedInlStyle: any = null;
            if (style["pointerEvents"]) {
                extractedInlStyle = newHashObj();
                extractedInlStyle["pointerEvents"] = style["pointerEvents"];
            }
            if (isIE9) {
                if (style["userSelect"]) {
                    if (extractedInlStyle == null) extractedInlStyle = newHashObj();
                    extractedInlStyle["userSelect"] = style["userSelect"];
                    delete style["userSelect"];
                }
            }
            ss.inlStyle = extractedInlStyle;
            shimStyle(style);
            let cssStyle = inlineStyleToCssDeclaration(style);
            if (cssStyle.length > 0)
                styleStr += (name == null ? parent : buildCssRule(parent, name)) + " {" + cssStyle + "}\n";
            for (var key2 in flattenPseudo) {
                let item = flattenPseudo[key2];
                shimStyle(item);
                styleStr +=
                    (name == null ? parent + ":" + key2 : buildCssRule(parent, name + ":" + key2)) +
                    " {" +
                    inlineStyleToCssDeclaration(item) +
                    "}\n";
            }
        }
        var styleElement = document.createElement("style");
        styleElement.type = "text/css";
        if ((<any>styleElement).styleSheet) {
            (<any>styleElement).styleSheet.cssText = styleStr;
        } else {
            styleElement.appendChild(document.createTextNode(styleStr));
        }

        var head = document.head || document.getElementsByTagName("head")[0];
        if (htmlStyle != null) {
            head.replaceChild(styleElement, htmlStyle);
        } else {
            head.appendChild(styleElement);
        }
        htmlStyle = styleElement;
        rebuildStyles = false;
    }
    chainedBeforeFrame();
}

export function style(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode {
    let className = node.className;
    let inlineStyle = node.style;
    let stack: (IBobrilStyles | number)[] | null = null;
    let i = 0;
    let ca = styles;
    while (true) {
        if (ca.length === i) {
            if (stack === null || stack.length === 0) break;
            ca = <IBobrilStyles[]>stack.pop();
            i = <number>stack.pop() + 1;
            continue;
        }
        let s = ca[i];
        if (s == null || s === true || s === false || s === "") {
            // skip
        } else if (isString(s)) {
            var sd = allStyles[s];
            if (className == null) className = sd.realName!;
            else className = className + " " + sd.realName;
            var inlS = sd.inlStyle;
            if (inlS) {
                if (inlineStyle == null) inlineStyle = {};
                inlineStyle = assign(inlineStyle, inlS);
            }
        } else if (isArray(s)) {
            if (ca.length > i + 1) {
                if (stack == null) stack = [];
                stack.push(i);
                stack.push(ca);
            }
            ca = <IBobrilStyles[]>s;
            i = 0;
            continue;
        } else {
            if (inlineStyle == null) inlineStyle = {};
            for (let key in s) {
                if (s.hasOwnProperty(key)) {
                    let val = (<any>s)[key];
                    if (isFunction(val)) val = val();
                    inlineStyle[key] = val;
                }
            }
        }
        i++;
    }
    node.className = className;
    node.style = inlineStyle;
    return node;
}

var uppercasePattern = /([A-Z])/g;
var msPattern = /^ms-/;

function hyphenateStyle(s: string): string {
    if (s === "cssFloat") return "float";
    return s
        .replace(uppercasePattern, "-$1")
        .toLowerCase()
        .replace(msPattern, "-ms-");
}

function inlineStyleToCssDeclaration(style: any): string {
    var res = "";
    for (var key in style) {
        var v = style[key];
        if (v === undefined) continue;
        res += hyphenateStyle(key) + ":" + (v === "" ? '""' : v) + ";";
    }
    res = res.slice(0, -1);
    return res;
}

// PureFuncs: styleDef, styleDefEx, sprite, spriteb, spritebc, asset

export function styleDef(style: any, pseudo?: { [name: string]: any }, nameHint?: string): IBobrilStyleDef {
    return styleDefEx(undefined, style, pseudo, nameHint);
}

export function styleDefEx(
    parent: IBobrilStyleDef | IBobrilStyleDef[] | undefined,
    style: any,
    pseudo?: { [name: string]: any },
    nameHint?: string
): IBobrilStyleDef {
    if (nameHint && nameHint !== "b-") {
        nameHint = nameHint.replace(/[^a-z0-9_-]/gi, "_").replace(/^[0-9]/, "_$&");
        if (allNameHints[nameHint]) {
            var counter = 1;
            while (allNameHints[nameHint + counter]) counter++;
            nameHint = nameHint + counter;
        }
        allNameHints[nameHint] = true;
    } else {
        nameHint = "b-" + globalCounter++;
    }
    allStyles[nameHint] = {
        name: nameHint,
        realName: nameHint,
        parent,
        style,
        inlStyle: null,
        pseudo
    };
    invalidateStyles();
    return nameHint;
}

export function selectorStyleDef(selector: string, style: any, pseudo?: { [name: string]: any }) {
    allStyles["b-" + globalCounter++] = {
        name: null,
        realName: null,
        parent: selector,
        style,
        inlStyle: null,
        pseudo
    };
    invalidateStyles();
}

export function invalidateStyles(): void {
    rebuildStyles = true;
    invalidate();
}

function updateSprite(spDef: ISprite): void {
    var stDef = allStyles[spDef.styleId];
    var style: any = {
        backgroundImage: `url(${spDef.url})`,
        width: spDef.width,
        height: spDef.height
    };
    style.backgroundPosition = `${-spDef.left}px ${-spDef.top}px`;
    stDef.style = style;
    invalidateStyles();
}

function emptyStyleDef(url: string): IBobrilStyleDef {
    return styleDef({ width: 0, height: 0 }, undefined, url);
}

const rgbaRegex = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;

function recolorAndClip(
    image: HTMLImageElement,
    colorStr: string,
    width: number,
    height: number,
    left: number,
    top: number
): string {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.drawImage(image, -left, -top);
    var imgData = ctx.getImageData(0, 0, width, height);
    var imgDataData = imgData.data;
    let rgba = rgbaRegex.exec(colorStr);
    let cRed: number, cGreen: number, cBlue: number, cAlpha: number;
    if (rgba) {
        cRed = parseInt(rgba[1], 10);
        cGreen = parseInt(rgba[2], 10);
        cBlue = parseInt(rgba[3], 10);
        cAlpha = Math.round(parseFloat(rgba[4]) * 255);
    } else {
        cRed = parseInt(colorStr.substr(1, 2), 16);
        cGreen = parseInt(colorStr.substr(3, 2), 16);
        cBlue = parseInt(colorStr.substr(5, 2), 16);
        cAlpha = parseInt(colorStr.substr(7, 2), 16) || 0xff;
    }
    if (cAlpha === 0xff) {
        for (var i = 0; i < imgDataData.length; i += 4) {
            // Horrible workaround for imprecisions due to browsers using premultiplied alpha internally for canvas
            let red = imgDataData[i];
            if (
                red === imgDataData[i + 1] &&
                red === imgDataData[i + 2] &&
                (red === 0x80 || (imgDataData[i + 3] < 0xff && red > 0x70))
            ) {
                imgDataData[i] = cRed;
                imgDataData[i + 1] = cGreen;
                imgDataData[i + 2] = cBlue;
            }
        }
    } else {
        for (var i = 0; i < imgDataData.length; i += 4) {
            let red = imgDataData[i];
            let alpha = imgDataData[i + 3];
            if (
                red === imgDataData[i + 1] &&
                red === imgDataData[i + 2] &&
                (red === 0x80 || (alpha < 0xff && red > 0x70))
            ) {
                if (alpha === 0xff) {
                    imgDataData[i] = cRed;
                    imgDataData[i + 1] = cGreen;
                    imgDataData[i + 2] = cBlue;
                    imgDataData[i + 3] = cAlpha;
                } else {
                    alpha = alpha * (1.0 / 255);
                    imgDataData[i] = Math.round(cRed * alpha);
                    imgDataData[i + 1] = Math.round(cGreen * alpha);
                    imgDataData[i + 2] = Math.round(cBlue * alpha);
                    imgDataData[i + 3] = Math.round(cAlpha * alpha);
                }
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
}

let lastFuncId = 0;
const funcIdName = "b@funcId";
let imagesWithCredentials = false;

function loadImage(url: string, onload: (image: HTMLImageElement) => void) {
    var image = new Image();
    image.crossOrigin = imagesWithCredentials ? "use-credentials" : "anonymous";
    image.addEventListener("load", () => onload(image));
    image.src = url;
}

export function setImagesWithCredentials(value: boolean) {
    imagesWithCredentials = value;
}

export function sprite(
    url: string,
    color?: string | (() => string),
    width?: number,
    height?: number,
    left?: number,
    top?: number
): IBobrilStyleDef {
    assert(allStyles[url] === undefined, "Wrong sprite url");
    left = left || 0;
    top = top || 0;
    let colorId = color || "";
    let isVarColor = false;
    if (isFunction(color)) {
        isVarColor = true;
        colorId = (<any>color)[funcIdName];
        if (colorId == null) {
            colorId = "" + lastFuncId++;
            (<any>color)[funcIdName] = colorId;
        }
    }
    var key = url + ":" + colorId + ":" + (width || 0) + ":" + (height || 0) + ":" + left + ":" + top;
    var spDef = allSprites[key];
    if (spDef) return spDef.styleId;
    var styleId = emptyStyleDef(url);
    spDef = { styleId, url, width, height, left, top };
    if (isVarColor) {
        (<IDynamicSprite>spDef).color = <() => string>color;
        (<IDynamicSprite>spDef).lastColor = "";
        (<IDynamicSprite>spDef).lastUrl = "";
        dynamicSprites.push(<IDynamicSprite>spDef);
        if (imageCache[url] === undefined) {
            imageCache[url] = null;
            loadImage(url, image => {
                imageCache[url] = image;
                invalidateStyles();
            });
        }
        invalidateStyles();
    } else if (width == null || height == null || color != null) {
        loadImage(url, image => {
            if (spDef.width == null) spDef.width = image.width;
            if (spDef.height == null) spDef.height = image.height;
            if (color != null) {
                spDef.url = recolorAndClip(image, <string>color, spDef.width, spDef.height, spDef.left, spDef.top);
                spDef.left = 0;
                spDef.top = 0;
            }
            updateSprite(spDef);
        });
    } else {
        updateSprite(spDef);
    }
    allSprites[key] = spDef;
    return styleId;
}

var bundlePath = (<any>window)["bobrilBPath"] || "bundle.png";

export function setBundlePngPath(path: string) {
    bundlePath = path;
}

export function spriteb(width: number, height: number, left: number, top: number): IBobrilStyleDef {
    let url = bundlePath;
    var key = url + "::" + width + ":" + height + ":" + left + ":" + top;
    var spDef = allSprites[key];
    if (spDef) return spDef.styleId;
    var styleId = styleDef({ width: 0, height: 0 });
    spDef = {
        styleId,
        url: url,
        width: width,
        height: height,
        left: left,
        top: top
    };
    updateSprite(spDef);
    allSprites[key] = spDef;
    return styleId;
}

export function spritebc(
    color: () => string,
    width: number,
    height: number,
    left: number,
    top: number
): IBobrilStyleDef {
    return sprite(bundlePath, color, width, height, left, top);
}

export function injectCss(css: string): void {
    injectedCss += css;
    invalidateStyles();
}

export function asset(path: string): string {
    return path;
}

// Bobril.svgExtensions

function polarToCartesian(
    centerX: number,
    centerY: number,
    radius: number,
    angleInDegrees: number
): { x: number; y: number } {
    var angleInRadians = angleInDegrees * Math.PI / 180.0;
    return {
        x: centerX + radius * Math.sin(angleInRadians),
        y: centerY - radius * Math.cos(angleInRadians)
    };
}

function svgDescribeArc(
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    startWithLine: boolean
) {
    var absDeltaAngle = Math.abs(endAngle - startAngle);
    var close = false;
    if (absDeltaAngle > 360 - 0.01) {
        if (endAngle > startAngle) endAngle = startAngle - 359.9;
        else endAngle = startAngle + 359.9;
        if (radius === 0) return "";
        close = true;
    } else {
        if (radius === 0) {
            return [startWithLine ? "L" : "M", x, y].join(" ");
        }
    }
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var arcSweep = absDeltaAngle <= 180 ? "0" : "1";
    var largeArg = endAngle > startAngle ? "0" : "1";
    var d = [
        startWithLine ? "L" : "M",
        start.x,
        start.y,
        "A",
        radius,
        radius,
        0,
        arcSweep,
        largeArg,
        end.x,
        end.y
    ].join(" ");
    if (close) d += "Z";
    return d;
}

export function svgPie(
    x: number,
    y: number,
    radiusBig: number,
    radiusSmall: number,
    startAngle: number,
    endAngle: number
): string {
    var p = svgDescribeArc(x, y, radiusBig, startAngle, endAngle, false);
    var nextWithLine = true;
    if (p[p.length - 1] === "Z") nextWithLine = false;
    if (radiusSmall === 0) {
        if (!nextWithLine) return p;
    }
    return p + svgDescribeArc(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "Z";
}

export function svgCircle(x: number, y: number, radius: number): string {
    return svgDescribeArc(x, y, radius, 0, 360, false);
}

export function svgRect(x: number, y: number, width: number, height: number): string {
    return "M" + x + " " + y + "h" + width + "v" + height + "h" + -width + "Z";
}

// Bobril.helpers

export function withKey(content: IBobrilChildren, key: string): IBobrilNode {
    if (isObject(content) && !isArray(content)) {
        content.key = key;
        return content;
    }
    return {
        key,
        children: content
    };
}

export function withRef(node: IBobrilNode, ctx: IBobrilCtx, name: string): IBobrilNode {
    node.ref = [ctx, name];
    return node;
}

export function extendCfg(ctx: IBobrilCtx, propertyName: string, value: any): void {
    var c = ctx.me.cfg;
    if (c !== undefined) {
        c[propertyName] = value;
    } else {
        c = Object.assign({}, ctx.cfg);
        c[propertyName] = value;
        ctx.me.cfg = c;
    }
}

// PureFuncs: styledDiv, createVirtualComponent, createComponent, createDerivedComponent, createOverridingComponent, prop, propi, propa, propim, getValue

export function styledDiv(children: IBobrilChildren, ...styles: any[]): IBobrilNode {
    return style({ tag: "div", children }, styles);
}

export interface IComponentFactory<TData extends Object> {
    (data?: TData, children?: IBobrilChildren): IBobrilNode<TData>;
}

export function createVirtualComponent<TData>(component: IBobrilComponent): IComponentFactory<TData> {
    return (data?: TData, children?: IBobrilChildren): IBobrilNode => {
        if (children !== undefined) {
            if (data == null) data = <any>{};
            (<any>data).children = children;
        }
        return { data, component: component };
    };
}

export function createOverridingComponent<TData>(
    original: (data?: any, children?: IBobrilChildren) => IBobrilNode,
    after: IBobrilComponent
): IComponentFactory<TData> {
    const originalComponent = original().component!;
    const overriding = overrideComponents(originalComponent, after);
    return createVirtualComponent<TData>(overriding);
}

export function createComponent<TData extends Object>(component: IBobrilComponent): IComponentFactory<TData> {
    const originalRender = component.render;
    if (originalRender) {
        component.render = function(ctx: any, me: IBobrilNode, oldMe?: IBobrilCacheNode) {
            me.tag = "div";
            return originalRender.call(component, ctx, me, oldMe);
        };
    } else {
        component.render = (_ctx: any, me: IBobrilNode) => {
            me.tag = "div";
        };
    }
    return createVirtualComponent<TData>(component);
}

export function createDerivedComponent<TData>(
    original: (data?: any, children?: IBobrilChildren) => IBobrilNode,
    after: IBobrilComponent
): IComponentFactory<TData> {
    const originalComponent = original().component!;
    const merged = mergeComponents(originalComponent, after);
    return createVirtualComponent<TData>(merged);
}

export type IProp<T> = (value?: T) => T;
export type IPropAsync<T> = (value?: T | PromiseLike<T>) => T;

export interface IValueData<T> {
    value: T | IProp<T>;
    onChange?: (value: T) => void;
}

export function prop<T>(value: T, onChange?: (value: T, old: T) => void): IProp<T> {
    return (val?: T) => {
        if (val !== undefined) {
            if (onChange !== undefined) onChange(val, value);
            value = val;
        }
        return value;
    };
}

export function propi<T>(value: T): IProp<T> {
    return (val?: T) => {
        if (val !== undefined) {
            value = val;
            invalidate();
        }
        return value;
    };
}

export function propa<T>(prop: IProp<T>): IPropAsync<T> {
    return (val?: T | PromiseLike<T>) => {
        if (val !== undefined) {
            if (typeof val === "object" && isFunction((<PromiseLike<T>>val).then)) {
                (<PromiseLike<T>>val).then(
                    v => {
                        prop(v);
                    },
                    err => {
                        if (window["console"] && console.error) console.error(err);
                    }
                );
            } else {
                return prop(<T>val);
            }
        }
        return prop();
    };
}

export function propim<T>(value: T, ctx?: IBobrilCtx, onChange?: (value: T, old: T) => void): IProp<T> {
    return (val?: T) => {
        if (val !== undefined && val !== value) {
            const oldVal = val;
            value = val;
            if (onChange !== undefined) onChange(val, oldVal);

            invalidate(ctx);
        }
        return value;
    };
}

export function getValue<T>(value: T | IProp<T> | IPropAsync<T>): T {
    if (isFunction(value)) {
        return (<IProp<T>>value)();
    }
    return <T>value;
}

export function emitChange<T>(data: IValueData<T>, value: T) {
    if (isFunction(data.value)) {
        (<IProp<T>>data.value)(value);
    }
    if (data.onChange !== undefined) {
        data.onChange(value);
    }
}

// bobril-clouseau needs this
// bobril-g11n needs ignoreShouldChange and setBeforeInit
if (!(<any>window).b)
    (<any>window).b = {
        deref,
        getRoots,
        setInvalidate,
        invalidateStyles,
        ignoreShouldChange,
        setAfterFrame,
        setBeforeFrame,
        getDnds,
        setBeforeInit
    };

// TSX reactNamespace emulation
// PureFuncs: createElement

export function createElement<T>(
    name: (data?: T, children?: any) => IBobrilNode,
    data?: T,
    ...children: IBobrilChildren[]
): IBobrilNode<T>;

export function createElement(name: any, props: any): IBobrilNode {
    var children: IBobrilChild[] = [];
    for (var i = 2; i < arguments.length; i++) {
        var ii = arguments[i];
        children.push(ii);
    }
    if (isString(name)) {
        var res: IBobrilNode = { tag: name, children: children };
        if (props == null) {
            return res;
        }
        var attrs: IBobrilAttributes = {};
        var someAttrs = false;
        for (var n in props) {
            if (!props.hasOwnProperty(n)) continue;
            if (n === "style") {
                style(res, props[n]);
                continue;
            }
            if (n === "key" || n === "ref" || n === "className" || n === "component" || n === "data") {
                (<any>res)[n] = props[n];
                continue;
            }
            someAttrs = true;
            attrs[n] = props[n];
        }
        if (someAttrs) res.attrs = attrs;

        return res;
    } else {
        let res = name(props, children);
        if (props != null) {
            if (props.key != null) res.key = props.key;
            if (props.ref != null) res.ref = props.ref;
        }
        return res;
    }
}

export const __spread = assign;
