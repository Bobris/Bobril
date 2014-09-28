module Bobril {
    function assert(shoudBeTrue: boolean, messageIfFalse: string) {
        if (!shoudBeTrue)
            throw Error(messageIfFalse);
    }

    var objectToString = {}.toString;
    var isArray = Array.isArray || ((a: any) => objectToString.call(a) === "[object Array]");

    export interface IBobrilAttributes {
        id?: string;
        href?: string;
        className?: string;
        style?: Object;
        [name: string]: any;
    }

    export interface IBobrilComponent {
        init? (ctx: Object, me: IBobrilNode): void;
        shouldChange? (ctx: Object, me: IBobrilNode, oldMe: IBobrilNode): boolean;
        postInitDom? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
        postUpdateDom? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
        delayInit? (ctx: Object, me: IBobrilNode, element: HTMLElement, time: number): number;
        delayStopInit? (ctx: Object, me: IBobrilNode, element: HTMLElement, time: number): boolean;
        delayDestroy? (ctx: Object, me: IBobrilNode, element: HTMLElement, time: number): number;
        preventDestroy? (ctx: Object, me: IBobrilNode): boolean;
        destroy? (ctx: Object, me: IBobrilNode, element: HTMLElement): void;
        onInput? (value: string): void;
        onKeyDown? (key: number): boolean;
    }

    export interface IBobrilNode {
        tag: string;
        key?: string;
        /** string|number|boolean */
        content?: any;
        attrs?: IBobrilAttributes;
        /** string|number|boolean|IBobrilNode|(string|number|boolean|IBobrilNode)[] */
        children?: any;
        component?: IBobrilComponent;
    }

    export interface IBobrilCacheNode extends IBobrilNode {
        /** HTMLNode | HTMLNode[] */
        element?: any;
        componentInstance?: Object;
    }

    export class Bobril {
        constructor() {
        }

        static updateElement(el: HTMLElement, newAttrs: IBobrilAttributes, oldAttrs: IBobrilAttributes, inNamespace: boolean): IBobrilAttributes {
            if (!newAttrs) return undefined;
            for (var attrName in newAttrs) {
                var newAttr = newAttrs[attrName];
                var oldAttr = oldAttrs[attrName];
                if ((oldAttr === undefined) || (oldAttr !== newAttr)) {
                    oldAttrs[attrName] = newAttr;
                    if (attrName === "style") {
                        if (oldAttr) {
                            for (var rule in newAttr) {
                                var v = newAttr[rule];
                                if (oldAttr[rule] !== v) el.style[rule] = v;
                            }
                            for (var rule in oldAttr) {
                                if (!(rule in newAttr)) el.style[rule] = "";
                            }
                        } else {
                            for (var rule in newAttr) {
                                el.style[rule] = newAttr[rule];
                            }
                        }
                    } else if (inNamespace) {
                        if (attrName === "href") el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);
                        else if (attrName === "className") el.setAttribute("class", newAttr);
                        else el.setAttribute(attrName, newAttr);
                    } else if (attrName in el && !(attrName == "list" || attrName == "form")) {
                        (<any>el)[attrName] = newAttr;
                    } else el.setAttribute(attrName, newAttr);
                }
            }
            return oldAttrs;
        }

        static createNode(n: IBobrilNode, inNamespace: boolean): IBobrilCacheNode {
            var c = <IBobrilCacheNode>n;
            if (c.component) {
                c.componentInstance = {};
                if (c.component.init) {
                    c.component.init(c.componentInstance, n);
                }
            }
            if (n.tag === "") {
                c.element = window.document.createTextNode("" + c.content);
                return c;
            } else if (n.tag === "svg") {
                c.element = window.document.createElementNS("http://www.w3.org/2000/svg", n.tag);
                inNamespace = true;
            } else {
                c.element = window.document.createElement(n.tag);
            }
            Bobril.createChildren(c, inNamespace);
            c.attrs = Bobril.updateElement(c.element, c.attrs, {}, inNamespace);
            return c;
        }

        static normalizeNode(n: any): IBobrilNode {
            var t = typeof n;
            if (t === "string" || t === "number" || t === "boolean") {
                return { tag: "", content: n };
            }
            return <IBobrilNode>n;
        }

        static createChildren(c: IBobrilCacheNode, inNamespace: boolean) {
            var ch = c.children;
            if (!ch)
                return;
            if (!Array.isArray(ch)) {
                ch = [ch];
            }
            var i = 0, l = ch.length;
            while (i < l) {
                var item = ch[i];
                if (isArray(item)) {
                    ch.splice.apply(ch, [i, 1].concat(item));
                    l = ch.length;
                    continue;
                }
                var j = ch[i] = Bobril.createNode(Bobril.normalizeNode(item), inNamespace);
                c.element.appendChild(j.element);
                i++;
            }
            c.children = ch;
        }

        static destroyNode(c: IBobrilCacheNode) {
            var ch = c.children;
            if (ch) {
                for (var i = 0, l = ch.length; i < l; i++) {
                    Bobril.destroyNode(ch[i]);
                }
            }
            if (c.component) {
                if (c.component.destroy)
                    c.component.destroy(c.componentInstance, c, c.element);
            }
        }

        static removeNode(c: IBobrilCacheNode) {
            Bobril.destroyNode(c);
            c.element.parentNode.removeChild(c.element);
        }

        static updateNode(n: IBobrilNode, c: IBobrilCacheNode, inNamespace: boolean): IBobrilCacheNode {
            if (n.component && c.component) {
                if (n.component.shouldChange)
                    if (!n.component.shouldChange(c.componentInstance, n, c))
                        return c;
            }
            if (n.tag === c.tag) {
                if (n.tag === "") {
                    if (c.content !== n.content) {
                        c.content = n.content;
                        if ('textContent' in c.element) {
                            c.element.textContent = "" + c.content;
                            return c;
                        }
                    }
                    else return c;
                }
                else if (!n.attrs && !c.attrs) {
                    Bobril.updateChildren(n, c, inNamespace);
                    return c;
                }
                else if (n.attrs && c.attrs && Object.keys(n.attrs).join() === Object.keys(c.attrs).join() && n.attrs.id === c.attrs.id) {
                    Bobril.updateChildren(n, c, inNamespace);
                    c.attrs = Bobril.updateElement(c.element, n.attrs, c.attrs, inNamespace);
                    return c;
                }
            }
            var r = Bobril.createNode(n, inNamespace);
            if (c.element.parentElement) {
                c.element.parentElement.insertBefore(r.element, c.element);
            }
            Bobril.removeNode(c);
            return r;
        }

        static updateChildren(n: IBobrilNode, c: IBobrilCacheNode, inNamespace: boolean): void {
            var newChildren = n.children || [];
            if (!isArray(newChildren))
                newChildren = [newChildren];
            var cachedChildren = c.children || [];
            var newLength = newChildren.length;
            var cachedLength = cachedChildren.length;
            var minNewCachedLength = newLength < cachedLength ? newLength : cachedLength;
            for (var newIndex = 0; newIndex < newLength;) {
                var item = newChildren[newIndex];
                if (isArray(item)) {
                    newChildren.splice.apply(newChildren, [newIndex, 1].concat(item));
                    newLength = newChildren.length;
                    continue;
                }
                newChildren[newIndex] = Bobril.normalizeNode(item);
                newIndex++;
            }
            newIndex = 0;
            var element = c.element;
            for (; newIndex < minNewCachedLength; newIndex++) {
                if (newChildren[newIndex].key !== cachedChildren[newIndex].key)
                    break;
                cachedChildren[newIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[newIndex], inNamespace);
            }
            if (newIndex === minNewCachedLength) {
                // all keys up to common length were identical = simple case
                while (newIndex < newLength) {
                    cachedChildren.push(Bobril.createNode(newChildren[newIndex], inNamespace));
                    element.appendChild(cachedChildren[newIndex].element);
                    newIndex++;
                }
                while (cachedLength > newIndex) {
                    cachedLength--;
                    Bobril.removeNode(cachedChildren[cachedLength]);
                    cachedChildren.pop();
                }
            } else {
                // order of keyed nodes ware changed => reorder keyed nodes first
                var cachedIndex: number;
                var cachedKeys: { [keyName: string]: number } = {};
                var newKeys: { [keyName: string]: number } = {};
                var key:string;
                var node: IBobrilNode;
                var backupCommonIndex = newIndex;
                var deltaKeyless = 0;
                for (cachedIndex = backupCommonIndex; cachedIndex < cachedLength; cachedIndex++) {
                    node = cachedChildren[cachedIndex];
                    key = node.key;
                    if (key !== undefined && !(key in cachedKeys))
                        cachedKeys[key] = cachedIndex;
                    else
                        deltaKeyless--;
                }
                for (; newIndex < newLength; newIndex++) {
                    node = newChildren[newIndex];
                    key = node.key;
                    if (key !== undefined && !(key in newKeys))
                        newKeys[key] = newIndex;
                    else
                        deltaKeyless++;
                }
                var delta = 0;
                newIndex = backupCommonIndex;
                cachedIndex = backupCommonIndex;
                var cachedKey: string;
                while (cachedIndex < cachedLength && newIndex < newLength) {
                    if (cachedChildren[cachedIndex] === null) { // already moved somethere else
                        cachedChildren.splice(cachedIndex, 1);
                        cachedLength--;
                        delta--;
                        continue;
                    }
                    cachedKey = cachedChildren[cachedIndex].key;
                    if (!cachedKey) {
                        cachedIndex++;
                        continue;
                    }
                    key = newChildren[newIndex].key;
                    if (!key) {
                        newIndex++;
                        while (newIndex < newLength) {
                            key = newChildren[newIndex].key;
                            if (key)
                                break;                            
                        }
                        if (!key)
                            break;
                    }
                    var akpos = cachedKeys[key];
                    if (akpos === undefined) {
                        // New key
                        cachedChildren.splice(cachedIndex, 0, Bobril.createNode(newChildren[newIndex], inNamespace));
                        element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                        delta++;
                        newIndex++;
                        cachedIndex++;
                        cachedLength++;
                        continue;
                    }
                    if (!(cachedKey in newKeys)) {
                        // Old key
                        Bobril.removeNode(cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex, 1);
                        delta--;
                        cachedLength--;
                        continue;
                    }
                    if (cachedIndex === akpos + delta) {
                        // Inplace update
                        cachedChildren[cachedIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[cachedIndex], inNamespace);
                        newIndex++;
                        cachedIndex++;
                    } else {
                        // Move
                        cachedChildren.splice(cachedIndex, 0, cachedChildren[akpos + delta]);
                        delta++;
                        cachedChildren[akpos + delta] = null;
                        element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                        cachedChildren[cachedIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[cachedIndex], inNamespace);
                        cachedIndex++;
                        cachedLength++;
                        newIndex++;
                    }
                }
                // remove old keyed cached nodes
                while (cachedIndex < cachedLength) {
                    if (cachedChildren[cachedIndex] === null) { // already moved somethere else
                        cachedChildren.splice(cachedIndex, 1);
                        cachedLength--;
                        continue;
                    }
                    if (cachedChildren[cachedIndex].key) { // this key is only in old
                        Bobril.removeNode(cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex, 1);
                        cachedLength--;
                        continue;
                    }
                    cachedIndex++;
                }
                // add new keyed nodes
                while (newIndex < newLength) {
                    key = newChildren[newIndex].key;
                    if (key) {
                        cachedChildren.push(Bobril.createNode(newChildren[newIndex], inNamespace));
                        element.insertBefore(cachedChildren[cachedIndex].element, cachedChildren[cachedIndex + 1].element);
                        delta++;
                        cachedIndex++;
                        cachedLength++;
                    }
                    newIndex++;
                }
                // reorder just nonkeyed nodes
                newIndex = cachedIndex = backupCommonIndex;
                while (newIndex < newLength) {
                    if (cachedIndex < cachedLength) {
                        cachedKey = cachedChildren[cachedIndex].key;
                        if (cachedKey) {
                            cachedIndex++;
                            continue;
                        }
                    }
                    key = newChildren[newIndex].key;
                    if (key === cachedChildren[newIndex].key) {
                        if (key) {
                            newIndex++;
                            continue;
                        }
                        cachedChildren[newIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[newIndex], inNamespace);
                        newIndex++;
                        if (cachedIndex < newIndex) cachedIndex = newIndex;
                        continue;
                    }
                    if (key) {
                        if (newIndex !== cachedIndex) throw Error("assertion failed");
                        if (newLength - newIndex - deltaKeyless == cachedLength - cachedIndex) {
                            while (true) {
                                Bobril.removeNode(cachedChildren[cachedIndex]);
                                cachedChildren.splice(cachedIndex, 1);
                                cachedLength--;
                                deltaKeyless++;
                                assert(cachedIndex !== cachedLength, "there still need to exist key node");
                                if (cachedChildren[cachedIndex].key)
                                    break;
                            }
                            continue;
                        }
                        while (!cachedChildren[cachedIndex].key)
                            cachedIndex++;
                        if (key !== cachedChildren[cachedIndex].key) throw Error("assertion failed");
                        cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex + 1, 1);
                        element.insertBefore(cachedChildren[newIndex].element, cachedChildren[newIndex + 1].element);
                        newIndex++;
                        cachedIndex = newIndex;
                        continue;
                    }
                    if (cachedIndex < cachedLength) {
                        cachedChildren.splice(newIndex, 0, cachedChildren[cachedIndex]);
                        cachedChildren.splice(cachedIndex + 1, 1);
                        if (key) {
                            newIndex++;
                            while (newIndex < newLength) {
                                key = newChildren[newIndex].key;
                                if (!key)
                                    break;
                            }
                            if (key)
                                break;
                        }
                        cachedChildren[cachedIndex] = Bobril.updateNode(newChildren[newIndex], cachedChildren[cachedIndex], inNamespace);
                        newIndex++;
                        cachedIndex++;
                    } else {
                        cachedChildren.push(Bobril.createNode(newChildren[newIndex], inNamespace));
                        element.appendChild(cachedChildren[cachedIndex].element);
                        newIndex++;
                        cachedIndex++;
                        cachedLength++;
                    }
                }
                while (cachedLength > newIndex) {
                    cachedLength--;
                    Bobril.removeNode(cachedChildren[cachedLength]);
                    cachedChildren.pop();
                }
            }
            c.children = cachedChildren;
        }
    }

}

export = Bobril;
