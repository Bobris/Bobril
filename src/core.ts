import { CSSInlineStyles } from "./cssTypes";
import {
    afterFrameCallback,
    beforeFrameCallback,
    beforeRenderCallback,
    reallyBeforeFrameCallback,
    RenderPhase,
} from "./frameCallbacks";
import { isString, isNumber, isObject, isFunction, isArray } from "./isFunc";
import { assert, createTextNode, hOP, is, newHashObj, noop } from "./localHelpers";

// Bobril.Core

export type IBobrilChild<T = any> = boolean | number | string | IBobrilNode<T> | null | undefined;
export type IBobrilChildren = IBobrilChild | IBobrilChildArray;
export interface IBobrilChildArray extends Array<IBobrilChildren> {}
export type IBobrilCacheChildren = string | IBobrilCacheNode[] | undefined;

export interface IDisposable {
    dispose(): void;
}

export type IDisposeFunction = (ctx?: any) => void;
export type IDisposableLike = IDisposable | IDisposeFunction;

export type MethodId = string | number;

export interface IBobrilRoot {
    // Factory function
    f: (rootData: IBobrilRoot) => IBobrilChildren;
    // Root element
    e: HTMLElement | undefined;
    /// @deprecated Virtual Dom Cache - true cache is in n
    c: IBobrilCacheChildren;
    // Optional Logical parent
    p: IBobrilCacheNode | undefined;
    // Virtual Dom Cache Node
    n: IBobrilCacheNode | undefined;
}

export type ICtxClass<TData = any> = {
    new (data: TData, me: IBobrilCacheNode<TData>): BobrilCtx<TData>;
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

export interface IEventParam {
    target: IBobrilCacheNode;
}

export interface IBubblingAndBroadcastEvents {
    onInput?(event: IInputEvent): GenericEventResult;
}

/// These events could be used with `useEvent` or `useCaptureEvent`
export interface IHookableEvents extends IBubblingAndBroadcastEvents {
    /// called on string input element when selection or caret position changes
    onSelectionChange?(event: ISelectionChangeEvent): GenericEventResult;

    onFocus?(event: IEventParam): GenericEventResult;
    onBlur?(event: IEventParam): GenericEventResult;
}

/// These events could be used with `useCaptureEvents`
export interface ICapturableEvents extends IHookableEvents {
    onScroll?(event: IBobrilScroll): GenericEventResult;
}

export interface IBobrilEvents extends IBubblingAndBroadcastEvents {
    /// called on input element after any change with new value (string|boolean|string[]) - it does NOT bubble, use onInput if need bubbling
    onChange?(value: any): void;
    /// called on string input element when selection or caret position changes (void result is just for backward compatibility, bubbling)
    onSelectionChange?(event: ISelectionChangeEvent): void | GenericEventResult;

    // focus moved from outside of this element to some child of this element
    onFocusIn?(): void;
    // focus moved from inside of this element to some outside element
    onFocusOut?(): void;
    /// void result is for barward compatibility, it is bubbled
    onFocus?(event: IEventParam): void | GenericEventResult;
    /// void result is for barward compatibility, it is bubbled
    onBlur?(event: IEventParam): void | GenericEventResult;
}

export type IBobrilEventsWithCtx<TCtx> = {
    [N in keyof IBobrilEvents]?: NonNullable<IBobrilEvents[N]> extends (...args: any) => any
        ? Parameters<NonNullable<IBobrilEvents[N]>>["length"] extends 0
            ? (ctx: TCtx) => ReturnType<NonNullable<IBobrilEvents[N]>>
            : (
                  ctx: TCtx,
                  event: Parameters<NonNullable<IBobrilEvents[N]>>[0]
              ) => ReturnType<NonNullable<IBobrilEvents[N]>>
        : never;
};

export interface IBobrilComponent<TData = any, TCtx extends IBobrilCtx<TData> = any>
    extends IBobrilEventsWithCtx<TCtx> {
    /// parent component of derived/overriding component
    super?: IBobrilComponent;
    /// if id of old node is different from new node it is considered completely different so init will be called before render directly
    /// it does prevent calling render method twice on same node
    id?: string;
    /// original function or component
    src?: any;
    ctxClass?: ICtxClass<TData>;
    /// called before new node in virtual dom should be created, me members (tag, attrs, children, ...) could be modified, ctx is initialized to { data: me.data||{}, me: me, cfg: fromParent }
    init?(ctx: IBobrilCtx<TData>, me: IBobrilCacheNode): void;
    /// in case of update after shouldChange returns true, you can do any update/init tasks, ctx.data is updated to me.data and oldMe.component updated to me.component before calling this
    /// in case of init this is called after init method, oldMe is equal to undefined in that case
    render?(ctx: IBobrilCtx<TData>, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    /// called after all children are rendered, but before updating own attrs
    /// so this is useful for kind of layout in JS features
    postRender?(ctx: IBobrilCtx<TData>, me: IBobrilNode, oldMe?: IBobrilCacheNode): void;
    /// return false when whole subtree should not be changed from last time, you can still update any me members except key, default implementation always return true
    shouldChange?(ctx: IBobrilCtx<TData>, me: IBobrilNode, oldMe: IBobrilCacheNode): boolean;
    /// called from children to parents order for new nodes
    postInitDom?(ctx: IBobrilCtx<TData>, me: IBobrilCacheNode, element: HTMLElement): void;
    /// called from children to parents order for updated nodes
    postUpdateDom?(ctx: IBobrilCtx<TData>, me: IBobrilCacheNode, element: HTMLElement): void;
    /// called from children to parents order for updated nodes but in every frame even when render was not run
    postUpdateDomEverytime?(ctx: IBobrilCtx<TData>, me: IBobrilCacheNode, element: HTMLElement): void;
    /// called just before removing node from dom
    destroy?(ctx: IBobrilCtx<TData>, me: IBobrilNode, element: HTMLElement): void;
    /// called after onX and before shouldStopBubble to handle any event
    handleGenericEvent?(ctx: IBobrilCtx<TData>, name: string, param: Object): GenericEventResult;
    /// called when bubbling event to parent so you could stop bubbling without preventing default handling
    shouldStopBubble?(ctx: IBobrilCtx<TData>, name: string, param: Object): boolean;
    /// called when broadcast wants to dive in this node so you could silence broadcast for you and your children
    shouldStopBroadcast?(ctx: IBobrilCtx<TData>, name: string, param: Object): boolean;
    /// used to implement any instance method which will be search by runMethodFrom using wave kind of broadcast stopping on first method returning true
    runMethod?(ctx: IBobrilCtx<TData>, methodId: MethodId, param?: Object): boolean;
}

export type RefType =
    | [IBobrilCtx, string]
    | ((node: IBobrilCacheNode | undefined, oldNode?: IBobrilCacheNode) => void)
    | { current: IBobrilCacheNode | undefined };

// new node should at least have tag or component or children member
export interface IBobrilNodeCommon<T = any> {
    tag?: string;
    key?: string;
    className?: string;
    style?: Record<string, string | number | undefined> | (() => IBobrilStyle);
    attrs?: IBobrilAttributes;
    children?: IBobrilChildren;
    ref?: RefType;
    /// set this for children to be set to their ctx.cfg, if undefined your own ctx.cfg will be used anyway; but better to use `extendCfg`
    cfg?: any;
    component?: IBobrilComponent<T>;
    // Bobril does not touch this, it is completely for user passing custom data to component
    // It is very similar to props in ReactJs, it must be immutable, you have access to this through ctx.data
    data?: T;
    /// Forbid array like objects to be IBobrilNode, use IBobrilChildren instead
    length?: never;
}

/// VDom node which Bobril will render and expand into IBobrilCacheNode
export type IBobrilNode<T = any> = Exclude<IBobrilNodeCommon<T> & object, Function>;

export interface IBobrilNodeWithKey<T = any> extends IBobrilNode<T> {
    key: string;
}

/// remembered and rendered VDom node
export interface IBobrilCacheNode<T = any> {
    readonly tag: string | undefined;
    readonly key: string | undefined;
    readonly className: string | undefined;
    readonly style: Record<string, string | undefined> | undefined;
    readonly ctxStyle: IBobrilCtx<IBobrilStyles> | undefined;
    readonly attrs: IBobrilAttributes | undefined;
    readonly children: IBobrilCacheChildren;
    readonly ref: RefType | undefined;
    readonly cfg: any;
    readonly component: IBobrilComponent<T>;
    readonly data: T;
    readonly element: Node | Node[] | undefined;
    readonly parent: IBobrilCacheNode | undefined;
    readonly ctx: IBobrilCtx | undefined;
    /// Originally created or updated from - used for partial updates
    readonly orig: IBobrilNode<T>;
}

/// There are not many reasons why client code should be allowed to modify VDom, that's why it is called Unsafe.
export type IBobrilCacheNodeUnsafe<T = any> = { -readonly [P in keyof IBobrilCacheNode<T>]: IBobrilCacheNode<T>[P] };

export interface IBobrilCtx<TData = any> {
    // properties passed from parent component, treat it as immutable
    data: TData;
    me: IBobrilCacheNode<TData>;
    // properties passed from parent component automatically, but could be extended for children to IBobrilNode.cfg
    cfg: any | undefined;
    refs: { [name: string]: IBobrilCacheNode | undefined } | undefined;
    disposables: IDisposableLike[] | undefined;
}

type HookFlags = number;
const hasPostInitDom: HookFlags = 1;
const hasPostUpdateDom: HookFlags = 2;
const hasPostUpdateDomEverytime: HookFlags = 4;
const hasEvents: HookFlags = 8;
const hasCaptureEvents: HookFlags = 16;
const hasUseEffect: HookFlags = 32;

interface IBobrilCtxInternal<TData = any> extends IBobrilCtx<TData> {
    $hookFlags: HookFlags;
    $hooks: any[] | undefined;
    $bobxCtx: object | undefined;
}

export class BobrilCtx<TData> implements IBobrilCtxInternal {
    constructor(data?: TData, me?: IBobrilCacheNode<TData>) {
        this.data = data!;
        this.me = me!;
        this.cfg = undefined;
        this.refs = undefined;
        this.disposables = undefined;
        this.$hookFlags = 0;
        this.$hooks = undefined;
        this.$bobxCtx = undefined;
    }
    data: TData;
    me: IBobrilCacheNode<TData>;
    cfg: any | undefined;
    refs: { [name: string]: IBobrilCacheNode | undefined } | undefined;
    disposables: IDisposableLike[] | undefined;
    $hookFlags: HookFlags;
    $hooks: any[] | undefined;
    $bobxCtx: object | undefined;
}

export interface IBobrilScroll {
    node: IBobrilCacheNode | undefined;
}

export interface ISelectionChangeEvent extends IEventParam {
    startPosition: number;
    // endPosition tries to be also caret position (does not work on any IE or Edge 12)
    endPosition: number;
}

declare var DEBUG: boolean;

const emptyObject = {};
if (DEBUG) Object.freeze(emptyObject);

function createEl(name: string): HTMLElement {
    return document.createElement(name);
}

export function assertNever(switchValue: never): never {
    throw new Error("Switch is not exhaustive for value: " + JSON.stringify(switchValue));
}

export let assign = Object.assign;

// PureFuncs: flatten
export function flatten(a: any | any[]): any[] {
    if (!isArray(a)) {
        if (a == undefined || a === false || a === true) return [];
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
        if (item == undefined || item === false || item === true) {
            a.splice(i, 1);
            aLen--;
            continue;
        }
        i++;
    }
    return a;
}

export function swallowPromise<T>(promise: Promise<T>): void {
    promise.catch((reason) => {
        console.error("Uncaught exception from swallowPromise", reason);
    });
}

var inSvg: boolean = false;
var inNotFocusable: boolean = false;
var updateCall: Array<Function> = [];
var updateInstance: Array<IBobrilCacheNode> = [];
var effectInstance: Array<IBobrilCacheNode> = [];

export function ieVersion() {
    return (<any>document).documentMode;
}

const focusableTag = /^input$|^select$|^textarea$|^button$/;
const tabindexStr = "tabindex";

function isNaturallyFocusable(tag: string | undefined, attrs: IBobrilAttributes | undefined): boolean {
    if (tag == undefined) return false;
    if (tag === "input" && attrs && attrs["disabled"]) return false;
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
    if (notFocusable && !wasTabindex && isNaturallyFocusable(n.tag, newAttrs)) {
        el.setAttribute(tabindexStr, "-1");
        oldAttrs[tabindexStr] = -1;
    }
    if (newAttrs == undefined) {
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
        setValueAttribute(el, n, valueNewAttr, valueOldAttr);
    }
    return oldAttrs;
}

function setValueAttribute(el: Element, node: IBobrilCacheNodeUnsafe, newValue: any, oldValue: any) {
    var tagName = el.tagName;
    var isSelect = tagName === "SELECT";
    var isInput = tagName === "INPUT" || tagName === "TEXTAREA";
    if (!isInput && !isSelect) {
        if (newValue !== oldValue) (<any>el)[tValue] = newValue;
        return;
    }
    if (node.ctx === undefined) {
        node.ctx = new BobrilCtx(undefined, node);
        node.component = emptyObject;
    }
    if (oldValue === undefined) {
        (<any>node.ctx)[bValue] = newValue;
    }
    var isMultiSelect = isSelect && (<HTMLSelectElement>el).multiple;
    var emitDiff = false;
    if (isMultiSelect) {
        var options = (<HTMLSelectElement>el).options;
        var currentMulti = selectedArray(options);
        if (!stringArrayEqual(newValue, currentMulti)) {
            if (
                oldValue === undefined ||
                stringArrayEqual(currentMulti, oldValue) ||
                !stringArrayEqual(newValue, (<any>node.ctx)[bValue])
            ) {
                for (var j = 0; j < options.length; j++) {
                    options[j]!.selected = stringArrayContains(newValue, options[j]!.value);
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
}

function pushInitCallback(c: IBobrilCacheNode) {
    var cc = c.component;
    if (cc) {
        let fn = cc[postInitDom];
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
        let flags = getHookFlags(c);
        if (flags & hasPostInitDom) {
            updateCall.push(hookPostInitDom);
            updateInstance.push(c);
        }
        if (flags & hasUseEffect) {
            effectInstance.push(c);
        }
    } else {
        var sctx = c.ctxStyle;
        if (sctx) {
            const flags = (sctx as IBobrilCtxInternal).$hookFlags | 0;
            if (flags & hasPostInitDom) {
                updateCall.push(hookPostInitDom);
                updateInstance.push(c);
            }
            if (flags & hasUseEffect) {
                effectInstance.push(c);
            }
        }
    }
}

function getHookFlags(c: IBobrilCacheNode<any>) {
    let flags = (c.ctx! as IBobrilCtxInternal).$hookFlags | 0;
    if (c.ctxStyle != undefined) flags = (c.ctxStyle as IBobrilCtxInternal).$hookFlags | flags;
    return flags;
}

function pushUpdateCallback(c: IBobrilCacheNode) {
    var cc = c.component;
    if (cc) {
        let fn = cc[postUpdateDom];
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
        let flags = getHookFlags(c);
        if (flags & hasPostUpdateDom) {
            updateCall.push(hookPostUpdateDom);
            updateInstance.push(c);
        }
        fn = cc[postUpdateDomEverytime];
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
        if (flags & hasPostUpdateDomEverytime) {
            updateCall.push(hookPostUpdateDomEverytime);
            updateInstance.push(c);
        }
        if (flags & hasUseEffect) {
            effectInstance.push(c);
        }
    } else {
        var sctx = c.ctxStyle;
        if (sctx) {
            const flags = (sctx as IBobrilCtxInternal).$hookFlags | 0;
            if (flags & hasPostUpdateDom) {
                updateCall.push(hookPostUpdateDom);
                updateInstance.push(c);
            }
            if (flags & hasPostUpdateDomEverytime) {
                updateCall.push(hookPostUpdateDomEverytime);
                updateInstance.push(c);
            }
            if (flags & hasUseEffect) {
                effectInstance.push(c);
            }
        }
    }
}

function pushUpdateEverytimeCallback(c: IBobrilCacheNode) {
    var cc = c.component;
    if (cc) {
        let fn = cc[postUpdateDomEverytime];
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
        if (getHookFlags(c) & hasPostUpdateDomEverytime) {
            updateCall.push(hookPostUpdateDomEverytime);
            updateInstance.push(c);
        }
    } else {
        var sctx = c.ctxStyle;
        if (sctx) {
            const flags = (sctx as IBobrilCtxInternal).$hookFlags | 0;
            if (flags & hasPostUpdateDomEverytime) {
                updateCall.push(hookPostUpdateDomEverytime);
                updateInstance.push(c);
            }
        }
    }
}

function findCfg(parent: IBobrilCacheNode | undefined): any {
    var cfg: any;
    while (parent) {
        cfg = parent.cfg;
        if (cfg !== undefined) break;
        if (parent.ctx !== undefined && parent.component !== emptyObject) {
            cfg = parent.ctx.cfg;
            break;
        }
        parent = parent.parent;
    }
    return cfg;
}

function setRef(ref: RefType | undefined, value: IBobrilCacheNode) {
    if (ref === undefined) return;
    if ("current" in ref) {
        ref.current = value;
    } else if (isFunction(ref)) {
        ref(value);
    } else if (isArray(ref)) {
        const ctx = ref[0];
        let refs = ctx.refs;
        if (refs === undefined) {
            refs = newHashObj();
            ctx.refs = refs;
        }
        refs[ref[1]] = value;
    }
}

function unsetRef(ref: RefType | undefined, value: IBobrilCacheNode) {
    if (ref === undefined) return;
    if ("current" in ref) {
        if (ref.current == value) ref.current = undefined;
    } else if (isFunction(ref)) {
        ref(undefined, value);
    } else if (isArray(ref)) {
        const ctx = ref[0];
        let refs = ctx.refs;
        if (refs === undefined) {
            refs = newHashObj();
            ctx.refs = refs;
        }
        if (refs[ref[1]] == value) refs[ref[1]] = undefined;
    }
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

let createNodeStyle: (
    el: HTMLElement,
    newStyle: Record<string, string | number | undefined> | (() => IBobrilStyles) | undefined,
    newClass: string | undefined,
    c: IBobrilCacheNode,
    inSvg: boolean
) => void;

let updateNodeStyle: (
    el: HTMLElement,
    newStyle: Record<string, string | number | undefined> | (() => IBobrilStyles) | undefined,
    newClass: string | undefined,
    c: IBobrilCacheNode,
    inSvg: boolean
) => void;

let style: (node: IBobrilNode, ...styles: IBobrilStyles[]) => IBobrilNode;

export function internalSetCssInJsCallbacks(
    create: (
        el: HTMLElement,
        newStyle: Record<string, string | number | undefined> | (() => IBobrilStyles) | undefined,
        newClass: string | undefined,
        c: IBobrilCacheNode,
        inSvg: boolean
    ) => void,
    update: (
        el: HTMLElement,
        newStyle: Record<string, string | number | undefined> | (() => IBobrilStyles) | undefined,
        newClass: string | undefined,
        c: IBobrilCacheNode,
        inSvg: boolean
    ) => void,
    s: (node: IBobrilNode, ...styles: IBobrilStyles[]) => IBobrilNode
) {
    createNodeStyle = create;
    updateNodeStyle = update;
    style = s;
}

let currentCtx: IBobrilCtx | undefined;
let hookId = -1;

export function getCurrentCtx() {
    return currentCtx;
}

export function setCurrentCtx(ctx: IBobrilCtx | undefined) {
    currentCtx = ctx;
}

let measureFullComponentDuration = false;
let measureComponentMethods = false;

export function setMeasureConfiguration(conf: {
    measureFullComponentDuration: boolean;
    measureComponentMethods: boolean;
}) {
    measureFullComponentDuration = conf.measureFullComponentDuration;
    measureComponentMethods = conf.measureComponentMethods;
}

export function createNode(
    n: IBobrilNode,
    parentNode: IBobrilCacheNode | undefined,
    createInto: Element,
    createBefore: Node | null
): IBobrilCacheNode {
    var c = <IBobrilCacheNodeUnsafe>{
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
        orig: n,
    };
    var backupInSvg = inSvg;
    var backupInNotFocusable = inNotFocusable;
    var component = c.component;
    var el: Node | undefined;
    if (DEBUG && component && measureFullComponentDuration) {
        var componentStartMark = `create ${frameCounter} ${++visitedComponentCounter}`;
        window.performance.mark(componentStartMark);
    }
    setRef(c.ref, c);
    if (component) {
        var ctx: IBobrilCtxInternal;
        if (component.ctxClass) {
            ctx = new component.ctxClass(c.data || {}, c) as any;
            if (ctx.data === undefined) ctx.data = c.data || {};
            if (ctx.me === undefined) ctx.me = c;
        } else {
            ctx = new BobrilCtx(c.data || {}, c);
        }
        ctx.cfg = n.cfg === undefined ? findCfg(parentNode) : n.cfg;
        c.ctx = ctx;
        currentCtx = ctx;
        if (component.init) {
            if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} init-start`);
            component.init(ctx, c);
            if (DEBUG && measureComponentMethods)
                window.performance.measure(`${component.id} [init]`, `${component.id} init-start`);
        }
        if (beforeRenderCallback !== noop) beforeRenderCallback(n, RenderPhase.Create);
        if (component.render) {
            hookId = 0;
            if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} render-start`);
            component.render(ctx, c);
            if (DEBUG && measureComponentMethods)
                window.performance.measure(`${component.id} [render]`, `${component.id} render-start`);
            hookId = -1;
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
        if (DEBUG && component && measureFullComponentDuration)
            window.performance.measure(`${component.id} create`, componentStartMark!);
        return c;
    } else if (tag === "@") {
        createInto = c.data;
        createBefore = null;
        tag = undefined;
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
            domNode2node.set(el, c);
            createInto.insertBefore(el, createBefore);
        } else {
            createChildren(c, createInto, createBefore);
        }
        if (component) {
            if (component.postRender) {
                if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} postRender-start`);
                component.postRender(c.ctx!, c);
                if (DEBUG && measureComponentMethods)
                    window.performance.measure(`${component.id} [postRender]`, `${component.id} postRender-start`);
            }
            pushInitCallback(c);
        }
        if (DEBUG && component && measureFullComponentDuration)
            window.performance.measure(`${component.id} create`, componentStartMark!);
        return c;
    }
    if (tag === "/") {
        var htmlText = <string>children;
        if (htmlText === "") {
            // nothing needs to be created
        } else if (createBefore == undefined) {
            var before = createInto.lastChild as Node | null;
            (<HTMLElement>createInto).insertAdjacentHTML("beforeend", htmlText);
            c.element = <Node[]>[];
            if (before) {
                before = before.nextSibling;
            } else {
                before = createInto.firstChild;
            }
            while (before) {
                domNode2node.set(before, c);
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
                domNode2node.set(elPrev!, c);
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
                if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} postRender-start`);
                component.postRender(c.ctx!, c);
                if (DEBUG && measureComponentMethods)
                    window.performance.measure(`${component.id} [postRender]`, `${component.id} postRender-start`);
            }
            pushInitCallback(c);
        }
        if (DEBUG && component && measureFullComponentDuration)
            window.performance.measure(`${component.id} create`, componentStartMark!);
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
    domNode2node.set(el, c);
    c.element = el;
    createChildren(c, <Element>el, null);
    if (component) {
        if (component.postRender) {
            if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} postRender-start`);
            component.postRender(c.ctx!, c);
            if (DEBUG && measureComponentMethods)
                window.performance.measure(`${component.id} [postRender]`, `${component.id} postRender-start`);
        }
    }
    if (inNotFocusable && focusRootTop === c) inNotFocusable = false;
    if (inSvgForeignObject) inSvg = true;
    if (c.attrs || inNotFocusable) c.attrs = updateElement(c, <HTMLElement>el, c.attrs, {}, inNotFocusable);
    createNodeStyle(el as HTMLElement, c.style, enrichClassName(c, c.className), c, inSvg);
    inSvg = backupInSvg;
    inNotFocusable = backupInNotFocusable;
    pushInitCallback(c);
    if (DEBUG && component && measureFullComponentDuration)
        window.performance.measure(`${component.id} create`, componentStartMark!);
    return c;
}

export function applyDynamicStyle(factory: () => IBobrilStyles, c: IBobrilCacheNode): IBobrilNode {
    var ctxStyle = c.ctxStyle;
    var backupCtx = currentCtx;
    if (ctxStyle === undefined) {
        ctxStyle = new BobrilCtx(factory, c);
        (c as IBobrilCacheNodeUnsafe).ctxStyle = ctxStyle;
        currentCtx = ctxStyle;
        if (beforeRenderCallback !== noop) beforeRenderCallback(ctxStyle, RenderPhase.Create);
    } else {
        currentCtx = ctxStyle;
        if (beforeRenderCallback !== noop) beforeRenderCallback(ctxStyle, RenderPhase.Update);
    }
    hookId = 0;
    var s = factory();
    hookId = -1;
    currentCtx = backupCtx;
    return style({}, s);
}

export function destroyDynamicStyle(c: IBobrilCacheNode) {
    let ctxStyle = c.ctxStyle;
    if (ctxStyle !== undefined) {
        currentCtx = ctxStyle;
        if (beforeRenderCallback !== noop) beforeRenderCallback(ctxStyle, RenderPhase.Destroy);
        let disposables = ctxStyle.disposables;
        if (isArray(disposables)) {
            for (let i = disposables.length; i-- > 0; ) {
                let d = disposables[i]!;
                if (isFunction(d)) d(ctxStyle);
                else d.dispose();
            }
        }
        currentCtx = undefined;
    }
}

var keysInClassNames = false;

export function setKeysInClassNames(value: boolean) {
    keysInClassNames = value;
}

function enrichClassName(c: IBobrilCacheNode, n: string | undefined): string | undefined {
    if (!keysInClassNames) return n;
    var add = "";
    do {
        var k = c.key;
        if (k) add = " " + k + add;
        c = c.parent!;
    } while (c != undefined && c.element == undefined);
    if (n) return n + add;
    return add.substr(1);
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

function createChildren(c: IBobrilCacheNodeUnsafe, createInto: Element, createBefore: Node | null): void {
    var ch = c.children;
    if (isString(ch)) {
        createInto.textContent = ch;
        return;
    }
    let res = <IBobrilCacheNode[]>[];
    flattenVdomChildren(res, ch);
    for (let i = 0; i < res.length; i++) {
        res[i] = createNode(res[i]!, c, createInto, createBefore);
    }
    c.children = res;
}

function destroyNode(c: IBobrilCacheNode) {
    unsetRef(c.ref, c);
    let ch = c.children;
    if (isArray(ch)) {
        for (let i = 0, l = ch.length; i < l; i++) {
            destroyNode(ch[i]!);
        }
    }
    let component = c.component;
    if (component) {
        let ctx = c.ctx!;
        currentCtx = ctx;
        if (beforeRenderCallback !== noop) beforeRenderCallback(c, RenderPhase.Destroy);
        if (component.destroy) component.destroy(ctx, c, <HTMLElement>c.element);
        let disposables = ctx.disposables;
        if (isArray(disposables)) {
            for (let i = disposables.length; i-- > 0; ) {
                let d = disposables[i]!;
                if (isFunction(d)) d(ctx);
                else d.dispose();
            }
        }
        currentCtx = undefined;
    }
    destroyDynamicStyle(c);
    if (c.tag === "@") {
        removeNodeRecursive(c);
    }
}

export function addDisposable(ctx: IBobrilCtx, disposable: IDisposableLike) {
    let disposables = ctx.disposables;
    if (disposables == undefined) {
        disposables = [];
        ctx.disposables = disposables;
    }
    disposables.push(disposable);
}

export function isDisposable(val: any): val is IDisposable {
    return isObject(val) && val["dispose"];
}

function removeNodeRecursive(c: IBobrilCacheNode) {
    var el = c.element;
    if (isArray(el)) {
        var pa = (<Node[]>el)[0]!.parentNode;
        if (pa) {
            for (let i = 0; i < (<Node[]>el).length; i++) {
                pa.removeChild((<Node[]>el)[i]!);
            }
        }
    } else if (el != null) {
        let p = (<Node>el).parentNode;
        if (p) p.removeChild(<Node>el);
    } else {
        var ch = c.children;
        if (isArray(ch)) {
            for (var i = 0, l = (<IBobrilCacheNode[]>ch).length; i < l; i++) {
                removeNodeRecursive((<IBobrilCacheNode[]>ch)[i]!);
            }
        }
    }
}

function removeNode(c: IBobrilCacheNode) {
    destroyNode(c);
    removeNodeRecursive(c);
}

var roots: IBobrilRoots = newHashObj();

var domNode2node: WeakMap<Node, IBobrilCacheNode> = new WeakMap();

export function vdomPath(n: Node | null | undefined): IBobrilCacheNode[] {
    var res: IBobrilCacheNode[] = [];
    while (n != undefined) {
        var bn = domNode2node.get(n);
        if (bn !== undefined) {
            do {
                res.push(bn);
                bn = bn.parent;
            } while (bn !== undefined);
            res.reverse();
            return res;
        }
        n = n.parentNode;
    }
    return res;
}

// PureFuncs: deref, getDomNode
export function deref(n: Node | null | undefined): IBobrilCacheNode | undefined {
    while (n != undefined) {
        var bn = domNode2node.get(n);
        if (bn !== undefined) {
            return bn;
        }
        n = n.parentNode;
    }
    return undefined;
}

function finishUpdateNode(n: IBobrilNode, c: IBobrilCacheNodeUnsafe, component: IBobrilComponent | null | undefined) {
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
    if (DEBUG && component && measureFullComponentDuration) {
        var componentStartMark = `update ${frameCounter} ${++visitedComponentCounter}`;
        window.performance.mark(componentStartMark);
    }

    if (component != null && ctx != null) {
        let locallyInvalidated = false;
        if ((<any>ctx)[ctxInvalidated] >= frameCounter) {
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
                if (!ignoringShouldChange && !locallyInvalidated) {
                    if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} shouldChange-start`);
                    const shouldChange = component.shouldChange(ctx, n, c);
                    if (DEBUG && measureComponentMethods)
                        window.performance.measure(
                            `${component.id} [shouldChange]`,
                            `${component.id} shouldChange-start`
                        );
                    if (!shouldChange) {
                        finishUpdateNodeWithoutChange(c, createInto, createBefore);
                        if (DEBUG && measureFullComponentDuration)
                            window.performance.measure(`${component.id} update`, componentStartMark!);
                        return c;
                    }
                }
            (<any>ctx).data = n.data || {};
            (c as IBobrilCacheNodeUnsafe).component = component;
            if (beforeRenderCallback !== noop)
                beforeRenderCallback(n, inSelectedUpdate ? RenderPhase.LocalUpdate : RenderPhase.Update);
            if (component.render) {
                (c as IBobrilCacheNodeUnsafe).orig = n;
                n = assign({}, n); // need to clone me because it should not be modified for next updates
                (c as IBobrilCacheNodeUnsafe).cfg = undefined;
                if (n.cfg !== undefined) n.cfg = undefined;
                hookId = 0;
                if (DEBUG && measureComponentMethods) window.performance.mark(`${component.id} render-start`);
                component.render(ctx, n, c);
                if (DEBUG && measureComponentMethods)
                    window.performance.measure(`${component.id} [render]`, `${component.id} render-start`);
                hookId = -1;
                if (n.cfg !== undefined) {
                    if (c.cfg === undefined) (c as IBobrilCacheNodeUnsafe).cfg = n.cfg;
                    else assign(c.cfg, n.cfg);
                }
            }
            currentCtx = undefined;
        }
    } else {
        // In case there is no component and source is same reference it is considered not changed
        if (c.orig === n && !ignoringShouldChange) {
            finishUpdateNodeWithoutChange(c, createInto, createBefore);
            if (DEBUG && component && measureFullComponentDuration)
                window.performance.measure(`${component.id} update`, componentStartMark!);
            return c;
        }
        (c as IBobrilCacheNodeUnsafe).orig = n;
        if (DEBUG) Object.freeze(n);
    }
    var newChildren = n.children;
    var cachedChildren = c.children;
    var tag = n.tag;
    if (tag === "-") {
        finishUpdateNodeWithoutChange(c, createInto, createBefore);
        if (DEBUG && component && measureFullComponentDuration)
            window.performance.measure(`${component.id} update`, componentStartMark!);
        return c;
    }
    const backupInSvg = inSvg;
    const backupInNotFocusable = inNotFocusable;
    if (isNumber(newChildren)) {
        newChildren = "" + newChildren;
    }
    if (
        bigChange ||
        (component != undefined && ctx == undefined) ||
        (component == undefined && ctx != undefined && ctx.me.component !== emptyObject)
    ) {
        // it is big change of component.id or old one was not even component or old one was component and new is not anymore => recreate
    } else if (tag === "/") {
        if (c.tag === "/" && cachedChildren === newChildren) {
            finishUpdateNode(n, c, component);
            if (DEBUG && component && measureFullComponentDuration)
                window.performance.measure(`${component.id} update`, componentStartMark!);
            return c;
        }
    } else if (tag === c.tag) {
        if (tag === "@") {
            if (n.data !== c.data) {
                var r: IBobrilCacheNode = createNode(n, c.parent, n.data, null);
                removeNode(c);
                if (DEBUG && component && measureFullComponentDuration)
                    window.performance.measure(`${component.id} update`, componentStartMark!);
                return r;
            }
            createInto = n.data;
            createBefore = getLastDomNode(c);
            if (createBefore != null) createBefore = createBefore.nextSibling;
            tag = undefined;
        }
        if (tag === undefined) {
            if (isString(newChildren) && isString(cachedChildren)) {
                if (newChildren !== cachedChildren) {
                    var el = <Element>c.element;
                    el.textContent = newChildren;
                    (c as IBobrilCacheNodeUnsafe).children = newChildren;
                }
            } else {
                if (inNotFocusable && focusRootTop === c) inNotFocusable = false;
                if (deepness <= 0) {
                    if (isArray(cachedChildren))
                        selectedUpdate(<IBobrilCacheNode[]>c.children, createInto, createBefore);
                } else {
                    (c as IBobrilCacheNodeUnsafe).children = updateChildren(
                        createInto,
                        newChildren,
                        cachedChildren,
                        c,
                        createBefore,
                        deepness - 1
                    );
                }
                inSvg = backupInSvg;
                inNotFocusable = backupInNotFocusable;
            }
            finishUpdateNode(n, c, component);
            if (DEBUG && component && measureFullComponentDuration)
                window.performance.measure(`${component.id} update`, componentStartMark!);
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
                    if (isArray(cachedChildren)) selectedUpdate(<IBobrilCacheNode[]>c.children, el, null);
                } else {
                    cachedChildren = updateChildren(el, newChildren, cachedChildren, c, null, deepness - 1);
                }
            }
            (c as IBobrilCacheNodeUnsafe).children = cachedChildren;
            if (inSvgForeignObject) inSvg = true;
            finishUpdateNode(n, c, component);
            if (c.attrs || n.attrs || inNotFocusable)
                (c as IBobrilCacheNodeUnsafe).attrs = updateElement(c, el, n.attrs, c.attrs || {}, inNotFocusable);
            updateNodeStyle(el as HTMLElement, n.style, enrichClassName(c, n.className), c, inSvg);
            inSvg = backupInSvg;
            inNotFocusable = backupInNotFocusable;
            if (DEBUG && component && measureFullComponentDuration)
                window.performance.measure(`${component.id} update`, componentStartMark!);
            return c;
        }
    }
    var parEl = c.element;
    if (isArray(parEl)) parEl = parEl[0];
    if (parEl == undefined) parEl = createInto;
    else parEl = <Element>parEl.parentNode;
    var r: IBobrilCacheNode = createNode(n, c.parent, <Element>parEl, getDomNode(c));
    removeNode(c);
    if (DEBUG && component && measureFullComponentDuration)
        window.performance.measure(`${component.id} update`, componentStartMark!);
    return r;
}

export function getDomNode(c: IBobrilCacheNode | undefined): Node | null {
    if (c === undefined) return null;
    var el: Node | Node[] | null | undefined = c.element;
    if (el != null) {
        if (isArray(el)) return el[0]!;
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

export function getLastDomNode(c: IBobrilCacheNode | undefined): Node | null {
    if (c === undefined) return null;
    var el: Node | Node[] | null | undefined = c.element;
    if (el != null) {
        if (isArray(el)) return el[el.length - 1]!;
        return el;
    }
    var ch = c.children;
    if (!isArray(ch)) return null;
    for (var i = ch.length; i-- > 0; ) {
        el = getLastDomNode(ch[i]);
        if (el) return el;
    }
    return null;
}

function findNextNode(a: IBobrilCacheNode[], i: number, len: number, def: Node | null): Node | null {
    while (++i < len) {
        var ai = a[i];
        if (ai == undefined) continue;
        var n = getDomNode(ai);
        if (n != null) return n;
    }
    return def;
}

export function callPostCallbacks() {
    var count = updateInstance.length;
    for (var i = 0; i < count; i++) {
        var n = updateInstance[i]!;
        currentCtx = n.ctx;
        if (currentCtx) {
            if (DEBUG && measureComponentMethods) window.performance.mark(`${n.component.id} post-start`);
            updateCall[i]!.call(n.component, currentCtx, n, n.element);
            if (DEBUG && measureComponentMethods)
                window.performance.measure(`${n.component.id} [post*]`, `${n.component.id} post-start`);
        }
        currentCtx = n.ctxStyle;
        if (currentCtx) {
            if (DEBUG && measureComponentMethods) window.performance.mark(`style post-start`);
            updateCall[i]!.call(n.component, currentCtx, n, n.element);
            if (DEBUG && measureComponentMethods) window.performance.measure(`style [post*]`, `style post-start`);
        }
    }
    currentCtx = undefined;
    updateCall = [];
    updateInstance = [];
}

export function callEffects() {
    var count = effectInstance.length;
    for (var i = 0; i < count; i++) {
        var n = effectInstance[i]!;
        currentCtx = n.ctx;
        if (currentCtx) {
            if (DEBUG && measureComponentMethods) window.performance.mark(`${n.component.id} effect-start`);
            const hooks = (currentCtx as IBobrilCtxInternal).$hooks!;
            const len = hooks.length;
            for (let i = 0; i < len; i++) {
                const hook = hooks[i];
                const fn = hook.useEffect;
                if (fn !== undefined) {
                    fn.call(hook, currentCtx);
                }
            }
            if (DEBUG && measureComponentMethods)
                window.performance.measure(`${n.component.id} [effect*]`, `${n.component.id} effect-start`);
        }
        currentCtx = n.ctxStyle;
        if (currentCtx) {
            if (DEBUG && measureComponentMethods) window.performance.mark(`style effect-start`);
            const hooks = (currentCtx as IBobrilCtxInternal).$hooks!;
            const len = hooks.length;
            for (let i = 0; i < len; i++) {
                const hook = hooks[i];
                const fn = hook.useEffect;
                if (fn !== undefined) {
                    fn.call(hook, currentCtx);
                }
            }
            if (DEBUG && measureComponentMethods) window.performance.measure(`style [effect*]`, `style effect-start`);
        }
    }
    currentCtx = undefined;
    effectInstance = [];
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
        cachedChildren[cachedIndex]!,
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
                element.insertBefore(el[i]!, before);
            }
        } else element.insertBefore(el, before);
        return;
    }
    var ch = c.children;
    if (!isArray(ch)) return;
    for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
        reorderInUpdateChildrenRec((<IBobrilCacheNode[]>ch)[i]!, element, before);
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
    var cur = cachedChildren[cachedIndex]!;
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
    var cur = cachedChildren[cachedIndex]!;
    var what = getDomNode(cur);
    if (what != null && what !== before) {
        reorderInUpdateChildrenRec(cur, element, before);
    }
    cachedChildren[cachedIndex] = updateNode(newNode, cur, element, before, deepness);
}

function recursiveFlattenVdomChildren(res: IBobrilNode[], children: IBobrilChildren) {
    if (children == undefined) return;
    if (isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            recursiveFlattenVdomChildren(res, children[i]);
        }
    } else {
        let item = normalizeNode(children);
        if (item !== undefined) res.push(item);
    }
}

function flattenVdomChildren(res: IBobrilNode[], children: IBobrilChildren) {
    recursiveFlattenVdomChildren(res, children);
    if (DEBUG) {
        var set = new Set();
        for (let i = 0; i < res.length; i++) {
            const key = res[i]!.key;
            if (key == undefined) continue;
            if (set.has(key)) {
                console.warn("Duplicate Bobril node key " + key);
            }
            set.add(key);
        }
    }
}

export function updateChildren(
    element: Element,
    newChildren: IBobrilChildren,
    cachedChildren: IBobrilCacheChildren,
    parentNode: IBobrilCacheNode | undefined,
    createBefore: Node | null,
    deepness: number
): IBobrilCacheNode[] {
    if (cachedChildren == undefined) cachedChildren = [];
    if (!isArray(cachedChildren)) {
        if (element.firstChild) element.removeChild(element.firstChild);
        cachedChildren = <any>[];
    }
    let newCh = <IBobrilNode[]>[];
    flattenVdomChildren(newCh, newChildren);
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
        if (newChildren[newIndex]!.key === cachedChildren[cachedIndex]!.key) {
            updateNodeInUpdateChildren(
                newChildren[newIndex]!,
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
            if (newChildren[newEnd - 1]!.key === cachedChildren[cachedEnd - 1]!.key) {
                newEnd--;
                cachedEnd--;
                updateNodeInUpdateChildren(
                    newChildren[newEnd]!,
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
            if (
                newChildren[newIndex]!.key === cachedChildren[cachedEnd - 1]!.key &&
                newChildren[newEnd - 1]!.key === cachedChildren[cachedIndex]!.key
            ) {
                var temp = cachedChildren[cachedIndex]!;
                cachedChildren[cachedIndex] = cachedChildren[cachedEnd - 1]!;
                cachedChildren[cachedEnd - 1] = temp;
                reorderAndUpdateNodeInUpdateChildren(
                    newChildren[newIndex]!,
                    cachedChildren,
                    cachedIndex,
                    cachedLength,
                    createBefore,
                    element,
                    deepness
                );
                newIndex++;
                cachedIndex++;
                newEnd--;
                cachedEnd--;
                reorderAndUpdateNodeInUpdateChildren(
                    newChildren[newEnd]!,
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
                    newChildren[newIndex]!,
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
            removeNode(cachedChildren[cachedEnd]!);
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
        node = cachedChildren[cachedIndex]!;
        key = node.key;
        if (key != null) {
            assert(!(key in <any>cachedKeys));
            cachedKeys[key] = cachedIndex;
        } else deltaKeyless--;
    }
    var keyLess = -deltaKeyless - deltaKeyless;
    for (; newIndex < newEnd; newIndex++) {
        node = newChildren[newIndex]!;
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
        cachedKey = cachedChildren[cachedIndex]!.key;
        if (cachedKey == undefined) {
            cachedIndex++;
            continue;
        }
        key = newChildren[newIndex]!.key;
        if (key == undefined) {
            newIndex++;
            while (newIndex < newEnd) {
                key = newChildren[newIndex]!.key;
                if (key != undefined) break;
                newIndex++;
            }
            if (key == undefined) break;
        }
        var akPos = cachedKeys[key];
        if (akPos === undefined) {
            // New key
            cachedChildren.splice(
                cachedIndex,
                0,
                createNode(
                    newChildren[newIndex]!,
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
            removeNode(cachedChildren[cachedIndex]!);
            cachedChildren.splice(cachedIndex, 1);
            delta--;
            cachedEnd--;
            cachedLength--;
            continue;
        }
        if (cachedIndex === akPos + delta) {
            // In-place update
            updateNodeInUpdateChildren(
                newChildren[newIndex]!,
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
            cachedChildren.splice(cachedIndex, 0, cachedChildren[akPos + delta]!);
            delta++;
            cachedChildren[akPos + delta] = null!;
            reorderAndUpdateNodeInUpdateChildren(
                newChildren[newIndex]!,
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
        if (cachedChildren[cachedIndex]!.key != null) {
            // this key is only in old
            removeNode(cachedChildren[cachedIndex]!);
            cachedChildren.splice(cachedIndex, 1);
            cachedEnd--;
            cachedLength--;
            continue;
        }
        cachedIndex++;
    }
    // add new keyed nodes
    while (newIndex < newEnd) {
        key = newChildren[newIndex]!.key;
        if (key != null) {
            cachedChildren.splice(
                cachedIndex,
                0,
                createNode(
                    newChildren[newIndex]!,
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
            cachedKey = cachedChildren[cachedIndex]!.key;
            if (cachedKey != null) {
                cachedIndex++;
                continue;
            }
        }
        key = newChildren[newIndex]!.key;
        if (newIndex < cachedEnd && key === cachedChildren[newIndex]!.key) {
            if (key != null) {
                newIndex++;
                continue;
            }
            updateNodeInUpdateChildren(
                newChildren[newIndex]!,
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
                    removeNode(cachedChildren[cachedIndex]!);
                    cachedChildren.splice(cachedIndex, 1);
                    cachedEnd--;
                    cachedLength--;
                    deltaKeyless++;
                    assert(cachedIndex !== cachedEnd, "there still need to exist key node");
                    if (cachedChildren[cachedIndex]!.key != null) break;
                }
                continue;
            }
            while (cachedChildren[cachedIndex]!.key == undefined) cachedIndex++;
            assert(key === cachedChildren[cachedIndex]!.key);
            cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]!);
            cachedChildren.splice(cachedIndex + 1, 1);
            reorderInUpdateChildren(cachedChildren, newIndex, cachedLength, createBefore, element);
            // just moving keyed node it was already updated before
            newIndex++;
            cachedIndex = newIndex;
            continue;
        }
        if (cachedIndex < cachedEnd) {
            cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]!);
            cachedChildren.splice(cachedIndex + 1, 1);
            reorderAndUpdateNodeInUpdateChildren(
                newChildren[newIndex]!,
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
                    newChildren[newIndex]!,
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
        removeNode(cachedChildren[cachedEnd]!);
        cachedChildren.splice(cachedEnd, 1);
    }
    return cachedChildren;
}

var hasNativeRaf = false;
var nativeRaf = window.requestAnimationFrame;
if (nativeRaf) {
    nativeRaf((param) => {
        if (param === +param) hasNativeRaf = true;
    });
}

const setTimeout = window.setTimeout;

export const now = Date.now || (() => new Date().getTime());
var startTime = now();
var lastTickTime = 0;

function requestAnimationFrame(callback: (time: number) => void) {
    if (hasNativeRaf) {
        nativeRaf(callback);
    } else {
        var delay = 50 / 3 + lastTickTime - now();
        if (delay < 0) delay = 0;
        setTimeout(() => {
            lastTickTime = now();
            callback(lastTickTime - startTime);
        }, delay);
    }
}

var ctxInvalidated = "$invalidated";
var ctxDeepness = "$deepness";
var fullRecreateRequested = true;
var scheduled = false;
var isInvalidated = true;
let initializing = true;
var uptimeMs = 0;
var frameCounter = 0;
var lastFrameDurationMs = 0;
var renderFrameBegin = 0;

var regEvents: {
    [name: string]: Array<(ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean>;
} = newHashObj();
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
    if (registryEvents == undefined) registryEvents = newHashObj();
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
            if (events[i]!(ev, target, node)) return true;
        }
    return false;
}

var isPassiveEventHandlerSupported = false;
try {
    var options = Object.defineProperty({}, "passive", {
        get: function () {
            isPassiveEventHandlerSupported = true;
        },
    });
    window.addEventListener("blur", options as any, options);
    window.removeEventListener("blur", options as any, options);
} catch (err) {
    isPassiveEventHandlerSupported = false;
}

var listeningEventDeepness = 0;

function addListener(el: EventTarget, name: string, nonbody: boolean) {
    if (name[0] == "!") return;
    var capture = name[0] == "^";
    var eventName = name;
    if (name[0] == "@") {
        if (nonbody) return;
        eventName = name.slice(1);
        el = document;
    }
    if (capture) {
        if (nonbody) return;
        eventName = name.slice(1);
    }
    function enhanceEvent(ev: Event) {
        var t = ev.target || el;
        var n = deref(<any>t);
        listeningEventDeepness++;
        emitEvent(name, ev, <Node>t, n);
        listeningEventDeepness--;
        if (listeningEventDeepness == 0 && deferSyncUpdateRequested) syncUpdate();
    }
    if (!nonbody) {
        if ("on" + eventName in window) el = window;
    }
    el.addEventListener(
        eventName,
        enhanceEvent,
        isPassiveEventHandlerSupported ? { capture: capture, passive: false } : capture
    );
}

function initEvents() {
    if (registryEvents === undefined) return;
    var eventNames = Object.keys(registryEvents);
    for (var j = 0; j < eventNames.length; j++) {
        var eventName = eventNames[j]!;
        var arr = registryEvents[eventName]!;
        arr = arr.sort((a, b) => a.priority - b.priority);
        regEvents[eventName] = arr.map((v) => v.callback);
    }
    registryEvents = undefined;
    var body = document.body;
    for (var i = 0; i < eventNames.length; i++) {
        addListener(body, eventNames[i]!, false);
    }
}

/// Use this function when combining 3rd party library which listen events like click and stop bubbling, but you want to use Bobril in its children
export function addEventListeners(el: Node) {
    var eventNames = Object.keys(regEvents);
    for (var i = 0; i < eventNames.length; i++) {
        addListener(el, eventNames[i]!, true);
    }
}

function selectedUpdate(cache: IBobrilCacheNode[], element: Element, createBefore: Node | null) {
    var len = cache.length;
    for (var i = 0; i < len; i++) {
        var node = cache[i]!;
        var ctx = node.ctx;
        if (ctx != null && (<any>ctx)[ctxInvalidated] >= frameCounter) {
            cache[i] = updateNode(
                node.orig,
                node,
                element,
                findNextNode(cache, i, len, createBefore),
                (<any>ctx)[ctxDeepness],
                true
            );
        } else {
            ctx = node.ctxStyle;
            if (ctx != null && (<any>ctx)[ctxInvalidated] >= frameCounter) {
                updateNodeStyle(node.element as HTMLElement, ctx.data, undefined, node, inSvg);
            }
            if (isArray(node.children)) {
                var backupInSvg = inSvg;
                var backupInNotFocusable = inNotFocusable;
                if (inNotFocusable && focusRootTop === node) inNotFocusable = false;
                if (node.tag === "svg") inSvg = true;
                else if (inSvg && node.tag === "foreignObject") inSvg = false;
                var thisElement = node.element;
                if (thisElement != undefined) {
                    selectedUpdate(node.children, <Element>thisElement, null);
                } else {
                    selectedUpdate(node.children, element, findNextNode(cache, i, len, createBefore));
                }
                pushUpdateEverytimeCallback(node);
                inSvg = backupInSvg;
                inNotFocusable = backupInNotFocusable;
            }
        }
    }
}

function isLogicalParent(
    parent: IBobrilCacheNode,
    child: IBobrilCacheNode | null | undefined,
    rootIds: string[]
): boolean {
    while (child != null) {
        if (parent === child) return true;
        let p = child.parent;
        if (p == undefined) {
            for (var i = 0; i < rootIds.length; i++) {
                var r = roots[rootIds[i]!];
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
    },
});

let visitedComponentCounter = 0;

function internalUpdate(time: number) {
    visitedComponentCounter = 0;
    isInvalidated = false;
    renderFrameBegin = now();
    initEvents();
    reallyBeforeFrameCallback();
    frameCounter++;
    ignoringShouldChange = nextIgnoreShouldChange;
    nextIgnoreShouldChange = false;
    uptimeMs = time;
    beforeFrameCallback();
    var fullRefresh = false;
    if (fullRecreateRequested) {
        fullRecreateRequested = false;
        fullRefresh = true;
    }
    listeningEventDeepness++;
    if (DEBUG && (measureComponentMethods || measureFullComponentDuration)) {
        var renderStartMark = `render ${frameCounter}`;
        window.performance.mark(renderStartMark);
    }
    for (let repeat = 0; repeat < 2; repeat++) {
        focusRootTop = focusRootStack.length === 0 ? null : focusRootStack[focusRootStack.length - 1]!;
        inNotFocusable = false;
        rootIds = Object.keys(roots);
        for (var i = 0; i < rootIds.length; i++) {
            var r = roots[rootIds[i]!];
            if (!r) continue;
            var rc = r.n;
            var insertBefore: Node | null = null;
            for (var j = i + 1; j < rootIds.length; j++) {
                let rafter = roots[rootIds[j]!];
                if (rafter === undefined) continue;
                insertBefore = getDomNode(rafter.n);
                if (insertBefore != null) break;
            }
            if (focusRootTop) inNotFocusable = !isLogicalParent(focusRootTop, r.p, rootIds);
            if (r.e === undefined) r.e = document.body;
            if (rc) {
                if (fullRefresh || (rc.ctx as any)[ctxInvalidated] >= frameCounter) {
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
        if (!deferSyncUpdateRequested) break;
    }
    callEffects();
    deferSyncUpdateRequested = false;
    listeningEventDeepness--;
    let r0 = roots["0"];
    afterFrameCallback(r0 ? r0.c : null);
    if (DEBUG && (measureComponentMethods || measureFullComponentDuration))
        window.performance.measure("render", renderStartMark!);
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
    isInvalidated = true;
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
    var root = roots[id]!;
    assert(root != null);
    if (factory != null) root.f = factory;
    let rootNode = root.n;
    if (rootNode == undefined) return;
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

export function init(factory: () => IBobrilChildren, element?: HTMLElement) {
    assert(rootIds == undefined, "init should not be called from render");
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

let currentCtxWithEvents: IBobrilCtx | undefined;

export function callWithCurrentCtxWithEvents<T>(call: () => T, ctx: IBobrilCtx): T {
    var backup = currentCtxWithEvents;
    currentCtxWithEvents = ctx;
    try {
        return call();
    } finally {
        currentCtxWithEvents = backup;
    }
}

export type AllEvents = IBobrilEvents | IBubblingAndBroadcastEvents | ICapturableEvents;
export type EventNames = keyof ICapturableEvents;
export type EventParam<T extends EventNames> = T extends keyof ICapturableEvents
    ? NonNullable<ICapturableEvents[T]> extends (p: infer P) => any
        ? P
        : any
    : any;

export function bubble<T extends EventNames>(
    node: IBobrilCacheNode | null | undefined,
    name: T,
    param?: Omit<EventParam<T>, "target"> | { target?: IBobrilCacheNode }
): IBobrilCtx | undefined {
    if (param == undefined) {
        param = { target: node! };
    } else if (isObject(param) && (param as any).target == undefined) {
        (param as any).target = node;
    }
    let res: IBobrilCtx | undefined = captureBroadcast(name, param!);
    if (res != undefined) return res;
    const prevCtx = currentCtxWithEvents;
    while (node) {
        var c = node.component;
        var ctx = node.ctxStyle;
        if (ctx) {
            currentCtxWithEvents = ctx;
            if ((((ctx as IBobrilCtxInternal).$hookFlags | 0) & hasEvents) === hasEvents) {
                var hooks = (ctx as IBobrilCtxInternal).$hooks!;
                for (var i = 0, l = hooks.length; i < l; i++) {
                    var h = hooks[i];
                    if (h instanceof EventsHook) {
                        var m = (h.events as any)[name];
                        if (m !== undefined) {
                            const eventResult = +m.call(ctx, param) as EventResult;
                            if (eventResult == EventResult.HandledPreventDefault) {
                                currentCtxWithEvents = prevCtx;
                                return ctx;
                            }
                            if (eventResult == EventResult.HandledButRunDefault) {
                                currentCtxWithEvents = prevCtx;
                                return undefined;
                            }
                            if (eventResult == EventResult.NotHandledPreventDefault) {
                                res = ctx;
                            }
                        }
                    }
                }
            }
        }
        if (c) {
            ctx = node.ctx!;
            currentCtxWithEvents = ctx;
            if ((((ctx as IBobrilCtxInternal).$hookFlags | 0) & hasEvents) === hasEvents) {
                var hooks = (ctx as IBobrilCtxInternal).$hooks!;
                for (var i = 0, l = hooks.length; i < l; i++) {
                    var h = hooks[i];
                    if (h instanceof EventsHook) {
                        var m = (h.events as any)[name];
                        if (m !== undefined) {
                            const eventResult = +m.call(ctx, param) as EventResult;
                            if (eventResult == EventResult.HandledPreventDefault) {
                                currentCtxWithEvents = prevCtx;
                                return ctx;
                            }
                            if (eventResult == EventResult.HandledButRunDefault) {
                                currentCtxWithEvents = prevCtx;
                                return undefined;
                            }
                            if (eventResult == EventResult.NotHandledPreventDefault) {
                                res = ctx;
                            }
                        }
                    }
                }
            }
            var m = (<any>c)[name];
            if (m) {
                const eventResult = +m.call(c, ctx, param) as EventResult;
                if (eventResult == EventResult.HandledPreventDefault) {
                    currentCtxWithEvents = prevCtx;
                    return ctx;
                }
                if (eventResult == EventResult.HandledButRunDefault) {
                    currentCtxWithEvents = prevCtx;
                    return undefined;
                }
                if (eventResult == EventResult.NotHandledPreventDefault) {
                    res = ctx;
                }
            }
            m = (<any>c).handleGenericEvent;
            if (m) {
                const eventResult = +m.call(c, ctx, name, param) as EventResult;
                if (eventResult == EventResult.HandledPreventDefault) {
                    currentCtxWithEvents = prevCtx;
                    return ctx;
                }
                if (eventResult == EventResult.HandledButRunDefault) {
                    currentCtxWithEvents = prevCtx;
                    return undefined;
                }
                if (eventResult == EventResult.NotHandledPreventDefault) {
                    res = ctx;
                }
            }
            m = (<any>c).shouldStopBubble;
            if (m) {
                if (m.call(c, ctx, name, param)) break;
            }
        }
        node = node.parent;
    }
    currentCtxWithEvents = prevCtx;
    return res;
}

function broadcastEventToNode(
    node: IBobrilCacheNode | null | undefined,
    name: string,
    param: any
): IBobrilCtx | undefined {
    if (!node) return undefined;
    let res: IBobrilCtx | undefined;
    var c = node.component;
    if (c) {
        var ctx = node.ctx!;
        var prevCtx = currentCtxWithEvents;
        currentCtxWithEvents = ctx;
        if ((((ctx as IBobrilCtxInternal).$hookFlags | 0) & hasEvents) === hasEvents) {
            var hooks = (ctx as IBobrilCtxInternal).$hooks!;
            for (var i = 0, l = hooks.length; i < l; i++) {
                var h = hooks[i];
                if (h instanceof EventsHook) {
                    var m = (h.events as any)[name];
                    if (m !== undefined) {
                        const eventResult = +m.call(ctx, param) as EventResult;
                        if (eventResult == EventResult.HandledPreventDefault) {
                            currentCtxWithEvents = prevCtx;
                            return ctx;
                        }
                        if (eventResult == EventResult.HandledButRunDefault) {
                            currentCtxWithEvents = prevCtx;
                            return undefined;
                        }
                        if (eventResult == EventResult.NotHandledPreventDefault) {
                            res = ctx;
                        }
                    }
                }
            }
        }
        var m = (<any>c)[name];
        if (m) {
            const eventResult = +m.call(c, ctx, param) as EventResult;
            if (eventResult == EventResult.HandledPreventDefault) {
                currentCtxWithEvents = prevCtx;
                return ctx;
            }
            if (eventResult == EventResult.HandledButRunDefault) {
                currentCtxWithEvents = prevCtx;
                return undefined;
            }
            if (eventResult == EventResult.NotHandledPreventDefault) {
                res = ctx;
            }
        }
        m = c.shouldStopBroadcast;
        if (m) {
            if (m.call(c, ctx, name, param)) {
                currentCtxWithEvents = prevCtx;
                return res;
            }
        }
        currentCtxWithEvents = prevCtx;
    }
    var ch = node.children;
    if (isArray(ch)) {
        for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
            var res2 = broadcastEventToNode((<IBobrilCacheNode[]>ch)[i], name, param);
            if (res2 != undefined) return res2;
        }
    }
    return res;
}

function broadcastCapturedEventToNode(
    node: IBobrilCacheNode | null | undefined,
    name: string,
    param: any
): IBobrilCtx | undefined {
    if (!node) return undefined;
    let res: IBobrilCtx | undefined;
    var c = node.component;
    var ctx = node.ctxStyle;
    if (ctx) {
        if (((ctx as IBobrilCtxInternal).$hookFlags & hasCaptureEvents) === hasCaptureEvents) {
            var hooks = (ctx as IBobrilCtxInternal).$hooks!;
            var prevCtx = currentCtxWithEvents;
            currentCtxWithEvents = ctx;
            for (var i = 0, l = hooks.length; i < l; i++) {
                var h = hooks[i];
                if (h instanceof CaptureEventsHook) {
                    var m = (h.events as any)[name];
                    if (m !== undefined) {
                        const eventResult = +m.call(ctx, param) as EventResult;
                        if (eventResult == EventResult.HandledPreventDefault) {
                            currentCtxWithEvents = prevCtx;
                            return ctx;
                        }
                        if (eventResult == EventResult.HandledButRunDefault) {
                            currentCtxWithEvents = prevCtx;
                            return undefined;
                        }
                        if (eventResult == EventResult.NotHandledPreventDefault) {
                            res = ctx;
                        }
                    }
                }
            }
            currentCtxWithEvents = prevCtx;
        }
    }
    if (c) {
        ctx = node.ctx!;
        if (((ctx as IBobrilCtxInternal).$hookFlags & hasCaptureEvents) === hasCaptureEvents) {
            var hooks = (ctx as IBobrilCtxInternal).$hooks!;
            var prevCtx = currentCtxWithEvents;
            currentCtxWithEvents = ctx;
            for (var i = 0, l = hooks.length; i < l; i++) {
                var h = hooks[i];
                if (h instanceof CaptureEventsHook) {
                    var m = (h.events as any)[name];
                    if (m !== undefined) {
                        const eventResult = +m.call(ctx, param) as EventResult;
                        if (eventResult == EventResult.HandledPreventDefault) {
                            currentCtxWithEvents = prevCtx;
                            return ctx;
                        }
                        if (eventResult == EventResult.HandledButRunDefault) {
                            currentCtxWithEvents = prevCtx;
                            return undefined;
                        }
                        if (eventResult == EventResult.NotHandledPreventDefault) {
                            res = ctx;
                        }
                    }
                }
            }
            currentCtxWithEvents = prevCtx;
        }
    }
    var ch = node.children;
    if (isArray(ch)) {
        for (var i = 0, l = (<IBobrilCacheNode[]>ch).length; i < l; i++) {
            var res2 = broadcastCapturedEventToNode((<IBobrilCacheNode[]>ch)[i], name, param);
            if (res2 != undefined) return res2;
        }
    }
    return res;
}

export function captureBroadcast<T extends EventNames>(
    name: T,
    param: Omit<EventParam<T>, "target"> | { target?: IBobrilCacheNode }
): IBobrilCtx | undefined {
    var k = Object.keys(roots);
    for (var i = 0; i < k.length; i++) {
        var ch = roots[k[i]!]!.n;
        if (ch != null) {
            var res = broadcastCapturedEventToNode(ch, name, param);
            if (res != null) return res;
        }
    }
    return undefined;
}

export function broadcast<T extends EventNames>(
    name: T,
    param: Omit<EventParam<T>, "target"> | { target?: IBobrilCacheNode }
): IBobrilCtx | undefined {
    var res = captureBroadcast(name, param);
    if (res != null) return res;
    var k = Object.keys(roots);
    for (var i = 0; i < k.length; i++) {
        var ch = roots[k[i]!]!.n;
        if (ch != null) {
            res = broadcastEventToNode(ch, name, param);
            if (res != null) return res;
        }
    }
    return undefined;
}

export function runMethodFrom(ctx: IBobrilCtx | undefined, methodId: MethodId, param?: Object): boolean {
    var done = false;
    if (DEBUG && ctx == undefined) throw new Error("runMethodFrom ctx is undefined");
    var currentRoot: IBobrilCacheNode | undefined = ctx!.me;
    var previousRoot: IBobrilCacheNode | undefined;

    while (currentRoot != undefined) {
        var children = currentRoot.children;
        if (isArray(children)) loopChildNodes(<IBobrilCacheNode[]>children);
        if (done) return true;

        var comp: any = currentRoot.component;
        if (comp && comp.runMethod) {
            if (
                callWithCurrentCtxWithEvents(
                    () => comp.runMethod(currentCtxWithEvents, methodId, param),
                    currentRoot.ctx!
                )
            )
                return true;
        }

        previousRoot = currentRoot;
        currentRoot = currentRoot.parent;
    }

    function loopChildNodes(children: IBobrilCacheNode[]) {
        for (var i = children.length - 1; i >= 0; i--) {
            var child: IBobrilCacheNode = children[i]!;
            if (child === previousRoot) continue;
            isArray(child.children) && loopChildNodes(child.children);
            if (done) return;

            var comp: any = child.component;
            if (comp && comp.runMethod) {
                if (
                    callWithCurrentCtxWithEvents(
                        () => comp.runMethod(currentCtxWithEvents, methodId, param),
                        child.ctx!
                    )
                ) {
                    done = true;
                    return;
                }
            }
        }
    }
    return done;
}

export function getCurrentCtxWithEvents(): IBobrilCtx | undefined {
    if (currentCtxWithEvents != undefined) return currentCtxWithEvents;
    return currentCtx;
}

export function tryRunMethod(methodId: MethodId, param?: Object): boolean {
    return runMethodFrom(getCurrentCtxWithEvents(), methodId, param);
}

export function runMethod(methodId: MethodId, param?: Object): void {
    if (!runMethodFrom(getCurrentCtxWithEvents(), methodId, param)) throw Error("runMethod didn't found " + methodId);
}

let lastMethodId = 0;

export function allocateMethodId(): number {
    return lastMethodId++;
}

function merge(f1: Function, f2: Function): Function {
    return function (this: any, ...params: any[]) {
        var result = f1.apply(this, params);
        if (result) return result;
        return f2.apply(this, params);
    };
}

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
    event.preventDefault();
    event.stopPropagation();
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
    var style = r.style;
    if (isObject(style) && !isFunction(style)) {
        r.style = assign({}, style);
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
    return isInvalidated;
}

// Bobril.OnChange

export interface IInputEvent<T = string | boolean | string[]> extends IEventParam {
    value: T;
}

var bValue = "b$value";
var bSelectionStart = "b$selStart";
var bSelectionEnd = "b$selEnd";
var tValue = "value";

function isCheckboxLike(el: HTMLInputElement) {
    var t = el.type;
    return t === "checkbox" || t === "radio";
}

function stringArrayEqual(a1: string[] | undefined, a2?: string[] | undefined): boolean {
    if (a1 === a2) return true;
    if (a1 == undefined || a2 == undefined) return false;
    var l = a1.length;
    if (l !== a2.length) return false;
    for (var j = 0; j < l; j++) {
        if (a1[j] !== a2[j]) return false;
    }
    return true;
}

function stringArrayContains(a: string[] | undefined, v: string): boolean {
    if (a == undefined) return false;
    for (var j = 0; j < a.length; j++) {
        if (a[j] === v) return true;
    }
    return false;
}

function selectedArray(options: HTMLOptionsCollection): string[] {
    var res: string[] = [];
    for (var j = 0; j < options.length; j++) {
        if (options[j]!.selected) res.push(options[j]!.value);
    }
    return res;
}

function emitOnChange(ev: Event | undefined, target: Node | undefined, node: IBobrilCacheNodeUnsafe | undefined) {
    if (target && target.nodeName === "OPTION") {
        target = document.activeElement!;
        node = deref(target);
    }
    if (!node) {
        return false;
    }
    if (node.ctx === undefined) {
        node.ctx = new BobrilCtx(undefined, node);
        node.component = emptyObject;
    }
    var ctx = node.ctx;
    var tagName = (<Element>target).tagName;
    var isSelect = tagName === "SELECT";
    var isMultiSelect = isSelect && (<HTMLSelectElement>target).multiple;
    if (isMultiSelect) {
        var vs = selectedArray((<HTMLSelectElement>target).options);
        if (!stringArrayEqual((<any>ctx)[bValue], vs)) {
            (<any>ctx)[bValue] = vs;
            emitOnInput(node, vs);
        }
    } else if (isCheckboxLike(<HTMLInputElement>target)) {
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
                var radioCtx = radioNode.ctx;
                var vrb = (<HTMLInputElement>radio).checked;
                if ((<any>radioCtx)[bValue] !== vrb) {
                    (<any>radioCtx)[bValue] = vrb;
                    emitOnInput(radioNode, vrb);
                }
            }
        } else {
            var vb = (<HTMLInputElement>target).checked;
            if ((<any>ctx)[bValue] !== vb) {
                (<any>ctx)[bValue] = vb;
                emitOnInput(node, vb);
            }
        }
    } else {
        var v = (<HTMLInputElement>target).value;
        if ((<any>ctx)[bValue] !== v) {
            (<any>ctx)[bValue] = v;
            emitOnInput(node, v);
        }
        let sStart = (<HTMLInputElement>target).selectionStart!;
        let sEnd = (<HTMLInputElement>target).selectionEnd!;
        let sDir = (<any>target).selectionDirection;
        let swap = false;
        let oStart = (<any>ctx)[bSelectionStart];
        if (sDir == undefined) {
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
    return false;
}

function emitOnInput(node: IBobrilCacheNode, value: any) {
    var prevCtx = currentCtxWithEvents;
    var ctx = node.ctx;
    var component = node.component;
    currentCtxWithEvents = ctx;
    const hasProp = node.attrs && node.attrs[bValue];
    if (isFunction(hasProp)) hasProp(value);
    const hasOnChange = component && component.onChange;
    if (isFunction(hasOnChange)) hasOnChange(ctx, value);
    currentCtxWithEvents = prevCtx;
    bubble(node, "onInput", { target: node, value });
}

function emitOnSelectionChange(node: IBobrilCacheNode, start: number, end: number) {
    let c = node.component;
    let ctx = node.ctx;
    if (c && ((<any>ctx)[bSelectionStart] !== start || (<any>ctx)[bSelectionEnd] !== end)) {
        (<any>ctx)[bSelectionStart] = start;
        (<any>ctx)[bSelectionEnd] = end;
        bubble(node, "onSelectionChange", {
            target: node,
            startPosition: start,
            endPosition: end,
        });
    }
}

export function select(node: IBobrilCacheNode, start: number, end = start): void {
    (node.element as HTMLInputElement).setSelectionRange(
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
for (var i = 0; i < events.length; i++) addEvent(events[i]!, 10, emitOnChange);

var mouseEvents = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel"];
for (var i = 0; i < mouseEvents.length; i++) addEvent(mouseEvents[i]!, 2, emitOnMouseChange);

// Bobril.Focus

let currentActiveElement: Element | undefined = undefined;
let currentFocusedNode: IBobrilCacheNode | undefined = undefined;
let nodeStack: IBobrilCacheNode[] = [];
let focusChangeRunning = false;

const focusedHookSet = new Set<CommonUseIsHook>();

export let useIsFocused = buildUseIsHook(focusedHookSet);

function emitOnFocusChange(inFocus: boolean): boolean {
    if (focusChangeRunning) return false;
    focusChangeRunning = true;
    while (true) {
        const newActiveElement = document.hasFocus() || inFocus ? document.activeElement! : undefined;
        if (newActiveElement === currentActiveElement) break;
        currentActiveElement = newActiveElement;
        var newStack = vdomPath(currentActiveElement);
        var common = 0;
        while (common < nodeStack.length && common < newStack.length && nodeStack[common] === newStack[common])
            common++;
        var i = nodeStack.length - 1;
        var n: IBobrilCacheNode | null;
        var c: IBobrilComponent;
        if (i >= common) {
            n = nodeStack[i]!;
            bubble(n, "onBlur");
            i--;
        }
        while (i >= common) {
            n = nodeStack[i]!;
            c = n.component;
            if (c && c.onFocusOut) c.onFocusOut(n.ctx!);
            i--;
        }
        i = common;
        while (i + 1 < newStack.length) {
            n = newStack[i]!;
            c = n.component;
            if (c && c.onFocusIn) c.onFocusIn(n.ctx!);
            i++;
        }
        if (i < newStack.length) {
            n = newStack[i]!;
            bubble(n, "onFocus");
        }
        nodeStack = newStack;
        currentFocusedNode = nodeStack.length == 0 ? undefined : nodeStack[nodeStack.length - 1];
        focusedHookSet.forEach((v) => v.update(newStack));
    }
    focusChangeRunning = false;
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

export function focus(node: IBobrilCacheNode, backwards?: boolean): boolean {
    if (node == undefined) return false;
    if (isString(node)) return false;
    var style = node.style as unknown as CSSStyleDeclaration | undefined;
    if (style != undefined) {
        if (style.visibility === "hidden") return false;
        if (style.display === "none") return false;
    }
    var attrs = node.attrs;
    if (attrs != undefined) {
        var ti = attrs.tabindex;
        if (ti !== undefined || isNaturallyFocusable(node.tag, attrs)) {
            var el = node.element;
            (<HTMLElement>el).focus();
            emitOnFocusChange(false);
            return true;
        }
    }
    var children = node.children;
    if (isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            if (focus(children[backwards ? children.length - 1 - i : i]!, backwards)) return true;
        }
        return false;
    }
    return false;
}

// Bobril.Scroll
var callbacks: Array<(info: IBobrilScroll) => void> = [];

function emitOnScroll(_ev: Event, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    let info: IBobrilScroll = {
        node,
    };
    for (var i = 0; i < callbacks.length; i++) {
        callbacks[i]!(info);
    }
    captureBroadcast("onScroll", info);
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
type Number16 = [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number
];

class CSSMatrix {
    data: Number16;
    constructor(data: Number16) {
        this.data = data;
    }
    static fromString(s: string): CSSMatrix {
        var c = s.match(/matrix3?d?\(([^\)]+)\)/i)![1]!.split(",");
        if (c.length === 6) {
            c = [c[0]!, c[1]!, "0", "0", c[2]!, c[3]!, "0", "0", "0", "0", "1", "0", c[4]!, c[5]!, "0", "1"];
        }
        return new CSSMatrix([
            parseFloat(c[0]!),
            parseFloat(c[4]!),
            parseFloat(c[8]!),
            parseFloat(c[12]!),
            parseFloat(c[1]!),
            parseFloat(c[5]!),
            parseFloat(c[9]!),
            parseFloat(c[13]!),
            parseFloat(c[2]!),
            parseFloat(c[6]!),
            parseFloat(c[10]!),
            parseFloat(c[14]!),
            parseFloat(c[3]!),
            parseFloat(c[7]!),
            parseFloat(c[11]!),
            parseFloat(c[15]!),
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
            a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15],
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
            1,
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
    var doc = x.ownerDocument!.documentElement;
    while (x != undefined && x !== doc && x.nodeType != 1) x = x.parentNode;
    while (x != undefined && x !== doc) {
        var computedStyle = <any>window.getComputedStyle(<HTMLElement>x, undefined);
        var c = CSSMatrix.fromString(
            (
                computedStyle.transform ||
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
    if (element == undefined) element = document.body;
    return getTransformationMatrix(element).inverse().transformPoint(pageX, pageY);
}

export declare class Tagged<N extends string> {
    protected _nominal_: N;
}
export type Nominal<T, N extends string> = T & Tagged<N>;

/// definition for Bobril defined class
export type IBobrilStyleDef = Nominal<string, "IBobrilStyleDef"> | ColorlessSprite;
export type ColorlessSprite = Nominal<string, "ColorlessSprite">;
/// object case if for inline style declaration, undefined, null, true and false values are ignored
export type IBobrilStyle = Readonly<CSSInlineStyles> | IBobrilStyleDef | "" | 0 | boolean | undefined | null;
/// place inline styles at end for optimal speed
export type IBobrilStyles = IBobrilStyle | IBobrilStyleArray;
export interface IBobrilStyleArray extends ReadonlyArray<IBobrilStyles> {
    fill: any;
    pop: any;
    push: any;
    concat: any;
    reverse: any;
    shift: any;
    slice: any;
    sort: any;
    splice: any;
    unshift: any;
    indexOf: any;
    lastIndexOf: any;
    every: any;
    some: any;
    forEach: any;
    map: any;
    filter: any;
    reduce: any;
    reduceRight: any;
    find: any;
    findIndex: any;
    [Symbol.iterator]: any;
    entries: any;
    values: any;
    readonly [index: number]: IBobrilStyles;
}

// PureFuncs: asset

export let asset: (path: string) => string =
    (<any>window)["bobrilBAsset"] ||
    function (path: string): string {
        return path;
    };

export function setAsset(fn: (path: string) => string) {
    asset = fn;
}

// Bobril.helpers

export function withKey(content: IBobrilChildren, key: string): IBobrilNodeWithKey {
    if (isObject(content) && !isArray(content)) {
        content.key = key;
        return content as IBobrilNodeWithKey;
    }
    return {
        key,
        children: content,
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
        (ctx.me as IBobrilCacheNodeUnsafe).cfg = c;
    }
}

// PureFuncs: createVirtualComponent, createComponent, createDerivedComponent, createOverridingComponent, prop, propi, propa, propim, getValue
export type ChildrenType<TData extends { [name: string]: any }> = "children" extends keyof TData
    ? TData["children"]
    : never;

export interface IComponentFactory<TData extends object | never> {
    (data?: TData, children?: ChildrenType<TData>): IBobrilNode<TData>;
}

export function createVirtualComponent<TData extends object | never, TCtx extends IBobrilCtx<TData> = any>(
    component: IBobrilComponent<TData, TCtx>
): IComponentFactory<TData> {
    return (data?: TData, children?: ChildrenType<TData>): IBobrilNode => {
        if (children !== undefined) {
            if (data == undefined) data = {} as TData;
            (data as any).children = children;
        }
        return { data, component: component };
    };
}

export function createOverridingComponent<
    TData extends object | never,
    TDataOriginal extends { [name: string]: any } = any
>(
    original: (data?: TDataOriginal, children?: ChildrenType<TDataOriginal>) => IBobrilNode,
    after: IBobrilComponent
): IComponentFactory<TData> {
    const originalComponent = original().component!;
    const overriding = overrideComponents(originalComponent, after);
    return createVirtualComponent<TData>(overriding);
}

export function createComponent<TData extends object | never, TCtx extends IBobrilCtx<TData> = any>(
    component: IBobrilComponent<TData, TCtx>
): IComponentFactory<TData> {
    const originalRender = component.render;
    if (originalRender) {
        component.render = function (ctx: IBobrilCtx<TData>, me: IBobrilNode, oldMe?: IBobrilCacheNode) {
            me.tag = "div";
            return originalRender.call(component, ctx, me, oldMe);
        };
    } else {
        component.render = (_ctx: IBobrilCtx<TData>, me: IBobrilNode) => {
            me.tag = "div";
        };
    }
    return createVirtualComponent<TData>(component);
}

export function createDerivedComponent<TData extends object | never, TDataOriginal extends object | never>(
    original: (data?: TDataOriginal, children?: ChildrenType<TDataOriginal>) => IBobrilNode<TDataOriginal>,
    after: IBobrilComponent<TData>
): IComponentFactory<TData & TDataOriginal> {
    const originalComponent = original().component!;
    const merged = mergeComponents(originalComponent, after);
    return createVirtualComponent<TData & TDataOriginal>(merged);
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
                    (v) => {
                        prop(v);
                    },
                    (err) => {
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
        if (val !== undefined && !is(val, value)) {
            const oldVal = val;
            value = val;
            if (onChange !== undefined) onChange(val, oldVal);

            invalidate(ctx);
        }
        return value;
    };
}

export function debounceProp<T>(from: IProp<T>, delay = 500): IProp<T> {
    let current = from();
    let lastSet = current;
    let timer: number | undefined;
    function clearTimer() {
        if (timer !== undefined) {
            clearTimeout(timer);
            timer = undefined;
        }
    }
    return (value?: T): T => {
        if (value === undefined) {
            let origin = from();
            if (origin === lastSet) return current;
            current = origin;
            lastSet = origin;
            clearTimer();
            return origin;
        } else {
            clearTimer();
            // setting same value means flush
            if (current === value) {
                lastSet = value;
                from(value);
            } else {
                current = value;
                timer = setTimeout(() => {
                    lastSet = current;
                    from(current);
                    timer = undefined;
                }, delay);
            }
            return value;
        }
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

export function shallowEqual(a: any, b: any): boolean {
    if (is(a, b)) {
        return true;
    }

    if (!isObject(a) || !isObject(b)) {
        return false;
    }

    const kA = Object.keys(a);
    const kB = Object.keys(b);

    if (kA.length !== kB.length) {
        return false;
    }

    for (let i = 0; i < kA.length; i++) {
        if (!hOP.call(b, kA[i]!) || !is(a[kA[i]!], b[kA[i]!])) {
            return false;
        }
    }

    return true;
}

// TSX reactNamespace emulation
// PureFuncs: createElement, getAllPropertyNames, component, buildUseIsHook

const jsxFactoryCache = new Map<IComponentClass<any> | IComponentFunction<any>, Function>();

function getStringPropertyDescriptors(obj: any): Map<string, PropertyDescriptor> {
    var props = new Map<string, PropertyDescriptor>();

    do {
        Object.getOwnPropertyNames(obj).forEach(function (this: Map<string, PropertyDescriptor>, prop: string) {
            if (!this.has(prop)) this.set(prop, Object.getOwnPropertyDescriptor(obj, prop)!);
        }, props);
    } while ((obj = Object.getPrototypeOf(obj)));

    return props;
}

const jsxSimpleProps = new Set("key className component data children".split(" "));

export function createElement<T extends object>(
    name: string | ((data?: T, children?: any) => IBobrilNode) | IComponentClass<T> | IComponentFunction<T>,
    data?: T,
    ...children: IBobrilChildren[]
): IBobrilNode<T>;

export function createElement(name: any, props: any): IBobrilNode {
    let children: IBobrilChildren;
    const argumentsCount = arguments.length - 2;
    if (argumentsCount === 0) {
    } else if (argumentsCount === 1) {
        children = arguments[2];
    } else {
        children = new Array(argumentsCount);
        for (let i = 0; i < argumentsCount; i++) {
            children[i] = arguments[i + 2];
        }
    }

    if (isString(name)) {
        var res: IBobrilNode = argumentsCount === 0 ? { tag: name } : { tag: name, children: children };
        if (props == undefined) {
            return res;
        }
        var attrs: IBobrilAttributes | undefined;
        var component: IBobrilComponent | undefined;
        for (var n in props) {
            if (!hOP.call(props, n)) continue;
            var propValue = props[n];
            if (jsxSimpleProps.has(n)) {
                (res as any)[n] = propValue;
            } else if (n === "style") {
                if (isFunction(propValue)) {
                    (res as any)[n] = propValue;
                } else {
                    style(res, propValue);
                }
            } else if (n === "ref") {
                if (isString(propValue)) {
                    assert(getCurrentCtx() != undefined);
                    res.ref = [getCurrentCtx()!, propValue];
                } else res.ref = propValue;
            } else if (n.startsWith("on") && isFunction(propValue)) {
                if (component == undefined) {
                    component = newHashObj();
                    res.component = component;
                }
                (component as any)[n] = propValue.call.bind(propValue);
                continue;
            } else {
                if (attrs == undefined) {
                    attrs = newHashObj();
                    res.attrs = attrs;
                }
                attrs[n] = propValue;
            }
        }

        return res;
    } else {
        let res: IBobrilNode;
        let factory = jsxFactoryCache.get(name);
        if (factory === undefined) {
            factory = createFactory(name);
            jsxFactoryCache.set(name, factory);
        }
        if (argumentsCount == 0) {
            res = factory(props);
        } else {
            if (factory.length == 1) {
                if (props == undefined) props = { children };
                else props.children = children;
                res = factory(props);
            } else {
                res = factory(props, children);
            }
        }
        if (props != undefined) {
            if (props.ref !== undefined) {
                res.ref = props.ref;
                delete props.ref;
            }
            if (props.key !== undefined) {
                res.key = props.key;
                delete props.key;
            }
        }
        return res;
    }
}

export const skipRender = { tag: "-" } as IBobrilNode;

export interface IFragmentData extends IDataWithChildren {}

export function Fragment(data: IFragmentData): IBobrilNode {
    return { children: data.children };
}

export interface IFragmentWithEventsData extends IFragmentData, IBobrilEvents {}

export function FragmentWithEvents(data: IFragmentWithEventsData): IBobrilNode {
    var res: IBobrilNode = { children: data.children };
    var component: IBobrilComponent;
    for (var n in data) {
        if (!hOP.call(data, n)) continue;
        var propValue = (data as any)[n];
        if (n.startsWith("on") && isFunction(propValue)) {
            component ??= newHashObj();
            res.component = component;
            (component as any)[n] = propValue.call.bind(propValue);
        }
    }

    return res;
}

export interface IPortalData extends IDataWithChildren {
    element?: Element;
}

export function Portal(data: IPortalData): IBobrilNode {
    return { tag: "@", data: data.element ?? document.body, children: data.children };
}

export enum EventResult {
    /// event propagation will continue. It's like returning falsy value.
    NotHandled = 0,
    /// event propagation will stop and default handing will be prevented. returning true has same meaning
    HandledPreventDefault = 1,
    /// event propagation will stop but default handing will still run
    HandledButRunDefault = 2,
    /// event propagation will continue but default handing will be prevented
    NotHandledPreventDefault = 3,
}

export type GenericEventResult = EventResult | boolean | void;

export class Component<TData = IDataWithChildren> extends BobrilCtx<TData> implements IBobrilEvents {
    constructor(data?: TData, me?: IBobrilCacheNode) {
        super(data, me);
    }

    init?(data: TData): void;
    render?(data: TData): IBobrilChildren;
    destroy?(me: IBobrilCacheNode): void;
    shouldChange?(newData: TData, oldData: TData): boolean;

    /// called from children to parents order for new nodes
    postInitDom?(me: IBobrilCacheNode): void;
    /// called from children to parents order for updated nodes
    postUpdateDom?(me: IBobrilCacheNode): void;
    /// called from children to parents order for updated nodes but in every frame even when render was not run
    postUpdateDomEverytime?(me: IBobrilCacheNode): void;
    /// called from children to parents order for new and updated nodes (combines postInitDom and postUpdateDom)
    postRenderDom?(me: IBobrilCacheNode): void;

    /// declared here to remove "no properties in common" your component can `implements b.IBobrilEvents`
    onChange?(value: any): void;

    //static canActivate?(transition: IRouteTransition): IRouteCanResult;
    //canDeactivate?(transition: IRouteTransition): IRouteCanResult;
}

export interface IComponentClass<TData extends Object = {}> {
    new (data?: any, me?: IBobrilCacheNode): Component<TData>;
}

export class PureComponent<TData = IDataWithChildren> extends Component<TData> {
    shouldChange(newData: TData, oldData: TData): boolean {
        return !shallowEqual(newData, oldData);
    }
}

export interface IComponentFunction<TData extends Object = {}> extends Function {
    (this: IBobrilCtx, data: TData): IBobrilChildren;
}

function forwardRender(m: Function) {
    return (ctx: IBobrilCtx, me: IBobrilNode, _oldMe?: IBobrilCacheNode) => {
        var res = m.call(ctx, ctx.data);
        if (res === skipRender) {
            me.tag = "-";
            return;
        }
        var resComponent = res?.component?.src;
        if (resComponent === Fragment) {
            res = res.data?.children;
        }
        me.children = res;
    };
}

function forwardInit(m: Function) {
    return (ctx: IBobrilCtx) => {
        m.call(ctx, ctx.data);
    };
}

function forwardShouldChange(m: Function) {
    return (ctx: IBobrilCtx, me: IBobrilNode, oldMe: IBobrilNode) => {
        return m.call(ctx, me.data, oldMe.data);
    };
}

function forwardMe(m: Function) {
    return m.call.bind(m);
}

type PostLikeMethod = (ctx: IBobrilCtx, me: IBobrilCacheNode) => void;

function combineWithForwardMe(
    component: IBobrilComponent,
    name: keyof IBobrilComponent,
    func: (me: IBobrilCacheNode) => void
) {
    const existing = component[name] as PostLikeMethod;
    if (existing != undefined) {
        (component[name] as PostLikeMethod) = (ctx: IBobrilCtx, me: IBobrilCacheNode) => {
            existing(ctx, me);
            func.call(ctx, me);
        };
    } else {
        (component[name] as PostLikeMethod) = forwardMe(func);
    }
}

const postInitDom = "postInitDom";
const postUpdateDom = "postUpdateDom";
const postUpdateDomEverytime = "postUpdateDomEverytime";
const methodsWithMeParam = ["destroy", postInitDom, postUpdateDom, postUpdateDomEverytime];

export function component<TData extends object>(
    component: IComponentClass<TData> | IComponentFunction<TData>,
    name?: string
): IComponentFactory<TData> {
    const bobrilComponent = {} as IBobrilComponent;
    if (component.prototype instanceof Component) {
        const proto = component.prototype as any;
        const protoStatic = proto.constructor;
        bobrilComponent.id = getId(name, protoStatic);
        const protoMap = getStringPropertyDescriptors(proto);
        protoMap.forEach((descriptor, key) => {
            const value = descriptor.value;
            if (value == undefined) return;
            let set = undefined as any;
            if (key === "render") {
                set = forwardRender(value);
            } else if (key === "init") {
                set = forwardInit(value);
            } else if (key === "shouldChange") {
                set = forwardShouldChange(value);
            } else if (methodsWithMeParam.indexOf(key) >= 0) {
                combineWithForwardMe(bobrilComponent, key as any, value);
            } else if (key === "postRenderDom") {
                combineWithForwardMe(bobrilComponent, methodsWithMeParam[1] as any, value);
                combineWithForwardMe(bobrilComponent, methodsWithMeParam[2] as any, value);
            } else if (isFunction(value) && /^(?:canDeactivate$|on[A-Z])/.test(key)) {
                set = forwardMe(value);
            }
            if (set !== undefined) {
                (bobrilComponent as any)[key] = set;
            }
        });
        bobrilComponent.ctxClass = component as unknown as ICtxClass;
        (bobrilComponent as any).canActivate = protoStatic.canActivate; // for router
    } else {
        bobrilComponent.id = getId(name, component);
        bobrilComponent.render = forwardRender(component);
    }
    bobrilComponent.src = component;
    return (data?: TData): IBobrilNode => {
        return { data, component: bobrilComponent };
    };
}

function getId(name: string | undefined, classOrFunction: any): string {
    return name || classOrFunction.id || classOrFunction.name + "_" + allocateMethodId();
}

function createFactory(comp: IComponentClass<any> | IComponentFunction<any>): Function {
    if (comp.prototype instanceof Component) {
        return component(comp);
    } else if (comp.length == 2) {
        // classic bobril factory method
        return comp;
    } else {
        return component(comp);
    }
}

function checkCurrentRenderCtx() {
    assert(currentCtx != undefined && hookId >= 0, "Hooks could be used only in Render method");
}

export function _getHooks() {
    checkCurrentRenderCtx();
    let hooks = (currentCtx as IBobrilCtxInternal).$hooks;
    if (hooks === undefined) {
        hooks = [];
        (currentCtx as IBobrilCtxInternal).$hooks = hooks;
    }
    return hooks;
}

export function _allocHook() {
    return hookId++;
}

function setStateHookFunction<T>(this: [T, any, IBobrilCtx], value: T | ((value: T) => T)) {
    if (isFunction(value)) {
        value = value(this[0]);
    }
    if (!is(value, this[0])) {
        this[0] = value;
        invalidate(this[2]);
    }
}

function useStateIterator(this: Array<any>) {
    var i = 0;
    var self = this;
    return {
        next: function () {
            return {
                value: self[i++],
                done: false,
            };
        },
    };
}

export function useState<T>(initValue: T | (() => T)): IProp<T> & [T, (value: T | ((value: T) => T)) => void] {
    const myHookId = hookId++;
    const hooks = _getHooks();
    const ctx = currentCtx;
    let hook = hooks[myHookId];
    if (hook === undefined) {
        if (isFunction(initValue)) {
            initValue = initValue();
        }
        hook = (...value: [T?]) => {
            if (value.length == 1 && !is(value[0], hook[0])) {
                hook[0] = value[0];
                invalidate(hook[2]);
            }
            return hook[0];
        };
        hook[0] = initValue;
        hook[1] = setStateHookFunction.bind(hook);
        hook[2] = ctx;
        hook[Symbol.iterator] = useStateIterator;
        hooks[myHookId] = hook;
    }
    return hook;
}

export type Dispatch<A> = (value: A) => void;
export type Reducer<S, A> = (prevState: S, action: A) => S;
export type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
export type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;

export function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I & ReducerState<R>,
    initializer: (arg: I & ReducerState<R>) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

export function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

export function useReducer<R extends Reducer<any, any>>(
    reducer: R,
    initialState: ReducerState<R>,
    initializer?: undefined
): [ReducerState<R>, Dispatch<ReducerAction<R>>];

export function useReducer<R extends Reducer<any, any>, I>(
    reducer: R,
    initializerArg: I,
    initializer?: (arg: I) => ReducerState<R>
): [ReducerState<R>, Dispatch<ReducerAction<R>>] {
    const myHookId = hookId++;
    const hooks = _getHooks();
    const ctx = currentCtx;
    let hook = hooks[myHookId] as [ReducerState<R>, Dispatch<ReducerAction<R>>];
    if (hook === undefined) {
        var initValue = isFunction(initializer) ? initializer(initializerArg) : (initializerArg as ReducerState<R>);
        hook = [
            initValue,
            (action: ReducerAction<R>) => {
                let currentValue = hook[0];
                let newValue = reducer(currentValue, action);
                if (!is(newValue, currentValue)) {
                    hook[0] = newValue;
                    invalidate(ctx);
                }
            },
        ];
        hooks[myHookId] = hook;
    }
    return hook;
}

export interface IContext<T> {
    id: string;
    dv: T;
}

export function createContext<T = unknown>(defaultValue: T, id?: string): IContext<T> {
    if (id === undefined) {
        id = "__b#" + allocateMethodId();
    }
    return { id, dv: defaultValue };
}

export function context<T>(key: IContext<T>): (target: object, propertyKey: string) => void {
    return (target: object, propertyKey: string): void => {
        Object.defineProperty(target, propertyKey, {
            configurable: true,
            get(this: IBobrilCtxInternal): T {
                const cfg = this.me.cfg || this.cfg;
                if (cfg == undefined || !(key.id in cfg)) return key.dv;
                return cfg[key.id];
            },
            set(this: IBobrilCtxInternal, value: T) {
                extendCfg(this, key.id, value);
            },
        });
    };
}

export function useContext<T>(key: IContext<T>): T;
export function useContext<T = unknown>(key: string): T | undefined;
export function useContext<T>(key: string | IContext<T>): T | undefined {
    checkCurrentRenderCtx();
    const cfg = currentCtx!.me.cfg || currentCtx!.cfg;
    if (isString(key)) {
        if (cfg == undefined) return undefined;
        return cfg[key];
    } else {
        if (cfg == undefined || !(key.id in cfg)) return key.dv;
        return cfg[key.id];
    }
}

export function useProvideContext(key: string, value: any): void;
export function useProvideContext<T>(key: IContext<T>, value: T): void;
export function useProvideContext<T = any>(key: string | IContext<T>, value: T): void {
    checkCurrentRenderCtx();
    extendCfg(currentCtx!, isString(key) ? key : key.id, value);
}

export function useRef<T = unknown>(initialValue?: T): IProp<T> & { current: T } {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        hook = (value?: T) => {
            if (value !== undefined) {
                hook.current = value;
            }
            return hook.current;
        };
        hook.current = initialValue;
        hooks[myHookId] = hook;
    }
    return hook;
}

export function useStore<T>(factory: () => T): T {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        hook = factory();
        if (isDisposable(hook)) {
            addDisposable(currentCtx!, hook);
        }
        hooks[myHookId] = hook;
    }
    return hook;
}

function hookPostInitDom(ctx: IBobrilCtxInternal) {
    const hooks = ctx.$hooks!;
    const len = hooks.length;
    for (let i = 0; i < len; i++) {
        const hook = hooks[i];
        const fn = hook[postInitDom];
        if (fn !== undefined) {
            fn.call(hook, ctx);
        }
    }
}

function hookPostUpdateDom(ctx: IBobrilCtxInternal) {
    const hooks = ctx.$hooks!;
    const len = hooks.length;
    for (let i = 0; i < len; i++) {
        const hook = hooks[i];
        const fn = hook[postUpdateDom];
        if (fn !== undefined) {
            fn.call(hook, ctx);
        }
    }
}

function hookPostUpdateDomEverytime(ctx: IBobrilCtxInternal) {
    const hooks = ctx.$hooks!;
    const len = hooks.length;
    for (let i = 0; i < len; i++) {
        const hook = hooks[i];
        const fn = hook[postUpdateDomEverytime];
        if (fn !== undefined) {
            fn.call(hook, ctx);
        }
    }
}

type EffectCallback = () => void | (() => void | undefined);
type DependencyList = ReadonlyArray<unknown>;

export function bind(target: any, propertyKey?: string, descriptor?: PropertyDescriptor): any {
    if (propertyKey != undefined && descriptor != undefined) {
        const fn = descriptor.value;
        assert(isFunction(fn), `Only methods can be decorated with @bind. '${propertyKey}' is not a method!`);

        let definingProperty = false;
        return {
            configurable: true,
            get() {
                if (definingProperty) {
                    return fn;
                }
                let value = fn!.bind(this);
                definingProperty = true;
                Object.defineProperty(this, propertyKey, {
                    value,
                    configurable: true,
                    writable: true,
                });
                definingProperty = false;
                return value;
            },
        };
    }
    const proto = target.prototype;
    const keys = Object.getOwnPropertyNames(proto);
    keys.forEach((key) => {
        if (key === "constructor") {
            return;
        }
        const descriptor = Object.getOwnPropertyDescriptor(proto, key);
        if (isFunction(descriptor!.value)) {
            Object.defineProperty(proto, key, bind(target, key, descriptor));
        }
    });
    return target;
}

class DepsChangeDetector {
    deps?: DependencyList;

    detectChange(deps?: DependencyList): boolean {
        let changed = false;
        if (deps != undefined) {
            const lastDeps = this.deps;
            if (lastDeps == undefined) {
                changed = true;
            } else {
                const depsLen = deps.length;
                if (depsLen != lastDeps.length) changed = true;
                else {
                    for (let i = 0; i < depsLen; i++) {
                        if (!is(deps[i], lastDeps[i])) {
                            changed = true;
                            break;
                        }
                    }
                }
            }
        } else changed = true;
        this.deps = deps;
        return changed;
    }
}

class MemoHook<T> extends DepsChangeDetector {
    current: T | undefined;

    memoize(factory: () => T, deps: DependencyList): T {
        if (this.detectChange(deps)) {
            this.current = factory();
        }
        return this.current!;
    }
}

export function useMemo<T>(factory: () => T, deps: DependencyList): T {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        hook = new MemoHook();
        hooks[myHookId] = hook;
    }
    return hook.memoize(factory, deps);
}

export function useCallback<T>(callback: T, deps: DependencyList): T {
    return useMemo(() => callback, deps);
}

class CommonEffectHook extends DepsChangeDetector implements IDisposable {
    callback?: EffectCallback;
    lastDisposer?: () => void;
    shouldRun = false;

    update(callback: EffectCallback, deps?: DependencyList) {
        this.callback = callback;
        if (this.detectChange(deps)) {
            this.doRun();
        }
    }

    doRun() {
        this.shouldRun = true;
    }

    run() {
        const c = this.callback;
        if (c != undefined) {
            this.dispose();
            this.lastDisposer = c() as any;
        }
    }

    dispose() {
        this.callback = undefined;
        if (isFunction(this.lastDisposer)) this.lastDisposer();
        this.lastDisposer = undefined;
    }
}

class EffectHook extends CommonEffectHook {
    useEffect() {
        if (this.shouldRun) {
            this.shouldRun = false;
            this.run();
        }
    }
}

export function useEffect(callback: EffectCallback, deps?: DependencyList): void {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        (currentCtx as IBobrilCtxInternal).$hookFlags! |= hasUseEffect;
        hook = new EffectHook();
        addDisposable(currentCtx!, hook);
        hooks[myHookId] = hook;
    }
    hook.update(callback, deps);
}

class LayoutEffectHook extends CommonEffectHook {
    postInitDom(ctx: IBobrilCtxInternal) {
        this[postUpdateDomEverytime].call(this, ctx);
    }

    postUpdateDomEverytime(ctx: IBobrilCtxInternal) {
        if (this.shouldRun) {
            this.shouldRun = false;
            this.run();
            if ((<any>ctx)[ctxInvalidated] > frameCounter) {
                deferSyncUpdate();
            }
        }
    }
}

export function useLayoutEffect(callback: EffectCallback, deps?: DependencyList): void {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        (currentCtx as IBobrilCtxInternal).$hookFlags! |= hasPostInitDom | hasPostUpdateDomEverytime;
        hook = new LayoutEffectHook();
        addDisposable(currentCtx!, hook);
        hooks[myHookId] = hook;
    }
    hook.update(callback, deps);
}

class EventsHook {
    events!: IHookableEvents;
}

export function useEvents(events: IHookableEvents) {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        (currentCtx as IBobrilCtxInternal).$hookFlags! |= hasEvents;
        hook = new EventsHook();
        hooks[myHookId] = hook;
    } else {
        assert(hook instanceof EventsHook);
    }
    hook.events = events;
}

class CaptureEventsHook {
    events!: ICapturableEvents;
}

export function useCaptureEvents(events: ICapturableEvents) {
    const myHookId = hookId++;
    const hooks = _getHooks();
    let hook = hooks[myHookId];
    if (hook === undefined) {
        (currentCtx as IBobrilCtxInternal).$hookFlags! |= hasCaptureEvents;
        hook = new CaptureEventsHook();
        hooks[myHookId] = hook;
    } else {
        assert(hook instanceof CaptureEventsHook);
    }
    hook.events = events;
}

export class CommonUseIsHook implements IDisposable {
    Value: boolean;
    private _owner: Set<CommonUseIsHook>;
    private _ctx: IBobrilCtx;

    constructor(owner: Set<CommonUseIsHook>, ctx: IBobrilCtx) {
        this.Value = false;
        this._owner = owner;
        this._ctx = ctx;
        owner.add(this);
        addDisposable(ctx, this);
    }

    update(path: IBobrilCacheNode[]) {
        let newValue = path.indexOf(this._ctx.me) >= 0;
        if (this.Value == newValue) return;
        this.Value = newValue;
        invalidate(this._ctx);
    }

    dispose() {
        this._owner.delete(this);
    }
}

export function buildUseIsHook(owner: Set<CommonUseIsHook>): () => boolean {
    return () => {
        const myHookId = hookId++;
        const hooks = _getHooks();
        let hook = hooks[myHookId];
        if (hook === undefined) {
            hook = new CommonUseIsHook(owner, currentCtx!);
            hooks[myHookId] = hook;
        }
        return hook.Value;
    };
}

export interface IDataWithChildren {
    children?: IBobrilChildren;
}

interface IGenericElementAttributes extends IBobrilEvents {
    children?: IBobrilChildren;
    style?: IBobrilStyles | (() => IBobrilStyles);
    [name: string]: any;
}

declare global {
    namespace JSX {
        type Element = IBobrilNode<any>;

        interface ElementAttributesProperty {
            data: {};
        }
        interface ElementChildrenAttribute {
            children: IBobrilChildren;
        }

        interface IntrinsicAttributes {
            key?: string;
            ref?: RefType;
        }

        interface IntrinsicClassAttributes<T> {
            key?: string;
            ref?: RefType;
        }

        interface IntrinsicElements {
            [name: string]: IGenericElementAttributes;
        }
    }
}
