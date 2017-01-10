// Bobril.Core

export type IBobrilChild = boolean | number | string | IBobrilNode | null | undefined;
export type IBobrilChildren = IBobrilChild | IBobrilChildArray | null | undefined;
export interface IBobrilChildArray extends Array<IBobrilChildren> { };
export type IBobrilCacheChildren = string | IBobrilCacheNode[] | undefined;
export type IBobrilShimStyleMapping = { [name: string]: null | ((style: any, value: any, oldName: string) => void) };

export interface IDisposable {
    dispose(): void;
}

export type IDisposeFunction = (ctx?: any) => void;
export type IDisposableLike = IDisposable | IDisposeFunction;

export interface IBobrilRoot {
    // Factory function
    f: () => IBobrilChildren;
    // Root element
    e: HTMLElement | undefined;
    // Virtual Dom Cache
    c: IBobrilCacheNode[];
    // Optional Logical parent
    p: IBobrilCacheNode | undefined;
}

export type IBobrilRoots = { [id: string]: IBobrilRoot };

export interface IBobrilAttributes {
    id?: string;
    href?: string;
    value?: boolean | string | string[] | IProp<boolean | string | string[]>;
    tabindex?: number;
    [name: string]: any;
}

export interface IBobrilComponent {
    // parent component of devired/overriding component
    super?: IBobrilComponent;
    // if id of old node is different from new node it is considered completely different so init will be called before render directly
    // it does prevent calling render method twice on same node
    id?: string;
    // called before new node in vdom should be created, me members (tag, attrs, children, ...) could be modified, ctx is initialized to { data: me.data||{}, me: me, cfg: fromparent }
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
    // called when bubling event to parent so you could stop bubling without preventing default handling
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
    // User want to drop draged object here - do it - onDragOver before had to set you target
    onDrop?(ctx: IBobrilCtx, dndCtx: IDndCtx): boolean;

    // this is "static" function that's why it does not have ctx - because it does not exists
    canActivate?(transition: IRouteTransition): IRouteCanResult;
    canDeactivate?(ctx: IBobrilCtx, transition: IRouteTransition): IRouteCanResult;
}

// new node should atleast have tag or component or children member
export interface IBobrilNodeCommon {
    tag?: string;
    key?: string;
    className?: string;
    style?: any;
    attrs?: IBobrilAttributes;
    children?: IBobrilChildren;
    ref?: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
    // set this for children to be set to their ctx.cfg, if undefined your own ctx.cfg will be used anyway
    cfg?: any;
    component?: IBobrilComponent;
    // Bobril does not touch this, it is completely for user passing custom data to component
    // It is very similar to props in ReactJs, it must be immutable, you have access to this through ctx.data
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

export type IBobrilNode = IBobrilNodeWithTag | IBobrilNodeWithComponent | IBobrilNodeWithChildren;

export interface IBobrilCacheNode {
    tag: string | undefined;
    key: string | undefined;
    className: string | undefined;
    style: any;
    attrs: IBobrilAttributes | undefined;
    children: IBobrilCacheChildren;
    ref: [IBobrilCtx, string] | ((node: IBobrilCacheNode) => void);
    cfg: any;
    component: IBobrilComponent;
    data: any;
    element: Node | Node[] | undefined;
    parent: IBobrilCacheNode | undefined;
    ctx: IBobrilCtx | undefined;
}

export interface IBobrilCtx {
    // properties passed from parent component, treat it as immutable
    data?: any;
    me: IBobrilCacheNode;
    // properties passed from parent component automatically, but could be extended for children to IBobrilNode.cfg
    cfg?: any;
    refs?: { [name: string]: IBobrilCacheNode | null };
    disposables?: IDisposableLike[];
}

export interface IBobrilScroll {
    node: IBobrilCacheNode;
}

export interface ISelectionChangeEvent {
    startPosition: number;
    // endPosition tries to be also caret position (does not work on any IE or Edge 12)
    endPosition: number;
}

declare var DEBUG: boolean;
if (typeof DEBUG === "undefined") DEBUG = true;

// PureFuncs: assert, isArray, isObject, flatten

function assert(shoudBeTrue: boolean, messageIfFalse?: string) {
    if (DEBUG && !shoudBeTrue)
        throw Error(messageIfFalse || "assertion failed");
}

export const isArray = Array.isArray;

function createTextNode(content: string): Text {
    return document.createTextNode(content);
}

function createEl(name: string): HTMLElement {
    return document.createElement(name);
}

function null2undefined<T>(value: T | null | undefined): T | undefined {
    return value === null ? undefined : value;
}

var hasTextContent = "textContent" in createTextNode("");

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
        if (target == null) throw new TypeError('Target in assign cannot be undefined or null');
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
    }
}

export let assign = Object.assign;

export function flatten(a: any | any[]): any[] {
    if (!isArray(a)) {
        if (a == null || a === false || a === true)
            return [];
        return [a];
    }
    a = a.slice(0);
    let alen = a.length;
    for (let i = 0; i < alen;) {
        let item = a[i];
        if (isArray(item)) {
            a.splice.apply(a, [i, 1].concat(item));
            alen = a.length;
            continue;
        }
        if (item == null || item === false || item === true) {
            a.splice(i, 1);
            alen--;
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
var setValueCallback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void = (el: Element, _node: IBobrilCacheNode, newValue: any, oldValue: any): void => {
    if (newValue !== oldValue)
        (<any>el)[tvalue] = newValue;
}

export function setSetValue(callback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void): (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void {
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
    zoom: true,
};

function renamer(newName: string) {
    return (style: any, value: any, oldName: string) => {
        style[newName] = value;
        style[oldName] = undefined;
    };
};

function renamerpx(newName: string) {
    return (style: any, value: any, oldName: string) => {
        if (isNumber(value)) {
            style[newName] = value + "px";
        } else {
            style[newName] = value;
        }
        style[oldName] = undefined;
    };
}

function pxadder(style: any, value: any, name: string) {
    if (isNumber(value))
        style[name] = value + "px";
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
        if (vi === undefined) continue;  // don't want to map undefined
        if (mi === undefined) {
            if (DEBUG) {
                if (ki === "float" && window.console && console.error) console.error("In style instead of 'float' you have to use 'cssFloat'");
                if (/-/.test(ki) && window.console && console.warn) console.warn("Style property " + ki + " contains dash (must use JS props instead of css names)");
            }
            if (testPropExistence(ki)) {
                mi = ((<any>isUnitlessNumber)[ki] === true) ? null : pxadder;
            } else {
                var titleCaseKi = ki.replace(/^\w/, match => match.toUpperCase());
                for (var j = 0; j < vendors.length; j++) {
                    if (testPropExistence(vendors[j] + titleCaseKi)) {
                        mi = (((<any>isUnitlessNumber)[ki] === true) ? renamer : renamerpx)(vendors[j] + titleCaseKi); break;
                    }
                }
                if (mi === undefined) {
                    mi = ((<any>isUnitlessNumber)[ki] === true) ? null : pxadder;
                    if (DEBUG && window.console && console.warn) console.warn("Style property " + ki + " is not supported in this browser");
                }
            }
            mapping[ki] = mi;
        }
        if (mi !== null)
            mi(newValue, vi, ki);
    }
}

function removeProperty(s: any, name: string) {
    (<any>s)[name] = "";
}

function updateStyle(el: HTMLElement, newStyle: any, oldStyle: any) {
    var s = el.style;
    if (isObject(newStyle)) {
        shimStyle(newStyle);
        var rule: string;
        if (isObject(oldStyle)) {
            for (rule in oldStyle) {
                if (!(rule in newStyle))
                    removeProperty(s, rule);
            }
            for (rule in newStyle) {
                var v = newStyle[rule];
                if (v !== undefined) {
                    if (oldStyle[rule] !== v) s[<any>rule] = v;
                } else {
                    removeProperty(s, rule);
                }
            }
        } else {
            if (oldStyle)
                s.cssText = "";
            for (rule in newStyle) {
                var v = newStyle[rule];
                if (v !== undefined)
                    s[<any>rule] = v;
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
    if (inSvg)
        el.setAttribute("class", className);
    else
        (<HTMLElement>el).className = className;
}

const focusableTag = /^input$|^select$|^textarea$|^button$/;
const tabindexStr = "tabindex";

function updateElement(n: IBobrilCacheNode, el: Element, newAttrs: IBobrilAttributes | undefined, oldAttrs: IBobrilAttributes, notFocusable: boolean): IBobrilAttributes {
    var attrName: string, newAttr: any, oldAttr: any, valueOldAttr: any, valueNewAttr: any;
    let wasTabindex = false;
    if (newAttrs != null) for (attrName in newAttrs) {
        newAttr = newAttrs[attrName];
        oldAttr = oldAttrs[attrName];
        if (notFocusable && attrName === tabindexStr) {
            newAttr = -1;
            wasTabindex = true;
        } else if (attrName === tvalue && !inSvg) {
            if (isFunction(newAttr)) {
                oldAttrs[bvalue] = newAttr;
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
    if (notFocusable && !wasTabindex && n.tag && focusableTag.test(n.tag)) {
        el.setAttribute(tabindexStr, "-1");
        oldAttrs[tabindexStr] = -1;
    }
    if (newAttrs == null) {
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined) {
                if (notFocusable && attrName === tabindexStr) continue;
                if (attrName === bvalue) continue;
                oldAttrs[attrName] = undefined;
                el.removeAttribute(attrName);
            }
        }
    } else {
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined && !(attrName in newAttrs)) {
                if (notFocusable && attrName === tabindexStr) continue;
                if (attrName === bvalue) continue;
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

function setRef(ref: [IBobrilCtx, string] | ((node: IBobrilCacheNode | null) => void), value: IBobrilCacheNode | null) {
    if (ref == null) return;
    if (isFunction(ref)) {
        (<(node: IBobrilCacheNode | null) => void>ref)(value);
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

export function createNode(n: IBobrilNode, parentNode: IBobrilCacheNode | undefined, createInto: Element, createBefore: Node | null): IBobrilCacheNode {
    var c = <IBobrilCacheNode>{ // This makes CacheNode just one object class = fast
        tag: n.tag,
        key: n.key,
        ref: n.ref,
        className: n.className,
        style: n.style,
        attrs: n.attrs,
        children: n.children,
        component: n.component,
        data: n.data,
        cfg: n.cfg,
        parent: parentNode,
        element: undefined,
        ctx: undefined
    };
    var backupInSvg = inSvg;
    var backupInNotFocusable = inNotFocusable;
    var component = c.component;
    var el: Node | undefined;
    setRef(c.ref, c);
    if (component) {
        var ctx: IBobrilCtx = { data: c.data || {}, me: c, cfg: findCfg(parentNode) };
        c.ctx = ctx;
        if (component.init) {
            component.init(ctx, c);
        }
        if (component.render) {
            component.render(ctx, c);
        }
    }
    var tag = c.tag;
    var children = c.children;
    var inSvgForeignObject = false;
    if (isNumber(children))
        children = "" + children;
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
    } else if (tag === "/") {
        var htmltext = <string>children;
        if (htmltext === "") {
            // nothing needs to be created
        } else if (createBefore == null) {
            var before = createInto.lastChild;
            (<HTMLElement>createInto).insertAdjacentHTML("beforeend", htmltext);
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
            var elprev = createBefore.previousSibling;
            var removeEl = false;
            var parent = createInto;
            if (!(<HTMLElement>el).insertAdjacentHTML) {
                el = parent.insertBefore(createEl("i"), el);
                removeEl = true;
            }
            (<HTMLElement>el).insertAdjacentHTML("beforebegin", htmltext);
            if (elprev) {
                elprev = elprev.nextSibling;
            }
            else {
                elprev = parent.firstChild;
            }
            var newElements: Array<Node> = [];
            while (elprev !== el) {
                newElements.push(elprev!);
                elprev = elprev!.nextSibling;
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
    } else if (inSvg || tag === "svg") {
        el = <any>document.createElementNS("http://www.w3.org/2000/svg", tag);
        inSvgForeignObject = tag === "foreignObject";
        inSvg = !inSvgForeignObject;
    } else if (!el) {
        el = createEl(tag);
    }
    createInto.insertBefore(el!, createBefore);
    c.element = el;
    createChildren(c, <Element>el, null);
    if (component) {
        if (component.postRender) {
            component.postRender(c.ctx!, c);
        }
    }
    if (inNotFocusable && focusRootTop === c)
        inNotFocusable = false;
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
    if (!ch)
        return;
    if (!isArray(ch)) {
        if (isString(ch)) {
            if (hasTextContent) {
                createInto.textContent = ch;
            } else {
                (<HTMLElement>createInto).innerText = ch;
            }
            return;
        }
        ch = <any>[ch];
    }
    ch = (<any[]>ch).slice(0);
    var i = 0, l = (<any[]>ch).length;
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
    setRef(c.ref, null);
    let ch = c.children;
    if (isArray(ch)) {
        for (let i = 0, l = ch.length; i < l; i++) {
            destroyNode(ch[i]);
        }
    }
    let component = c.component;
    if (component) {
        let ctx = c.ctx!;
        if (component.destroy)
            component.destroy(ctx, c, <HTMLElement>c.element);
        let disposables = ctx.disposables;
        if (isArray(disposables)) {
            for (let i = disposables.length; i-- > 0;) {
                let d = disposables[i];
                if (isFunction(d)) d(ctx); else d.dispose();
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

function nodeContainsNode(c: IBobrilCacheNode, n: Node, resIndex: number, res: (IBobrilCacheNode | null)[]): IBobrilCacheNode[] | null | undefined {
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
    var rootElements = rootIds.map((i) => roots[i].e || document.body);
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
    var currentNode = nodeStack.pop() !;
    rootFound2: for (j = 0; j < rootElements.length; j++) {
        if (n === rootElements[j]) {
            var rc = roots[rootIds[j]].c;
            for (var k = 0; k < rc.length; k++) {
                var rck = rc[k];
                var findResult = nodeContainsNode(rck, currentNode, res.length, res);
                if (findResult !== undefined) {
                    currentCacheArray = findResult;
                    break rootFound2;
                }
            }
        }
    }
    subtreeSearch: while (nodeStack.length) {
        currentNode = nodeStack.pop() !;
        if (currentCacheArray && (<any>currentCacheArray).length) for (var i = 0, l = (<any>currentCacheArray).length; i < l; i++) {
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
            component.postRender(c.ctx!, n, c);
        }
    }
    c.data = n.data;
    pushUpdateCallback(c);
}

export function updateNode(n: IBobrilNode, c: IBobrilCacheNode, createInto: Element, createBefore: Node | null, deepness: number): IBobrilCacheNode {
    var component = n.component;
    var backupInSvg = inSvg;
    var backupInNotFocusable = inNotFocusable;
    var bigChange = false;
    var ctx = c.ctx;
    if (component && ctx != null) {
        if ((<any>ctx)[ctxInvalidated] === frameCounter) {
            deepness = Math.max(deepness, (<any>ctx)[ctxDeepness]);
        }
        if (component.id !== c.component.id) {
            bigChange = true;
        } else {
            if (c.parent != undefined)
                ctx.cfg = findCfg(c.parent);
            if (component.shouldChange)
                if (!component.shouldChange(ctx, n, c) && !ignoringShouldChange) {
                    if (isArray(c.children)) {
                        if (c.tag === "svg") {
                            inSvg = true;
                        } else if (inSvg && c.tag === "foreignObject") inSvg = false;
                        if (inNotFocusable && focusRootTop === c)
                            inNotFocusable = false;
                        selectedUpdate(<IBobrilCacheNode[]>c.children, <Element>c.element || createInto, c.element != null ? null : createBefore);
                        inSvg = backupInSvg;
                        inNotFocusable = backupInNotFocusable;
                    }
                    pushUpdateEverytimeCallback(c);
                    return c;
                }
            (<any>ctx).data = n.data || {};
            c.component = component;
            if (component.render) {
                n = assign({}, n); // need to clone me because it should not be modified for next updates
                component.render(ctx, n, c);
            }
            c.cfg = n.cfg;
        }
    }
    if (DEBUG) {
        if (!((n.ref == null && c.ref == null) ||
            ((n.ref != null && c.ref != null && (isFunction(n.ref) || isFunction(c.ref) ||
                (<[IBobrilCtx, string]>n.ref)[0] === (<[IBobrilCtx, string]>c.ref)[0] && (<[IBobrilCtx, string]>n.ref)[1] === (<[IBobrilCtx, string]>c.ref)[1]))))) {
            if (window.console && console.warn) console.warn("ref changed in child in update");
        }
    }
    var newChildren = n.children;
    var cachedChildren = c.children;
    var tag = n.tag;
    if (isNumber(newChildren)) {
        newChildren = "" + newChildren;
    }
    if (bigChange || (component && ctx == null)) {
        // it is big change of component.id or old one was not even component => recreate
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
                    if (hasTextContent) {
                        el.textContent = newChildren;
                    } else {
                        (<HTMLElement>el).nodeValue = newChildren;
                    }
                    c.children = newChildren;
                }
            } else {
                if (inNotFocusable && focusRootTop === c)
                    inNotFocusable = false;
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
            if (inNotFocusable && focusRootTop === c)
                inNotFocusable = false;
            var el = <Element>c.element;
            if ((isString(newChildren)) && !isArray(cachedChildren)) {
                if (newChildren !== cachedChildren) {
                    if (hasTextContent) {
                        el.textContent = newChildren;
                    } else {
                        (<HTMLElement>el).innerText = newChildren;
                    }
                    cachedChildren = newChildren;
                }
            } else {
                if (deepness <= 0) {
                    if (isArray(cachedChildren))
                        selectedUpdate(<IBobrilCacheNode[]>c.children, el, createBefore);
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
    if (parEl == null) parEl = createInto; else parEl = <Element>parEl.parentNode;
    var r: IBobrilCacheNode = createNode(n, c.parent, <Element>parEl, getDomNode(c));
    removeNode(c);
    return r;
}

export function getDomNode(c: IBobrilCacheNode): Node | null {
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
        updateCall[i].call(n.component, n.ctx, n, n.element);
    }
    updateCall = [];
    updateInstance = [];
}

function updateNodeInUpdateChildren(newNode: IBobrilNode, cachedChildren: IBobrilCacheNode[], cachedIndex: number, cachedLength: number, createBefore: Node | null, element: Element, deepness: number) {
    cachedChildren[cachedIndex] = updateNode(newNode, cachedChildren[cachedIndex], element,
        findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore), deepness);
}

function reorderInUpdateChildrenRec(c: IBobrilCacheNode, element: Element, before: Node | null): void {
    var el = c.element;
    if (el != null) {
        if (isArray(el)) {
            for (var i = 0; i < el.length; i++) {
                element.insertBefore(el[i], before);
            }
        } else
            element.insertBefore(el, before);
        return;
    }
    var ch = c.children;
    if (!isArray(ch)) return;
    for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
        reorderInUpdateChildrenRec((<IBobrilCacheNode[]>ch)[i], element, before);
    }
}

function reorderInUpdateChildren(cachedChildren: IBobrilCacheNode[], cachedIndex: number, cachedLength: number, createBefore: Node | null, element: Element) {
    var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
    var cur = cachedChildren[cachedIndex];
    var what = getDomNode(cur);
    if (what != null && what !== before) {
        reorderInUpdateChildrenRec(cur, element, before);
    }
}

function reorderAndUpdateNodeInUpdateChildren(newNode: IBobrilNode, cachedChildren: IBobrilCacheNode[], cachedIndex: number, cachedLength: number, createBefore: Node | null, element: Element, deepness: number) {
    var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
    var cur = cachedChildren[cachedIndex];
    var what = getDomNode(cur);
    if (what != null && what !== before) {
        reorderInUpdateChildrenRec(cur, element, before);
    }
    cachedChildren[cachedIndex] = updateNode(newNode, cur, element, before, deepness);
}

export function updateChildren(element: Element, newChildren: IBobrilChildren, cachedChildren: IBobrilCacheChildren, parentNode: IBobrilCacheNode | undefined, createBefore: Node | null, deepness: number): IBobrilCacheNode[] {
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
    for (newIndex = 0; newIndex < newLength;) {
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
    return updateChildrenCore(element, <IBobrilNode[]>newCh, <IBobrilCacheNode[]>cachedChildren, parentNode, createBefore, deepness);
}

function updateChildrenCore(element: Element, newChildren: IBobrilNode[], cachedChildren: IBobrilCacheNode[], parentNode: IBobrilCacheNode | undefined, createBefore: Node | null, deepness: number): IBobrilCacheNode[] {
    let newEnd = newChildren.length;
    var cachedLength = cachedChildren.length;
    let cachedEnd = cachedLength;
    let newIndex = 0;
    let cachedIndex = 0;
    while (newIndex < newEnd && cachedIndex < cachedEnd) {
        if (newChildren[newIndex].key === cachedChildren[cachedIndex].key) {
            updateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness);
            newIndex++;
            cachedIndex++;
            continue;
        }
        while (true) {
            if (newChildren[newEnd - 1].key === cachedChildren[cachedEnd - 1].key) {
                newEnd--;
                cachedEnd--;
                updateNodeInUpdateChildren(newChildren[newEnd], cachedChildren, cachedEnd, cachedLength, createBefore, element, deepness);
                if (newIndex < newEnd && cachedIndex < cachedEnd)
                    continue;
            }
            break;
        }
        if (newIndex < newEnd && cachedIndex < cachedEnd) {
            if (newChildren[newIndex].key === cachedChildren[cachedEnd - 1].key) {
                cachedChildren.splice(cachedIndex, 0, cachedChildren[cachedEnd - 1]);
                cachedChildren.splice(cachedEnd, 1);
                reorderAndUpdateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness);
                newIndex++;
                cachedIndex++;
                continue;
            }
            if (newChildren[newEnd - 1].key === cachedChildren[cachedIndex].key) {
                cachedChildren.splice(cachedEnd, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                newEnd--;
                reorderAndUpdateNodeInUpdateChildren(newChildren[newEnd], cachedChildren, cachedEnd, cachedLength, createBefore, element, deepness);
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
            cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode, element,
                findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)));
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
        }
        else
            deltaKeyless--;
    }
    var keyLess = -deltaKeyless - deltaKeyless;
    for (; newIndex < newEnd; newIndex++) {
        node = newChildren[newIndex];
        key = node.key;
        if (key != null) {
            assert(!(key in <any>newKeys));
            newKeys[key] = newIndex;
        }
        else
            deltaKeyless++;
    }
    keyLess += deltaKeyless;
    var delta = 0;
    newIndex = backupNewIndex;
    cachedIndex = backupCachedIndex;
    var cachedKey: string | undefined;
    while (cachedIndex < cachedEnd && newIndex < newEnd) {
        if (cachedChildren[cachedIndex] === null) { // already moved somethere else
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
                if (key != null)
                    break;
                newIndex++;
            }
            if (key == null)
                break;
        }
        var akpos = cachedKeys[key];
        if (akpos === undefined) {
            // New key
            cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode, element,
                findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)));
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
        if (cachedIndex === akpos + delta) {
            // Inplace update
            updateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness);
            newIndex++;
            cachedIndex++;
        } else {
            // Move
            cachedChildren.splice(cachedIndex, 0, cachedChildren[akpos + delta]);
            delta++;
            cachedChildren[akpos + delta] = null!;
            reorderAndUpdateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness);
            cachedIndex++;
            cachedEnd++;
            cachedLength++;
            newIndex++;
        }
    }
    // remove old keyed cached nodes
    while (cachedIndex < cachedEnd) {
        if (cachedChildren[cachedIndex] === null) { // already moved somethere else
            cachedChildren.splice(cachedIndex, 1);
            cachedEnd--;
            cachedLength--;
            continue;
        }
        if (cachedChildren[cachedIndex].key != null) { // this key is only in old
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
            cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode, element,
                findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)));
            cachedEnd++;
            cachedLength++;
            delta++;
            cachedIndex++;
        }
        newIndex++;
    }
    // Without any keyless nodes we are done
    if (!keyLess)
        return cachedChildren;
    // calculate common (old and new) keyless
    keyLess = (keyLess - Math.abs(deltaKeyless)) >> 1;
    // reorder just nonkeyed nodes
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
            updateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, newIndex, cachedLength, createBefore, element, deepness);
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
                    if (cachedChildren[cachedIndex].key != null)
                        break;
                }
                continue;
            }
            while (cachedChildren[cachedIndex].key == null)
                cachedIndex++;
            assert(key === cachedChildren[cachedIndex].key);
            cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
            cachedChildren.splice(cachedIndex + 1, 1);
            reorderInUpdateChildren(cachedChildren, newIndex, cachedLength, createBefore, element)
            // just moving keyed node it was already updated before
            newIndex++;
            cachedIndex = newIndex;
            continue;
        }
        if (cachedIndex < cachedEnd) {
            cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
            cachedChildren.splice(cachedIndex + 1, 1);
            reorderAndUpdateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, newIndex, cachedLength, createBefore, element, deepness);
            keyLess--;
            newIndex++;
            cachedIndex++;
        } else {
            cachedChildren.splice(newIndex, 0, createNode(newChildren[newIndex], parentNode, element,
                findNextNode(cachedChildren, newIndex - 1, cachedLength, createBefore)));
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
    nativeRaf((param) => { if (param === +param) hasNativeRaf = true; });
}

export const now = Date.now || (() => (new Date).getTime());
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

var regEvents: { [name: string]: Array<(ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean> } = {};
var registryEvents: { [name: string]: Array<{ priority: number; callback: (ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean }> } | undefined;

export function addEvent(name: string, priority: number, callback: (ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean): void {
    if (registryEvents == null) registryEvents = {};
    var list = registryEvents[name] || [];
    list.push({ priority: priority, callback: callback });
    registryEvents[name] = list;
}

export function emitEvent(name: string, ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined): boolean {
    var events = regEvents[name];
    if (events) for (var i = 0; i < events.length; i++) {
        if (events[i](ev, target, node))
            return true;
    }
    return false;
}

function addListener(el: EventTarget, name: string) {
    if (name[0] == "!") return;
    var capture = (name[0] == "^");
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
        emitEvent(name, ev, <Node>t, n);
    }
    if (("on" + eventName) in window) el = window;
    el.addEventListener(eventName, enhanceEvent, capture);
}

function initEvents() {
    if (registryEvents === undefined)
        return;
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
            var cloned: IBobrilNode = { data: ctx.data, component: node.component };
            cache[i] = updateNode(cloned, node, element, createBefore, (<any>ctx)[ctxDeepness]);
        } else if (isArray(node.children)) {
            var backupInSvg = inSvg;
            var backupInNotFocusable = inNotFocusable;
            if (inNotFocusable && focusRootTop === node)
                inNotFocusable = false;
            if (node.tag === "svg") inSvg = true;
            else if (inSvg && node.tag === "foreignObject") inSvg = false;
            selectedUpdate(node.children, (<Element>node.element) || element, findNextNode(cache, i, len, createBefore));
            pushUpdateEverytimeCallback(node);
            inSvg = backupInSvg;
            inNotFocusable = backupInNotFocusable;
        }
    }
}

var beforeFrameCallback: () => void = () => { };
var afterFrameCallback: (root: IBobrilCacheChildren | null) => void = () => { };

export function setBeforeFrame(callback: () => void): () => void {
    var res = beforeFrameCallback;
    beforeFrameCallback = callback;
    return res;
}

export function setAfterFrame(callback: (root: IBobrilCacheChildren | null) => void): (root: IBobrilCacheChildren | null) => void {
    var res = afterFrameCallback;
    afterFrameCallback = callback;
    return res;
}

function findLastNode(children: IBobrilCacheNode[]): Node | null {
    for (var i = children.length - 1; i >= 0; i--) {
        var c = children[i];
        var el = c.element;
        if (el != null) {
            if (isArray(el)) {
                var l = el.length;
                if (l === 0)
                    continue;
                return el[l - 1];
            }
            return <Node>el;
        }
        var ch = c.children;
        if (!isArray(ch))
            continue;
        var res = findLastNode(ch);
        if (res != null)
            return res;
    }
    return null;
}

function isLogicalParent(parent: IBobrilCacheNode, child: IBobrilCacheNode | null | undefined, rootIds: string[]): boolean {
    while (child != null) {
        if (parent === child) return true;
        let p = child.parent;
        if (p == null) {
            for (var i = 0; i < rootIds.length; i++) {
                var r = roots[rootIds[i]];
                if (!r) continue;
                var rc = r.c;
                if (rc.indexOf(child) >= 0) {
                    p = r.p;
                    break;
                }
            }
        }
        child = p;
    }
    return false;
}

export function syncUpdate() {
    internalUpdate(now() - startTime);
}

function update(time: number) {
    scheduled = false;
    internalUpdate(time);
}

function internalUpdate(time: number) {
    renderFrameBegin = now();
    initEvents();
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
    var rootIds = Object.keys(roots);
    for (var i = 0; i < rootIds.length; i++) {
        var r = roots[rootIds[i]];
        if (!r) continue;
        var rc = r.c;
        var insertBefore = findLastNode(rc);
        if (focusRootTop) inNotFocusable = !isLogicalParent(focusRootTop, r.p, rootIds);
        if (insertBefore != null) insertBefore = insertBefore.nextSibling;
        if (fullRefresh) {
            var newChildren = r.f();
            if (newChildren === undefined)
                break;
            r.e = r.e || document.body;
            r.c = updateChildren(r.e, newChildren, rc, undefined, insertBefore, 1e6);
        }
        else {
            selectedUpdate(rc, r.e!, insertBefore);
        }
    }
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

export function setInvalidate(inv: (ctx?: Object, deepness?: number) => void): (ctx?: Object, deepness?: number) => void {
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
            if (deepness > (<any>ctx)[ctxDeepness])
                (<any>ctx)[ctxDeepness] = deepness;
        }
    } else {
        fullRecreateRequested = true;
    }
    if (scheduled || initializing)
        return;
    scheduled = true;
    requestAnimationFrame(update);
}

var lastRootId = 0;

export function addRoot(factory: () => IBobrilChildren, element?: HTMLElement, parent?: IBobrilCacheNode): string {
    lastRootId++;
    var rootId = "" + lastRootId;
    roots[rootId] = { f: factory, e: element, c: [], p: parent };
    invalidate();
    return rootId;
}

export function removeRoot(id: string): void {
    var root = roots[id];
    if (!root) return;
    if (root.c.length) {
        root.c = <any>updateChildren(root.e!, <any>[], root.c, undefined, null, 1e9);
    }
    delete roots[id];
}

export function getRoots(): IBobrilRoots {
    return roots;
}

function finishInitialize() {
    initializing = false;
    invalidate();
}

var beforeInit: () => void = finishInitialize;

export function init(factory: () => any, element?: HTMLElement) {
    removeRoot("0");
    roots["0"] = { f: factory, e: element, c: [], p: undefined };
    initializing = true;
    beforeInit();
    beforeInit = finishInitialize;
}

export function setBeforeInit(callback: (cb: () => void) => void): void {
    let prevBeforeInit = beforeInit;
    beforeInit = () => {
        callback(prevBeforeInit);
    }
}

export function bubble(node: IBobrilCacheNode | null | undefined, name: string, param: any): IBobrilCtx | undefined {
    while (node) {
        var c = node.component;
        if (c) {
            var ctx = node.ctx!;
            var m = (<any>c)[name];
            if (m) {
                if (m.call(c, ctx, param))
                    return ctx;
            }
            m = (<any>c).shouldStopBubble;
            if (m) {
                if (m.call(c, ctx, name, param))
                    break;
            }
        }
        node = node.parent;
    }
    return undefined;
}

function broadcastEventToNode(node: IBobrilCacheNode | null | undefined, name: string, param: any): IBobrilCtx | undefined {
    if (!node)
        return undefined;
    var c = node.component;
    if (c) {
        var ctx = node.ctx!;
        var m = (<any>c)[name];
        if (m) {
            if (m.call(c, ctx, param))
                return ctx;
        }
        m = c.shouldStopBroadcast;
        if (m) {
            if (m.call(c, ctx, name, param))
                return undefined;
        }
    }
    var ch = node.children;
    if (isArray(ch)) {
        for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
            var res = broadcastEventToNode((<IBobrilCacheNode[]>ch)[i], name, param);
            if (res != null)
                return res;
        }
    }
    return undefined;
}

export function broadcast(name: string, param: any): IBobrilCtx | undefined {
    var k = Object.keys(roots);
    for (var i = 0; i < k.length; i++) {
        var ch = roots[k[i]].c;
        if (ch != null) {
            for (var j = 0; j < ch.length; j++) {
                var res = broadcastEventToNode(ch[j], name, param);
                if (res != null)
                    return res;
            }
        }
    }
    return undefined;
}

function merge(f1: Function, f2: Function): Function {
    return function (this: any, ...params: any[]) {
        var result = f1.apply(this, params);
        if (result) return result;
        return f2.apply(this, params);
    }
}

var emptyObject = {};

function mergeComponents(c1: IBobrilComponent, c2: IBobrilComponent): IBobrilComponent {
    let res: IBobrilComponent = Object.create(c1) !;
    res.super = c1;
    for (var i in c2) {
        if (!(i in <any>emptyObject)) {
            var m = (<any>c2)[i];
            var origM = (<any>c1)[i];
            if (i === "id") {
                (<any>res)[i] = ((origM != null) ? origM : "") + "/" + m;
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
    let res: IBobrilComponent = Object.create(originalComponent) !;
    res.super = originalComponent;
    for (let i in overridingComponent) {
        if (!(i in <any>emptyObject)) {
            let m = (<any>overridingComponent)[i];
            let origM = (<any>originalComponent)[i];
            if (i === 'id') {
                (<any>res)[i] = ((origM != null) ? origM : '') + '/' + m;
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
    if (pd) pd.call(event); else (<any>event).returnValue = false;
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

export function setStyleShim(name: string, action: (style: any, value: any, oldName: string) => void) { mapping[name] = action; }

// PureFuncs: uptime, lastFrameDuration, frame, invalidated

export function uptime() { return uptimeMs; }

export function lastFrameDuration() { return lastFrameDurationMs; }

export function frame() { return frameCounter; }

export function invalidated() { return scheduled; }

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
for (var i = 0; i < events.length; i++)
    addEvent(events[i], 10, emitOnMediaChange);

export function accDeviceBreaks(newBreaks?: number[][]): number[][] {
    if (newBreaks != null) {
        breaks = newBreaks;
        emitOnMediaChange();
    }
    return breaks;
}

var viewport = window.document.documentElement;
var isAndroid = /Android/i.test(navigator.userAgent);
var weirdPortrait: boolean;  // Some android devices provide reverted orientation

export function getMedia(): IBobrilMedia {
    if (media == null) {
        var w = viewport.clientWidth;
        var h = viewport.clientHeight;
        var o: any = (<any>window).orientation;
        var p = h >= w;
        if (o == null) o = (p ? 0 : 90);
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

    var onreadystatechange = 'onreadystatechange';
    // Modern browsers, fastest async
    if ((<any>window).MutationObserver) {
        var hiddenDiv = document.createElement("div");
        (new MutationObserver(executeCallbacks)).observe(hiddenDiv, { attributes: true });
        return (callback: () => void) => {
            if (!callbacks.length) {
                hiddenDiv.setAttribute('yes', 'no');
            }
            callbacks.push(callback);
        };
        // Browsers that support postMessage
    } else if (!window.setImmediate && window.postMessage && window.addEventListener) {
        var MESSAGE_PREFIX = "basap" + Math.random(), hasPostMessage = false;

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
    } else if (!window.setImmediate && onreadystatechange in document.createElement('script')) {
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
    (function () {
        // Polyfill for Function.prototype.bind
        function bind(fn: (args: any) => void, thisArg: any) {
            return function () {
                fn.apply(thisArg, arguments);
            }
        }

        function handle(this: any, deferred: Array<(v: any) => any>) {
            if (this.s/*tate*/ === null) {
                this.d/*eferreds*/.push(deferred);
                return;
            }
            asap(() => {
                var cb = this.s/*tate*/ ? deferred[0] : deferred[1];
                if (cb == null) {
                    (this.s/*tate*/ ? deferred[2] : deferred[3])(this.v/*alue*/);
                    return;
                }
                var ret: any;
                try {
                    ret = cb(this.v/*alue*/);
                } catch (e) {
                    deferred[3](e);
                    return;
                }
                deferred[2](ret);
            });
        }

        function finale(this: any) {
            for (var i = 0, len = this.d/*eferreds*/.length; i < len; i++) {
                handle.call(this, this.d/*eferreds*/[i]);
            }
            this.d/*eferreds*/ = null;
        }

        function reject(this: any, newValue: any) {
            this.s/*tate*/ = false;
            this.v/*alue*/ = newValue;
            finale.call(this);
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(fn: (fulfill: (v: any) => void, reject: (r: any) => void) => void, onFulfilled: (value: any) => void, onRejected: (reason: any) => void) {
            var done = false;
            try {
                fn((value: any) => {
                    if (done) return;
                    done = true;
                    onFulfilled(value);
                }, (reason: any) => {
                    if (done) return;
                    done = true;
                    onRejected(reason);
                });
            } catch (ex) {
                if (done) return;
                done = true;
                onRejected(ex);
            }
        }

        function resolve(this: any, newValue: any) {
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === this) throw new TypeError('Promise selfresolve');
                if (Object(newValue) === newValue) {
                    var then = newValue.then;
                    if (typeof then === 'function') {
                        doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
                        return;
                    }
                }
                this.s/*tate*/ = true;
                this.v/*alue*/ = newValue;
                finale.call(this);
            } catch (e) { reject.call(this, e); }
        }

        function Promise(this: any, fn: (onFulfilled: (value: any) => void, onRejected: (reason: any) => void) => void) {
            this.s/*tate*/ = null;
            this.v/*alue*/ = null;
            this.d/*eferreds*/ = <Array<Array<() => void>>>[];

            doResolve(fn, bind(resolve, this), bind(reject, this));
        }

        Promise.prototype.then = function (this: any, onFulfilled: any, onRejected?: any) {
            var me = this;
            return new (<any>Promise)((resolve: any, reject: any) => {
                handle.call(me, [onFulfilled, onRejected, resolve, reject]);
            });
        };

        Promise.prototype['catch'] = function (this: any, onRejected?: any) {
            return this.then(undefined, onRejected);
        };

        (<any>Promise).all = function () {
            var args = (<any>[]).slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

            return new (<any>Promise)((resolve: (value: any) => void, reject: (reason: any) => void) => {
                if (args.length === 0) {
                    resolve(args);
                    return;
                }
                var remaining = args.length;
                function res(i: number, val: any) {
                    try {
                        if (val && (typeof val === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, (val: any) => { res(i, val) }, reject);
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
            if (value && typeof value === 'object' && value.constructor === Promise) {
                return value;
            }

            return new (<any>Promise)((resolve: (value: any) => void) => {
                resolve(value);
            });
        };

        (<any>Promise).reject = (value: any) => new (<any>Promise)((_resolve: any, reject: (reason: any) => void) => {
            reject(value);
        });

        (<any>Promise).race = (values: any[]) => new (<any>Promise)((resolve: any, reject: any) => {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].then(resolve, reject);
            }
        });

        (<any>window)['Promise'] = <any>Promise;
    })();
}
// Bobril.StyleShim

if (ieVersion() === 9) {
    (() => {
        function addFilter(s: any, v: string) {
            if (s.zoom == null) s.zoom = "1";
            var f = s.filter;
            s.filter = (f == null) ? v : f + " " + v;
        }

        var simpleLinearGradient = /^linear\-gradient\(to (.+?),(.+?),(.+?)\)/ig;

        setStyleShim("background", (s: any, v: any, oldName: string) => {
            var match = simpleLinearGradient.exec(v);
            if (match == null) return;
            var dir = match[1];
            var color1 = match[2];
            var color2 = match[3];
            var tmp: string;
            switch (dir) {
                case "top": dir = "0"; tmp = color1; color1 = color2; color2 = tmp; break;
                case "bottom": dir = "0"; break;
                case "left": dir = "1"; tmp = color1; color1 = color2; color2 = tmp; break;
                case "right": dir = "1"; break;
                default: return;
            }
            s[oldName] = "none";
            addFilter(s, "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + color1 + "',endColorstr='" + color2 + "', gradientType='" + dir + "')");
        });
    })();
} else {
    (() => {
        var teststyle = document.createElement("div").style;
        teststyle.cssText = "background:-webkit-linear-gradient(top,red,red)";
        if (teststyle.background!.length > 0) {
            (() => {
                var startsWithGradient = /^(?:repeating\-)?(?:linear|radial)\-gradient/ig;
                var revdirs = { top: "bottom", bottom: "top", left: "right", right: "left" };
                function gradientWebkitter(style: any, value: any, name: string) {
                    if (startsWithGradient.test(value)) {
                        var pos = (<string>value).indexOf("(to ");
                        if (pos > 0) {
                            pos += 4;
                            var posend = (<string>value).indexOf(",", pos);
                            var dir = (<string>value).slice(pos, posend);
                            dir = dir.split(" ").map(v => (<any>revdirs)[v] || v).join(" ");
                            value = (<string>value).slice(0, pos - 3) + dir + (<string>value).slice(posend);
                        }
                        value = "-webkit-" + value;
                    }
                    style[name] = value;
                };
                setStyleShim("background", gradientWebkitter);
            })();
        }
    })();
}

// Bobril.OnChange

var bvalue = "b$value";
var bSelectionStart = "b$selStart";
var bSelectionEnd = "b$selEnd";
var tvalue = "value";

function isCheckboxlike(el: HTMLInputElement) {
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
    if (node.ctx === undefined) node.ctx = { me: node };
    if (oldValue === undefined) {
        (<any>node.ctx)[bvalue] = newValue;
    }
    var isMultiSelect = isSelect && (<HTMLSelectElement>el).multiple;
    var emitDiff = false;
    if (isMultiSelect) {
        var options = <HTMLSelectElement>(<HTMLSelectElement>el).options;
        var currentMulti = selectedArray(options);
        if (!stringArrayEqual(newValue, currentMulti)) {
            if (oldValue === undefined || stringArrayEqual(currentMulti, oldValue) || !stringArrayEqual(newValue, (<any>node.ctx)[bvalue])) {
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
        if (isInput && isCheckboxlike(<HTMLInputElement>el)) {
            var currentChecked = (<any>el).checked;
            if (newValue !== currentChecked) {
                if (oldValue === undefined || currentChecked === oldValue || newValue !== (<any>node.ctx)[bvalue]) {
                    (<any>el).checked = newValue;
                } else {
                    emitDiff = true;
                }
            }
        } else {
            var isCombobox = isSelect && (<HTMLSelectElement>el).size < 2;
            var currentValue = ((<any>el)[tvalue]);
            if (newValue !== currentValue) {
                if (oldValue === undefined || currentValue === oldValue || newValue !== (<any>node.ctx)[bvalue]) {
                    if (isSelect) {
                        if (newValue === "") {
                            (<HTMLSelectElement>el).selectedIndex = isCombobox ? 0 : -1;
                        } else {
                            (<any>el)[tvalue] = newValue;
                        }
                        if (newValue !== "" || isCombobox) {
                            currentValue = ((<any>el)[tvalue]);
                            if (newValue !== currentValue) {
                                emitDiff = true;
                            }
                        }
                    } else {
                        (<any>el)[tvalue] = newValue;
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
        (<any>node.ctx)[bvalue] = newValue;
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
    const hasProp = node.attrs && node.attrs[bvalue];
    const hasOnChange = c && c.onChange != null;
    const hasPropOrOnChange = hasProp || hasOnChange;
    const hasOnSelectionChange = c && c.onSelectionChange != null;
    if (!hasPropOrOnChange && !hasOnSelectionChange)
        return false;
    var ctx = node.ctx!;
    var tagName = (<Element>target).tagName;
    var isSelect = tagName === "SELECT";
    var isMultiSelect = isSelect && (<HTMLSelectElement>target).multiple;
    if (hasPropOrOnChange && isMultiSelect) {
        var vs = selectedArray(<HTMLSelectElement>(<HTMLSelectElement>target).options);
        if (!stringArrayEqual((<any>ctx)[bvalue], vs)) {
            (<any>ctx)[bvalue] = vs;
            if (hasProp) hasProp(vs);
            if (hasOnChange) c.onChange!(ctx, vs);
        }
    } else if (hasPropOrOnChange && isCheckboxlike(<HTMLInputElement>target)) {
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
                var radionode = deref(radio);
                if (!radionode) continue;
                const rbhasProp = node.attrs![bvalue];
                var radiocomponent = radionode.component;
                const rbhasOnChange = radiocomponent && radiocomponent.onChange != null;
                if (!rbhasProp && !rbhasOnChange) continue;
                var radioctx = radionode.ctx;
                var vrb = (<HTMLInputElement>radio).checked;
                if ((<any>radioctx)[bvalue] !== vrb) {
                    (<any>radioctx)[bvalue] = vrb;
                    if (rbhasProp) rbhasProp(vrb);
                    if (rbhasOnChange) radiocomponent.onChange!(radioctx!, vrb);
                }
            }
        } else {
            var vb = (<HTMLInputElement>target).checked;
            if ((<any>ctx)[bvalue] !== vb) {
                (<any>ctx)[bvalue] = vb;
                if (hasProp) hasProp(vb);
                if (hasOnChange) c.onChange!(ctx, vb);
            }
        }
    } else {
        if (hasPropOrOnChange) {
            var v = (<HTMLInputElement>target).value;
            if ((<any>ctx)[bvalue] !== v) {
                (<any>ctx)[bvalue] = v;
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
                let s = sStart; sStart = sEnd; sEnd = s;
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
        if (c.onSelectionChange) c.onSelectionChange(ctx!, {
            startPosition: start,
            endPosition: end
        });
    }
}

export function select(node: IBobrilCacheNode, start: number, end = start): void {
    (<any>node.element).setSelectionRange(Math.min(start, end), Math.max(start, end), start > end ? "backward" : "forward");
    emitOnSelectionChange(node, start, end);
}

function emitOnMouseChange(ev: Event | undefined, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    let f = focused();
    if (f) emitOnChange(ev, <Node>f.element, f);
    return false;
}

// click here must have lower priority (higher number) over mouse handlers
var events = ["input", "cut", "paste", "keydown", "keypress", "keyup", "click", "change"];
for (var i = 0; i < events.length; i++)
    addEvent(events[i], 10, emitOnChange);

var mouseEvents = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel"];
for (var i = 0; i < mouseEvents.length; i++)
    addEvent(mouseEvents[i], 2, emitOnMouseChange);

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
        which: ev.which || ev.keyCode,
    };
}

function emitOnKeyDown(ev: KeyboardEvent, _target: Node, node: IBobrilCacheNode) {
    if (!node)
        return false;
    var param: IKeyDownUpEvent = buildParam(ev);
    if (bubble(node, "onKeyDown", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyUp(ev: KeyboardEvent, _target: Node, node: IBobrilCacheNode) {
    if (!node)
        return false;
    var param: IKeyDownUpEvent = buildParam(ev);
    if (bubble(node, "onKeyUp", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyPress(ev: KeyboardEvent, _target: Node, node: IBobrilCacheNode) {
    if (!node)
        return false;
    if (ev.which === 0) // don't want special key presses
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
    /// 1 - single click, 2 - double click, 3+ - multiclick
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

const enum Consts {
    MoveOverIsNotTap = 13,
    TapShouldBeShorterThanMs = 750,
    MaxBustDelay = 500,
    MaxBustDelayForIE = 800,
    BustDistance = 50
}

let ownerCtx: any = null;
let invokingOwner: boolean;
const onClickText = "onClick";

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
    if (!handler) { // no handler available
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
                if (e === "none")
                    return true;
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

function pointerThroughIE(ev: MouseEvent, target: Node, _node: IBobrilCacheNode): boolean {
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

function addEvent5(name: string, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean) {
    addEvent(name, 5, callback);
}

var pointersEventNames = ["PointerDown", "PointerMove", "PointerUp", "PointerCancel"];
var i: number;
if (ieVersion() && ieVersion() < 11) {
    // emulate pointer-events: none in older ie
    var mouseEvents = [
        "click", "dblclick", "drag", "dragend",
        "dragenter", "dragleave", "dragover", "dragstart",
        "drop", "mousedown", "mousemove", "mouseout",
        "mouseover", "mouseup", "mousewheel", "scroll", "wheel"];
    for (i = 0; i < mouseEvents.length; ++i) {
        addEvent(mouseEvents[i], 1, pointerThroughIE);
    }
}

function type2Bobril(t: any): BobrilPointerType {
    if (t === "mouse" || t === 4) return BobrilPointerType.Mouse;
    if (t === "pen" || t === 3) return BobrilPointerType.Pen;
    return BobrilPointerType.Touch;
}

function pointerEventsNoneFix(x: number, y: number, target: Node | undefined, node: IBobrilCacheNode | undefined): [Node, IBobrilCacheNode | undefined] {
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
    return function handlePointerDown(ev: PointerEvent, target: Node, node: IBobrilCacheNode | undefined): boolean {
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
            while (!(buttons & 1)) { buttons = buttons >> 1; button++; }
        }
        var param: IBobrilPointerEvent = { id: ev.pointerId, type: type, x: ev.clientX, y: ev.clientY, button: button, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
        if (emitEvent("!" + name, param, target, node)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
}

function buildHandlerTouch(name: string) {
    return function handlePointerDown(ev: TouchEvent, target: Node, node: IBobrilCacheNode | undefined): boolean {
        var preventDef = false;
        for (var i = 0; i < ev.changedTouches.length; i++) {
            var t = ev.changedTouches[i];
            target = <HTMLElement>document.elementFromPoint(t.clientX, t.clientY);
            node = deref(target);
            var param: IBobrilPointerEvent = { id: t.identifier + 2, type: BobrilPointerType.Touch, x: t.clientX, y: t.clientY, button: 1, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
            if (emitEvent("!" + name, param, target, node))
                preventDef = true;
        }
        if (preventDef) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
}

function buildHandlerMouse(name: string) {
    return function handlePointer(ev: MouseEvent, target: Node, node: IBobrilCacheNode | undefined): boolean {
        target = <HTMLElement>document.elementFromPoint(ev.clientX, ev.clientY);
        node = deref(target);
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        var param: IBobrilPointerEvent = { id: 1, type: BobrilPointerType.Mouse, x: ev.clientX, y: ev.clientY, button: decodeButton(ev), shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
        if (emitEvent("!" + name, param, target, node)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
}

if (window.onpointerdown !== undefined) {
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
    if ((<any>window).ontouchstart !== undefined) {
        addEvent5("touchstart", buildHandlerTouch(pointersEventNames[0]/*"PointerDown"*/));
        addEvent5("touchmove", buildHandlerTouch(pointersEventNames[1]/*"PointerMove"*/));
        addEvent5("touchend", buildHandlerTouch(pointersEventNames[2]/*"PointerUp"*/));
        addEvent5("touchcancel", buildHandlerTouch(pointersEventNames[3]/*"PointerCancel"*/));
    }
    addEvent5("mousedown", buildHandlerMouse(pointersEventNames[0]/*"PointerDown"*/));
    addEvent5("mousemove", buildHandlerMouse(pointersEventNames[1]/*"PointerMove"*/));
    addEvent5("mouseup", buildHandlerMouse(pointersEventNames[2]/*"PointerUp"*/));
}

for (var j = 0; j < 4 /*pointersEventNames.length*/; j++) {
    ((name: string) => {
        var onname = "on" + name;
        addEvent("!" + name, 50, (ev: IBobrilPointerEvent, _target: Node, node: IBobrilCacheNode) => {
            return invokeMouseOwner(onname, ev) || (bubble(node, onname, ev) != null);
        });
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
    if (lastMouseEv)
        mouseEnterAndLeave(lastMouseEv);
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
            if (c && c.onMouseOut)
                c.onMouseOut(n.ctx!, ev);
        }
    }
    while (i > common) {
        i--;
        n = prevMousePath[i];
        if (n) {
            c = n.component;
            if (c && c.onMouseLeave)
                c.onMouseLeave(n.ctx!, ev);
        }
    }
    while (i < toPath.length) {
        n = toPath[i];
        if (n) {
            c = n.component;
            if (c && c.onMouseEnter)
                c.onMouseEnter(n.ctx!, ev);
        }
        i++;
    }
    prevMousePath = toPath;
    if (i > 0) {
        n = prevMousePath[i - 1];
        if (n) {
            c = n.component;
            if (c && c.onMouseIn)
                c.onMouseIn(n.ctx!, ev);
        }
    }
    return false;
};

function noPointersDown(): boolean {
    return Object.keys(pointersDown).length === 0;
}

function bustingPointerDown(ev: IBobrilPointerEvent, _target: Node, _node: IBobrilCacheNode): boolean {
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

function bustingPointerMove(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
    // Browser forgot to send mouse up? Let's fix it
    if (ev.type === BobrilPointerType.Mouse && ev.button === 0 && pointersDown[ev.id] != null) {
        ev.button = 1;
        emitEvent("!PointerUp", ev, target, node);
        ev.button = 0;
    }
    if (firstPointerDown === ev.id) {
        mouseEnterAndLeave(ev);
        if (!diffLess(firstPointerDownX, ev.x, Consts.MoveOverIsNotTap) || !diffLess(firstPointerDownY, ev.y, Consts.MoveOverIsNotTap))
            tapCanceled = true;
    } else if (noPointersDown()) {
        mouseEnterAndLeave(ev);
    }
    return false;
}

function bustingPointerUp(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        mouseEnterAndLeave(ev);
        firstPointerDown = -1;
        if (ev.type == BobrilPointerType.Touch && !tapCanceled) {
            if (now() - firstPointerDownTime < Consts.TapShouldBeShorterThanMs) {
                emitEvent("!PointerCancel", ev, target, node);
                var handled = invokeMouseOwner(onClickText, ev) || (bubble(node, onClickText, ev) != null);
                var delay = (ieVersion()) ? Consts.MaxBustDelayForIE : Consts.MaxBustDelay;
                toBust.push([ev.x, ev.y, now() + delay, handled ? 1 : 0]);
                return handled;
            }
        }
    }
    return false;
}

function bustingPointerCancel(ev: IBobrilPointerEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        firstPointerDown = -1;
    }
    return false;
}

function bustingClick(ev: MouseEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    var n = now();
    for (var i = 0; i < toBust.length; i++) {
        var j = toBust[i];
        if (j[2] < n) {
            toBust.splice(i, 1);
            i--;
            continue;
        }
        if (diffLess(j[0], ev.clientX, Consts.BustDistance) && diffLess(j[1], ev.clientY, Consts.BustDistance)) {
            toBust.splice(i, 1);
            if (j[3]) preventDefault(ev);
            return true;
        }
    }
    return false;
}

var bustingEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click"];
var bustingEventHandlers = [bustingPointerDown, bustingPointerMove, bustingPointerUp, bustingPointerCancel, bustingClick];
for (var i = 0; i < 5 /*bustingEventNames.length*/; i++) {
    addEvent(bustingEventNames[i], 3, bustingEventHandlers[i]);
}

function createHandlerMouse(handlerName: string) {
    return (ev: IBobrilPointerEvent, _target: Node, node: IBobrilCacheNode) => {
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
    return (ev: MouseEvent, target: Node, node: IBobrilCacheNode | undefined) => {
        target = <HTMLElement>document.elementFromPoint(ev.clientX, ev.clientY);
        node = deref(target);
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        let button = decodeButton(ev) || 1;
        // Ignore non left mouse click/dblclick event, but not for contextmenu event
        if (!allButtons && button !== 1) return false;
        let param: IBobrilMouseEvent = { x: ev.clientX, y: ev.clientY, button: button, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail || 1 };
        if (invokeMouseOwner(handlerName, param) || bubble(node, handlerName, param)) {
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

function handleSelectStart(ev: any, _target: Node, node: IBobrilCacheNode | undefined): boolean {
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
addEvent5("click", createHandler(onClickText));
addEvent5("dblclick", createHandler("onDoubleClick"));
addEvent5("contextmenu", createHandler("onContextMenu", true));

let wheelSupport = ("onwheel" in document.createElement("div") ? "" : "mouse") + "wheel";
function handleMouseWheel(ev: any, target: Node, node: IBobrilCacheNode | undefined): boolean {
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
        target = fixed[0];
        node = fixed[1];
    }
    let button = ev.button + 1;
    let buttons = ev.buttons;
    if (button === 0 && buttons) {
        button = 1;
        while (!(buttons & 1)) { buttons = buttons >> 1; button++; }
    }
    let dx = 0, dy: number;
    if (wheelSupport == "mousewheel") {
        dy = - 1 / 40 * ev.wheelDelta;
        ev.wheelDeltaX && (dx = - 1 / 40 * ev.wheelDeltaX);
    } else {
        dx = ev.deltaX;
        dy = ev.deltaY;
    }
    var param: IBobrilMouseWheelEvent = { dx, dy, x: ev.clientX, y: ev.clientY, button: button, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
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
    var delay = ieVersion() ? Consts.MaxBustDelayForIE : Consts.MaxBustDelay;
    toBust.push([x, y, now() + delay, 1]);
};

// Bobril.Focus

let currentActiveElement: Element | undefined = undefined;
let currentFocusedNode: IBobrilCacheNode | undefined = undefined;
let nodestack: (IBobrilCacheNode | null)[] = [];

function emitOnFocusChange(inFocus: boolean): boolean {
    var newActiveElement = (document.hasFocus() || inFocus) ? document.activeElement : undefined;
    if (newActiveElement !== currentActiveElement) {
        currentActiveElement = newActiveElement;
        var newstack = vdomPath(currentActiveElement);
        var common = 0;
        while (common < nodestack.length && common < newstack.length && nodestack[common] === newstack[common])
            common++;
        var i = nodestack.length - 1;
        var n: IBobrilCacheNode | null;
        var c: IBobrilComponent;
        if (i >= common) {
            n = nodestack[i];
            if (n) {
                c = n.component;
                if (c && c.onBlur)
                    c.onBlur(n.ctx!);
            }
            i--;
        }
        while (i >= common) {
            n = nodestack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocusOut)
                    c.onFocusOut(n.ctx!);
            }
            i--;
        }
        i = common;
        while (i + 1 < newstack.length) {
            n = newstack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocusIn)
                    c.onFocusIn(n.ctx!);
            }
            i++;
        }
        if (i < newstack.length) {
            n = newstack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocus)
                    c.onFocus(n.ctx!);
            }
            i++;
        }
        nodestack = newstack;
        currentFocusedNode = nodestack.length == 0 ? undefined : null2undefined(nodestack[nodestack.length - 1]);
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
        if (style.visibility === "hidden")
            return false;
        if (style.display === "none")
            return false;
    }
    var attrs = node.attrs;
    if (attrs != null) {
        var ti = attrs.tabindex != null ? attrs.tabindex : (<any>attrs).tabIndex; // < tabIndex is here because of backward compatibility
        if (ti !== undefined || node.tag && focusableTag.test(node.tag)) {
            var el = node.element;
            (<HTMLElement>el).focus();
            emitOnFocusChange(false);
            return true;
        }
    }
    var children = node.children;
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            if (focus(children[i]))
                return true;
        }
        return false;
    }
    return false;
}

// Bobril.Scroll
var callbacks: Array<(info: IBobrilScroll) => void> = [];

function emitOnScroll(_ev: Event, _target: Node, node: IBobrilCacheNode) {
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

// returns standart X,Y order
export function getWindowScroll(): [number, number] {
    var left = window.pageXOffset;
    var top = window.pageYOffset;
    return [left, top];
}

// returns node offset on page in standart X,Y order
export function nodePagePos(node: IBobrilCacheNode): [number, number] {
    let rect = (<Element>getDomNode(node)).getBoundingClientRect();
    let res = getWindowScroll();
    res[0] += rect.left;
    res[1] += rect.top;
    return res;
}

var cachedConvertPointFromClientToNode: (element: Node | null, x: number, y: number) => [number, number];

type Point = [number, number];
class CSSMatrix {
    data: number[];
    constructor(data: number[]) {
        this.data = data;
    }
    static fromString(s: string): CSSMatrix {
        var c = s.match(/matrix3?d?\(([^\)]+)\)/i) ![1].split(",");
        if (c.length === 6) {
            c = [c[0], c[1], "0", "0", c[2], c[3], "0", "0", "0", "0", "1", "0", c[4], c[5], "0", "1"];
        }
        return new CSSMatrix([
            parseFloat(c[0]), parseFloat(c[4]), parseFloat(c[8]), parseFloat(c[12]),
            parseFloat(c[1]), parseFloat(c[5]), parseFloat(c[9]), parseFloat(c[13]),
            parseFloat(c[2]), parseFloat(c[6]), parseFloat(c[10]), parseFloat(c[14]),
            parseFloat(c[3]), parseFloat(c[7]), parseFloat(c[11]), parseFloat(c[15])
        ]);
    };
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
            a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
        ]);
    };
    translate(tx: number, ty: number, tz: number): CSSMatrix {
        var z = new CSSMatrix([1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]);
        return this.multiply(z);
    };
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
        var X = new CSSMatrix([A / det, D / det, G / det, 0,
        B / det, E / det, H / det, 0,
        C / det, F / det, K / det, 0,
            0, 0, 0, 1]);
        var Y = new CSSMatrix([1, 0, 0, -m[3],
            0, 1, 0, -m[7],
            0, 0, 1, -m[11],
            0, 0, 0, 1]);
        return X.multiply(Y);
    };
    transformPoint(x: number, y: number): Point {
        var m = this.data;
        return [m[0] * x + m[1] * y + m[3], m[4] * x + m[5] * y + m[7]];
    };
}

function getTransformationMatrix(element: Node) {
    var identity = CSSMatrix.identity();
    var transformationMatrix = identity;
    var x: Node | null = element;
    var doc = x.ownerDocument.documentElement;
    while (x != undefined && x !== doc && x.nodeType != 1) x = x.parentNode;
    while (x != undefined && x !== doc) {
        var computedStyle = <any>window.getComputedStyle(<HTMLElement>x, undefined);
        var c = CSSMatrix.fromString((computedStyle.transform || computedStyle.OTransform || computedStyle.WebkitTransform || computedStyle.msTransform || computedStyle.MozTransform || "none").replace(/^none$/, "matrix(1,0,0,1,0,0)"));
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
    if (cachedConvertPointFromClientToNode == null) {
        let conv = window.webkitConvertPointFromPageToNode;
        if (conv) {
            cachedConvertPointFromClientToNode = (element: Node, x: number, y: number) => {
                let scr = getWindowScroll();
                let res = conv(element, new WebKitPoint(scr[0] + x, scr[1] + y));
                return [res.x, res.y];
            }
        } else {
            cachedConvertPointFromClientToNode = (element: Node, x: number, y: number) => {
                return getTransformationMatrix(element).inverse().transformPoint(x, y);
            }
        }
    }
    return cachedConvertPointFromClientToNode(element, pageX, pageY);
};

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
    // way to overrride mouse cursor, leave null to emulate dnd cursor
    cursor: string | null;
    // dnd is wating for activation by moving atleast distanceToStart pixels
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
    dragView: any;
    destroy(): void;
}

export interface IDndStartCtx extends IDndCtx {
    addData(type: string, data: any): boolean;
    setEnabledOps(ops: DndEnabledOps): void;
    setDragNodeView(view: (dnd: IDndCtx) => IBobrilNode): void;
}

export interface IDndOverCtx extends IDndCtx {
    setOperation(operation: DndOp): void;
}

var lastDndId = 0;
var dnds: IDndCtx[] = [];
var systemdnd: IDndCtx | null = null;
var rootId: string | null = null;
var bodyCursorBackup: string;
var userSelectBackup: string;
var shimedStyle = { userSelect: '' };
shimStyle(shimedStyle);
var shimedStyleKeys = Object.keys(shimedStyle);
var userSelectPropName = shimedStyleKeys[shimedStyleKeys.length - 1]; // renamed is last

var DndCtx = function (this: IDndCtx, pointerId: number) {
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
    this.dragView = null;
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
    if (pointerId >= 0)
        pointer2Dnd[pointerId] = this;
    dnds.push(this);
};

function lazyCreateRoot() {
    if (rootId == null) {
        let dbs = <any>document.body.style;
        bodyCursorBackup = dbs.cursor;
        userSelectBackup = dbs[userSelectPropName];
        dbs[userSelectPropName] = 'none';
        rootId = addRoot(dndRootFactory);
    }
}

var DndComp: IBobrilComponent = {
    render(ctx: IBobrilCtx, me: IBobrilNode) {
        var dnd: IDndCtx = ctx.data;
        me.tag = "div";
        me.style = { position: "absolute", left: dnd.x, top: dnd.y };
        me.children = (<any>dnd).dragView(dnd);
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
            case DndOp.Move: cursor = 'move'; break;
            case DndOp.Link: cursor = 'alias'; break;
            case DndOp.Copy: cursor = 'copy'; break;
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
            if ((<any>dnd).dragView != null && (dnd.x != 0 || dnd.y != 0)) {
                res.push({ key: "" + dnd.id, data: dnd, component: DndComp });
            }
        }
        me.tag = "div";
        me.style = { position: "fixed", pointerEvents: "none", userSelect: "none", left: 0, top: 0, right: 0, bottom: 0 };
        let dbs = document.body.style;
        let cur = currentCursor();
        if (cur && dbs.cursor !== cur)
            dbs.cursor = cur;
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
dndProto.setOperation = function (this: IDndCtx, operation: DndOp): void {
    this.operation = operation;
}

dndProto.setDragNodeView = function (this: IDndCtx, view: (dnd: IDndCtx) => IBobrilNode): void {
    this.dragView = view;
}

dndProto.addData = function (this: IDndCtx, type: string, data: any): boolean {
    this.data[type] = data;
    return true;
}

dndProto.listData = function (this: IDndCtx): string[] {
    return Object.keys(this.data);
}

dndProto.hasData = function (this: IDndCtx, type: string): boolean {
    return this.data[type] !== undefined;
}

dndProto.getData = function (this: IDndCtx, type: string): any {
    return this.data[type];
}

dndProto.setEnabledOps = function (this: IDndCtx, ops: DndEnabledOps): void {
    this.enabledOperations = ops;
}

dndProto.cancelDnd = function (this: IDndCtx): void {
    dndmoved(undefined, this);
    this.destroy();
}

dndProto.destroy = function (this: IDndCtx): void {
    this.ended = true;
    if (this.started)
        broadcast("onDragEnd", this);
    delete pointer2Dnd[this.pointerid];
    for (var i = 0; i < dnds.length; i++) {
        if (dnds[i] === this) {
            dnds.splice(i, 1);
            break;
        }
    }
    if (systemdnd === this) {
        systemdnd = null;
    }
    if (dnds.length === 0 && rootId != null) {
        removeRoot(rootId);
        rootId = null;
        let dbs = <any>document.body.style;
        dbs.cursor = bodyCursorBackup;
        dbs[userSelectPropName] = userSelectBackup;
    }
}

var pointer2Dnd = newHashObj();

function handlePointerDown(ev: IBobrilPointerEvent, _target: Node, node: IBobrilCacheNode): boolean {
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
                dndmoved(node, dnd);
            }
            lazyCreateRoot();
        } else {
            dnd.destroy();
        }
    }
    return false;
}

function dndmoved(node: IBobrilCacheNode | undefined, dnd: IDndCtx) {
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

function handlePointerMove(ev: IBobrilPointerEvent, _target: Node, node: IBobrilCacheNode): boolean {
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
    dndmoved(node, dnd);
    dnd.lastX = ev.x;
    dnd.lastY = ev.y;
    return true;
}

function handlePointerUp(ev: IBobrilPointerEvent, _target: Node, node: IBobrilCacheNode): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
    if (!dnd.beforeDrag) {
        updateDndFromPointerEvent(dnd, ev);
        dndmoved(node, dnd);
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

function handlePointerCancel(ev: IBobrilPointerEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
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
    dndmoved(node, dnd);
    dnd.lastX = dnd.x;
    dnd.lastY = dnd.y;
}

var effectAllowedTable = ["none", "link", "copy", "copyLink", "move", "linkMove", "copyMove", "all"];

function handleDragStart(ev: DragEvent, _target: Node, node: IBobrilCacheNode): boolean {
    var dnd: IDndCtx | null = systemdnd;
    if (dnd != null) {
        (<any>dnd).destroy();
    }
    var activePointerIds = Object.keys(pointer2Dnd);
    if (activePointerIds.length > 0) {
        dnd = pointer2Dnd[activePointerIds[0]];
        dnd!.system = true;
        systemdnd = dnd;
    } else {
        var startX = ev.clientX, startY = ev.clientY;
        dnd = new (<any>DndCtx)(-1);
        dnd!.system = true;
        systemdnd = dnd;
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
    var datas = dnd!.data;
    var dataKeys = Object.keys(datas);
    for (var i = 0; i < dataKeys.length; i++) {
        try {
            var k = dataKeys[i];
            var d = datas[k];
            if (!isString(d))
                d = JSON.stringify(d);
            ev.dataTransfer.setData(k, d);
        }
        catch (e) {
            if (DEBUG)
                if (window.console) console.log("Cannot set dnd data to " + dataKeys[i]);
        }
    }
    updateFromNative(dnd!, ev);
    return false;
}

function setDropEffect(ev: DragEvent, op: DndOp) {
    ev.dataTransfer.dropEffect = ["none", "link", "copy", "move"][op];
}

function handleDragOver(ev: DragEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    var dnd = systemdnd;
    if (dnd == null) {
        dnd = new (<any>DndCtx)(-1);
        dnd!.system = true;
        systemdnd = dnd;
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
        }
        catch (e) { }
        for (; eff < 7; eff++) {
            if (effectAllowedTable[eff] === effectAllowed) break;
        }
        dnd!.enabledOperations = eff;
        var dttypes = dt.types;
        if (dttypes) {
            for (var i = 0; i < dttypes.length; i++) {
                var tt = dttypes[i];
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

function handleDrag(ev: DragEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    var x = ev.clientX;
    var y = ev.clientY;
    var m = getMedia();
    if (systemdnd != null && (x === 0 && y === 0 || x < 0 || y < 0 || x >= m.width || y >= m.height)) {
        systemdnd.x = 0;
        systemdnd.y = 0;
        systemdnd.operation = DndOp.None;
        broadcast("onDrag", systemdnd);
    }
    return false;
}

function handleDragEnd(_ev: DragEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    if (systemdnd != null) {
        systemdnd.destroy();
    }
    return false;
}

function handleDrop(ev: DragEvent, _target: Node, _node: IBobrilCacheNode): boolean {
    var dnd = systemdnd;
    if (dnd == null)
        return false;
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

function justPreventDefault(ev: any, _target: Node, _node: IBobrilCacheNode): boolean {
    preventDefault(ev);
    return true;
}

function handleDndSelectStart(ev: any, _target: Node, _node: IBobrilCacheNode): boolean {
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
    [name: string]: string
}

// Just marker interface
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
    handler: IRouteHandler;
    keyBuilder?: (params: Params) => string;
}

// Heavily inspired by https://github.com/rackt/react-router/ Thanks to authors

interface OutFindMatch {
    p: Params
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

let rootRoutes: IRoute[];
let nameRouteMap: { [name: string]: IRoute } = {};

function encodeUrl(url: string): string {
    return encodeURIComponent(url).replace(/%20/g, "+");
}

function decodeUrl(url: string): string {
    return decodeURIComponent(url.replace(/\+/g, " "));
}

function encodeUrlPath(path: string): string {
    return String(path).split("/").map(encodeUrl).join("/");
}

const paramCompileMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|[*.()\[\]\\+|{}^$]/g;
const paramInjectMatcher = /:([a-zA-Z_$][a-zA-Z0-9_$?]*[?]?)|[*]/g;

let compiledPatterns: { [pattern: string]: { matcher: RegExp; paramNames: string[] } } = {};

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

// Extracts the portions of the given URL path that match the given pattern.
// Returns null if the pattern does not match the given path.
function extractParams(pattern: string, path: string): Params | null {
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

    return pattern.replace(paramInjectMatcher, (_match: string, paramName: string) => {
        paramName = paramName || "splat";

        // If param is optional don't check for existence
        if (paramName.slice(-1) !== "?") {
            if (params![paramName] == null)
                throw new Error("Missing \"" + paramName + "\" parameter for path \"" + pattern + "\"");
        } else {
            paramName = paramName.slice(0, -1);
            if (params![paramName] == null) {
                return "";
            }
        }

        var segment: string;
        if (paramName === "splat" && Array.isArray(params![paramName])) {
            segment = params![paramName][splatIndex++];

            if (segment == null)
                throw new Error("Missing splat # " + splatIndex + " for path \"" + pattern + "\"");
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
};

let activeRoutes: IRoute[] = [];
let futureRoutes: IRoute[];
let activeParams: Params = newHashObj();
let nodesArray: (IBobrilCacheNode | undefined)[] = [];
let setterOfNodesArray: ((node: IBobrilCacheNode) => void)[] = [];
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

function getSetterOfNodesArray(idx: number): (node: IBobrilCacheNode) => void {
    while (idx >= setterOfNodesArray.length) {
        setterOfNodesArray.push(((a: (IBobrilCacheNode | undefined)[], i: number) =>
            ((n: IBobrilCacheNode) => {
                if (n)
                    a[i] = n
            }))(nodesArray, idx));
    }
    return setterOfNodesArray[idx];
}

var firstRouting = true;
function rootNodeFactory(): IBobrilNode | undefined {
    if (waitingForPopHashChange >= 0)
        return undefined;
    let browserPath = window.location.hash;
    let path = browserPath.substr(1);
    if (!isAbsolute(path)) path = "/" + path;
    var out: OutFindMatch = { p: {} };
    var matches = findMatch(path, rootRoutes, out) || [];
    if (firstRouting) {
        firstRouting = false;
        currentTransition = { inApp: true, type: RouteTransitionType.Pop, name: undefined, params: undefined };
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
            if (currentTransition != null)
                return undefined;
        } else
            return undefined;
    }
    if (currentTransition == null) {
        activeRoutes = matches;
        while (nodesArray.length > activeRoutes.length) nodesArray.pop();
        while (nodesArray.length < activeRoutes.length) nodesArray.push(undefined);
        activeParams = out.p;
    }
    var fn: (otherdata?: any) => IBobrilNode | undefined = noop;
    for (var i = 0; i < activeRoutes.length; i++) {
        ((fninner: Function, r: IRoute, routeParams: Params, i: number) => {
            fn = (otherdata?: any) => {
                var data: any = r.data || {};
                assign(data, otherdata);
                data.activeRouteHandler = fninner;
                data.routeParams = routeParams;
                var handler = r.handler;
                var res: IBobrilNode;
                if (isFunction(handler)) {
                    res = handler(data);
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

export function routes(rootroutes: IRoute | IRoute[]): void {
    if (!isArray(rootroutes)) {
        rootroutes = <IRoute[]>[rootroutes];
    }
    registerRoutes("/", <IRoute[]>rootroutes);
    rootRoutes = <IRoute[]>rootroutes;
    init(rootNodeFactory);
}

export function route(config: IRouteConfig, nestedRoutes?: Array<IRoute>): IRoute {
    return { name: config.name, url: config.url, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, children: nestedRoutes };
}

export function routeDefault(config: IRouteConfig): IRoute {
    return { name: config.name, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, isDefault: true };
}

export function routeNotFound(config: IRouteConfig): IRoute {
    return { name: config.name, data: config.data, handler: config.handler, keyBuilder: config.keyBuilder, isNotFound: true };
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
            if (rootRoutes == null) throw Error('Cannot use urlOfRoute before defining routes');
            if (r == null) throw Error('Route with name ' + name + ' if not defined in urlOfRoute');
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
    }
}

export function createRedirectReplace(name: string, params?: Params): IRouteTransition {
    return {
        inApp: isInApp(name),
        type: RouteTransitionType.Replace,
        name: name,
        params: params || {}
    }
}

export function createBackTransition(distance?: number): IRouteTransition {
    distance = distance || 1;
    return {
        inApp: myAppHistoryDeepness >= distance,
        type: RouteTransitionType.Pop,
        name: undefined,
        params: {},
        distance
    }
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
                let tr = currentTransition; if (!currentTransition!.inApp) currentTransition = null;
                doAction(tr!);
                return;
            }
        } else if (transitionState === -1) {
            var out: OutFindMatch = { p: {} };
            if (currentTransition!.inApp) {
                futureRoutes = findMatch(urlOfRoute(currentTransition!.name!, currentTransition!.params).substring(1), rootRoutes, out) || [];
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
                let tr = currentTransition; currentTransition = null;
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
            if (res === true)
                continue;
            Promise.resolve(res).then((resp: boolean | IRouteTransition) => {
                if (resp === true) { }
                else if (resp === false) {
                    currentTransition = null; nextTransition = null;
                    return;
                } else {
                    nextTransition = resp;
                }
                nextIteration();
            }).catch((err: any) => { if (typeof console !== "undefined" && console.log) console.log(err); });
            return;
        }
    }
}

export let transitionRunCount = 1;

export function runTransition(transition: IRouteTransition): void {
    transitionRunCount++;

    if (currentTransition != null) {
        nextTransition = transition;
        return;
    }
    firstRouting = false;
    currentTransition = transition;
    transitionState = 0;
    nextIteration();
}

interface IBobrilAnchorCtx extends IBobrilCtx { l: number; } // shortened lastTransitionRunCount

export function anchor(children: IBobrilChildren, name?: string, params?: Params): IBobrilNode {
    return {
        children, component: {
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
                if (ctx.l === transitionRunCount)
                    return;
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

/** definition for Bobril defined class */
export type IBobrilStyleDef = string;

/** object case if for inline style declaration, undefined, null, true and false values are ignored */
export type IBobrilStyle = Object | IBobrilStyleDef | boolean | null | undefined;

export type IBobrilStyles = IBobrilStyle | IBobrilStyle[];

interface ISprite {
    styleid: IBobrilStyleDef;
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
    realname: string | null;
    parent?: IBobrilStyleDef | IBobrilStyleDef[];
    style: any;
    inlStyle?: CSSInlineStyles;
    pseudo?: CSSPseudoStyles;
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
            throw new Error("uknown style " + style);
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
        // Hack around bug in Chrome to not have FOUC
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
                let lastUrl = recolorAndClip(image, colorStr, dynSprite.width, dynSprite.height, dynSprite.left, dynSprite.top);
                var stDef = allStyles[dynSprite.styleid];
                stDef.style = { backgroundImage: `url(${lastUrl})`, width: dynSprite.width, height: dynSprite.height, backgroundPosition: 0 };
            }
        }
        var stylestr = injectedCss;
        for (var key in allStyles) {
            var ss = allStyles[key];
            let parent = ss.parent;
            let name = ss.name;
            let sspseudo = ss.pseudo;
            let ssstyle = ss.style;
            if (isFunction(ssstyle) && ssstyle.length === 0) {
                [ssstyle, sspseudo] = ssstyle();
            }
            if (isString(ssstyle) && sspseudo == null) {
                ss.realname = ssstyle;
                assert(name != null, "Cannot link existing class to selector");
                continue;
            }
            ss.realname = name;
            let style = newHashObj();
            let flattenPseudo = newHashObj();
            flattenStyle(undefined, flattenPseudo, undefined, sspseudo);
            flattenStyle(style, flattenPseudo, ssstyle, undefined);
            var extractedInlStyle: any;
            if (style["pointerEvents"]) {
                extractedInlStyle = newHashObj();
                extractedInlStyle["pointerEvents"] = style["pointerEvents"];
            }
            if (isIE9) {
                if (style["userSelect"]) {
                    if (extractedInlStyle == null)
                        extractedInlStyle = newHashObj();
                    extractedInlStyle["userSelect"] = style["userSelect"];
                    delete style["userSelect"];
                }
            }
            ss.inlStyle = extractedInlStyle;
            shimStyle(style);
            let cssStyle = inlineStyleToCssDeclaration(style);
            if (cssStyle.length > 0)
                stylestr += (name == null ? parent : buildCssRule(parent, name)) + " {" + cssStyle + "}\n";
            for (var key2 in flattenPseudo) {
                let sspi = flattenPseudo[key2];
                shimStyle(sspi);
                stylestr += (name == null ? parent + ":" + key2 : buildCssRule(parent, name + ":" + key2))
                    + " {" + inlineStyleToCssDeclaration(sspi) + "}\n";
            }
        }
        var styleElement = document.createElement("style");
        styleElement.type = 'text/css';
        if ((<any>styleElement).styleSheet) {
            (<any>styleElement).styleSheet.cssText = stylestr;
        } else {
            styleElement.appendChild(document.createTextNode(stylestr));
        }

        var head = document.head || document.getElementsByTagName('head')[0];
        if (htmlStyle != null) {
            head.replaceChild(styleElement, htmlStyle);
        }
        else {
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
        if (s == null || s === true || s === false || s === '') {
            // skip
        } else if (isString(s)) {
            var sd = allStyles[s];
            if (className == null) className = sd.realname!; else className = className + " " + sd.realname;
            var inls = sd.inlStyle;
            if (inls) {
                if (inlineStyle == null) inlineStyle = {};
                inlineStyle = assign(inlineStyle, inls);
            }
        } else if (isArray(s)) {
            if (ca.length > i + 1) {
                if (stack == null) stack = [];
                stack.push(i); stack.push(ca);
            }
            ca = <IBobrilStyles[]>s; i = 0;
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
    return s.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
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

export function styleDef(style: /*string | (() => [CSSStyles, CSSPseudoStyles]) |*/ CSSStyles, pseudo?: CSSPseudoStyles, nameHint?: string): IBobrilStyleDef {
    return styleDefEx(undefined, style, pseudo, nameHint);
}

export function styleDefEx(parent: IBobrilStyleDef | IBobrilStyleDef[] | undefined, style: (() => [CSSStyles, CSSPseudoStyles]) | CSSStyles, pseudo?: CSSPseudoStyles, nameHint?: string): IBobrilStyleDef {
    if (nameHint && nameHint !== "b-") {
        if (allNameHints[nameHint]) {
            var counter = 1;
            while (allNameHints[nameHint + counter]) counter++;
            nameHint = nameHint + counter;
        }
        allNameHints[nameHint] = true;
    } else {
        nameHint = "b-" + globalCounter++;
    }
    allStyles[nameHint] = { name: nameHint, realname: nameHint, parent, style, inlStyle: undefined, pseudo };
    invalidateStyles();
    return nameHint;
}

export function selectorStyleDef(selector: string, style: any, pseudo?: { [name: string]: any }) {
    allStyles["b-" + globalCounter++] = { name: null, realname: null, parent: selector, style, inlStyle: undefined, pseudo };
    invalidateStyles();
}

export function invalidateStyles(): void {
    rebuildStyles = true;
    invalidate();
}

function updateSprite(spDef: ISprite): void {
    var stDef = allStyles[spDef.styleid];
    var style: any = { backgroundImage: `url(${spDef.url})`, width: spDef.width, height: spDef.height };
    style.backgroundPosition = `${-spDef.left}px ${-spDef.top}px`;
    stDef.style = style;
    invalidateStyles();
}

function emptyStyleDef(url: string): IBobrilStyleDef {
    return styleDef({ width: 0, height: 0 }, undefined, url.replace(/[^a-z0-9_-]/gi, '_'));
}

const rgbaRegex = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;

function recolorAndClip(image: HTMLImageElement, colorStr: string, width: number, height: number, left: number, top: number): string {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = <CanvasRenderingContext2D>canvas.getContext("2d");
    ctx.drawImage(image, -left, -top);
    var imgdata = ctx.getImageData(0, 0, width, height);
    var imgd = imgdata.data;
    let rgba = rgbaRegex.exec(colorStr);
    let cred: number, cgreen: number, cblue: number, calpha: number;
    if (rgba) {
        cred = parseInt(rgba[1], 10);
        cgreen = parseInt(rgba[2], 10);
        cblue = parseInt(rgba[3], 10);
        calpha = Math.round(parseFloat(rgba[4]) * 255);
    } else {
        cred = parseInt(colorStr.substr(1, 2), 16);
        cgreen = parseInt(colorStr.substr(3, 2), 16);
        cblue = parseInt(colorStr.substr(5, 2), 16);
        calpha = parseInt(colorStr.substr(7, 2), 16) || 0xff;
    }
    if (calpha === 0xff) {
        for (var i = 0; i < imgd.length; i += 4) {
            // Horrible workaround for imprecisions due to browsers using premultiplied alpha internally for canvas
            let red = imgd[i];
            if (red === imgd[i + 1] && red === imgd[i + 2] && (red === 0x80 || imgd[i + 3] < 0xff && red > 0x70)) {
                imgd[i] = cred; imgd[i + 1] = cgreen; imgd[i + 2] = cblue;
            }
        }
    } else {
        for (var i = 0; i < imgd.length; i += 4) {
            let red = imgd[i];
            let alpha = imgd[i + 3];
            if (red === imgd[i + 1] && red === imgd[i + 2] && (red === 0x80 || alpha < 0xff && red > 0x70)) {
                if (alpha === 0xff) {
                    imgd[i] = cred; imgd[i + 1] = cgreen; imgd[i + 2] = cblue; imgd[i + 3] = calpha;
                } else {
                    alpha = alpha * (1.0 / 255);
                    imgd[i] = Math.round(cred * alpha);
                    imgd[i + 1] = Math.round(cgreen * alpha);
                    imgd[i + 2] = Math.round(cblue * alpha);
                    imgd[i + 3] = Math.round(calpha * alpha);
                }
            }
        }
    }
    ctx.putImageData(imgdata, 0, 0);
    return canvas.toDataURL();
}

let lastFuncId = 0;
const funcIdName = "b@funcId";
export function sprite(url: string, color?: string | (() => string), width?: number, height?: number, left?: number, top?: number): IBobrilStyleDef {
    assert(allStyles[url] === undefined, "Wrong sprite url");
    left = left || 0;
    top = top || 0;
    let colorId = color || "";
    let isVarColor = false;
    if (isFunction(color)) {
        isVarColor = true;
        colorId = (<any>color)[funcIdName];
        if (colorId == null) {
            colorId = "" + (lastFuncId++);
            (<any>color)[funcIdName] = colorId;
        }
    }
    var key = url + ":" + colorId + ":" + (width || 0) + ":" + (height || 0) + ":" + left + ":" + top;
    var spDef = allSprites[key];
    if (spDef) return spDef.styleid;
    var styleid = emptyStyleDef(url);
    spDef = { styleid, url, width, height, left, top };
    if (isVarColor) {
        (<IDynamicSprite>spDef).color = <() => string>color;
        (<IDynamicSprite>spDef).lastColor = '';
        (<IDynamicSprite>spDef).lastUrl = '';
        dynamicSprites.push(<IDynamicSprite>spDef);
        if (imageCache[url] === undefined) {
            imageCache[url] = null;
            var image = new Image();
            image.addEventListener("load", () => {
                imageCache[url] = image;
                invalidateStyles();
            });
            image.src = url;
        }
        invalidateStyles();
    } else if (width == null || height == null || color != null) {
        var image = new Image();
        image.addEventListener("load", () => {
            if (spDef.width == null) spDef.width = image.width;
            if (spDef.height == null) spDef.height = image.height;
            if (color != null) {
                spDef.url = recolorAndClip(image, <string>color, spDef.width, spDef.height, spDef.left, spDef.top);
                spDef.left = 0;
                spDef.top = 0;
            }
            updateSprite(spDef);
        });
        image.src = url;
    } else {
        updateSprite(spDef);
    }
    allSprites[key] = spDef;
    return styleid;
}

var bundlePath = (<any>window)['bobrilBPath'] || 'bundle.png';

export function setBundlePngPath(path: string) {
    bundlePath = path;
}

export function spriteb(width: number, height: number, left: number, top: number): IBobrilStyleDef {
    let url = bundlePath;
    var key = url + "::" + width + ":" + height + ":" + left + ":" + top;
    var spDef = allSprites[key];
    if (spDef) return spDef.styleid;
    var styleid = styleDef({ width: 0, height: 0 });
    spDef = { styleid: styleid, url: url, width: width, height: height, left: left, top: top };
    updateSprite(spDef);
    allSprites[key] = spDef;
    return styleid;
}

export function spritebc(color: () => string, width: number, height: number, left: number, top: number): IBobrilStyleDef {
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

function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
    var angleInRadians = angleInDegrees * Math.PI / 180.0;
    return {
        x: centerX + (radius * Math.sin(angleInRadians)), y: centerY - (radius * Math.cos(angleInRadians))
    };
}

function svgDescribeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, startWithLine: boolean) {
    var absDeltaAngle = Math.abs(endAngle - startAngle);
    var close = false;
    if (absDeltaAngle > 360 - 0.01) {
        if (endAngle > startAngle) endAngle = startAngle - 359.9;
        else endAngle = startAngle + 359.9;
        if (radius === 0) return "";
        close = true;
    } else {
        if (radius === 0) {
            return [
                startWithLine ? "L" : "M", x, y
            ].join(" ");
        }
    }
    var start = polarToCartesian(x, y, radius, endAngle);
    var end = polarToCartesian(x, y, radius, startAngle);
    var arcSweep = (absDeltaAngle <= 180) ? "0" : "1";
    var largeArg = (endAngle > startAngle) ? "0" : "1";
    var d = [
        (startWithLine ? "L" : "M"), start.x, start.y, "A", radius, radius, 0, arcSweep, largeArg, end.x, end.y
    ].join(" ");
    if (close) d += "Z";
    return d;
}

export function svgPie(x: number, y: number, radiusBig: number, radiusSmall: number, startAngle: number, endAngle: number): string {
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
    return "M" + x + " " + y + "h" + width + "v" + height + "h" + (-width) + "Z";
}

// Bobril.helpers

export function withKey(node: IBobrilNode, key: string): IBobrilNode {
    node.key = key;
    return node;
}

// PureFuncs: styledDiv, createVirtualComponent, createComponent, createDerivedComponent, createOverridingComponent, prop, propi, propa, propim, getValue

export function styledDiv(children: IBobrilChildren, ...styles: any[]): IBobrilNode {
    return style({ tag: 'div', children }, styles);
}

export interface IComponentFactory<TData extends Object> {
    (data?: TData, children?: IBobrilChildren): IBobrilNode;
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
    original: (data?: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent
): IComponentFactory<TData> {
    const originalComponent = original().component!;
    const overriding = overrideComponents(originalComponent, after);
    return createVirtualComponent<TData>(overriding);
}

export function createComponent<TData extends Object>(component: IBobrilComponent): IComponentFactory<TData> {
    const originalRender = component.render;
    if (originalRender) {
        component.render = function (ctx: any, me: IBobrilNode, oldMe?: IBobrilCacheNode) {
            me.tag = 'div';
            return originalRender.call(component, ctx, me, oldMe);
        }
    } else {
        component.render = (_ctx: any, me: IBobrilNode) => { me.tag = 'div'; };
    }
    return createVirtualComponent<TData>(component);
}

export function createDerivedComponent<TData>(original: (data?: any, children?: IBobrilChildren) => IBobrilNode, after: IBobrilComponent): IComponentFactory<TData> {
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
            if (onChange !== undefined)
                onChange(val, value);
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
                (<PromiseLike<T>>val).then((v) => {
                    prop(v);
                }, (err) => {
                    if (window["console"] && console.error)
                        console.error(err);
                });
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
            if (onChange !== undefined)
                onChange(val, oldVal);

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
if (!(<any>window).b) (<any>window).b = { deref, getRoots, setInvalidate, invalidateStyles, ignoreShouldChange, setAfterFrame, setBeforeFrame, getDnds, setBeforeInit };

// TSX reactNamespace emulation
// PureFuncs: createElement

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
        var someattrs = false;
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
            someattrs = true;
            attrs[n] = props[n];
        }
        if (someattrs)
            res.attrs = attrs;

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

// CSS Style defs
export type CSSValueGeneral = number | string;

export type CSSGlobalValues
    = 'initial'
    | 'inherit'
    | /** combination of `initial` and `inherit` */ 'unset'
    | 'revert';

export type CSSBlendMode = 'normal' | 'multiply' | 'screen' | 'overlay' | 'darken' | 'lighten' | 'color-dodge' | 'color-burn'
    | 'hard-light' | 'soft-light' | 'difference' | 'exclusion' | 'hue' | 'saturation' | 'color' | 'luminosity';

export type CSSBox = CSSGlobalValues | string | 'border-box' | 'padding-box' | 'content-box';

export type CSSColor = CSSGlobalValues | 'transparent' | 'currentColor' | string;

export type CSSFlexAlign = 'flex-start' | 'flex-end' | 'center' | 'baseline' | 'stretch';

export type CSSFontSize = CSSGlobalValues | CSSValueGeneral | 'xx-small' | 'x-small' | 'small' | 'medium' | 'large'
    | 'x-large' | 'xx-large' | 'larger' | 'smaller';

export type CSSLineStyle = string | 'none' | 'hidden' | 'dotted'
    | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset'
    | 'outset';

export type CSSOverflow = 'visible' | 'hidden' | 'scroll' | 'clip' | 'auto';

export type CSSRepeatStyle = string | 'repeat-x' | 'repeat-y' | 'repeat' | 'space' | 'round' | 'no-repeat';

export type CSSFontWeight = 'normal' | 'bold' | 'bolder' | 'lighter' | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | CSSValueGeneral | CSSGlobalValues;

export type CSSLazy<T> = T | ((styles: CSSInlineStyles, key: string) => T);

export type CSSLazyString = CSSLazy<string>;

export type CSSLazyValueGeneral = CSSLazy<CSSValueGeneral>;
/**
 * This interface documents key CSS properties for autocomplete
 */
export interface CSSInlineStyles {
    /**
     * Smooth scrolling on an iPhone. Specifies whether to use native-style scrolling in an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/-webkit-overflow-scrolling
     */
    overflowScrolling?: CSSLazy<'auto' | 'touch'>;

    /**
     * Aligns a flex container's lines within the flex container when there is extra space in the cross-axis, similar to how justify-content aligns individual items within the main-axis.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-content
     */
    alignContent?: CSSLazy<'stretch' | 'center' | 'flex-start' | 'flex-end' | 'space-between' | 'space-around' | 'initial' | 'inherit'>;

    /**
     * Sets the default alignment in the cross axis for all of the flex container's items, including anonymous flex items, similarly to how justify-content aligns items along the main axis.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-items
     */
    alignItems?: CSSLazy<CSSFlexAlign>;

    /**
     * Allows the default alignment to be overridden for individual flex items.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/align-self
     */
    alignSelf?: CSSLazy<'auto' | CSSFlexAlign>;

    /**
     * This property allows precise alignment of elements, such as graphics, that do not have a baseline-table or lack the desired baseline in their baseline-table. With the alignment-adjust property, the position of the baseline identified by the alignment-baseline can be explicitly determined. It also determines precisely the alignment point for each glyph within a textual element.
     */
    alignmentAdjust?: CSSLazyValueGeneral;

    /**
     * The alignment-baseline attribute specifies how an object is aligned with respect to its parent.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/alignment-baseline
     */
    alignmentBaseline?: CSSLazy<'auto' | 'baseline' | 'before-edge' | 'text-before-edge' | 'middle' | 'central' | 'after-edge' | 'text-after-edge' | 'ideographic' | 'alphabetic' | 'hanging' | 'mathematical' | 'inherit'>;

    /**
     * Shorthand property for animation-name, animation-duration, animation-timing-function, animation-delay,
     * animation-iteration-count, animation-direction, animation-fill-mode, and animation-play-state.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation
     */
    animation?: CSSLazyString;

    /**
     * Defines a length of time to elapse before an animation starts, allowing an animation to begin execution some time after it is applied.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-delay
     */
    animationDelay?: CSSLazyValueGeneral;

    /**
     * Defines whether an animation should run in reverse on some or all cycles.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-direction
     */
    animationDirection?: CSSLazy<CSSGlobalValues | 'normal' | 'alternate' | 'reverse' | 'alternate-reverse'>;

    /**
     * The animation-duration CSS property specifies the length of time that an animation should take to complete one cycle.
     * A value of '0s', which is the default value, indicates that no animation should occur.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-duration
     */
    animationDuration?: CSSLazyString;

    /**
     * Specifies how a CSS animation should apply styles to its target before and after it is executing.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-fill-mode
     */
    animationFillMode?: CSSLazy<'none' | 'forwards' | 'backwards' | 'both'>;

    /**
     * Specifies how many times an animation cycle should play.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-iteration-count
     */
    animationIterationCount?: CSSLazy<CSSValueGeneral | 'infinite'>;

    /**
     * Defines the list of animations that apply to the element.
     * Note: You probably want animationDuration as well
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-name
     */
    animationName?: CSSLazyString;

    /**
     * Defines whether an animation is running or paused.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-play-state
     */
    animationPlayState?: CSSLazyString;

    /**
     * Sets the pace of an animation
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/animation-timing-function
     */
    animationTimingFunction?: CSSLazyString;

    /**
     * Allows changing the style of any element to platform-based interface elements or vice versa.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/appearance
     */
    appearance?: CSSLazy<'auto' | 'none'>;

    /**
     * Determines whether or not the “back” side of a transformed element is visible when facing the viewer.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/backface-visibility
     */
    backfaceVisibility?: CSSLazy<CSSGlobalValues | 'visible' | 'hidden'>;

    /**
     * Shorthand property to set the values for one or more of:
     * background-clip, background-color, background-image,
     * background-origin, background-position, background-repeat,
     * background-size, and background-attachment.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background
     */
    background?: CSSLazyString;

    /**
     * If a background-image is specified, this property determines
     * whether that image's position is fixed within the viewport,
     * or scrolls along with its containing block.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-attachment
     */
    backgroundAttachment?: CSSLazy<'scroll' | 'fixed' | 'local'>;

    /**
     * This property describes how the element's background images should blend with each other and the element's background color.
     * The value is a list of blend modes that corresponds to each background image. Each element in the list will apply to the corresponding element of background-image. If a property doesn’t have enough comma-separated values to match the number of layers, the UA must calculate its used value by repeating the list of values until there are enough.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-blend-mode
     */
    backgroundBlendMode?: CSSLazy<CSSBlendMode>;

    /**
     * Specifies whether an element's background, either the color or image, extends underneath its border.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-clip
     */
    backgroundClip?: CSSLazy<CSSBox | 'text'>;

    /**
     * Sets the background color of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-color
     */
    backgroundColor?: CSSLazy<CSSColor>;

    /**
     * Sets a compositing style for background images and colors.
     */
    backgroundComposite?: CSSLazyString;

    /**
     * Applies one or more background images to an element. These can be any valid CSS image, including url() paths to image files or CSS gradients.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-image
     */
    backgroundImage?: CSSLazyString;

    /**
     * Specifies what the background-position property is relative to.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-origin
     */
    backgroundOrigin?: CSSLazy<CSSBox>;

    /**
     * Sets the position of a background image.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-position
     */
    backgroundPosition?: CSSLazyString;

    /**
     * Background-repeat defines if and how background images will be repeated after they have been sized and positioned
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-repeat
     */
    backgroundRepeat?: CSSLazy<CSSRepeatStyle>;

    /**
     * Background-size specifies the size of a background image
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/background-size
     */
    backgroundSize?: CSSLazy<'auto' | 'cover' | 'contain' | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Shorthand property that defines the different properties of all four sides of an element's border in a single declaration. It can be used to set border-width, border-style and border-color, or a subset of these.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border
     */
    border?: CSSLazyValueGeneral;

    /**
     * Shorthand that sets the values of border-bottom-color,
     * border-bottom-style, and border-bottom-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom
     */
    borderBottom?: CSSLazyValueGeneral;

    /**
     * Sets the color of the bottom border of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-color
     */
    borderBottomColor?: CSSLazy<CSSColor>;

    /**
     * Defines the shape of the border of the bottom-left corner.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-left-radius
     */
    borderBottomLeftRadius?: CSSLazyValueGeneral;

    /**
     * Defines the shape of the border of the bottom-right corner.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-right-radius
     */
    borderBottomRightRadius?: CSSLazyValueGeneral;

    /**
     * Sets the line style of the bottom border of a box.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-style
     */
    borderBottomStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's bottom border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-bottom-width
     */
    borderBottomWidth?: CSSLazyValueGeneral;

    /**
     * Border-collapse can be used for collapsing the borders between table cells
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-collapse
     */
    borderCollapse?: CSSLazy<"collapse" | "separate" | "inherit">;

    /**
     * The CSS border-color property sets the color of an element's four borders. This property can have from one to four values, made up of the elementary properties:
     *      •       border-top-color
     *      •       border-right-color
     *      •       border-bottom-color
     *      •       border-left-color The default color is the currentColor of each of these values.
     * If you provide one value, it sets the color for the element. Two values set the horizontal and vertical values, respectively. Providing three values sets the top, vertical, and bottom values, in that order. Four values set all for sides: top, right, bottom, and left, in that order.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-color
     */
    borderColor?: CSSLazy<CSSColor>;

    /**
     * Specifies different corner clipping effects, such as scoop (inner curves), bevel (straight cuts) or notch (cut-off rectangles). Works along with border-radius to specify the size of each corner effect.
     */
    borderCornerShape?: CSSLazyValueGeneral;

    /**
     * The property border-image-source is used to set the image to be used instead of the border style. If this is set to none the border-style is used instead.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-source
     */
    borderImageSource?: CSSLazyString;

    /**
     * The border-image-width CSS property defines the offset to use for dividing the border image in nine parts, the top-left corner, central top edge, top-right-corner, central right edge, bottom-right corner, central bottom edge, bottom-left corner, and central right edge. They represent inward distance from the top, right, bottom, and left edges.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-image-width
     */
    borderImageWidth?: CSSLazyValueGeneral;

    /**
     * Shorthand property that defines the border-width, border-style and border-color of an element's left border in a single declaration. Note that you can use the corresponding longhand properties to set specific individual properties of the left border — border-left-width, border-left-style and border-left-color.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left
     */
    borderLeft?: CSSLazyValueGeneral;

    /**
     * The CSS border-left-color property sets the color of an element's left border. This page explains the border-left-color value, but often you will find it more convenient to fix the border's left color as part of a shorthand set, either border-left or border-color.
     * Colors can be defined several ways. For more information, see Usage.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-color
     */
    borderLeftColor?: CSSLazy<CSSColor>;

    /**
     * Sets the style of an element's left border. To set all four borders, use the shorthand property, border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-style
     */
    borderLeftStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's left border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-left-width
     */
    borderLeftWidth?: CSSLazyValueGeneral;

    /**
     * Allows Web authors to define how rounded border corners are
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-radius
     */
    borderRadius?: CSSLazyValueGeneral;

    /**
     * Shorthand property that defines the border-width, border-style and border-color of an element's right border in a single declaration. Note that you can use the corresponding longhand properties to set specific individual properties of the right border — border-right-width, border-right-style and border-right-color.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right
     */
    borderRight?: CSSLazyValueGeneral;

    /**
     * Sets the color of an element's right border. This page explains the border-right-color value, but often you will find it more convenient to fix the border's right color as part of a shorthand set, either border-right or border-color.
     * Colors can be defined several ways. For more information, see Usage.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-color
     */
    borderRightColor?: CSSLazy<CSSColor>;

    /**
     * Sets the style of an element's right border. To set all four borders, use the shorthand property, border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-style
     */
    borderRightStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's right border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-right-width
     */
    borderRightWidth?: CSSLazyValueGeneral;

    /**
     * Specifies the distance between the borders of adjacent cells.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-spacing
     */
    borderSpacing?: CSSLazyValueGeneral;

    /**
     * Sets the style of an element's four borders. This property can have from one to four values. With only one value, the value will be applied to all four borders; otherwise, this works as a shorthand property for each of border-top-style, border-right-style, border-bottom-style, border-left-style, where each border style may be assigned a separate value.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-style
     */
    borderStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Shorthand property that defines the border-width, border-style and border-color of an element's top border in a single declaration. Note that you can use the corresponding longhand properties to set specific individual properties of the top border — border-top-width, border-top-style and border-top-color.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top
     */
    borderTop?: CSSLazyValueGeneral;

    /**
     * Sets the color of an element's top border. This page explains the border-top-color value, but often you will find it more convenient to fix the border's top color as part of a shorthand set, either border-top or border-color.
     * Colors can be defined several ways. For more information, see Usage.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-color
     */
    borderTopColor?: CSSLazy<CSSColor>;

    /**
     * Sets the rounding of the top-left corner of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-left-radius
     */
    borderTopLeftRadius?: CSSLazyValueGeneral;

    /**
     * Sets the rounding of the top-right corner of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-right-radius
     */
    borderTopRightRadius?: CSSLazyValueGeneral;

    /**
     * Sets the style of an element's top border. To set all four borders, use the shorthand property, border-style. Otherwise, you can set the borders individually with border-top-style, border-right-style, border-bottom-style, border-left-style.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-style
     */
    borderTopStyle?: CSSLazy<CSSLineStyle>;

    /**
     * Sets the width of an element's top border. To set all four borders, use the border-width shorthand property which sets the values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-top-width
     */
    borderTopWidth?: CSSLazyValueGeneral;

    /**
     * Sets the width of an element's four borders. This property can have from one to four values. This is a shorthand property for setting values simultaneously for border-top-width, border-right-width, border-bottom-width, and border-left-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/border-width
     */
    borderWidth?: CSSLazyValueGeneral;

    /**
     * This property specifies how far an absolutely positioned box's bottom margin edge is offset above the bottom edge of the box's containing block. For relatively positioned boxes, the offset is with respect to the bottom edges of the box itself (i.e., the box is given a position in the normal flow, then offset from that position according to these properties).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/bottom
     */
    bottom?: CSSLazyValueGeneral;

    /**
     * Breaks a box into fragments creating new borders, padding and repeating backgrounds or lets it stay as a continuous box on a page break, column break, or, for inline elements, at a line break.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-decoration-break
     */
    boxDecorationBreak?: CSSLazy<"slice" | "clone">;

    /**
     * box sizing
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing
     */
    boxSizing?: CSSLazy<CSSGlobalValues | 'content-box' | 'border-box'>;

    /**
     * Box shadow
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/box-shadow
     */
    boxShadow?: CSSLazyValueGeneral;

    /**
     * The CSS break-after property allows you to force a break on multi-column layouts. More specifically, it allows you to force a break after an element. It allows you to determine if a break should occur, and what type of break it should be. The break-after CSS property describes how the page, column or region break behaves after the generated box. If there is no generated box, the property is ignored.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/break-after
     */
    breakAfter?: CSSLazy<'auto' | 'avoid' | 'avoid-page' | 'page' | 'left' | 'right' | 'recto' | 'verso' | 'avoid-column' | 'column' | 'avoid-region' | 'region'>;

    /**
     * Control page/column/region breaks that fall above a block of content
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/break-before
     */
    breakBefore?: CSSLazy<'auto' | 'avoid' | 'avoid-page' | 'page' | 'left' | 'right' | 'recto' | 'verso' | 'avoid-column' | 'column' | 'avoid-region' | 'region'>;

    /**
     * Control page/column/region breaks that fall within a block of content
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/break-inside
     */
    breakInside?: CSSLazy<'auto' | 'avoid' | 'avoid-page' | 'avoid-column' | 'avoid-region'>;

    /**
     * The caption-side CSS property positions the content of a table's <caption> on the specified side.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/caption-side
     */
    captionSide?: CSSLazy<CSSGlobalValues | 'top' | 'bottom' | 'block-start' | 'block-end' | 'inline-start' | 'inline-end'>;

    /**
     * The clear CSS property specifies if an element can be positioned next to or must be positioned below the floating elements that precede it in the markup.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/clear
     */
    clear?: CSSLazy<CSSGlobalValues | 'none' | 'left' | 'right' | 'both'>;

    /**
     * Clipping crops an graphic, so that only a portion of the graphic is rendered, or filled. This clip-rule property, when used with the clip-path property, defines which clip rule, or algorithm, to use when filling the different parts of a graphics.
     * @see https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/clip-rule
     */
    clipRule?: CSSLazyString;

    /**
     * The color property sets the color of an element's foreground content (usually text), accepting any standard CSS color from keywords and hex values to RGB(a) and HSL(a).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/color
     */
    color?: CSSLazy<CSSColor>;

    /**
     * Describes the number of columns of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-count
     */
    columnCount?: CSSLazyValueGeneral;

    /**
     * Specifies how to fill columns (balanced or sequential).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-fill
     */
    columnFill?: CSSLazyString;

    /**
     * The column-gap property controls the width of the gap between columns in multi-column elements.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-gap
     */
    columnGap?: CSSLazyValueGeneral;

    /**
     * Sets the width, style, and color of the rule between columns.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule
     */
    columnRule?: CSSLazyString;

    /**
     * Specifies the color of the rule between columns.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-color
     */
    columnRuleColor?: CSSLazy<CSSColor>;

    /**
     * Specifies the width of the rule between columns.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-rule-width
     */
    columnRuleWidth?: CSSLazyValueGeneral;

    /**
     * The column-span CSS property makes it possible for an element to span across all columns when its value is set to all. An element that spans more than one column is called a spanning element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-span
     */
    columnSpan?: CSSLazyValueGeneral;

    /**
     * Specifies the width of columns in multi-column elements.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/column-width
     */
    columnWidth?: CSSLazyValueGeneral;

    /**
     * This property is a shorthand property for setting column-width and/or column-count.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/columns
     */
    columns?: CSSLazyValueGeneral;

    /**
     * The content property is used with the :before and :after pseudo-elements, to insert generated content.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/content
     */
    content?: CSSLazyString;

    /**
     * The counter-increment property accepts one or more names of counters (identifiers), each one optionally followed by an integer which specifies the value by which the counter should be incremented (e.g. if the value is 2, the counter increases by 2 each time it is invoked).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/counter-increment
     */
    counterIncrement?: CSSLazyValueGeneral;

    /**
     * The counter-reset property contains a list of one or more names of counters, each one optionally followed by an integer (otherwise, the integer defaults to 0.) Each time the given element is invoked, the counters specified by the property are set to the given integer.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/counter-reset
     */
    counterReset?: CSSLazyValueGeneral;

    /**
     * Specifies the mouse cursor displayed when the mouse pointer is over an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/cursor
     */
    cursor?: CSSLazy<CSSGlobalValues | string | 'auto' | 'default' | 'none' | 'context-menu' | 'help' | 'pointer' | 'progress' | 'wait' | 'cell' | 'crosshair' | 'text' | 'vertical-text' | 'alias' | 'copy' | 'move' | 'no-drop' | 'not-allowed' | 'e-resize' | 'n-resize' | 'ne-resize' | 'nw-resize' | 's-resize' | 'se-resize' | 'sw-resize' | 'w-resize' | 'ew-resize' | 'ns-resize' | 'nesw-resize' | 'nwse-resize' | 'col-resize' | 'row-resize' | 'all-scroll' | 'zoom-in' | 'zoom-out' | 'grab' | 'grabbing'>;

    /**
     * The direction CSS property specifies the text direction/writing direction. The rtl is used for Hebrew or Arabic text, the ltr is for other languages.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/direction
     */
    direction?: CSSLazy<CSSGlobalValues | 'ltr' | 'rtl'>;

    /**
     * This property specifies the type of rendering box used for an element. It is a shorthand property for many other display properties.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/display
     */
    display?: CSSLazy<CSSGlobalValues | string | 'none' | 'inline' | 'block' | 'inline-block' | 'contents' | 'list-item' | 'inline-list-item' | 'table' | 'inline-table' | 'table-cell' | 'table-column' | 'table-column-group' | 'table-footer-group' | 'table-header-group' | 'table-row' | 'table-row-group' | 'table-caption' | 'flex' | 'inline-flex' | 'grid' | 'inline-grid' | 'ruby' | 'ruby-base' | 'ruby-text' | 'ruby-base-container' | 'ruby-text-container' | 'run-in'>;

    /**
     * The ‘fill’ property paints the interior of the given graphical element. The area to be painted consists of any areas inside the outline of the shape. To determine the inside of the shape, all subpaths are considered, and the interior is determined according to the rules associated with the current value of the ‘fill-rule’ property. The zero-width geometric outline of a shape is included in the area to be painted.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/fill
     */
    fill?: CSSLazyString;

    /**
     * SVG: Specifies the opacity of the color or the content the current object is filled with.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/fill-opacity
     */
    fillOpacity?: CSSLazyValueGeneral;

    /**
     * The ‘fill-rule’ property indicates the algorithm which is to be used to determine what parts of the canvas are included inside the shape. For a simple, non-intersecting path, it is intuitively clear what region lies "inside"; however, for a more complex path, such as a path that intersects itself or where one subpath encloses another, the interpretation of "inside" is not so obvious.
     * The ‘fill-rule’ property provides two options for how the inside of a shape is determined:
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/fill-rule
     */
    fillRule?: CSSLazyString;

    /**
     * Applies various image processing effects. This property is largely unsupported. See Compatibility section for more information.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/filter
     */
    filter?: CSSLazyString;

    /**
     * Shorthand for `flex-grow`, `flex-shrink`, and `flex-basis`.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex
     */
    flex?: CSSLazyValueGeneral;

    /**
     * The flex-basis CSS property describes the initial main size of the flex item before any free space is distributed according to the flex factors described in the flex property (flex-grow and flex-shrink).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-basis
     */
    flexBasis?: CSSLazyValueGeneral;

    /**
     * The flex-direction CSS property describes how flex items are placed in the flex container, by setting the direction of the flex container's main axis.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-direction
     */
    flexDirection?: CSSLazy<CSSGlobalValues | "row" | "row-reverse" | "column" | "column-reverse">;

    /**
     * The flex-flow CSS property defines the flex container's main and cross axis. It is a shorthand property for the flex-direction and flex-wrap properties.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-flow
     */
    flexFlow?: CSSLazyString;

    /**
     * Specifies the flex grow factor of a flex item.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-grow
     */
    flexGrow?: CSSLazyValueGeneral;

    /**
     * Gets or sets a value that specifies the ordinal group that a flexbox element belongs to. This ordinal value identifies the display order for the group.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-order
     */
    flexOrder?: CSSLazyValueGeneral;

    /**
     * Specifies the flex shrink factor of a flex item.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-shrink
     */
    flexShrink?: CSSLazyValueGeneral;

    /**
     * Specifies whether flex items are forced into a single line or can be wrapped onto multiple lines.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/flex-wrap
     */
    flexWrap?: CSSLazy<CSSGlobalValues | 'nowrap' | 'wrap' | 'wrap-reverse'>;

    /**
     * Elements which have the style float are floated horizontally. These elements can move as far to the left or right of the containing element. All elements after the floating element will flow around it, but elements before the floating element are not impacted. If several floating elements are placed after each other, they will float next to each other as long as there is room.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/float
     */
    float?: CSSLazy<CSSGlobalValues | 'left' | 'right' | 'none' | 'inline-start' | 'inline-end'>;

    /**
     * Flows content from a named flow (specified by a corresponding flow-into) through selected elements to form a dynamic chain of layout regions.
     */
    flowFrom?: CSSLazyValueGeneral;

    /**
     * The font property is shorthand that allows you to do one of two things: you can either set up six of the most mature font properties in one line, or you can set one of a choice of keywords to adopt a system font setting.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font
     */
    font?: CSSLazyString;

    /**
     * The font-family property allows one or more font family names and/or generic family names to be specified for usage on the selected element(s)' text. The browser then goes through the list; for each character in the selection it applies the first font family that has an available glyph for that character.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-family
     */
    fontFamily?: CSSLazyString;

    /**
     * The font-kerning property allows contextual adjustment of inter-glyph spacing, i.e. the spaces between the characters in text. This property controls <bold>metric kerning</bold> - that utilizes adjustment data contained in the font. Optical Kerning is not supported as yet.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-kerning
     */
    fontKerning?: CSSLazy<CSSGlobalValues | 'auto' | 'normal' | 'none'>;

    /**
     * Specifies the size of the font. Used to compute em and ex units.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-size
     */
    fontSize?: CSSLazy<CSSFontSize>;

    /**
     * The font-size-adjust property adjusts the font-size of the fallback fonts defined with font-family, so that the x-height is the same no matter what font is used. This preserves the readability of the text when fallback happens.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-size-adjust
     */
    fontSizeAdjust?: CSSLazyValueGeneral;

    /**
     * Allows you to expand or condense the widths for a normal, condensed, or expanded font face.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch
     */
    fontStretch?: CSSLazy<CSSGlobalValues | 'normal' | 'ultra-condensed' | 'extra-condensed' | 'condensed' | 'semi-condensed' | 'semi-expanded' | 'expanded' | 'extra-expanded' | 'ultra-expanded'>;

    /**
     * The font-style property allows normal, italic, or oblique faces to be selected. Italic forms are generally cursive in nature while oblique faces are typically sloped versions of the regular face. Oblique faces can be simulated by artificially sloping the glyphs of the regular face.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
     */
    fontStyle?: CSSLazy<CSSGlobalValues | 'normal' | 'italic' | 'oblique'>;

    /**
     * This value specifies whether the user agent is allowed to synthesize bold or oblique font faces when a font family lacks bold or italic faces.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-synthesis
     */
    fontSynthesis?: CSSLazyString;

    /**
     * The font-variant property enables you to select the small-caps font within a font family.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant
     */
    fontVariant?: CSSLazyString;

    /**
     * Fonts can provide alternate glyphs in addition to default glyph for a character. This property provides control over the selection of these alternate glyphs.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-variant-alternates
     */
    fontVariantAlternates?: CSSLazyString;

    /**
     * Specifies the weight or boldness of the font.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
     */
    fontWeight?: CSSLazy<CSSFontWeight>;

    /**
     * Lays out one or more grid items bound by 4 grid lines. Shorthand for setting grid-column-start, grid-column-end, grid-row-start, and grid-row-end in a single declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-area
     */
    gridArea?: CSSLazyString;

    /**
     * Controls a grid item's placement in a grid area, particularly grid position and a grid span. Shorthand for setting grid-column-start and grid-column-end in a single declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column
     */
    gridColumn?: CSSLazyString;

    /**
     * Controls a grid item's placement in a grid area as well as grid position and a grid span. The grid-column-end property (with grid-row-start, grid-row-end, and grid-column-start) determines a grid item's placement by specifying the grid lines of a grid item's grid area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-end
     */
    gridColumnEnd?: CSSLazyValueGeneral;

    /**
     * Determines a grid item's placement by specifying the starting grid lines of a grid item's grid area . A grid item's placement in a grid area consists of a grid position and a grid span. See also ( grid-row-start, grid-row-end, and grid-column-end)
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-column-start
     */
    gridColumnStart?: CSSLazyValueGeneral;

    /**
     * Gets or sets a value that indicates which row an element within a Grid should appear in. Shorthand for setting grid-row-start and grid-row-end in a single declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row
     */
    gridRow?: CSSLazyString;

    /**
     * Determines a grid item’s placement by specifying the block-end. A grid item's placement in a grid area consists of a grid position and a grid span. The grid-row-end property (with grid-row-start, grid-column-start, and grid-column-end) determines a grid item's placement by specifying the grid lines of a grid item's grid area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-end
     */
    gridRowEnd?: CSSLazyValueGeneral;

    /**
     * Determines a grid item’s start position within the grid row by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the inline-start edge of its grid area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-row-start
     */
    gridRowStart?: CSSLazyValueGeneral;

    /**
     * Specifies a row position based upon an integer location, string value, or desired row size.
     * css/properties/grid-row is used as short-hand for grid-row-position and grid-row-position
     */
    gridRowPosition?: CSSLazyString;

    gridRowSpan?: CSSLazyValueGeneral;

    /**
     * Specifies named grid areas which are not associated with any particular grid item, but can be referenced from the grid-placement properties. The syntax of the grid-template-areas property also provides a visualization of the structure of the grid, making the overall layout of the grid container easier to understand.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-areas
     */
    gridTemplateAreas?: CSSLazyValueGeneral;

    /**
     * Specifies (with grid-template-rows) the line names and track sizing functions of the grid. Each sizing function can be specified as a length, a percentage of the grid container’s size, a measurement of the contents occupying the column or row, or a fraction of the free space in the grid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-columns
     */
    gridTemplateColumns?: CSSLazyValueGeneral;

    /**
     * Specifies (with grid-template-columns) the line names and track sizing functions of the grid. Each sizing function can be specified as a length, a percentage of the grid container’s size, a measurement of the contents occupying the column or row, or a fraction of the free space in the grid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/grid-template-rows
     */
    gridTemplateRows?: CSSLazyValueGeneral;

    /**
     * Sets the height of an element. The content area of the element height does not include the padding, border, and margin of the element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/height
     */
    height?: CSSLazy<'auto' | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Specifies the minimum number of characters in a hyphenated word
     * @see https://msdn.microsoft.com/en-us/library/hh771865(v=vs.85).aspx
     */
    hyphenateLimitChars?: CSSLazyValueGeneral;

    /**
     * Indicates the maximum number of successive hyphenated lines in an element. The ‘no-limit’ value means that there is no limit.
     * @see https://msdn.microsoft.com/en-us/library/hh771867(v=vs.85).aspx
     */
    hyphenateLimitLines?: CSSLazyValueGeneral;

    /**
     * Specifies the maximum amount of trailing whitespace (before justification) that may be left in a line before hyphenation is triggered to pull part of a word from the next line back up into the current one.
     * @see https://msdn.microsoft.com/en-us/library/hh771869(v=vs.85).aspx
     */
    hyphenateLimitZone?: CSSLazyValueGeneral;

    /**
     * Specifies whether or not words in a sentence can be split by the use of a manual or automatic hyphenation mechanism.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/hyphens
     */
    hyphens?: CSSLazy<CSSGlobalValues | string | 'none' | 'manual' | 'auto'>;

    /**
     * Controls the state of the input method editor for text fields.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/ime-mode
     */
    imeMode?: CSSLazy<CSSGlobalValues | 'auto' | 'normal' | 'active' | 'inactive' | 'disabled'>;

    /**
     * Defines how the browser distributes space between and around flex items
     * along the main-axis of their container.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/justify-content
     */
    justifyContent?: CSSLazy<'flex-start' | 'flex-end' | 'center' | 'space-between' | 'space-around'>;

    layoutGrid?: CSSLazyValueGeneral;

    layoutGridChar?: CSSLazyValueGeneral;

    layoutGridLine?: CSSLazyValueGeneral;

    layoutGridMode?: CSSLazyValueGeneral;

    layoutGridType?: CSSLazyValueGeneral;

    /**
     * Sets the left edge of an element
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/left
     */
    left?: CSSLazy<'auto' | CSSValueGeneral>;

    /**
     * The letter-spacing CSS property specifies the spacing behavior between text characters.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/letter-spacing
     */
    letterSpacing?: CSSLazyValueGeneral;

    lineClamp?: CSSLazyValueGeneral;

    /**
     * Specifies the height of an inline block level element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/line-height
     */
    lineHeight?: CSSLazyValueGeneral;

    /**
     * Shorthand property that sets the list-style-type, list-style-position and list-style-image properties in one declaration.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style
     */
    listStyle?: CSSLazyString;

    /**
     * This property sets the image that will be used as the list item marker. When the image is available, it will replace the marker set with the 'list-style-type' marker. That also means that if the image is not available, it will show the style specified by list-style-property
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-image
     */
    listStyleImage?: CSSLazyString;

    /**
     * Specifies if the list-item markers should appear inside or outside the content flow.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-position
     */
    listStylePosition?: CSSLazy<CSSGlobalValues | 'inside' | 'outside'>;

    /**
     * Specifies the type of list-item marker in a list.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/list-style-type
     */
    listStyleType?: CSSLazyString;

    /**
     * The margin property is shorthand to allow you to set all four margins of an element at once. Its equivalent longhand properties are margin-top, margin-right, margin-bottom and margin-left. Negative values are also allowed.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin
     */
    margin?: CSSLazyValueGeneral;

    /**
     * margin-bottom sets the bottom margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-bottom
     */
    marginBottom?: CSSLazyValueGeneral;

    /**
     * margin-left sets the left margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-left
     */
    marginLeft?: CSSLazyValueGeneral;

    /**
     * margin-right sets the right margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-right
     */
    marginRight?: CSSLazyValueGeneral;

    /**
     * margin-top sets the top margin of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/margin-top
     */
    marginTop?: CSSLazyValueGeneral;

    /**
     * This property is shorthand for setting mask-image, mask-mode, mask-repeat, mask-position, mask-clip, mask-origin, mask-composite and mask-size. Omitted values are set to their original properties' initial values.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mask
     */
    mask?: CSSLazyString;

    /**
     * This property is shorthand for setting mask-border-source, mask-border-slice, mask-border-width, mask-border-outset, and mask-border-repeat. Omitted values are set to their original properties' initial values.
     */
    maskBorder?: CSSLazyString;

    /**
     * This property specifies how the images for the sides and the middle part of the mask image are scaled and tiled. The first keyword applies to the horizontal sides, the second one applies to the vertical ones. If the second keyword is absent, it is assumed to be the same as the first, similar to the CSS border-image-repeat property.
     */
    maskBorderRepeat?: CSSLazyValueGeneral;

    /**
     * This property specifies inward offsets from the top, right, bottom, and left edges of the mask image, dividing it into nine regions: four corners, four edges, and a middle. The middle image part is discarded and treated as fully transparent black unless the fill keyword is present. The four values set the top, right, bottom and left offsets in that order, similar to the CSS border-image-slice property.
     */
    maskBorderSlice?: CSSLazyValueGeneral;

    /**
     * Specifies an image to be used as a mask. An image that is empty, fails to download, is non-existent, or cannot be displayed is ignored and does not mask the element.
     */
    maskBorderSource?: CSSLazyString;

    /**
     * This property sets the width of the mask box image, similar to the CSS border-image-width property.
     */
    maskBorderWidth?: CSSLazyValueGeneral;

    /**
     * Determines the mask painting area, which defines the area that is affected by the mask. The painted content of an element may be restricted to this area.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mask-clip
     */
    maskClip?: CSSLazyString;

    /**
     * For elements rendered as a single box, specifies the mask positioning area. For elements rendered as multiple boxes (e.g., inline boxes on several lines, boxes on several pages) specifies which boxes box-decoration-break operates on to determine the mask positioning area(s).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mask-origin
     */
    maskOrigin?: CSSLazyString;

    /**
     * Sets the maximum height for an element. It prevents the height of the element to exceed the specified value. If min-height is specified and is greater than max-height, max-height is overridden.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/max-height
     */
    maxHeight?: CSSLazyValueGeneral;

    /**
     * Sets the maximum width for an element. It limits the width property to be larger than the value specified in max-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/max-width
     */
    maxWidth?: CSSLazyValueGeneral;

    /**
     * Sets the minimum height for an element. It prevents the height of the element to be smaller than the specified value. The value of min-height overrides both max-height and height.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/min-height
     */
    minHeight?: CSSLazyValueGeneral;

    /**
     * Sets the minimum width of an element. It limits the width property to be not smaller than the value specified in min-width.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/min-width
     */
    minWidth?: CSSLazyValueGeneral;

    /**
     * The blend mode defines the formula that must be used to mix the colors with the backdrop
     * @see https://drafts.fxtf.org/compositing-1/#mix-blend-mode
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/mix-blend-mode
     */
    mixBlendMode?: CSSLazy<CSSBlendMode>;

    /**
     * Specifies the transparency of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/opacity
     */
    opacity?: CSSLazyValueGeneral;

    /**
     * Specifies the order used to lay out flex items in their flex container.
     * Elements are laid out in the ascending order of the order value.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/order
     */
    order?: CSSLazyValueGeneral;

    /**
     * In paged media, this property defines the minimum number of lines in
     * a block container that must be left at the bottom of the page.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/orphans
     */
    orphans?: CSSLazyValueGeneral;

    /**
     * The CSS outline property is a shorthand property for setting one or more of the individual outline properties outline-style, outline-width and outline-color in a single rule. In most cases the use of this shortcut is preferable and more convenient.
     * Outlines differ from borders in the following ways:
     *  • Outlines do not take up space, they are drawn above the content.
     *  • Outlines may be non-rectangular. They are rectangular in Gecko/Firefox. Internet Explorer attempts to place the smallest contiguous outline around all elements or shapes that are indicated to have an outline. Opera draws a non-rectangular shape around a construct.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline
     */
    outline?: CSSLazyString;

    /**
     * The outline-color property sets the color of the outline of an element. An outline is a line that is drawn around elements, outside the border edge, to make the element stand out.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline-color
     */
    outlineColor?: CSSLazy<CSSColor>;

    /**
     * The outline-style property sets the style of the outline of an element.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline-style
     */
    outlineStyle?: CSSLazy<CSSGlobalValues | 'auto' | 'none' | 'dotted' | 'dashed' | 'solid' | 'double' | 'groove' | 'ridge' | 'inset' | 'outset'>;

    /**
     * The outline-offset property offsets the outline and draw it beyond the border edge.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/outline-offset
     */
    outlineOffset?: CSSLazyValueGeneral;

    /**
     * The overflow property controls how extra content exceeding the bounding box of an element is rendered. It can be used in conjunction with an element that has a fixed width and height, to eliminate text-induced page distortion.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
     */
    overflow?: CSSLazy<CSSOverflow>;

    /**
     * Specifies the preferred scrolling methods for elements that overflow.
     */
    overflowStyle?: CSSLazyValueGeneral;

    /**
     * Controls how extra content exceeding the x-axis of the bounding box of an element is rendered.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-x
     */
    overflowX?: CSSLazy<CSSOverflow>;

    /**
     * Controls how extra content exceeding the y-axis of the bounding box of an element is rendered.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/overflow-y
     */
    overflowY?: CSSLazy<CSSOverflow>;

    /**
     * The padding optional CSS property sets the required padding space on one to four sides of an element. The padding area is the space between an element and its border. Negative values are not allowed but decimal values are permitted. The element size is treated as fixed, and the content of the element shifts toward the center as padding is increased.
     * The padding property is a shorthand to avoid setting each side separately (padding-top, padding-right, padding-bottom, padding-left).
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding
     */
    padding?: CSSLazyValueGeneral;

    /**
     * The padding-bottom CSS property of an element sets the padding space required on the bottom of an element. The padding area is the space between the content of the element and its border. Contrary to margin-bottom values, negative values of padding-bottom are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-bottom
     */
    paddingBottom?: CSSLazyValueGeneral;

    /**
     * The padding-left CSS property of an element sets the padding space required on the left side of an element. The padding area is the space between the content of the element and its border. Contrary to margin-left values, negative values of padding-left are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-left
     */
    paddingLeft?: CSSLazyValueGeneral;

    /**
     * The padding-right CSS property of an element sets the padding space required on the right side of an element. The padding area is the space between the content of the element and its border. Contrary to margin-right values, negative values of padding-right are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-right
     */
    paddingRight?: CSSLazyValueGeneral;

    /**
     * The padding-top CSS property of an element sets the padding space required on the top of an element. The padding area is the space between the content of the element and its border. Contrary to margin-top values, negative values of padding-top are invalid.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/padding-top
     */
    paddingTop?: CSSLazyValueGeneral;

    /**
     * The page-break-after property is supported in all major browsers. With CSS3, page-break-* properties are only aliases of the break-* properties. The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-after
     */
    pageBreakAfter?: CSSLazy<CSSGlobalValues | 'auto' | 'always' | 'avoid' | 'left' | 'right' | 'recto' | 'verso'>;

    /**
     * The page-break-before property sets the page-breaking behavior before an element. With CSS3, page-break-* properties are only aliases of the break-* properties. The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-before
     */
    pageBreakBefore?: CSSLazy<CSSGlobalValues | 'auto' | 'always' | 'avoid' | 'left' | 'right' | 'recto' | 'verso'>;

    /**
     * Sets the page-breaking behavior inside an element. With CSS3, page-break-* properties are only aliases of the break-* properties. The CSS3 Fragmentation spec defines breaks for all CSS box fragmentation.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/page-break-inside
     */
    pageBreakInside?: CSSLazy<CSSGlobalValues | 'auto' | 'avoid'>;

    /**
     * The perspective property defines how far an element is placed from the view on the z-axis, from the screen to the viewer.
     * Perspective defines how an object is viewed. In graphic arts, perspective is the representation on a flat surface of what the viewer's eye would see in a 3D space. (See Wikipedia for more information about graphical perspective and for related illustrations.)
     * The illusion of perspective on a flat surface, such as a computer screen, is created by projecting points on the flat surface as they would appear if the flat surface were a window through which the viewer was looking at the object. In discussion of virtual environments, this flat surface is called a projection plane.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/perspective
     */
    perspective?: CSSLazyValueGeneral;

    /**
     * The perspective-origin property establishes the origin for the perspective property. It effectively sets the X and Y position at which the viewer appears to be looking at the children of the element.
     * When used with perspective, perspective-origin changes the appearance of an object, as if a viewer were looking at it from a different origin. An object appears differently if a viewer is looking directly at it versus looking at it from below, above, or from the side. Thus, the perspective-origin is like a vanishing point.
     * The default value of perspective-origin is 50% 50%. This displays an object as if the viewer's eye were positioned directly at the center of the screen, both top-to-bottom and left-to-right. A value of 0% 0% changes the object as if the viewer was looking toward the top left angle. A value of 100% 100% changes the appearance as if viewed toward the bottom right angle.
     * @see https://developer.mozilla.org/en-US/docs/Web/CSS/perspective-origin
     */
    perspectiveOrigin?: CSSLazyValueGeneral;

    /**
     * The pointer-events property allows you to control whether an element can be the target for the pointing device (e.g, mouse, pen) events.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/pointer-events
     */
    pointerEvents?: CSSLazy<CSSGlobalValues | 'auto' | 'none' | 'visiblePainted' | 'visibleFill' | 'visibleStroke' | 'visible' | 'painted' | 'fill' | 'stroke' | 'all'>;

    /**
     * The position property controls the type of positioning used by an element within its parent elements. The effect of the position property depends on a lot of factors, for example the position property of parent elements.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/position
     */
    position?: CSSLazy<CSSGlobalValues | 'static' | 'relative' | 'absolute' | 'sticky' | 'fixed'>;

    /**
     * Sets the type of quotation marks for embedded quotations.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/quotes
     */
    quotes?: CSSLazyValueGeneral;

    /**
     * Controls whether the last region in a chain displays additional 'overset' content according its default overflow property, or if it displays a fragment of content as if it were flowing into a subsequent region.
     */
    regionFragment?: CSSLazyValueGeneral;

    /**
     * The resize CSS property lets you control the resizability of an element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/resize
     */
    resize?: CSSLazy<CSSGlobalValues | 'none' | 'both ' | 'horizontal' | 'vertical'>;

    /**
     * The rest-after property determines how long a speech media agent should pause after presenting an element's main content, before presenting that element's exit cue sound. It may be replaced by the shorthand property rest, which sets rest time before and after.
     */
    restAfter?: CSSLazyValueGeneral;

    /**
     * The rest-before property determines how long a speech media agent should pause after presenting an intro cue sound for an element, before presenting that element's main content. It may be replaced by the shorthand property rest, which sets rest time before and after.
     */
    restBefore?: CSSLazyValueGeneral;

    /**
     * Specifies the position an element in relation to the right side of the containing element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/right
     */
    right?: CSSLazy<'auto' | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Specifies the distribution of the different ruby elements over the base.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/ruby-align
     */
    rubyAlign?: CSSLazy<CSSGlobalValues | 'start' | 'center' | 'space-between' | 'space-around'>;

    /**
     * Specifies the position of a ruby element relatives to its base element. It can be position over the element (over), under it (under), or between the characters, on their right side (inter-character).
     * @see https://developer.mozilla.org/en/docs/Web/CSS/ruby-position
     */
    rubyPosition?: CSSLazy<CSSGlobalValues | 'over' | 'under' | 'inter-character'>;

    /**
     * Defines the alpha channel threshold used to extract a shape from an image. Can be thought of as a "minimum opacity" threshold; that is, a value of 0.5 means that the shape will enclose all the pixels that are more than 50% opaque.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/shape-image-threshold
     */
    shapeImageThreshold?: CSSLazyValueGeneral;

    /**
     * A future level of CSS Shapes will define a shape-inside property, which will define a shape to wrap content within the element. See Editor's Draft <http://dev.w3.org/csswg/css-shapes/> and CSSWG wiki page on next-level plans <http://wiki.csswg.org/spec/css-shapes>
     */
    shapeInside?: CSSLazyValueGeneral;

    /**
     * Adds a margin to a shape-outside. In effect, defines a new shape that is the smallest contour around all the points that are the shape-margin distance outward perpendicular to each point on the underlying shape. For points where a perpendicular direction is not defined (e.g., a triangle corner), takes all points on a circle centered at the point and with a radius of the shape-margin distance. This property accepts only non-negative values.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/shape-margin
     */
    shapeMargin?: CSSLazyValueGeneral;

    /**
     * Declares a shape around which text should be wrapped, with possible modifications from the shape-margin property. The shape defined by shape-outside and shape-margin changes the geometry of a float element's float area.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/shape-outside
     */
    shapeOutside?: CSSLazyValueGeneral;

    /**
     * The speak property determines whether or not a speech synthesizer will read aloud the contents of an element.
     */
    speak?: CSSLazyValueGeneral;

    /**
     * The speak-as property determines how the speech synthesizer interprets the content: words as whole words or as a sequence of letters, numbers as a numerical value or a sequence of digits, punctuation as pauses in speech or named punctuation characters.
     */
    speakAs?: CSSLazyValueGeneral;

    /**
     * SVG: Specifies the opacity of the outline on the current object.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/stroke-opacity
     */
    strokeOpacity?: CSSLazyValueGeneral;

    /**
     * SVG: Specifies the width of the outline on the current object.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/stroke-width
     */
    strokeWidth?: CSSLazyValueGeneral;

    /**
     * The tab-size CSS property is used to customise the width of a tab (U+0009) character.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/tab-size
     */
    tabSize?: CSSLazyValueGeneral;

    /**
     * The 'table-layout' property controls the algorithm used to lay out the table cells, rows, and columns.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/table-layout
     */
    tableLayout?: CSSLazyValueGeneral;

    /**
     * The text-align CSS property describes how inline content like text is aligned in its parent block element. text-align does not control the alignment of block elements itself, only their inline content.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-align
     */
    textAlign?: CSSLazy<CSSGlobalValues | 'start' | 'end' | 'left' | 'right' | 'center' | 'justify' | 'justify-all' | 'match-parent'>;

    /**
     * The text-align-last CSS property describes how the last line of a block element or a line before line break is aligned in its parent block element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-align-last
     */
    textAlignLast?: CSSLazy<CSSGlobalValues | 'auto' | 'start' | 'end' | 'left' | 'right' | 'center' | 'justify'>;

    /**
     * The text-decoration CSS property is used to set the text formatting to underline, overline, line-through or blink.
     * underline and overline decorations are positioned under the text, line-through over it.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration
     */
    textDecoration?: CSSLazyValueGeneral;

    /**
     * Sets the color of any text decoration, such as underlines, overlines, and strike throughs.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-color
     */
    textDecorationColor?: CSSLazy<CSSColor>;

    /**
     * Sets what kind of line decorations are added to an element, such as underlines, overlines, etc.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-line
     */
    textDecorationLine?: CSSLazyValueGeneral;

    textDecorationLineThrough?: CSSLazyValueGeneral;

    textDecorationNone?: CSSLazyValueGeneral;

    textDecorationOverline?: CSSLazyValueGeneral;

    /**
     * Specifies what parts of an element’s content are skipped over when applying any text decoration.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-skip
     */
    textDecorationSkip?: CSSLazyValueGeneral;

    /**
     * This property specifies the style of the text decoration line drawn on the specified element. The intended meaning for the values are the same as those of the border-style-properties.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-decoration-style
     */
    textDecorationStyle?: CSSLazy<CSSGlobalValues | 'solid' | 'double' | 'dotted' | 'dashed' | 'wavy'>;

    textDecorationUnderline?: CSSLazyValueGeneral;

    /**
     * The text-emphasis property will apply special emphasis marks to the elements text. Slightly similar to the text-decoration property only that this property can have affect on the line-height. It also is noted that this is shorthand for text-emphasis-style and for text-emphasis-color.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-emphasis
     */
    textEmphasis?: CSSLazyValueGeneral;

    /**
     * The text-emphasis-color property specifies the foreground color of the emphasis marks.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-emphasis-color
     */
    textEmphasisColor?: CSSLazy<CSSColor>;

    /**
     * The text-emphasis-style property applies special emphasis marks to an element's text.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-emphasis-style
     */
    textEmphasisStyle?: CSSLazyValueGeneral;

    /**
     * This property helps determine an inline box's block-progression dimension, derived from the text-height and font-size properties for non-replaced elements, the height or the width for replaced elements, and the stacked block-progression dimension for inline-block elements. The block-progression dimension determines the position of the padding, border and margin for the element.
     */
    textHeight?: CSSLazyValueGeneral;

    /**
     * Specifies the amount of space horizontally that should be left on the first line of the text of an element. This horizontal spacing is at the beginning of the first line and is in respect to the left edge of the containing block box.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-indent
     */
    textIndent?: CSSLazyValueGeneral;

    /**
     * The text-overflow shorthand CSS property determines how overflowed content that is not displayed is signaled to the users. It can be clipped, display an ellipsis ('…', U+2026 HORIZONTAL ELLIPSIS) or a Web author-defined string. It covers the two long-hand properties text-overflow-mode and text-overflow-ellipsis
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-overflow
     */
    textOverflow?: CSSLazy<CSSGlobalValues | 'clip' | 'ellipsis' | string>;

    /**
     * The text-overline property is the shorthand for the text-overline-style, text-overline-width, text-overline-color, and text-overline-mode properties.
     */
    textOverline?: CSSLazyValueGeneral;

    /**
     * Specifies the line color for the overline text decoration.
     */
    textOverlineColor?: CSSLazy<CSSColor>;

    /**
     * Sets the mode for the overline text decoration, determining whether the text decoration affects the space characters or not.
     */
    textOverlineMode?: CSSLazyValueGeneral;

    /**
     * Specifies the line style for overline text decoration.
     */
    textOverlineStyle?: CSSLazyValueGeneral;

    /**
     * Specifies the line width for the overline text decoration.
     */
    textOverlineWidth?: CSSLazyValueGeneral;

    /**
     * The text-rendering CSS property provides information to the browser about how to optimize when rendering text. Options are: legibility, speed or geometric precision.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-rendering
     */
    textRendering?: CSSLazy<CSSGlobalValues | 'auto' | 'optimizeSpeed' | 'optimizeLegibility' | 'geometricPrecision'>;

    /**
     * The CSS text-shadow property applies one or more drop shadows to the text and <text-decorations> of an element. Each shadow is specified as an offset from the text, along with optional color and blur radius values.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-shadow
     */
    textShadow?: CSSLazyValueGeneral;

    /**
     * This property transforms text for styling purposes. (It has no effect on the underlying content.)
     * @see https://developer.mozilla.org/en/docs/Web/CSS/text-transform
     */
    textTransform?: CSSLazy<CSSGlobalValues | 'none' | 'capitalize' | 'uppercase' | 'lowercase' | 'full-width'>;

    /**
     * Unsupported.
     * This property will add a underline position value to the element that has an underline defined.
     */
    textUnderlinePosition?: CSSLazyValueGeneral;

    /**
     * After review this should be replaced by text-decoration should it not?
     * This property will set the underline style for text with a line value for underline, overline, and line-through.
     */
    textUnderlineStyle?: CSSLazyValueGeneral;

    /**
     * This property specifies how far an absolutely positioned box's top margin edge is offset below the top edge of the box's containing block. For relatively positioned boxes, the offset is with respect to the top edges of the box itself (i.e., the box is given a position in the normal flow, then offset from that position according to these properties).
     * @see https://developer.mozilla.org/en/docs/Web/CSS/top
     */
    top?: CSSLazy<'auto' | CSSValueGeneral | CSSGlobalValues>;

    /**
     * Determines whether touch input may trigger default behavior supplied by the user agent, such as panning or zooming.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/touch-action
     */
    touchAction?: CSSLazy<CSSGlobalValues | 'auto' | 'none' | 'pan-x' | 'pan-left' | 'pan-right' | 'pan-y' | 'pan-up' | 'pan-down' | 'manipulation'>;

    /**
     * CSS transforms allow elements styled with CSS to be transformed in two-dimensional or three-dimensional space. Using this property, elements can be translated, rotated, scaled, and skewed. The value list may consist of 2D and/or 3D transform values.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transform
     */
    transform?: CSSLazyString;

    /**
     * This property defines the origin of the transformation axes relative to the element to which the transformation is applied.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transform-origin
     */
    transformOrigin?: CSSLazyValueGeneral;

    /**
     * This property allows you to define the relative position of the origin of the transformation grid along the z-axis.
     */
    transformOriginZ?: CSSLazyValueGeneral;

    /**
     * This property specifies how nested elements are rendered in 3D space relative to their parent.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transform-style
     */
    transformStyle?: CSSLazy<CSSGlobalValues | 'flat' | 'preserve-3d'>;

    /**
     * The transition CSS property is a shorthand property for transition-property, transition-duration, transition-timing-function, and transition-delay. It allows to define the transition between two states of an element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/transition
     */
    transition?: CSSLazyValueGeneral;

    /**
     * The unicode-bidi CSS property specifies the level of embedding with respect to the bidirectional algorithm.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/unicode-bidi
     */
    unicodeBidi?: CSSLazyValueGeneral;

    /**
     * User select
     * @see https://developer.mozilla.org/en/docs/Web/CSS/user-select
     */
    userSelect?: CSSLazy<'auto' | 'text' | 'none' | 'contain' | 'all'>;

    /**
     * The vertical-align property controls how inline elements or text are vertically aligned compared to the baseline. If this property is used on table-cells it controls the vertical alignment of content of the table cell.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/vertical-align
     */
    verticalAlign?: CSSLazy<CSSGlobalValues | 'baseline' | 'sub' | 'super' | 'text-top' | 'text-bottom' | 'middle' | 'top' | 'bottom' | CSSValueGeneral>;

    /**
     * The visibility property specifies whether the boxes generated by an element are rendered.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/visibility
     */
    visibility?: CSSLazy<CSSGlobalValues | 'visible' | 'hidden' | 'collapse'>;

    /**
     * The white-space property controls whether and how white space inside the element is collapsed, and whether lines may wrap at unforced "soft wrap" opportunities.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/white-space
     */
    whiteSpace?: CSSLazy<CSSGlobalValues | 'normal' | 'nowrap' | 'pre' | 'pre-line' | 'pre-wrap'>;

    /**
     * In paged media, this property defines the mimimum number of lines
     * that must be left at the top of the second page.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/widows
     */
    widows?: CSSLazyValueGeneral;

    /**
     * Specifies the width of the content area of an element. The content area of the element width does not include the padding, border, and margin of the element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/width
     */
    width?: CSSLazy<'auto' | CSSValueGeneral | CSSGlobalValues>;

    /**
     * The word-break property is often used when there is long generated content that is strung together without and spaces or hyphens to beak apart. A common case of this is when there is a long URL that does not have any hyphens. This case could potentially cause the breaking of the layout as it could extend past the parent element.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/word-break
     */
    wordBreak?: CSSLazy<CSSGlobalValues | 'normal' | 'break-all' | 'keep-all'>;

    /**
     * The word-spacing CSS property specifies the spacing behavior between "words".
     * @see https://developer.mozilla.org/en/docs/Web/CSS/word-spacing
     */
    wordSpacing?: CSSLazy<CSSGlobalValues | 'normal' | CSSValueGeneral>;

    /**
     * An alias of css/properties/overflow-wrap, word-wrap defines whether to break words when the content exceeds the boundaries of its container.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/word-wrap
     */
    wordWrap?: CSSLazy<CSSGlobalValues | 'normal' | 'break-word'>;

    /**
     * writing-mode specifies if lines of text are laid out horizontally or vertically, and the direction which lines of text and blocks progress.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/writing-mode
     */
    writingMode?: CSSLazy<CSSGlobalValues | 'horizontal-tb' | 'vertical-rl' | 'vertical-lr' | 'sideways-rl' | 'sideways-lr'>;

    /**
     * The z-index property specifies the z-order of an element and its descendants.
     * When elements overlap, z-order determines which one covers the other.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/z-index
     */
    zIndex?: CSSLazy<'auto' | CSSValueGeneral>;

    /**
     * Sets the initial zoom factor of a document defined by @viewport.
     * @see https://developer.mozilla.org/en/docs/Web/CSS/zoom
     */
    zoom?: CSSLazy<'auto' | CSSValueGeneral>;

    [prop: string]: CSSLazyValueGeneral | undefined;
}

export type CSSStylesItem = string | ((styles: CSSInlineStyles, pseudo: CSSPseudoStyles) => void) | CSSInlineStyles | boolean | null | undefined;
export type CSSStyles = CSSStylesItem | CSSStylesItemArray;
export interface CSSStylesItemArray extends Array<CSSStyles> { };

export type CSSPseudoStyles = {
    'active'?: CSSStyles;
    'checked'?: CSSStyles;
    'disabled'?: CSSStyles;
    'enabled'?: CSSStyles;
    'first-child'?: CSSStyles;
    'focus'?: CSSStyles;
    'hover'?: CSSStyles;
    'invalid'?: CSSStyles;
    'last-child'?: CSSStyles;
    'valid'?: CSSStyles;
    'visited'?: CSSStyles;

    [selector: string]: CSSStyles;
};
