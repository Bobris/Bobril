/// <reference path="../src/bobril.d.ts"/>
// ReSharper disable InconsistentNaming
declare var DEBUG: boolean;
// ReSharper restore InconsistentNaming
if (typeof DEBUG === "undefined") DEBUG = true;

// IE8 [].map polyfill Reference: http://es5.github.io/#x15.4.4.19
if (!Array.prototype.map) {
    Array.prototype.map = function (callback: any, thisArg: any) {
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

    var hasTextContent = "textContent" in createTextNode("");

    function isObject(value: any): boolean {
        return typeof value === "object";
    }

    var inNamespace: boolean = false;
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

    var setStyleCallback: (newValue: any) => void = (): void => {
    }

    function setSetStyle(callback: (newValue: any) => void): (newValue: any) => void {
        var prev = setStyleCallback;
        setStyleCallback = callback;
        return prev;
    }

    function updateElement(n: IBobrilCacheNode, el: HTMLElement, newAttrs: IBobrilAttributes, oldAttrs: IBobrilAttributes): IBobrilAttributes {
        if (!newAttrs) return undefined;
        var attrName: string, newAttr: any, oldAttr: any, valueOldAttr: any, valueNewAttr: any;
        for (attrName in newAttrs) {
            newAttr = newAttrs[attrName];
            oldAttr = oldAttrs[attrName];
            if (attrName === "value" && !inNamespace) {
                valueOldAttr = oldAttr;
                valueNewAttr = newAttr;
                oldAttrs[attrName] = newAttr;
                continue;
            }
            if (oldAttr !== newAttr) {
                oldAttrs[attrName] = newAttr;
                if (attrName === "style") {
                    if (isObject(newAttr)) {
                        setStyleCallback(newAttr);
                        var rule: string;
                        if (isObject(oldAttr)) {
                            for (rule in oldAttr) {
                                if (!(rule in newAttr)) el.style[<any>rule] = "";
                            }
                            for (rule in newAttr) {
                                var v = newAttr[rule];
                                if (v !== undefined) {
                                    if (oldAttr[rule] !== v) el.style[<any>rule] = v;
                                } else {
                                    el.style[<any>rule] = "";
                                }
                            }
                        } else {
                            if (oldAttr)
                                el.style.cssText = "";
                            for (rule in newAttr) {
                                el.style[<any>rule] = newAttr[rule];
                            }
                        }
                    } else {
                        el.style.cssText = newAttr;
                    }
                } else if (inNamespace) {
                    if (attrName === "href") el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);
                    else if (attrName === "className") el.setAttribute("class", newAttr);
                    else el.setAttribute(attrName, newAttr);
                } else if (attrName === "value") {
                    valueOldAttr = oldAttr;
                    valueNewAttr = newAttr;
                } else if (attrName in el && !(attrName === "list" || attrName === "form")) {
                    (<any>el)[attrName] = newAttr;
                } else el.setAttribute(attrName, newAttr);
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

    function createNode(n: IBobrilNode, parentNode: IBobrilNode): IBobrilCacheNode {
        var c = <IBobrilCacheNode>n;
        var backupInNamespace = inNamespace;
        var backupInSvg = inSvg;
        var component = c.component;
        if (component) {
            c.ctx = { data: c.data || {} };
            if (component.init) {
                component.init(c.ctx, n);
            }
            if (component.render) {
                component.render(c.ctx, n);
            }
        }
        if (n.tag === "") {
            c.element = createTextNode(c.children);
            return c;
        } else if (n.tag === "/") {
            return c;
        } else if (inSvg || n.tag === "svg") {
            c.element = document.createElementNS("http://www.w3.org/2000/svg", n.tag);
            inNamespace = true;
            inSvg = true;
        } else {
            c.element = document.createElement(n.tag);
        }
        createChildren(c);
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, n);
            }
        }
        c.attrs = updateElement(c, c.element, c.attrs, {});
        inNamespace = backupInNamespace;
        inSvg = backupInSvg;
        pushInitCallback(c, false);
        c.parent = parentNode;
        return c;
    }

    function normalizeNode(n: any): IBobrilNode {
        var t = typeof n;
        if (t === "string") {
            return { tag: "", children: n };
        }
        if (t === "boolean") return null;
        return <IBobrilNode>n;
    }

    function createChildren(c: IBobrilCacheNode): void {
        var ch = c.children;
        var element = c.element;
        if (!ch)
            return;
        if (!isArray(ch)) {
            var type = typeof ch;
            if (type === "string") {
                if (hasTextContent) {
                    element.textContent = ch;
                } else {
                    element.innerText = ch;
                }
                return;
            }
            ch = [ch];
        }
        ch = ch.slice(0);
        var i = 0, l = ch.length;
        while (i < l) {
            var item = ch[i];
            if (isArray(item)) {
                ch.splice.apply(ch, [i, 1].concat(item));
                l = ch.length;
                continue;
            }
            item = normalizeNode(item);
            if (item == null) {
                ch.splice(i, 1);
                l--;
                continue;
            }
            var j = ch[i] = createNode(item, c);
            if (j.tag === "/") {
                var before = element.lastChild;
                c.element.insertAdjacentHTML("beforeend", j.children);
                j.element = <any>[];
                if (before) {
                    before = before.nextSibling;
                } else {
                    before = element.firstChild;
                }
                while (before) {
                    j.element.push(before);
                    before = before.nextSibling;
                }
            } else {
                element.appendChild(j.element);
            }
            i++;
        }
        c.children = ch;
    }

    function destroyNode(c: IBobrilCacheNode) {
        var ch = c.children;
        if (isArray(ch)) {
            for (var i = 0, l = ch.length; i < l; i++) {
                destroyNode(ch[i]);
            }
        }
        var component = c.component;
        if (component) {
            if (component.destroy)
                component.destroy(c.ctx, c, c.element);
        }
    }

    function removeNode(c: IBobrilCacheNode) {
        destroyNode(c);
        var el = c.element;
        c.parent = null;
        if (isArray(el)) {
            var pa = el[0].parentNode;
            if (pa) {
                for (var i = 0; i < el.length; i++) {
                    pa.removeChild(el[i]);
                }
            }
        } else {
            var p = el.parentNode;
            if (p) p.removeChild(el);
        }
    }

    var rootFactory: () => any;
    var rootCacheChildren: Array<IBobrilCacheNode> = [];

    function vdomPath(n: Node): IBobrilCacheNode[] {
        var res: IBobrilCacheNode[] = [];
        if (n == null) return res;
        var root = document.body;
        var nodeStack: Node[] = [];
        while (n && n !== root) {
            nodeStack.push(n);
            n = n.parentNode;
        }
        if (!n) return res;
        var currentCacheArray = rootCacheChildren;
        while (nodeStack.length) {
            var currentNode = nodeStack.pop();
            for (var i = 0, l = currentCacheArray.length; i < l; i++) {
                var bn = currentCacheArray[i];
                if (bn.element === currentNode) {
                    res.push(bn);
                    currentCacheArray = bn.children;
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

    function updateNode(n: IBobrilNode, c: IBobrilCacheNode): IBobrilCacheNode {
        var component = n.component;
        var backupInNamespace = inNamespace;
        var backupInSvg = inSvg;
        var bigChange = false;
        if (component && c.ctx != null) {
            if (component.id !== c.component.id) {
                bigChange = true;
            } else {
                if (component.shouldChange)
                    if (!component.shouldChange(c.ctx, n, c))
                        return c;
                (<any>c.ctx).data = n.data || {};
                c.component = component;
                if (component.render)
                    component.render(c.ctx, n, c);
            }
        }
        var el: any;
        if (bigChange || (component && c.ctx == null)) {
            // it is big change of component.id or old one was not even component => recreate
        } else if (n.tag === "/") {
            el = c.element;
            if (isArray(el)) el = el[0];
            var elprev = el.previousSibling;
            var removeEl = false;
            var parent = el.parentNode;
            if (!el.insertAdjacentHTML) {
                el = parent.insertBefore(document.createElement("i"), el);
                removeEl = true;
            }
            el.insertAdjacentHTML("beforebegin", n.children);
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
            removeNode(c);
            return n;
        }
        else if (n.tag === c.tag && (inSvg || !inNamespace)) {
            if (n.tag === "") {
                if (c.children !== n.children) {
                    c.children = n.children;
                    el = c.element;
                    if (hasTextContent) {
                        el.textContent = c.children;
                    } else {
                        el.nodeValue = c.children;
                    }
                }
                return c;
            } else {
                if (n.tag === "svg") {
                    inNamespace = true;
                    inSvg = true;
                }
                if (!n.attrs && !c.attrs || n.attrs && c.attrs && objectKeys(n.attrs).join() === objectKeys(c.attrs).join() && n.attrs.id === c.attrs.id) {
                    updateChildrenNode(n, c);
                    if (component) {
                        if (component.postRender) {
                            component.postRender(c.ctx, n, c);
                        }
                    }
                    if (c.attrs)
                        c.attrs = updateElement(c, c.element, n.attrs, c.attrs);
                    inNamespace = backupInNamespace;
                    inSvg = backupInSvg;
                    pushInitCallback(c, true);
                    return c;
                }
                inSvg = backupInSvg;
                inNamespace = backupInNamespace;
            }
        }
        var r = createNode(n, c.parent);
        var pn = c.element.parentNode;
        if (pn) {
            pn.insertBefore(r.element, c.element);
        }
        removeNode(c);
        return r;
    }

    function callPostCallbacks() {
        var count = updateInstance.length;
        for (var i = 0; i < count; i++) {
            var n = updateInstance[i];
            if (updateCall[i]) {
                n.component.postUpdateDom(n.ctx, n, n.element);
            } else {
                n.component.postInitDom(n.ctx, n, n.element);
            }
        }
        updateCall = [];
        updateInstance = [];
    }

    function updateChildren(element: HTMLElement, newChildren: any, cachedChildren: any, parentNode: IBobrilNode): Array<IBobrilCacheNode> {
        if (newChildren == null) newChildren = <any>[];
        if (!isArray(newChildren)) {
            var type = typeof newChildren;
            if ((type === "string") && !isArray(cachedChildren)) {
                if (newChildren === cachedChildren) return cachedChildren;
                if (hasTextContent) {
                    element.textContent = newChildren;
                } else {
                    element.innerText = newChildren;
                }
                return newChildren;
            }
            newChildren = [newChildren];
        }
        if (cachedChildren == null) cachedChildren = <any>[];
        if (!isArray(cachedChildren)) {
            element.removeChild(element.firstChild);
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
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                newIndex++;
                cachedIndex++;
                continue;
            }
            while (true) {
                if (newChildren[newEnd - 1].key === cachedChildren[cachedEnd - 1].key) {
                    newEnd--;
                    cachedEnd--;
                    cachedChildren[cachedEnd] = updateNode(newChildren[newEnd], cachedChildren[cachedEnd]);
                    if (newIndex < newEnd && cachedIndex < cachedEnd)
                        continue;
                }
                break;
            }
            if (newIndex < newEnd && cachedIndex < cachedEnd) {
                if (newChildren[newIndex].key === cachedChildren[cachedEnd - 1].key) {
                    element.insertBefore(cachedChildren[cachedEnd - 1].element, cachedChildren[cachedIndex].element);
                    cachedChildren.splice(cachedIndex, 0, cachedChildren[cachedEnd - 1]);
                    cachedChildren.splice(cachedEnd, 1);
                    cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                    newIndex++;
                    cachedIndex++;
                    continue;
                }
                if (newChildren[newEnd - 1].key === cachedChildren[cachedIndex].key) {
                    element.insertBefore(cachedChildren[cachedIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
                    cachedChildren.splice(cachedEnd, 0, cachedChildren[cachedIndex]);
                    cachedChildren.splice(cachedIndex, 1);
                    cachedEnd--;
                    newEnd--;
                    cachedChildren[cachedEnd] = updateNode(newChildren[newEnd], cachedChildren[cachedEnd]);
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
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[newIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
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
        var cachedKeys: { [keyName: string]: number } = {};
        var newKeys: { [keyName: string]: number } = {};
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
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
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
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
                newIndex++;
                cachedIndex++;
            } else {
                // Move
                cachedChildren.splice(cachedIndex, 0, cachedChildren[akpos + delta]);
                delta++;
                cachedChildren[akpos + delta] = null;
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                cachedChildren[cachedIndex] = updateNode(newChildren[newIndex], cachedChildren[cachedIndex]);
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
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[cachedIndex].element, cachedEnd === cachedLength ? null : cachedChildren[cachedEnd].element);
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
                cachedChildren[newIndex] = updateNode(newChildren[newIndex], cachedChildren[newIndex]);
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
                element.insertBefore(cachedChildren[newIndex].element, cachedChildren[newIndex + 1].element);
                newIndex++;
                cachedIndex = newIndex;
                continue;
            }
            if (cachedIndex < cachedEnd) {
                element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[newIndex].element);
                cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                cachedChildren.splice(cachedIndex + 1, 1);
                cachedChildren[newIndex] = updateNode(newChildren[newIndex], cachedChildren[newIndex]);
                keyLess--;
                newIndex++;
                cachedIndex++;
            } else {
                cachedChildren.splice(newIndex, 0, createNode(newChildren[newIndex], parentNode));
                cachedEnd++;
                cachedLength++;
                element.insertBefore(cachedChildren[newIndex].element, newIndex + 1 === cachedLength ? null : cachedChildren[newIndex + 1].element);
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

    function updateChildrenNode(n: IBobrilNode, c: IBobrilCacheNode): void {
        c.children = updateChildren(c.element, n.children, c.children, c);
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

    var scheduled = false;
    var uptime = 0;

    var regEvents: { [name: string]: Array<(ev: Event, target: Node, node: IBobrilCacheNode) => boolean> } = {};
    var registryEvents: { [name: string]: Array<{ priority: number; callback: (ev: Event, target: Node, node: IBobrilCacheNode) => boolean }> } = {};

    function addEvent(name: string, priority: number, callback: (ev: Event, target: Node, node: IBobrilCacheNode) => boolean): void {
        var list = registryEvents[name] || [];
        list.push({ priority: priority, callback: callback });
        registryEvents[name] = list;
    }

    function emitEvent(name: string, ev: Event, target: Node, node: IBobrilCacheNode) {
        var events = regEvents[name];
        if (events) for (var i = 0; i < events.length; i++) {
            if (events[i](ev, target, node))
                break;
        }
    }

    function addListener(el: EventTarget, name: string) {
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

    function update(time: number) {
        initEvents();
        uptime = time;
        scheduled = false;
        var newChildren = rootFactory();
        rootCacheChildren = updateChildren(document.body, newChildren, rootCacheChildren, null);
        callPostCallbacks();
    }

    function scheduleUpdate() {
        if (scheduled)
            return;
        scheduled = true;
        requestAnimationFrame(update);
    }

    function init(factory: () => any) {
        if (rootCacheChildren.length) {
            rootCacheChildren = updateChildren(document.body, <any>[], rootCacheChildren, null);
        }
        rootFactory = factory;
        scheduleUpdate();
    }

    function bubbleEvent(node: IBobrilCacheNode, name: string, param: any): boolean {
        while (node) {
            var c = node.component;
            if (c) {
                var m = (<any>c)[name];
                if (m) {
                    if (m.call(c, node.ctx, param))
                        return true;
                }
            }
            node = node.parent;
        }
        return false;
    }

    function merge(f1: Function, f2: Function): Function {
        return () => {
            var result = f1.apply(this, arguments);
            if (result) return result;
            return f2.apply(this, arguments);
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
                } else if (typeof m === "function" && origM!=null && typeof origM === "function") {
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

    return {
        createNode: createNode,
        updateNode: updateNode,
        updateChildren: updateChildren,
        callPostCallbacks: callPostCallbacks,
        setSetValue: setSetValue,
        setSetStyle: setSetStyle,
        init: init,
        isArray: isArray,
        uptime: () => uptime,
        now: now,
        assign: assign,
        ieVersion: () => document.documentMode,
        invalidate: scheduleUpdate,
        preventDefault: preventDefault,
        vmlNode: () => inNamespace = true,
        vdomPath: vdomPath,
        deref: getCacheNode,
        addEvent: addEvent,
        bubble: bubbleEvent,
        preEnhance: preEnhance,
        postEnhance: postEnhance
    };
})(window, document);
