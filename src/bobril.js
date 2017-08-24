/// <reference path="bobril.d.ts"/>
if (typeof DEBUG === "undefined")
    DEBUG = true;
b = (function (window, document) {
    function assert(shoudBeTrue, messageIfFalse) {
        if (DEBUG && !shoudBeTrue)
            throw Error(messageIfFalse || "assertion failed");
    }
    var isArray = Array.isArray;
    function createTextNode(content) {
        return document.createTextNode(content);
    }
    function createElement(name) {
        return document.createElement(name);
    }
    var hasTextContent = "textContent" in createTextNode("");
    function isObject(value) {
        return typeof value === "object";
    }
    function flatten(a) {
        if (!isArray(a)) {
            if (a == null || a === false || a === true)
                return [];
            return [a];
        }
        a = a.slice(0);
        var alen = a.length;
        for (var i = 0; i < alen;) {
            var item = a[i];
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
    var inSvg = false;
    var updateCall = [];
    var updateInstance = [];
    var setValueCallback = function (el, node, newValue, oldValue) {
        if (newValue !== oldValue)
            el["value"] = newValue;
    };
    function setSetValue(callback) {
        var prev = setValueCallback;
        setValueCallback = callback;
        return prev;
    }
    function newHashObj() {
        return Object.create(null);
    }
    var vendors = ["Webkit", "Moz", "ms", "O"];
    var testingDivStyle = document.createElement("div").style;
    function testPropExistence(name) {
        return typeof testingDivStyle[name] === "string";
    }
    var mapping = newHashObj();
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
    function renamer(newName) {
        return function (style, value, oldName) {
            style[newName] = value;
            style[oldName] = undefined;
        };
    }
    ;
    function renamerpx(newName) {
        return function (style, value, oldName) {
            if (typeof value === "number") {
                style[newName] = value + "px";
            }
            else {
                style[newName] = value;
            }
            style[oldName] = undefined;
        };
    }
    function pxadder(style, value, name) {
        if (typeof value === "number")
            style[name] = value + "px";
    }
    function ieVersion() {
        return document.documentMode;
    }
    function shimStyle(newValue) {
        var k = Object.keys(newValue);
        for (var i = 0, l = k.length; i < l; i++) {
            var ki = k[i];
            var mi = mapping[ki];
            var vi = newValue[ki];
            if (vi === undefined)
                continue; // don't want to map undefined
            if (mi === undefined) {
                if (DEBUG) {
                    if (ki === "float" && window.console && console.error)
                        console.error("In style instead of 'float' you have to use 'cssFloat'");
                    if (/-/.test(ki) && window.console && console.warn)
                        console.warn("Style property " + ki + " contains dash (must use JS props instead of css names)");
                }
                if (testPropExistence(ki)) {
                    mi = (isUnitlessNumber[ki] === true) ? null : pxadder;
                }
                else {
                    var titleCaseKi = ki.replace(/^\w/, function (match) { return match.toUpperCase(); });
                    for (var j = 0; j < vendors.length; j++) {
                        if (testPropExistence(vendors[j] + titleCaseKi)) {
                            mi = ((isUnitlessNumber[ki] === true) ? renamer : renamerpx)(vendors[j] + titleCaseKi);
                            break;
                        }
                    }
                    if (mi === undefined) {
                        mi = (isUnitlessNumber[ki] === true) ? null : pxadder;
                        if (DEBUG && window.console && console.warn)
                            console.warn("Style property " + ki + " is not supported in this browser");
                    }
                }
                mapping[ki] = mi;
            }
            if (mi !== null)
                mi(newValue, vi, ki);
        }
    }
    function removeProperty(s, name) {
        s[name] = "";
    }
    function updateStyle(n, el, newStyle, oldStyle) {
        var s = el.style;
        if (isObject(newStyle)) {
            shimStyle(newStyle);
            var rule;
            if (isObject(oldStyle)) {
                for (rule in oldStyle) {
                    if (!(rule in newStyle))
                        removeProperty(s, rule);
                }
                for (rule in newStyle) {
                    var v = newStyle[rule];
                    if (v !== undefined) {
                        if (oldStyle[rule] !== v)
                            s[rule] = v;
                    }
                    else {
                        removeProperty(s, rule);
                    }
                }
            }
            else {
                if (oldStyle)
                    s.cssText = "";
                for (rule in newStyle) {
                    var v = newStyle[rule];
                    if (v !== undefined)
                        s[rule] = v;
                }
            }
        }
        else if (newStyle) {
            s.cssText = newStyle;
        }
        else {
            if (isObject(oldStyle)) {
                for (rule in oldStyle) {
                    removeProperty(s, rule);
                }
            }
            else if (oldStyle) {
                s.cssText = "";
            }
        }
    }
    function setClassName(el, className) {
        if (inSvg)
            el.setAttribute("class", className);
        else
            el.className = className;
    }
    function updateElement(n, el, newAttrs, oldAttrs) {
        var attrName, newAttr, oldAttr, valueOldAttr, valueNewAttr;
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
                    if (attrName === "href")
                        el.setAttributeNS("http://www.w3.org/1999/xlink", "href", newAttr);
                    else
                        el.setAttribute(attrName, newAttr);
                }
                else if (attrName in el && !(attrName === "list" || attrName === "form")) {
                    el[attrName] = newAttr;
                }
                else
                    el.setAttribute(attrName, newAttr);
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
    function pushInitCallback(c, aupdate) {
        var cc = c.component;
        if (cc) {
            if (cc[aupdate ? "postUpdateDom" : "postInitDom"]) {
                updateCall.push(aupdate);
                updateInstance.push(c);
            }
        }
    }
    function findCfg(parent) {
        var cfg;
        while (parent) {
            cfg = parent.cfg;
            if (cfg !== undefined)
                break;
            if (parent.ctx) {
                cfg = parent.ctx.cfg;
                break;
            }
            parent = parent.parent;
        }
        return cfg;
    }
    function setRef(ref, value) {
        if (ref == null)
            return;
        if (typeof ref === "function") {
            ref(value);
            return;
        }
        var ctx = ref[0];
        var refs = ctx.refs;
        if (!refs) {
            refs = newHashObj();
            ctx.refs = refs;
        }
        refs[ref[1]] = value;
    }
    function createNode(n, parentNode, createInto, createBefore) {
        var c = {
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
        var el;
        setRef(c.ref, c);
        if (component) {
            var ctx = { data: c.data || {}, me: c, cfg: findCfg(parentNode) };
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
        if (tag === undefined) {
            if (typeof children === "string") {
                el = createTextNode(children);
                c.element = el;
                createInto.insertBefore(el, createBefore);
            }
            else {
                createChildren(c, createInto, createBefore);
            }
            if (component) {
                if (component.postRender) {
                    component.postRender(c.ctx, c);
                }
                pushInitCallback(c, false);
            }
            return c;
        }
        else if (tag === "/") {
            var htmltext = children;
            if (htmltext === "") {
                // nothing needs to be created
            }
            else if (createBefore == null) {
                var before = createInto.lastChild;
                createInto.insertAdjacentHTML("beforeend", htmltext);
                c.element = [];
                if (before) {
                    before = before.nextSibling;
                }
                else {
                    before = createInto.firstChild;
                }
                while (before) {
                    c.element.push(before);
                    before = before.nextSibling;
                }
            }
            else {
                el = createBefore;
                var elprev = createBefore.previousSibling;
                var removeEl = false;
                var parent = createInto;
                if (!el.insertAdjacentHTML) {
                    el = parent.insertBefore(createElement("i"), el);
                    removeEl = true;
                }
                el.insertAdjacentHTML("beforebegin", htmltext);
                if (elprev) {
                    elprev = elprev.nextSibling;
                }
                else {
                    elprev = parent.firstChild;
                }
                var newElements = [];
                while (elprev !== el) {
                    newElements.push(elprev);
                    elprev = elprev.nextSibling;
                }
                c.element = newElements;
                if (removeEl) {
                    parent.removeChild(el);
                }
            }
            if (component) {
                if (component.postRender) {
                    component.postRender(c.ctx, c);
                }
                pushInitCallback(c, false);
            }
            return c;
        }
        else if (inSvg || tag === "svg") {
            el = document.createElementNS("http://www.w3.org/2000/svg", tag);
            inSvg = true;
        }
        else if (!el) {
            el = createElement(tag);
        }
        createInto.insertBefore(el, createBefore);
        c.element = el;
        createChildren(c, el, null);
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, c);
            }
        }
        if (c.attrs)
            c.attrs = updateElement(c, el, c.attrs, {});
        if (c.style)
            updateStyle(c, el, c.style, undefined);
        var className = c.className;
        if (className)
            setClassName(el, className);
        inSvg = backupInSvg;
        pushInitCallback(c, false);
        return c;
    }
    function normalizeNode(n) {
        var t = typeof n;
        if (t === "string") {
            return { children: n };
        }
        if (t === "boolean")
            return null;
        return n;
    }
    function createChildren(c, createInto, createBefore) {
        var ch = c.children;
        if (!ch)
            return;
        if (!isArray(ch)) {
            if (typeof ch === "string") {
                if (hasTextContent) {
                    createInto.textContent = ch;
                }
                else {
                    createInto.innerText = ch;
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
            ch[i] = createNode(item, c, createInto, createBefore);
            i++;
        }
        c.children = ch;
    }
    function destroyNode(c) {
        setRef(c.ref, null);
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
    function removeNodeRecursive(c) {
        var el = c.element;
        if (isArray(el)) {
            var pa = el[0].parentNode;
            if (pa) {
                for (var i = 0; i < el.length; i++) {
                    pa.removeChild(el[i]);
                }
            }
        }
        else if (el != null) {
            var p = el.parentNode;
            if (p)
                p.removeChild(el);
        }
        else {
            var ch = c.children;
            if (isArray(ch)) {
                for (var i = 0, l = ch.length; i < l; i++) {
                    removeNodeRecursive(ch[i]);
                }
            }
        }
    }
    function removeNode(c) {
        destroyNode(c);
        removeNodeRecursive(c);
    }
    var roots = Object.create(null);
    function nodeContainsNode(c, n, resIndex, res) {
        var el = c.element;
        var ch = c.children;
        if (isArray(el)) {
            for (var ii = 0; ii < el.length; ii++) {
                if (el[ii] === n) {
                    res.push(c);
                    if (isArray(ch)) {
                        return ch;
                    }
                    return null;
                }
            }
        }
        else if (el == null) {
            if (isArray(ch)) {
                for (var i = 0; i < ch.length; i++) {
                    var result = nodeContainsNode(ch[i], n, resIndex, res);
                    if (result !== undefined) {
                        res.splice(resIndex, 0, c);
                        return result;
                    }
                }
            }
        }
        else if (el === n) {
            res.push(c);
            if (isArray(ch)) {
                return ch;
            }
            return null;
        }
        return undefined;
    }
    function vdomPath(n) {
        var res = [];
        if (n == null)
            return res;
        var rootIds = Object.keys(roots);
        var rootElements = rootIds.map(function (i) { return roots[i].e || document.body; });
        var nodeStack = [];
        rootFound: while (n) {
            for (var j = 0; j < rootElements.length; j++) {
                if (n === rootElements[j])
                    break rootFound;
            }
            nodeStack.push(n);
            n = n.parentNode;
        }
        if (!n || nodeStack.length === 0)
            return res;
        var currentCacheArray = null;
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
            if (currentCacheArray && currentCacheArray.length)
                for (var i = 0, l = currentCacheArray.length; i < l; i++) {
                    var bn = currentCacheArray[i];
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
    function getCacheNode(n) {
        var p = vdomPath(n);
        var currentNode = null;
        while (currentNode === null && p.length > 0) {
            currentNode = p.pop();
        }
        return currentNode;
    }
    function finishUpdateNode(n, c, component) {
        if (component) {
            if (component.postRender) {
                component.postRender(c.ctx, n, c);
            }
        }
        c.data = n.data;
        pushInitCallback(c, true);
    }
    function updateNode(n, c, createInto, createBefore, deepness) {
        var component = n.component;
        var backupInSvg = inSvg;
        var bigChange = false;
        var ctx = c.ctx;
        if (component != null && ctx != null) {
            if (ctx[ctxInvalidated] === frameCounter) {
                deepness = Math.max(deepness, ctx[ctxDeepness]);
            }
            if (component.id !== c.component.id) {
                bigChange = true;
            }
            else {
                if (c.parent != undefined)
                    ctx.cfg = findCfg(c.parent);
                if (component.shouldChange)
                    if (!component.shouldChange(ctx, n, c) && !ignoringShouldChange) {
                        if (isArray(c.children))
                            selectedUpdate(c.children, c.element || createInto, c.element != null ? null : createBefore);
                        return c;
                    }
                ctx.data = n.data || {};
                c.component = component;
                if (component.render) {
                    n = assign({}, n); // need to clone me because it should not be modified for next updates
                    component.render(ctx, n, c);
                }
                c.cfg = n.cfg;
            }
        }
        var newChildren = n.children;
        var cachedChildren = c.children;
        var tag = n.tag;
        if (bigChange || (component != null && ctx == null) || (component == null && ctx != null)) {
            // it is big change of component.id or old one was not even component or old one was component and new is not anymore => recreate
        }
        else if (tag === "/") {
            if (c.tag === "/" && cachedChildren === newChildren) {
                finishUpdateNode(n, c, component);
                return c;
            }
        }
        else if (tag === c.tag) {
            if (tag === undefined) {
                if (typeof newChildren === "string" && typeof cachedChildren === "string") {
                    if (newChildren !== cachedChildren) {
                        var el = c.element;
                        if (hasTextContent) {
                            el.textContent = newChildren;
                        }
                        else {
                            el.nodeValue = newChildren;
                        }
                        c.children = newChildren;
                    }
                }
                else {
                    if (deepness <= 0) {
                        if (isArray(cachedChildren))
                            selectedUpdate(c.children, createInto, createBefore);
                    }
                    else {
                        c.children = updateChildren(createInto, newChildren, cachedChildren, c, createBefore, deepness - 1);
                    }
                }
                finishUpdateNode(n, c, component);
                return c;
            }
            else {
                if (tag === "svg") {
                    inSvg = true;
                }
                var el = c.element;
                if ((typeof newChildren === "string") && !isArray(cachedChildren)) {
                    if (newChildren !== cachedChildren) {
                        if (hasTextContent) {
                            el.textContent = newChildren;
                        }
                        else {
                            el.innerText = newChildren;
                        }
                        cachedChildren = newChildren;
                    }
                }
                else {
                    if (deepness <= 0) {
                        if (isArray(cachedChildren))
                            selectedUpdate(c.children, el, createBefore);
                    }
                    else {
                        cachedChildren = updateChildren(el, newChildren, cachedChildren, c, null, deepness - 1);
                    }
                }
                c.children = cachedChildren;
                finishUpdateNode(n, c, component);
                if (c.attrs || n.attrs)
                    c.attrs = updateElement(c, el, n.attrs || {}, c.attrs || {});
                updateStyle(c, el, n.style, c.style);
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
        if (isArray(parEl))
            parEl = parEl[0];
        if (parEl == null)
            parEl = createInto;
        else
            parEl = parEl.parentNode;
        var r = createNode(n, c.parent, parEl, getDomNode(c));
        removeNode(c);
        return r;
    }
    function getDomNode(c) {
        var el = c.element;
        if (el != null) {
            if (isArray(el))
                return el[0];
            return el;
        }
        var ch = c.children;
        if (!isArray(ch))
            return null;
        for (var i = 0; i < ch.length; i++) {
            el = getDomNode(ch[i]);
            if (el)
                return el;
        }
        return null;
    }
    function findNextNode(a, i, len, def) {
        while (++i < len) {
            var ai = a[i];
            if (ai == null)
                continue;
            var n = getDomNode(ai);
            if (n != null)
                return n;
        }
        return def;
    }
    function callPostCallbacks() {
        var count = updateInstance.length;
        for (var i = 0; i < count; i++) {
            var n = updateInstance[i];
            if (updateCall[i]) {
                n.component.postUpdateDom(n.ctx, n, n.element);
            }
            else {
                n.component.postInitDom(n.ctx, n, n.element);
            }
        }
        updateCall = [];
        updateInstance = [];
    }
    function updateNodeInUpdateChildren(newNode, cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness) {
        cachedChildren[cachedIndex] = updateNode(newNode, cachedChildren[cachedIndex], element, findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore), deepness);
    }
    function reorderInUpdateChildrenRec(c, element, before) {
        var el = c.element;
        if (el != null) {
            if (isArray(el)) {
                for (var i = 0; i < el.length; i++) {
                    element.insertBefore(el[i], before);
                }
            }
            else
                element.insertBefore(el, before);
            return;
        }
        var ch = c.children;
        if (!isArray(ch))
            return null;
        for (var i = 0; i < ch.length; i++) {
            reorderInUpdateChildrenRec(ch[i], element, before);
        }
    }
    function reorderInUpdateChildren(cachedChildren, cachedIndex, cachedLength, createBefore, element) {
        var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
        var cur = cachedChildren[cachedIndex];
        var what = getDomNode(cur);
        if (what != null && what !== before) {
            reorderInUpdateChildrenRec(cur, element, before);
        }
    }
    function reorderAndUpdateNodeInUpdateChildren(newNode, cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness) {
        var before = findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore);
        var cur = cachedChildren[cachedIndex];
        var what = getDomNode(cur);
        if (what != null && what !== before) {
            reorderInUpdateChildrenRec(cur, element, before);
        }
        cachedChildren[cachedIndex] = updateNode(newNode, cur, element, before, deepness);
    }
    function updateChildren(element, newChildren, cachedChildren, parentNode, createBefore, deepness) {
        if (newChildren == null)
            newChildren = [];
        if (!isArray(newChildren)) {
            newChildren = [newChildren];
        }
        if (cachedChildren == null)
            cachedChildren = [];
        if (!isArray(cachedChildren)) {
            if (element.firstChild)
                element.removeChild(element.firstChild);
            cachedChildren = [];
        }
        var newCh = newChildren;
        newCh = newCh.slice(0);
        var newLength = newCh.length;
        var newIndex;
        for (newIndex = 0; newIndex < newLength;) {
            var item = newCh[newIndex];
            if (isArray(item)) {
                newCh.splice.apply(newCh, [newIndex, 1].concat(item));
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
        return updateChildrenCore(element, newCh, cachedChildren, parentNode, createBefore, deepness);
    }
    function updateChildrenCore(element, newChildren, cachedChildren, parentNode, createBefore, deepness) {
        var newEnd = newChildren.length;
        var cachedLength = cachedChildren.length;
        var cachedEnd = cachedLength;
        var newIndex = 0;
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
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode, element, findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)));
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
        var cachedKeys = newHashObj();
        var newKeys = newHashObj();
        var key;
        var node;
        var backupNewIndex = newIndex;
        var backupCachedIndex = cachedIndex;
        var deltaKeyless = 0;
        for (; cachedIndex < cachedEnd; cachedIndex++) {
            node = cachedChildren[cachedIndex];
            key = node.key;
            if (key != null) {
                assert(!(key in cachedKeys));
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
                assert(!(key in newKeys));
                newKeys[key] = newIndex;
            }
            else
                deltaKeyless++;
        }
        keyLess += deltaKeyless;
        var delta = 0;
        newIndex = backupNewIndex;
        cachedIndex = backupCachedIndex;
        var cachedKey;
        while (cachedIndex < cachedEnd && newIndex < newEnd) {
            if (cachedChildren[cachedIndex] === null) {
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
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode, element, findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)));
                delta++;
                newIndex++;
                cachedIndex++;
                cachedEnd++;
                cachedLength++;
                continue;
            }
            if (!(cachedKey in newKeys)) {
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
            }
            else {
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
            if (cachedChildren[cachedIndex] === null) {
                cachedChildren.splice(cachedIndex, 1);
                cachedEnd--;
                cachedLength--;
                continue;
            }
            if (cachedChildren[cachedIndex].key != null) {
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
                cachedChildren.splice(cachedIndex, 0, createNode(newChildren[newIndex], parentNode, element, findNextNode(cachedChildren, cachedIndex - 1, cachedLength, createBefore)));
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
                reorderInUpdateChildren(cachedChildren, newIndex, cachedLength, createBefore, element);
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
            }
            else {
                cachedChildren.splice(newIndex, 0, createNode(newChildren[newIndex], parentNode, element, findNextNode(cachedChildren, newIndex - 1, cachedLength, createBefore)));
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
        nativeRaf(function (param) { if (param === +param)
            hasNativeRaf = true; });
    }
    var now = Date.now || (function () { return (new Date).getTime(); });
    var startTime = now();
    var lastTickTime = 0;
    function requestAnimationFrame(callback) {
        if (hasNativeRaf) {
            nativeRaf(callback);
        }
        else {
            var delay = 50 / 3 + lastTickTime - now();
            if (delay < 0)
                delay = 0;
            window.setTimeout(function () {
                lastTickTime = now();
                callback(lastTickTime - startTime);
            }, delay);
        }
    }
    var ctxInvalidated = "$invalidated";
    var ctxDeepness = "$deepness";
    var fullRecreateRequested = true;
    var scheduled = false;
    var initializing = true;
    var uptime = 0;
    var frameCounter = 0;
    var lastFrameDuration = 0;
    var renderFrameBegin = 0;
    var regEvents = {};
    var registryEvents;
    function addEvent(name, priority, callback) {
        if (registryEvents == null)
            registryEvents = {};
        var list = registryEvents[name] || [];
        list.push({ priority: priority, callback: callback });
        registryEvents[name] = list;
    }
    function emitEvent(name, ev, target, node) {
        var events = regEvents[name];
        if (events)
            for (var i = 0; i < events.length; i++) {
                if (events[i](ev, target, node))
                    return true;
            }
        return false;
    }
    function addListener(el, name) {
        if (name[0] == "!")
            return;
        var capture = (name[0] == "^");
        var eventName = name;
        if (capture) {
            eventName = name.slice(1);
        }
        function enhanceEvent(ev) {
            ev = ev || window.event;
            var t = ev.target || ev.srcElement || el;
            var n = getCacheNode(t);
            emitEvent(name, ev, t, n);
        }
        if (("on" + eventName) in window)
            el = window;
        el.addEventListener(eventName, enhanceEvent, capture);
    }
    function initEvents() {
        if (registryEvents == null)
            return;
        var eventNames = Object.keys(registryEvents);
        for (var j = 0; j < eventNames.length; j++) {
            var eventName = eventNames[j];
            var arr = registryEvents[eventName];
            arr = arr.sort(function (a, b) { return a.priority - b.priority; });
            regEvents[eventName] = arr.map(function (v) { return v.callback; });
        }
        registryEvents = null;
        var body = document.body;
        for (var i = 0; i < eventNames.length; i++) {
            addListener(body, eventNames[i]);
        }
    }
    function selectedUpdate(cache, element, createBefore) {
        var len = cache.length;
        for (var i = 0; i < len; i++) {
            var node = cache[i];
            var ctx = node.ctx;
            if (ctx != null && ctx[ctxInvalidated] === frameCounter) {
                var cloned = { data: ctx.data, component: node.component };
                cache[i] = updateNode(cloned, node, element, createBefore, ctx[ctxDeepness]);
            }
            else if (isArray(node.children)) {
                var backupInSvg = inSvg;
                if (node.tag === "svg")
                    inSvg = true;
                selectedUpdate(node.children, node.element || element, findNextNode(cache, i, len, createBefore));
                inSvg = backupInSvg;
            }
        }
    }
    var beforeFrameCallback = function () { };
    var afterFrameCallback = function () { };
    function setBeforeFrame(callback) {
        var res = beforeFrameCallback;
        beforeFrameCallback = callback;
        return res;
    }
    function setAfterFrame(callback) {
        var res = afterFrameCallback;
        afterFrameCallback = callback;
        return res;
    }
    function findLastNode(children) {
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
                return el;
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
    function syncUpdate() {
        invalidate();
        update(now() - startTime);
    }
    function update(time) {
        renderFrameBegin = now();
        initEvents();
        frameCounter++;
        ignoringShouldChange = nextIgnoreShouldChange;
        nextIgnoreShouldChange = false;
        uptime = time;
        scheduled = false;
        beforeFrameCallback();
        var fullRefresh = false;
        if (fullRecreateRequested) {
            fullRecreateRequested = false;
            fullRefresh = true;
        }
        var rootIds = Object.keys(roots);
        for (var i = 0; i < rootIds.length; i++) {
            var r = roots[rootIds[i]];
            if (!r)
                continue;
            var rc = r.c;
            var insertBefore = findLastNode(rc);
            if (insertBefore != null)
                insertBefore = insertBefore.nextSibling;
            if (fullRefresh) {
                var newChildren = r.f();
                if (newChildren === undefined)
                    break;
                r.e = r.e || document.body;
                r.c = updateChildren(r.e, newChildren, rc, null, insertBefore, 1e6);
            }
            else {
                selectedUpdate(rc, r.e, insertBefore);
            }
        }
        callPostCallbacks();
        var r0 = roots["0"];
        afterFrameCallback(r0 ? r0.c : null);
        lastFrameDuration = now() - renderFrameBegin;
    }
    var nextIgnoreShouldChange = false;
    var ignoringShouldChange = false;
    function ignoreShouldChange() {
        nextIgnoreShouldChange = true;
        invalidate();
    }
    function invalidate(ctx, deepness) {
        if (ctx != null) {
            if (deepness == undefined)
                deepness = 1e6;
            if (ctx[ctxInvalidated] !== frameCounter + 1) {
                ctx[ctxInvalidated] = frameCounter + 1;
                ctx[ctxDeepness] = deepness;
            }
            else {
                if (deepness > ctx[ctxDeepness])
                    ctx[ctxDeepness] = deepness;
            }
        }
        else {
            fullRecreateRequested = true;
        }
        if (scheduled || initializing)
            return;
        scheduled = true;
        requestAnimationFrame(update);
    }
    var lastRootId = 0;
    function addRoot(factory, element, parent) {
        lastRootId++;
        var rootId = "" + lastRootId;
        roots[rootId] = { f: factory, e: element, c: [], p: parent };
        invalidate();
        return rootId;
    }
    function removeRoot(id) {
        var root = roots[id];
        if (!root)
            return;
        if (root.c.length) {
            root.c = updateChildren(root.e, [], root.c, null, null, 1e9);
        }
        delete roots[id];
    }
    function getRoots() {
        return roots;
    }
    function finishInitialize() {
        initializing = false;
        invalidate();
    }
    var beforeInit = finishInitialize;
    function init(factory, element) {
        removeRoot("0");
        roots["0"] = { f: factory, e: element, c: [], p: undefined };
        initializing = true;
        beforeInit();
        beforeInit = finishInitialize;
    }
    function setBeforeInit(callback) {
        var prevBeforeInit = beforeInit;
        beforeInit = function () {
            callback(prevBeforeInit);
        };
    }
    function bubbleEvent(node, name, param) {
        while (node) {
            var c = node.component;
            if (c) {
                var ctx = node.ctx;
                var m = c[name];
                if (m) {
                    if (m.call(c, ctx, param))
                        return ctx;
                }
                m = c.shouldStopBubble;
                if (m) {
                    if (m.call(c, ctx, name, param))
                        break;
                }
            }
            node = node.parent;
        }
        return null;
    }
    function broadcastEventToNode(node, name, param) {
        if (!node)
            return null;
        var c = node.component;
        if (c) {
            var ctx = node.ctx;
            var m = c[name];
            if (m) {
                if (m.call(c, ctx, param))
                    return ctx;
            }
            m = c.shouldStopBroadcast;
            if (m) {
                if (m.call(c, ctx, name, param))
                    return null;
            }
        }
        var ch = node.children;
        if (isArray(ch)) {
            for (var i = 0; i < ch.length; i++) {
                var res = broadcastEventToNode(ch[i], name, param);
                if (res != null)
                    return res;
            }
        }
        return null;
    }
    function broadcastEvent(name, param) {
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
        return null;
    }
    function merge(f1, f2) {
        var _this = this;
        return function () {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i] = arguments[_i];
            }
            var result = f1.apply(_this, params);
            if (result)
                return result;
            return f2.apply(_this, params);
        };
    }
    var emptyObject = {};
    function mergeComponents(c1, c2) {
        var res = Object.create(c1);
        res.super = c1;
        for (var i in c2) {
            if (!(i in emptyObject)) {
                var m = c2[i];
                var origM = c1[i];
                if (i === "id") {
                    res[i] = ((origM != null) ? origM : "") + "/" + m;
                }
                else if (typeof m === "function" && origM != null && typeof origM === "function") {
                    res[i] = merge(origM, m);
                }
                else {
                    res[i] = m;
                }
            }
        }
        return res;
    }
    function preEnhance(node, methods) {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(methods, comp);
        return node;
    }
    function postEnhance(node, methods) {
        var comp = node.component;
        if (!comp) {
            node.component = methods;
            return node;
        }
        node.component = mergeComponents(comp, methods);
        return node;
    }
    function assign(target) {
        var sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            sources[_i - 1] = arguments[_i];
        }
        if (target == null)
            target = {};
        var totalArgs = arguments.length;
        for (var i = 1; i < totalArgs; i++) {
            var source = arguments[i];
            if (source == null)
                continue;
            var keys = Object.keys(source);
            var totalKeys = keys.length;
            for (var j = 0; j < totalKeys; j++) {
                var key = keys[j];
                target[key] = source[key];
            }
        }
        return target;
    }
    function preventDefault(event) {
        var pd = event.preventDefault;
        if (pd)
            pd.call(event);
        else
            event.returnValue = false;
    }
    function cloneNodeArray(a) {
        a = a.slice(0);
        for (var i = 0; i < a.length; i++) {
            var n = a[i];
            if (isArray(n)) {
                a[i] = cloneNodeArray(n);
            }
            else if (isObject(n)) {
                a[i] = cloneNode(n);
            }
        }
        return a;
    }
    function cloneNode(node) {
        var r = assign({}, node);
        if (r.attrs) {
            r.attrs = assign({}, r.attrs);
        }
        if (isObject(r.style)) {
            r.style = assign({}, r.style);
        }
        var ch = r.children;
        if (ch) {
            if (isArray(ch)) {
                r.children = cloneNodeArray(ch);
            }
            else if (isObject(ch)) {
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
        setStyleShim: function (name, action) { return mapping[name] = action; },
        init: init,
        addRoot: addRoot,
        removeRoot: removeRoot,
        getRoots: getRoots,
        setBeforeFrame: setBeforeFrame,
        setAfterFrame: setAfterFrame,
        setBeforeInit: setBeforeInit,
        isArray: isArray,
        uptime: function () { return uptime; },
        lastFrameDuration: function () { return lastFrameDuration; },
        now: now,
        frame: function () { return frameCounter; },
        assign: assign,
        ieVersion: ieVersion,
        invalidate: invalidate,
        ignoreShouldChange: ignoreShouldChange,
        invalidated: function () { return scheduled; },
        preventDefault: preventDefault,
        vdomPath: vdomPath,
        getDomNode: getDomNode,
        deref: getCacheNode,
        addEvent: addEvent,
        emitEvent: emitEvent,
        bubble: bubbleEvent,
        broadcast: broadcastEvent,
        preEnhance: preEnhance,
        postEnhance: postEnhance,
        cloneNode: cloneNode,
        shimStyle: shimStyle,
        flatten: flatten,
        syncUpdate: syncUpdate,
        mergeComponents: mergeComponents
    };
})(window, document);
