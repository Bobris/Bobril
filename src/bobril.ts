﻿/// <reference path="bobril.d.ts"/>

declare var DEBUG: boolean;
if (typeof DEBUG === "undefined") DEBUG = true;

// IE8 [].map polyfill Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function(callback: any, thisArg: any) {
        var a: Array<any>, k: number;
        // ReSharper disable once ConditionIsAlwaysConst
        if (DEBUG && this == null) {
            throw new TypeError("this==null");
        }
        var o = Object(this);
        var len = o.length >>> 0;
        if (DEBUG && typeof callback != "function") {
            throw new TypeError(callback + " isn't func");
        }
        a = new Array(len);
        k = 0;
        while (k < len) {
            var kValue: any, mappedValue: any;
            if (k in o) {
                kValue = o[k];
                mappedValue = callback.call(thisArg, kValue, k, o);
                a[k] = mappedValue;
            }
            k++;
        }
        return a;
    };
}

// Object create polyfill
if (!Object.create) {
    Object.create = (o: any) => {
        function f() { }
        f.prototype = o;
        return new (<any>f)();
    }
}

// Object keys polyfill
if (!Object.keys) {
    Object.keys = ((obj: any) => {
        var keys = <string[]>[];
        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }
        return keys;
    });
}

// Array isArray polyfill
if (!Array.isArray) {
    var objectToString = {}.toString;
    Array.isArray = ((a: any) => objectToString.call(a) === "[object Array]");
}

b = ((window: Window, document: Document): IBobrilStatic => {
    function assert(shoudBeTrue: boolean, messageIfFalse?: string) {
        if (DEBUG && !shoudBeTrue)
            throw Error(messageIfFalse || "assertion failed");
    }

    var isArray = Array.isArray;
    var objectKeys = Object.keys;

    function createTextNode(content: string): Text {
        return document.createTextNode(content);
    }

    function createElement(name: string): HTMLElement {
        return document.createElement(name);
    }

    var hasTextContent = "textContent" in createTextNode("");
    var hasRemovePropertyInStyle = "removeProperty" in createElement("a").style;

    function isObject(value: any): boolean {
        return typeof value === "object";
    }

    var inSvg: boolean = false;
    var updateCall: Array<boolean> = [];
    var updateInstance: Array<IBobrilCacheNode> = [];
    var setValueCallback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void = (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any): void => {
        if (newValue !== oldValue)
            (<any>el)["value"] = newValue;
    }

    function setSetValue(callback: (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void): (el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => void {
        var prev = setValueCallback;
        setValueCallback = callback;
        return prev;
    }

    function newHashObj() {
        return Object.create(null);
    }

    var vendors = ["webkit", "Moz", "ms", "o"];
    var testingDivStyle: any = document.createElement("div").style;
    function testPropExistence(name: string) {
        return typeof testingDivStyle[name] === "string";
    }

    var mapping: IBobrilShimStyleMapping = newHashObj();

    var isUnitlessNumber = {
        boxFlex: true,
        boxFlexGroup: true,
        columnCount: true,
        flex: true,
        flexGrow: true,
        flexShrink: true,
        fontWeight: true,
        lineClamp: true,
        lineHeight: true,
        opacity: true,
        order: true,
        orphans: true,
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
            if (typeof value === "number") {
                style[newName] = value + "px";
            } else {
                style[newName] = value;
            }
            style[oldName] = undefined;
        };
    }

    function pxadder(style: any, value: any, name: string) {
        if (typeof value === "number")
            style[name] = value + "px";
    }

    function ieVersion() {
        return document.documentMode;
    }

    var onIE8 = ieVersion() === 8;

    if (onIE8) {
        (<any>mapping).cssFloat = renamer("styleFloat");
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

    function removeProperty(s: MSStyleCSSProperties, name: string) {
        if (hasRemovePropertyInStyle)
            (<any>s)[name] = "";
        else
            s.removeAttribute(name);
    }

    function updateStyle(n: IBobrilCacheNode, el: HTMLElement, newStyle: any, oldStyle: any) {
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

    function updateElement(n: IBobrilCacheNode, el: Element, newAttrs: IBobrilAttributes, oldAttrs: IBobrilAttributes): IBobrilAttributes {
        var attrName: string, newAttr: any, oldAttr: any, valueOldAttr: any, valueNewAttr: any;
        for (attrName in newAttrs) {
            newAttr = newAttrs[attrName];
            oldAttr = oldAttrs[attrName];
            if (attrName === "value" && !inSvg) {
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
                } else if (onIE8 && attrName === "type" && el.nodeName === "input") {
                    // Already set before adding to document
                } else if (attrName in el && !(attrName === "list" || attrName === "form")) {
                    (<any>el)[attrName] = newAttr;
                } else el.setAttribute(attrName, newAttr);
            }
        }
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined && !(attrName in newAttrs)) {
                oldAttrs[attrName] = undefined;
                el.removeAttribute(attrName);
            }
        }
        if (valueNewAttr !== undefined) {
            setValueCallback(el, n, valueNewAttr, valueOldAttr);
        }
        return oldAttrs;
    }

    function pushInitCallback(c: IBobrilCacheNode, aupdate: boolean) {
        var cc = c.component;
        if (cc) {
            if ((<any>cc)[aupdate ? "postUpdateDom" : "postInitDom"]) {
                updateCall.push(aupdate);
                updateInstance.push(c);
            }
        }
    }

    function findCfg(parent: IBobrilCacheNode): any {
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

    function setRef(ref: [IBobrilCtx, string], value: IBobrilCacheNode) {
        if (ref == null) return;
        var ctx = ref[0];
        var refs = ctx.refs;
        if (!refs) {
            refs = newHashObj();
            ctx.refs = refs;
        }
        refs[ref[1]] = value;
    }

    function createNode(n: IBobrilNode, parentNode: IBobrilNode, createInto: Element, createBefore: Node): IBobrilCacheNode {
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
        var component = c.component;
        var el: Node;
        setRef(c.ref, c);
        if (component) {
            var ctx: IBobrilCtx = { data: c.data || {}, me: c, cfg: findCfg(parentNode) };
            c.ctx = ctx;
            if (component.init) {
                component.init(ctx, c, createInto, createBefore);
            }
            if (component.render) {
                component.render(ctx, c);
            }
            if (c.element) return c;
        }
        var tag = c.tag;
        var children = c.children;
        if (tag === undefined) {
            if (typeof children === "string") {
                el = createTextNode(<string>children);
                c.element = el;
                createInto.insertBefore(el, createBefore);
            } else {
                createChildren(c, createInto, createBefore);
            }
            if (component) {
                if (component.postRender) {
                    component.postRender(c.ctx, c);
                }
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
                    el = parent.insertBefore(createElement("i"), el);
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
                    newElements.push(elprev);
                    elprev = elprev.nextSibling;
                }
                (<IBobrilCacheNode>n).element = newElements;
                if (removeEl) {
                    parent.removeChild(el);
                }
            }
            if (component) {
                if (component.postRender) {
                    component.postRender(c.ctx, c);
                }
            }
            return c;
        } else if (inSvg || tag === "svg") {
            el = <HTMLElement>document.createElementNS("http://www.w3.org/2000/svg", tag);
            inSvg = true;
        } else if (!el) {
            el = createElement(tag);
        }
        if (onIE8 && tag === "input" && "type" in c.attrs) {
            // On IE8 input.type has to be written before writing adding to document
            (<HTMLInputElement>el).type = (<any>c.attrs).type;
        }
        createInto.insertBefore(el, createBefore);
        c.element = el;
        createChildren(c, <Element>el, null);
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, c);
            }
        }
        if (c.attrs) c.attrs = updateElement(c, <HTMLElement>el, c.attrs, {});
        if (c.style) updateStyle(c, <HTMLElement>el, c.style, undefined);
        var className = c.className;
        if (className) setClassName(<HTMLElement>el, className);
        inSvg = backupInSvg;
        pushInitCallback(c, false);
        return c;
    }

    function normalizeNode(n: any): IBobrilNode {
        var t = typeof n;
        if (t === "string") {
            return { children: n };
        }
        if (t === "boolean") return null;
        return <IBobrilNode>n;
    }

    function createChildren(c: IBobrilCacheNode, createInto: Element, createBefore: Node): void {
        var ch = c.children;
        if (!ch)
            return;
        if (!isArray(ch)) {
            if (typeof ch === "string") {
                if (hasTextContent) {
                    createInto.textContent = ch;
                } else {
                    (<HTMLElement>createInto).innerText = ch;
                }
                return;
            }
            ch = [ch];
        }
        ch = (<IBobrilNode[]>ch).slice(0);
        var i = 0, l = (<IBobrilNode[]>ch).length;
        while (i < l) {
            var item = (<IBobrilNode[]>ch)[i];
            if (isArray(item)) {
                (<IBobrilNode[]>ch).splice.apply(ch, (<any>[i, 1]).concat(item));
                l = (<IBobrilNode[]>ch).length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                (<IBobrilNode[]>ch).splice(i, 1);
                l--;
                continue;
            }
            var j = (<IBobrilNode[]>ch)[i] = createNode(item, c, createInto, createBefore);
            i++;
        }
        c.children = ch;
    }

    function destroyNode(c: IBobrilCacheNode) {
        setRef(c.ref, null);
        var ch = c.children;
        if (isArray(ch)) {
            for (var i = 0, l = (<IBobrilCacheNode[]>ch).length; i < l; i++) {
                destroyNode((<IBobrilCacheNode[]>ch)[i]);
            }
        }
        var component = c.component;
        if (component) {
            if (component.destroy)
                component.destroy(c.ctx, c, <HTMLElement>c.element);
        }
    }

    function removeNodeRecursive(c: IBobrilCacheNode) {
        var el = c.element;
        if (isArray(el)) {
            var pa = (<Node[]>el)[0].parentNode;
            if (pa) {
                for (var i = 0; i < (<Node[]>el).length; i++) {
                    pa.removeChild((<Node[]>el)[i]);
                }
            }
        } else if (el != null) {
            var p = (<Node>el).parentNode;
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

    var roots: IBobrilRoots = Object.create(null);

    function nodeContainsNode(c: IBobrilCacheNode, n: Node, resIndex: number, res: IBobrilCacheNode[]): IBobrilCacheNode[] {
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

    function vdomPath(n: Node): IBobrilCacheNode[] {
        var res: IBobrilCacheNode[] = [];
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
        var currentCacheArray: IBobrilChildren = null;
        var currentNode = nodeStack.pop();
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
        while (nodeStack.length) {
            currentNode = nodeStack.pop();
            if (currentCacheArray && (<any>currentCacheArray).length) for (var i = 0, l = (<any>currentCacheArray).length; i < l; i++) {
                var bn = (<IBobrilCacheNode[]>currentCacheArray)[i];
                var findResult = nodeContainsNode(bn, currentNode, res.length, res);
                if (findResult !== undefined) {
                    currentCacheArray = findResult;
                    currentNode = null;
                    break;
                }
            }
            if (currentNode) {
                res.push(null);
                break;
            }
        }
        return res;
    }

    function getCacheNode(n: Node): IBobrilCacheNode {
        var s = vdomPath(n);
        if (s.length == 0) return null;
        return s[s.length - 1];
    }

    function finishUpdateNode(n: IBobrilNode, c: IBobrilCacheNode, component: IBobrilComponent) {
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, n, c);
            }
        }
        c.data = n.data;
        pushInitCallback(c, true);
    }

    function updateNode(n: IBobrilNode, c: IBobrilCacheNode, createInto: Element, createBefore: Node, deepness: number): IBobrilCacheNode {
        var component = n.component;
        var backupInSvg = inSvg;
        var bigChange = false;
        var ctx = c.ctx;
        if (component && ctx != null) {
            if ((<any>ctx)[ctxInvalidated] === frame) {
                deepness = Math.max(deepness,  (<any>ctx)[ctxDeepness]);
            }
            if (component.id !== c.component.id) {
                bigChange = true;
            } else {
                if (c.parent != undefined)
                    ctx.cfg = findCfg(c.parent);
                if (component.shouldChange)
                    if (!component.shouldChange(ctx, n, c))
                        return c;
                (<any>ctx).data = n.data || {};
                c.component = component;
                if (component.render)
                    component.render(ctx, n, c);
                c.cfg = n.cfg;
            }
        }
        if (DEBUG) {
            if (!((n.ref == null && c.ref == null) ||
                ((n.ref != null && c.ref != null && n.ref[0] === c.ref[0] && n.ref[1] === c.ref[1])))) {
                if (window.console && console.warn) console.warn("ref changed in child in update");
            }
        }
        var newChildren = n.children;
        var cachedChildren = c.children;
        var tag = n.tag;
        if (bigChange || (component && ctx == null)) {
            // it is big change of component.id or old one was not even component => recreate
        } else if (tag === "/") {
            if (c.tag === "/" && cachedChildren === newChildren) {
                finishUpdateNode(n, c, component);
                return c;
            }
        } else if (tag === c.tag) {
            if (tag === undefined) {
                if (typeof newChildren === "string" && typeof cachedChildren === "string") {
                    if (newChildren !== cachedChildren) {
                        var el = <Element>c.element;
                        if (hasTextContent) {
                            el.textContent = newChildren;
                        } else {
                            (<HTMLElement>el).innerText = newChildren;
                        }
                        c.children = newChildren;
                    }
                } else {
                    if (deepness <= 0) {
                        if (isArray(cachedChildren))
                            selectedUpdate(<IBobrilCacheNode[]>c.children, createInto, createBefore);
                    } else {
                        c.children = updateChildren(createInto, newChildren, cachedChildren, c, createBefore, deepness - 1);
                    }
                }
                finishUpdateNode(n, c, component);
                return c;
            } else {
                if (tag === "svg") {
                    inSvg = true;
                }
                var el = <Element>c.element;
                if ((typeof newChildren === "string") && !isArray(cachedChildren)) {
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
                finishUpdateNode(n, c, component);
                if (c.attrs || n.attrs)
                    c.attrs = updateElement(c, el, n.attrs || {}, c.attrs || {});
                updateStyle(c, <HTMLElement>el, n.style, c.style);
                c.style = n.style;
                var className = n.className;
                if (className !== c.className) {
                    setClassName(el, className || "");
                    c.className = className;
                }
                inSvg = backupInSvg;
                return c;
            }
        }
        var parEl = c.element;
        if (isArray(parEl)) parEl = (<Node[]>parEl)[0];
        if (parEl == null) parEl = createInto; else parEl = (<Node>parEl).parentNode;
        var r: IBobrilCacheNode = createNode(n, c.parent, <Element>parEl, findFirstNode(c));
        removeNode(c);
        return r;
    }

    function findFirstNode(c: IBobrilCacheNode): Node {
        var el = c.element;
        if (el != null) {
            if (isArray(el)) return (<Node[]>el)[0];
            return <Node>el;
        }
        var ch = c.children;
        if (!isArray(ch)) return null;
        for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
            el = findFirstNode((<IBobrilCacheNode[]>ch)[i]);
            if (el) return <Node>el;
        }
        return null;
    }

    function findNextNode(a: IBobrilCacheNode[], i: number, len: number, def: Node): Node {
        while (++i < len) {
            var ai = a[i];
            if (ai == null) continue;
            var n = findFirstNode(ai);
            if (n != null) return n;
        }
        return def;
    }

    function callPostCallbacks() {
        var count = updateInstance.length;
        for (var i = 0; i < count; i++) {
            var n = updateInstance[i];
            if (updateCall[i]) {
                n.component.postUpdateDom(n.ctx, n, <HTMLElement>n.element);
            } else {
                n.component.postInitDom(n.ctx, n, <HTMLElement>n.element);
            }
        }
        updateCall = [];
        updateInstance = [];
    }

    function updateNodeInUpdateChildren(newNode: IBobrilNode, cachedChildren: IBobrilCacheNode[], cachedIndex: number, cachedLength: number, createBefore: Node, element: Element, deepness: number) {
        cachedChildren[cachedIndex] = updateNode(newNode, cachedChildren[cachedIndex], element,
            findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore), deepness);
    }

    function reorderInUpdateChildrenRec(c: IBobrilCacheNode, element: Element, before: Node): void {
        var el = c.element;
        if (el != null) {
            if (isArray(el)) {
                for (var i = 0; i < (<Node[]>el).length; i++) {
                    element.insertBefore((<Node[]>el)[i], before);
                }
            } else
                element.insertBefore(<Node>el, before);
            return;
        }
        var ch = c.children;
        if (!isArray(ch)) return null;
        for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
            reorderInUpdateChildrenRec((<IBobrilCacheNode[]>ch)[i], element, before);
        }
    }

    function reorderInUpdateChildren(cachedChildren: IBobrilCacheNode[], cachedIndex: number, cachedLength: number, createBefore: Node, element: Element) {
        var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
        var cur = cachedChildren[cachedIndex];
        var what = findFirstNode(cur);
        if (what != null && what !== before) {
            reorderInUpdateChildrenRec(cur, element, before);
        }
    }

    function reorderAndUpdateNodeInUpdateChildren(newNode: IBobrilNode, cachedChildren: IBobrilCacheNode[], cachedIndex: number, cachedLength: number, createBefore: Node, element: Element, deepness: number) {
        var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
        var cur = cachedChildren[cachedIndex];
        var what = findFirstNode(cur);
        if (what != null && what !== before) {
            reorderInUpdateChildrenRec(cur, element, before);
        }
        cachedChildren[cachedIndex] = updateNode(newNode, cur, element, before, deepness);
    }

    function updateChildren(element: Element, newChildren: any, cachedChildren: any, parentNode: IBobrilNode, createBefore: Node, deepness: number): IBobrilCacheNode[] {
        if (newChildren == null) newChildren = <IBobrilNode[]>[];
        if (!isArray(newChildren)) {
            newChildren = [newChildren];
        }
        if (cachedChildren == null) cachedChildren = <IBobrilCacheNode>[];
        if (!isArray(cachedChildren)) {
            if (element.firstChild) element.removeChild(element.firstChild);
            cachedChildren = <any>[];
        }
        newChildren = newChildren.slice(0);
        var newLength = newChildren.length;
        var cachedLength = cachedChildren.length;
        var newIndex: number;
        for (newIndex = 0; newIndex < newLength;) {
            var item = newChildren[newIndex];
            if (isArray(item)) {
                newChildren.splice.apply(newChildren, [newIndex, 1].concat(item));
                newLength = newChildren.length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                newChildren.splice(newIndex, 1);
                newLength--;
                continue;
            }
            newChildren[newIndex] = item;
            newIndex++;
        }
        var newEnd = newLength;
        var cachedEnd = cachedLength;
        newIndex = 0;
        var cachedIndex = 0;
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
        var key: string;
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
        var cachedKey: string;
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
                cachedChildren[akpos + delta] = null;
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

    var now = Date.now || (() => (new Date).getTime());
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
    var fullRecreateRequested = false;
    var scheduled = false;
    var uptime = 0;
    var frame = 0;
    var lastFrameDuration = 0;
    var renderFrameBegin = 0;

    var regEvents: { [name: string]: Array<(ev: any, target: Node, node: IBobrilCacheNode) => boolean> } = {};
    var registryEvents: { [name: string]: Array<{ priority: number; callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean }> } = {};

    function addEvent(name: string, priority: number, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean): void {
        var list = registryEvents[name] || [];
        list.push({ priority: priority, callback: callback });
        registryEvents[name] = list;
    }

    function emitEvent(name: string, ev: any, target: Node, node: IBobrilCacheNode): boolean {
        var events = regEvents[name];
        if (events) for (var i = 0; i < events.length; i++) {
            if (events[i](ev, target, node))
                return true;
        }
        return false;
    }

    function addListener(el: EventTarget, name: string) {
        if (name[0] == "!") return;
        function enhanceEvent(ev: Event) {
            ev = ev || window.event;
            var t = ev.target || ev.srcElement || el;
            var n = getCacheNode(<any>t);
            emitEvent(name, ev, <Node>t, n);
        }
        if (("on" + name) in window) el = window;
        if (el.addEventListener) {
            el.addEventListener(name, enhanceEvent);
        } else {
            (<MSEventAttachmentTarget><any>el).attachEvent("on" + name, enhanceEvent);
        }
    }

    var eventsCaptured = false;

    function initEvents() {
        if (eventsCaptured)
            return;
        eventsCaptured = true;
        var eventNames = objectKeys(registryEvents);
        for (var j = 0; j < eventNames.length; j++) {
            var eventName = eventNames[j];
            var arr = registryEvents[eventName];
            arr = arr.sort((a, b) => a.priority - b.priority);
            regEvents[eventName] = arr.map(v => v.callback);
        }
        registryEvents = null;
        var body = document.body;
        for (var i = 0; i < eventNames.length; i++) {
            addListener(body, eventNames[i]);
        }
    }

    function selectedUpdate(cache: IBobrilCacheNode[], element: Element, createBefore: Node) {
        var len = cache.length;
        for (var i = 0; i < len; i++) {
            var node = cache[i];
            var ctx = node.ctx;
            if (ctx != null && (<any>ctx)[ctxInvalidated] === frame) {
                var cloned:IBobrilNode = { data: ctx.data, component: node.component };
                cache[i] = updateNode(cloned, node, element, createBefore, (<any>ctx)[ctxDeepness]);
            } else if (isArray(node.children)) {
                var backupInSvg = inSvg;
                if (node.tag === "svg") inSvg = true;
                selectedUpdate(<IBobrilCacheNode[]>node.children, (<Element>node.element) || element, findNextNode(cache, i, len, createBefore));
                inSvg = backupInSvg;
            }
        }
    }

    var afterFrameCallback: (root: IBobrilCacheChildren) => void = () => { };

    function setAfterFrame(callback: (root: IBobrilCacheChildren) => void): (root: IBobrilCacheChildren) => void {
        var res = afterFrameCallback;
        afterFrameCallback = callback;
        return res;
    }

    function findLastNode(children: IBobrilCacheNode[]): Node {
        for (var i = children.length - 1; i >= 0; i--) {
            var c = children[i];
            var el = c.element;
            if (el != null) {
                if (isArray(el)) {
                    var l = (<Node[]>el).length;
                    if (l === 0)
                        continue;
                    return (<Node[]>el)[l - 1];
                }
                return <Node>el;
            }
            var ch = c.children;
            if (!isArray(ch))
                continue;
            var res = findLastNode(<IBobrilCacheNode[]>ch);
            if (res != null)
                return res;
        }
        return null;
    }

    function update(time: number) {
        renderFrameBegin = now();
        initEvents();
        frame++;
        uptime = time;
        scheduled = false;
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
            if (insertBefore != null) insertBefore = insertBefore.nextSibling;
            if (fullRefresh) {
                var newChildren = r.f();
                r.e = r.e || document.body;
                r.c = updateChildren(r.e, newChildren, rc, null, insertBefore, 1e6);
            }
            else {
                selectedUpdate(rc, r.e, insertBefore);
            }
        }
        callPostCallbacks();
        afterFrameCallback(roots["0"].c);
        lastFrameDuration = now() - renderFrameBegin;
    }

    function invalidate(ctx?: Object, deepness?: number) {
        if (fullRecreateRequested)
            return;
        if (ctx != null) {
            if (deepness == undefined) deepness = 1e6;
            if ((<any>ctx)[ctxInvalidated] !== frame + 1) {
                (<any>ctx)[ctxInvalidated] = frame + 1;
                (<any>ctx)[ctxDeepness] = deepness;
            } else {
                if (deepness > (<any>ctx)[ctxDeepness])
                    (<any>ctx)[ctxDeepness] = deepness;
            }
        } else {
            fullRecreateRequested = true;
        }
        if (scheduled)
            return;
        scheduled = true;
        requestAnimationFrame(update);
    }

    var lastRootId = 0;

    function addRoot(factory: () => IBobrilChildren, element?: HTMLElement): string {
        lastRootId++;
        var rootId = "" + lastRootId;
        roots[rootId] = { f: factory, e: element, c: [] };
        invalidate();
        return rootId;
    }

    function removeRoot(id: string): void {
        var root = roots[id];
        if (!root) return;
        if (root.c.length) {
            root.c = <any>updateChildren(root.e, <any>[], root.c, null, null, 1e9);
        }
        delete roots[id];
    }

    function getRoots(): IBobrilRoots {
        return roots;
    }

    function init(factory: () => any, element?: HTMLElement) {
        removeRoot("0");
        roots["0"] = { f: factory, e: element, c: [] };
        invalidate();
    }

    function bubbleEvent(node: IBobrilCacheNode, name: string, param: any): boolean {
        while (node) {
            var c = node.component;
            if (c) {
                var ctx = node.ctx;
                var m = (<any>c)[name];
                if (m) {
                    if (m.call(c, ctx, param))
                        return true;
                }
                m = (<any>c).shouldStopBubble;
                if (m) {
                    if (m.call(c, ctx, name, param))
                        break;
                }
            }
            node = node.parent;
        }
        return false;
    }

    function broadcastEventToNode(node: IBobrilCacheNode, name: string, param: any): boolean {
        if (!node)
            return false;
        var c = node.component;
        if (c) {
            var ctx = node.ctx;
            if (c.shouldStopBroadcast(ctx, name, param))
                return false;
            var m = (<any>c)[name];
            if (m) {
                if (m.call(c, ctx, param))
                    return true;
            }
        }
        return broadcastEvent(node, name, param);
    }

    function broadcastEvent(node: IBobrilCacheNode, name: string, param: any): boolean {
        if (!node)
            return false;
        var ch = node.children;
        if (isArray(ch)) {
            for (var i = 0; i < (<IBobrilCacheNode[]>ch).length; i++) {
                if (broadcastEventToNode((<IBobrilCacheNode[]>ch)[i], name, param))
                    return true;
            }
        } else {
            return broadcastEventToNode(ch, name, param);
        }
    }

    function merge(f1: Function, f2: Function): Function {
        return (...params: any[]) => {
            var result = f1.apply(this, params);
            if (result) return result;
            return f2.apply(this, params);
        }
    }

    var emptyObject = {};

    function mergeComponents(c1: IBobrilComponent, c2: IBobrilComponent) {
        var res = Object.create(c1);
        for (var i in c2) {
            if (!(i in <any>emptyObject)) {
                var m = (<any>c2)[i];
                var origM = (<any>c1)[i];
                if (i === "id") {
                    res[i] = ((origM != null) ? origM : "") + "/" + m;
                } else if (typeof m === "function" && origM != null && typeof origM === "function") {
                    res[i] = merge(origM, m);
                } else {
                    res[i] = m;
                }
            }
        }
        return res;
    }

    function preEnhance(node: IBobrilNode, methods: IBobrilComponent): IBobrilNode {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(methods, comp);
        return node;
    }

    function postEnhance(node: IBobrilNode, methods: IBobrilComponent): IBobrilNode {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(comp, methods);
        return node;
    }

    function assign(target: Object, source: Object): Object {
        if (target == null) target = {};
        if (source != null) for (var propname in source) {
            if (!source.hasOwnProperty(propname)) continue;
            (<any>target)[propname] = (<any>source)[propname];
        }
        return target;
    }

    function preventDefault(event: Event) {
        var pd = event.preventDefault;
        if (pd) pd.call(event); else (<any>event).returnValue = false;
    }

    function cloneNodeArray(a: IBobrilChild[]): IBobrilChild[] {
        a = a.slice(0);
        for (var i = 0; i < a.length; i++) {
            var n = a[i];
            if (isArray(n)) {
                a[i] = cloneNodeArray(<IBobrilChild[]>n);
            } else if (isObject(n)) {
                a[i] = cloneNode(n);
            }
        }
        return a;
    }

    function cloneNode(node: IBobrilNode): IBobrilNode {
        var r = <IBobrilNode>b.assign({}, node);
        if (r.attrs) {
            r.attrs = <IBobrilAttributes>b.assign({}, r.attrs);
        }
        if (isObject(r.style)) {
            r.style = b.assign({}, r.style);
        }
        var ch = r.children;
        if (ch) {
            if (isArray(ch)) {
                r.children = cloneNodeArray(<IBobrilChild[]>ch);
            } else if (isObject(ch)) {
                r.children = cloneNode(ch);
            }
        }
        return r;
    }

    return {
        createNode: createNode,
        updateNode: updateNode,
        updateChildren: updateChildren,
        callPostCallbacks: callPostCallbacks,
        setSetValue: setSetValue,
        setStyleShim: (name: string, action: (style: any, value: any, oldName: string) => void) => mapping[name] = action,
        init: init,
        addRoot: addRoot,
        removeRoot: removeRoot,
        getRoots: getRoots,
        setAfterFrame: setAfterFrame,
        isArray: isArray,
        uptime: () => uptime,
        lastFrameDuration: () => lastFrameDuration,
        now: now,
        frame: () => frame,
        assign: assign,
        ieVersion: ieVersion,
        invalidate: invalidate,
        invalidated: () => scheduled,
        preventDefault: preventDefault,
        vdomPath: vdomPath,
        deref: getCacheNode,
        addEvent: addEvent,
        emitEvent: emitEvent,
        bubble: bubbleEvent,
        broadcast: broadcastEvent,
        preEnhance: preEnhance,
        postEnhance: postEnhance,
        cloneNode: cloneNode
    };
})(window, document);
