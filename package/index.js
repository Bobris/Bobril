"use strict";
// Bobril.Core
Object.defineProperty(exports, "__esModule", { value: true });
var BobrilCtx = /** @class */ (function () {
    function BobrilCtx(data, me) {
        this.data = data;
        this.me = me;
        this.cfg = undefined;
        this.refs = undefined;
        this.disposables = undefined;
        this.$bobxCtx = undefined;
    }
    return BobrilCtx;
}());
exports.BobrilCtx = BobrilCtx;
// PureFuncs: assert, isArray, isObject, flatten
function assert(shouldBeTrue, messageIfFalse) {
    if (DEBUG && !shouldBeTrue)
        throw Error(messageIfFalse || "assertion failed");
}
exports.isArray = Array.isArray;
var emptyComponent = {};
function createTextNode(content) {
    return document.createTextNode(content);
}
function createEl(name) {
    return document.createElement(name);
}
function null2undefined(value) {
    return value === null ? undefined : value;
}
function isNumber(val) {
    return typeof val == "number";
}
exports.isNumber = isNumber;
function isString(val) {
    return typeof val == "string";
}
exports.isString = isString;
function isFunction(val) {
    return typeof val == "function";
}
exports.isFunction = isFunction;
function isObject(val) {
    return typeof val === "object";
}
exports.isObject = isObject;
if (Object.assign == null) {
    Object.assign = function assign(target) {
        var _sources = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            _sources[_i - 1] = arguments[_i];
        }
        if (target == null)
            throw new TypeError("Target in assign cannot be undefined or null");
        var totalArgs = arguments.length;
        for (var i_1 = 1; i_1 < totalArgs; i_1++) {
            var source = arguments[i_1];
            if (source == null)
                continue;
            var keys = Object.keys(source);
            var totalKeys = keys.length;
            for (var j_1 = 0; j_1 < totalKeys; j_1++) {
                var key = keys[j_1];
                target[key] = source[key];
            }
        }
        return target;
    };
}
exports.assign = Object.assign;
function flatten(a) {
    if (!exports.isArray(a)) {
        if (a == null || a === false || a === true)
            return [];
        return [a];
    }
    a = a.slice(0);
    var aLen = a.length;
    for (var i_2 = 0; i_2 < aLen;) {
        var item = a[i_2];
        if (exports.isArray(item)) {
            a.splice.apply(a, [i_2, 1].concat(item));
            aLen = a.length;
            continue;
        }
        if (item == null || item === false || item === true) {
            a.splice(i_2, 1);
            aLen--;
            continue;
        }
        i_2++;
    }
    return a;
}
exports.flatten = flatten;
var inSvg = false;
var inNotFocusable = false;
var updateCall = [];
var updateInstance = [];
var setValueCallback = function (el, _node, newValue, oldValue) {
    if (newValue !== oldValue)
        el[tValue] = newValue;
};
function setSetValue(callback) {
    var prev = setValueCallback;
    setValueCallback = callback;
    return prev;
}
exports.setSetValue = setSetValue;
function newHashObj() {
    return Object.create(null);
}
var vendors = ["Webkit", "Moz", "ms", "O"];
var testingDivStyle = document.createElement("div").style;
function testPropExistence(name) {
    return isString(testingDivStyle[name]);
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
    zoom: true
};
function renamer(newName) {
    return function (style, value, oldName) {
        style[newName] = value;
        style[oldName] = undefined;
    };
}
function renamerPx(newName) {
    return function (style, value, oldName) {
        if (isNumber(value)) {
            style[newName] = value + "px";
        }
        else {
            style[newName] = value;
        }
        style[oldName] = undefined;
    };
}
function pxAdder(style, value, name) {
    if (isNumber(value))
        style[name] = value + "px";
}
function ieVersion() {
    return document.documentMode;
}
exports.ieVersion = ieVersion;
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
                mi = isUnitlessNumber[ki] === true ? null : pxAdder;
            }
            else {
                var titleCaseKi = ki.replace(/^\w/, function (match) { return match.toUpperCase(); });
                for (var j = 0; j < vendors.length; j++) {
                    if (testPropExistence(vendors[j] + titleCaseKi)) {
                        mi = (isUnitlessNumber[ki] === true ? renamer : renamerPx)(vendors[j] + titleCaseKi);
                        break;
                    }
                }
                if (mi === undefined) {
                    mi = isUnitlessNumber[ki] === true ? null : pxAdder;
                    if (DEBUG &&
                        window.console &&
                        console.warn &&
                        ["overflowScrolling", "touchCallout"].indexOf(ki) < 0 // whitelist rare but useful
                    )
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
function setStyleProperty(s, name, value) {
    if (isString(value)) {
        var len = value.length;
        if (len > 11 && value.substr(len - 11, 11) === " !important") {
            s.setProperty(hyphenateStyle(name), value.substr(0, len - 11), "important");
            return;
        }
    }
    s[name] = value;
}
function updateStyle(el, newStyle, oldStyle) {
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
                        setStyleProperty(s, rule, v);
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
                    setStyleProperty(s, rule, v);
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
var focusableTag = /^input$|^select$|^textarea$|^button$/;
var tabindexStr = "tabindex";
function isNaturalyFocusable(tag, attrs) {
    if (tag == null)
        return false;
    if (focusableTag.test(tag))
        return true;
    if (tag === "a" && attrs != null && attrs.href != null)
        return true;
    return false;
}
function updateElement(n, el, newAttrs, oldAttrs, notFocusable) {
    var attrName, newAttr, oldAttr, valueOldAttr, valueNewAttr;
    var wasTabindex = false;
    if (newAttrs != null)
        for (attrName in newAttrs) {
            newAttr = newAttrs[attrName];
            oldAttr = oldAttrs[attrName];
            if (notFocusable && attrName === tabindexStr) {
                newAttr = -1;
                wasTabindex = true;
            }
            else if (attrName === tValue && !inSvg) {
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
    if (notFocusable && !wasTabindex && isNaturalyFocusable(n.tag, newAttrs)) {
        el.setAttribute(tabindexStr, "-1");
        oldAttrs[tabindexStr] = -1;
    }
    if (newAttrs == null) {
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined) {
                if (notFocusable && attrName === tabindexStr)
                    continue;
                if (attrName === bValue)
                    continue;
                oldAttrs[attrName] = undefined;
                el.removeAttribute(attrName);
            }
        }
    }
    else {
        for (attrName in oldAttrs) {
            if (oldAttrs[attrName] !== undefined && !(attrName in newAttrs)) {
                if (notFocusable && attrName === tabindexStr)
                    continue;
                if (attrName === bValue)
                    continue;
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
function pushInitCallback(c) {
    var cc = c.component;
    if (cc) {
        var fn = cc.postInitDom;
        if (fn) {
            updateCall.push(fn);
            updateInstance.push(c);
        }
    }
}
function pushUpdateCallback(c) {
    var cc = c.component;
    if (cc) {
        var fn = cc.postUpdateDom;
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
function pushUpdateEverytimeCallback(c) {
    var cc = c.component;
    if (cc) {
        var fn = cc.postUpdateDomEverytime;
        if (fn) {
            updateCall.push(fn);
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
    if (isFunction(ref)) {
        ref(value);
        return;
    }
    var ctx = ref[0];
    var refs = ctx.refs;
    if (refs == null) {
        refs = newHashObj();
        ctx.refs = refs;
    }
    refs[ref[1]] = value;
}
var focusRootStack = [];
var focusRootTop = null;
function registerFocusRoot(ctx) {
    focusRootStack.push(ctx.me);
    addDisposable(ctx, unregisterFocusRoot);
    ignoreShouldChange();
}
exports.registerFocusRoot = registerFocusRoot;
function unregisterFocusRoot(ctx) {
    var idx = focusRootStack.indexOf(ctx.me);
    if (idx !== -1) {
        focusRootStack.splice(idx, 1);
        ignoreShouldChange();
    }
}
exports.unregisterFocusRoot = unregisterFocusRoot;
var currentCtx;
function getCurrentCtx() {
    return currentCtx;
}
exports.getCurrentCtx = getCurrentCtx;
function setCurrentCtx(ctx) {
    currentCtx = ctx;
}
exports.setCurrentCtx = setCurrentCtx;
function createNode(n, parentNode, createInto, createBefore) {
    var c = {
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
    var el;
    setRef(c.ref, c);
    if (component) {
        var ctx;
        if (component.ctxClass) {
            ctx = new component.ctxClass(c.data || {}, c);
            if (ctx.data === undefined)
                ctx.data = c.data || {};
            if (ctx.me === undefined)
                ctx.me = c;
        }
        else {
            ctx = { data: c.data || {}, me: c, cfg: undefined };
        }
        ctx.cfg = n.cfg === undefined ? findCfg(parentNode) : n.cfg;
        c.ctx = ctx;
        currentCtx = ctx;
        if (component.init) {
            component.init(ctx, c);
        }
        if (beforeRenderCallback !== emptyBeforeRenderCallback)
            beforeRenderCallback(n, 0 /* Create */);
        if (component.render) {
            component.render(ctx, c);
        }
        currentCtx = undefined;
    }
    else {
        if (DEBUG)
            Object.freeze(n);
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
            pushInitCallback(c);
        }
        return c;
    }
    if (tag === "/") {
        var htmlText = children;
        if (htmlText === "") {
            // nothing needs to be created
        }
        else if (createBefore == null) {
            var before = createInto.lastChild;
            createInto.insertAdjacentHTML("beforeend", htmlText);
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
            var elPrev = createBefore.previousSibling;
            var removeEl = false;
            var parent = createInto;
            if (!el.insertAdjacentHTML) {
                el = parent.insertBefore(createEl("i"), el);
                removeEl = true;
            }
            el.insertAdjacentHTML("beforebegin", htmlText);
            if (elPrev) {
                elPrev = elPrev.nextSibling;
            }
            else {
                elPrev = parent.firstChild;
            }
            var newElements = [];
            while (elPrev !== el) {
                newElements.push(elPrev);
                elPrev = elPrev.nextSibling;
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
            pushInitCallback(c);
        }
        return c;
    }
    if (inSvg || tag === "svg") {
        el = document.createElementNS("http://www.w3.org/2000/svg", tag);
        inSvgForeignObject = tag === "foreignObject";
        inSvg = !inSvgForeignObject;
    }
    else {
        el = createEl(tag);
    }
    createInto.insertBefore(el, createBefore);
    c.element = el;
    createChildren(c, el, null);
    if (component) {
        if (component.postRender) {
            component.postRender(c.ctx, c);
        }
    }
    if (inNotFocusable && focusRootTop === c)
        inNotFocusable = false;
    if (inSvgForeignObject)
        inSvg = true;
    if (c.attrs || inNotFocusable)
        c.attrs = updateElement(c, el, c.attrs, {}, inNotFocusable);
    if (c.style)
        updateStyle(el, c.style, undefined);
    var className = c.className;
    if (className)
        setClassName(el, className);
    inSvg = backupInSvg;
    inNotFocusable = backupInNotFocusable;
    pushInitCallback(c);
    return c;
}
exports.createNode = createNode;
function normalizeNode(n) {
    if (n === false || n === true || n === null)
        return undefined;
    if (isString(n)) {
        return { children: n };
    }
    if (isNumber(n)) {
        return { children: "" + n };
    }
    return n;
}
function createChildren(c, createInto, createBefore) {
    var ch = c.children;
    if (!ch)
        return;
    if (!exports.isArray(ch)) {
        if (isString(ch)) {
            createInto.textContent = ch;
            return;
        }
        ch = [ch];
    }
    ch = ch.slice(0);
    var i = 0, l = ch.length;
    while (i < l) {
        var item = ch[i];
        if (exports.isArray(item)) {
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
    setRef(c.ref, undefined);
    var ch = c.children;
    if (exports.isArray(ch)) {
        for (var i_3 = 0, l = ch.length; i_3 < l; i_3++) {
            destroyNode(ch[i_3]);
        }
    }
    var component = c.component;
    if (component) {
        var ctx = c.ctx;
        currentCtx = ctx;
        if (beforeRenderCallback !== emptyBeforeRenderCallback)
            beforeRenderCallback(c, 3 /* Destroy */);
        if (component.destroy)
            component.destroy(ctx, c, c.element);
        var disposables = ctx.disposables;
        if (exports.isArray(disposables)) {
            for (var i_4 = disposables.length; i_4-- > 0;) {
                var d = disposables[i_4];
                if (isFunction(d))
                    d(ctx);
                else
                    d.dispose();
            }
        }
    }
}
function addDisposable(ctx, disposable) {
    var disposables = ctx.disposables;
    if (disposables == null) {
        disposables = [];
        ctx.disposables = disposables;
    }
    disposables.push(disposable);
}
exports.addDisposable = addDisposable;
function removeNodeRecursive(c) {
    var el = c.element;
    if (exports.isArray(el)) {
        var pa = el[0].parentNode;
        if (pa) {
            for (var i_5 = 0; i_5 < el.length; i_5++) {
                pa.removeChild(el[i_5]);
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
        if (exports.isArray(ch)) {
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
var roots = newHashObj();
function nodeContainsNode(c, n, resIndex, res) {
    var el = c.element;
    var ch = c.children;
    if (exports.isArray(el)) {
        for (var ii = 0; ii < el.length; ii++) {
            if (el[ii] === n) {
                res.push(c);
                if (exports.isArray(ch)) {
                    return ch;
                }
                return null;
            }
        }
    }
    else if (el == null) {
        if (exports.isArray(ch)) {
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
        if (exports.isArray(ch)) {
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
    for (j = 0; j < rootElements.length; j++) {
        if (n === rootElements[j]) {
            var rn = roots[rootIds[j]].n;
            if (rn === undefined)
                continue;
            var findResult = nodeContainsNode(rn, currentNode, res.length, res);
            if (findResult !== undefined) {
                currentCacheArray = findResult;
                break;
            }
        }
    }
    subtreeSearch: while (nodeStack.length) {
        currentNode = nodeStack.pop();
        if (currentCacheArray && currentCacheArray.length)
            for (var i = 0, l = currentCacheArray.length; i < l; i++) {
                var bn = currentCacheArray[i];
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
exports.vdomPath = vdomPath;
// PureFuncs: deref, getDomNode
function deref(n) {
    var p = vdomPath(n);
    var currentNode = null;
    while (currentNode === null) {
        currentNode = p.pop();
    }
    return currentNode;
}
exports.deref = deref;
function finishUpdateNode(n, c, component) {
    if (component) {
        if (component.postRender) {
            currentCtx = c.ctx;
            component.postRender(currentCtx, n, c);
            currentCtx = undefined;
        }
    }
    c.data = n.data;
    pushUpdateCallback(c);
}
function finishUpdateNodeWithoutChange(c, createInto, createBefore) {
    currentCtx = undefined;
    if (exports.isArray(c.children)) {
        var backupInSvg = inSvg;
        var backupInNotFocusable = inNotFocusable;
        if (c.tag === "svg") {
            inSvg = true;
        }
        else if (inSvg && c.tag === "foreignObject")
            inSvg = false;
        if (inNotFocusable && focusRootTop === c)
            inNotFocusable = false;
        selectedUpdate(c.children, c.element || createInto, c.element != null ? null : createBefore);
        inSvg = backupInSvg;
        inNotFocusable = backupInNotFocusable;
    }
    pushUpdateEverytimeCallback(c);
}
function updateNode(n, c, createInto, createBefore, deepness, inSelectedUpdate) {
    var component = n.component;
    var bigChange = false;
    var ctx = c.ctx;
    if (component != null && ctx != null) {
        var locallyInvalidated = false;
        if (ctx[ctxInvalidated] === frameCounter) {
            deepness = Math.max(deepness, ctx[ctxDeepness]);
            locallyInvalidated = true;
        }
        if (component.id !== c.component.id) {
            bigChange = true;
        }
        else {
            currentCtx = ctx;
            if (n.cfg !== undefined)
                ctx.cfg = n.cfg;
            else
                ctx.cfg = findCfg(c.parent);
            if (component.shouldChange)
                if (!component.shouldChange(ctx, n, c) && !ignoringShouldChange && !locallyInvalidated) {
                    finishUpdateNodeWithoutChange(c, createInto, createBefore);
                    return c;
                }
            ctx.data = n.data || {};
            c.component = component;
            if (beforeRenderCallback !== emptyBeforeRenderCallback)
                beforeRenderCallback(n, inSelectedUpdate ? 2 /* LocalUpdate */ : 1 /* Update */);
            if (component.render) {
                c.orig = n;
                n = exports.assign({}, n); // need to clone me because it should not be modified for next updates
                c.cfg = undefined;
                if (n.cfg !== undefined)
                    n.cfg = undefined;
                component.render(ctx, n, c);
                if (n.cfg !== undefined) {
                    if (c.cfg === undefined)
                        c.cfg = n.cfg;
                    else
                        exports.assign(c.cfg, n.cfg);
                }
            }
            currentCtx = undefined;
        }
    }
    else {
        // In case there is no component and source is same reference it is considered not changed
        if (c.orig === n) {
            return c;
        }
        c.orig = n;
        if (DEBUG)
            Object.freeze(n);
    }
    var newChildren = n.children;
    var cachedChildren = c.children;
    var tag = n.tag;
    if (tag === "-") {
        finishUpdateNodeWithoutChange(c, createInto, createBefore);
        return c;
    }
    var backupInSvg = inSvg;
    var backupInNotFocusable = inNotFocusable;
    if (isNumber(newChildren)) {
        newChildren = "" + newChildren;
    }
    if (bigChange ||
        (component != null && ctx == null) ||
        (component == null && ctx != null && ctx.me.component !== emptyComponent)) {
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
            if (isString(newChildren) && isString(cachedChildren)) {
                if (newChildren !== cachedChildren) {
                    var el = c.element;
                    el.textContent = newChildren;
                    c.children = newChildren;
                }
            }
            else {
                if (inNotFocusable && focusRootTop === c)
                    inNotFocusable = false;
                if (deepness <= 0) {
                    if (exports.isArray(cachedChildren))
                        selectedUpdate(c.children, createInto, createBefore);
                }
                else {
                    c.children = updateChildren(createInto, newChildren, cachedChildren, c, createBefore, deepness - 1);
                }
                inSvg = backupInSvg;
                inNotFocusable = backupInNotFocusable;
            }
            finishUpdateNode(n, c, component);
            return c;
        }
        else {
            var inSvgForeignObject = false;
            if (tag === "svg") {
                inSvg = true;
            }
            else if (inSvg && tag === "foreignObject") {
                inSvgForeignObject = true;
                inSvg = false;
            }
            if (inNotFocusable && focusRootTop === c)
                inNotFocusable = false;
            var el = c.element;
            if (isString(newChildren) && !exports.isArray(cachedChildren)) {
                if (newChildren !== cachedChildren) {
                    el.textContent = newChildren;
                    cachedChildren = newChildren;
                }
            }
            else {
                if (deepness <= 0) {
                    if (exports.isArray(cachedChildren))
                        selectedUpdate(c.children, el, createBefore);
                }
                else {
                    cachedChildren = updateChildren(el, newChildren, cachedChildren, c, null, deepness - 1);
                }
            }
            c.children = cachedChildren;
            if (inSvgForeignObject)
                inSvg = true;
            finishUpdateNode(n, c, component);
            if (c.attrs || n.attrs || inNotFocusable)
                c.attrs = updateElement(c, el, n.attrs, c.attrs || {}, inNotFocusable);
            updateStyle(el, n.style, c.style);
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
    if (exports.isArray(parEl))
        parEl = parEl[0];
    if (parEl == null)
        parEl = createInto;
    else
        parEl = parEl.parentNode;
    var r = createNode(n, c.parent, parEl, getDomNode(c));
    removeNode(c);
    return r;
}
exports.updateNode = updateNode;
function getDomNode(c) {
    if (c === undefined)
        return null;
    var el = c.element;
    if (el != null) {
        if (exports.isArray(el))
            return el[0];
        return el;
    }
    var ch = c.children;
    if (!exports.isArray(ch))
        return null;
    for (var i = 0; i < ch.length; i++) {
        el = getDomNode(ch[i]);
        if (el)
            return el;
    }
    return null;
}
exports.getDomNode = getDomNode;
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
        currentCtx = n.ctx;
        updateCall[i].call(n.component, currentCtx, n, n.element);
    }
    currentCtx = undefined;
    updateCall = [];
    updateInstance = [];
}
exports.callPostCallbacks = callPostCallbacks;
function updateNodeInUpdateChildren(newNode, cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness) {
    cachedChildren[cachedIndex] = updateNode(newNode, cachedChildren[cachedIndex], element, findNextNode(cachedChildren, cachedIndex, cachedLength, createBefore), deepness);
}
function reorderInUpdateChildrenRec(c, element, before) {
    var el = c.element;
    if (el != null) {
        if (exports.isArray(el)) {
            for (var i = 0; i < el.length; i++) {
                element.insertBefore(el[i], before);
            }
        }
        else
            element.insertBefore(el, before);
        return;
    }
    var ch = c.children;
    if (!exports.isArray(ch))
        return;
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
    if (!exports.isArray(newChildren)) {
        newChildren = [newChildren];
    }
    if (cachedChildren == null)
        cachedChildren = [];
    if (!exports.isArray(cachedChildren)) {
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
        if (exports.isArray(item)) {
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
exports.updateChildren = updateChildren;
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
                if (key != null)
                    break;
                newIndex++;
            }
            if (key == null)
                break;
        }
        var akPos = cachedKeys[key];
        if (akPos === undefined) {
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
        if (cachedIndex === akPos + delta) {
            // In-place update
            updateNodeInUpdateChildren(newChildren[newIndex], cachedChildren, cachedIndex, cachedLength, createBefore, element, deepness);
            newIndex++;
            cachedIndex++;
        }
        else {
            // Move
            cachedChildren.splice(cachedIndex, 0, cachedChildren[akPos + delta]);
            delta++;
            cachedChildren[akPos + delta] = null;
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
    nativeRaf(function (param) {
        if (param === +param)
            hasNativeRaf = true;
    });
}
exports.now = Date.now || (function () { return new Date().getTime(); });
var startTime = exports.now();
var lastTickTime = 0;
function requestAnimationFrame(callback) {
    if (hasNativeRaf) {
        nativeRaf(callback);
    }
    else {
        var delay = 50 / 3 + lastTickTime - exports.now();
        if (delay < 0)
            delay = 0;
        window.setTimeout(function () {
            lastTickTime = exports.now();
            callback(lastTickTime - startTime);
        }, delay);
    }
}
var ctxInvalidated = "$invalidated";
var ctxDeepness = "$deepness";
var fullRecreateRequested = true;
var scheduled = false;
var initializing = true;
var uptimeMs = 0;
var frameCounter = 0;
var lastFrameDurationMs = 0;
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
exports.addEvent = addEvent;
function emitEvent(name, ev, target, node) {
    var events = regEvents[name];
    if (events)
        for (var i = 0; i < events.length; i++) {
            if (events[i](ev, target, node))
                return true;
        }
    return false;
}
exports.emitEvent = emitEvent;
var listeningEventDeepness = 0;
function addListener(el, name) {
    if (name[0] == "!")
        return;
    var capture = name[0] == "^";
    var eventName = name;
    if (name[0] == "@") {
        eventName = name.slice(1);
        el = document;
    }
    if (capture) {
        eventName = name.slice(1);
    }
    function enhanceEvent(ev) {
        ev = ev || window.event;
        var t = ev.target || ev.srcElement || el;
        var n = deref(t);
        listeningEventDeepness++;
        emitEvent(name, ev, t, n);
        listeningEventDeepness--;
        if (listeningEventDeepness == 0 && deferSyncUpdateRequested)
            syncUpdate();
    }
    if ("on" + eventName in window)
        el = window;
    el.addEventListener(eventName, enhanceEvent, capture);
}
function initEvents() {
    if (registryEvents === undefined)
        return;
    var eventNames = Object.keys(registryEvents);
    for (var j = 0; j < eventNames.length; j++) {
        var eventName = eventNames[j];
        var arr = registryEvents[eventName];
        arr = arr.sort(function (a, b) { return a.priority - b.priority; });
        regEvents[eventName] = arr.map(function (v) { return v.callback; });
    }
    registryEvents = undefined;
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
            cache[i] = updateNode(node.orig, node, element, createBefore, ctx[ctxDeepness], true);
        }
        else if (exports.isArray(node.children)) {
            var backupInSvg = inSvg;
            var backupInNotFocusable = inNotFocusable;
            if (inNotFocusable && focusRootTop === node)
                inNotFocusable = false;
            if (node.tag === "svg")
                inSvg = true;
            else if (inSvg && node.tag === "foreignObject")
                inSvg = false;
            selectedUpdate(node.children, node.element || element, findNextNode(cache, i, len, createBefore));
            pushUpdateEverytimeCallback(node);
            inSvg = backupInSvg;
            inNotFocusable = backupInNotFocusable;
        }
    }
}
var emptyBeforeRenderCallback = function () { };
var beforeRenderCallback = emptyBeforeRenderCallback;
var beforeFrameCallback = function () { };
var reallyBeforeFrameCallback = function () { };
var afterFrameCallback = function () { };
function setBeforeRender(callback) {
    var res = beforeRenderCallback;
    beforeRenderCallback = callback;
    return res;
}
exports.setBeforeRender = setBeforeRender;
function setBeforeFrame(callback) {
    var res = beforeFrameCallback;
    beforeFrameCallback = callback;
    return res;
}
exports.setBeforeFrame = setBeforeFrame;
function setReallyBeforeFrame(callback) {
    var res = reallyBeforeFrameCallback;
    reallyBeforeFrameCallback = callback;
    return res;
}
exports.setReallyBeforeFrame = setReallyBeforeFrame;
function setAfterFrame(callback) {
    var res = afterFrameCallback;
    afterFrameCallback = callback;
    return res;
}
exports.setAfterFrame = setAfterFrame;
function isLogicalParent(parent, child, rootIds) {
    while (child != null) {
        if (parent === child)
            return true;
        var p = child.parent;
        if (p == null) {
            for (var i = 0; i < rootIds.length; i++) {
                var r = roots[rootIds[i]];
                if (!r)
                    continue;
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
function syncUpdate() {
    deferSyncUpdateRequested = false;
    internalUpdate(exports.now() - startTime);
}
exports.syncUpdate = syncUpdate;
function deferSyncUpdate() {
    if (listeningEventDeepness > 0) {
        deferSyncUpdateRequested = true;
        return;
    }
    syncUpdate();
}
exports.deferSyncUpdate = deferSyncUpdate;
function update(time) {
    scheduled = false;
    internalUpdate(time);
}
var rootIds;
var RootComponent = createVirtualComponent({
    render: function (ctx, me) {
        var r = ctx.data;
        var c = r.f(r);
        if (c === undefined) {
            me.tag = "-"; // Skip render when root factory returns undefined
        }
        else {
            me.children = c;
        }
    }
});
function internalUpdate(time) {
    renderFrameBegin = exports.now();
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
        if (!r)
            continue;
        var rc = r.n;
        var insertBefore = null;
        for (var j = i + 1; j < rootIds.length; j++) {
            var rafter = roots[rootIds[j]];
            if (rafter === undefined)
                continue;
            insertBefore = getDomNode(rafter.n);
            if (insertBefore != null)
                break;
        }
        if (focusRootTop)
            inNotFocusable = !isLogicalParent(focusRootTop, r.p, rootIds);
        if (r.e === undefined)
            r.e = document.body;
        if (rc) {
            if (fullRefresh || rc.ctx[ctxInvalidated] === frameCounter) {
                var node = RootComponent(r);
                updateNode(node, rc, r.e, insertBefore, fullRefresh ? 1e6 : rc.ctx[ctxDeepness]);
            }
            else {
                if (exports.isArray(r.c))
                    selectedUpdate(r.c, r.e, insertBefore);
            }
        }
        else {
            var node = RootComponent(r);
            rc = createNode(node, undefined, r.e, insertBefore);
            r.n = rc;
        }
        r.c = rc.children;
    }
    rootIds = undefined;
    callPostCallbacks();
    var r0 = roots["0"];
    afterFrameCallback(r0 ? r0.c : null);
    lastFrameDurationMs = exports.now() - renderFrameBegin;
}
var nextIgnoreShouldChange = false;
var ignoringShouldChange = false;
function ignoreShouldChange() {
    nextIgnoreShouldChange = true;
    exports.invalidate();
}
exports.ignoreShouldChange = ignoreShouldChange;
function setInvalidate(inv) {
    var prev = exports.invalidate;
    exports.invalidate = inv;
    return prev;
}
exports.setInvalidate = setInvalidate;
exports.invalidate = function (ctx, deepness) {
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
};
var lastRootId = 0;
function addRoot(factory, element, parent) {
    lastRootId++;
    var rootId = "" + lastRootId;
    roots[rootId] = { f: factory, e: element, c: [], p: parent, n: undefined };
    if (rootIds != null) {
        rootIds.push(rootId);
    }
    else {
        firstInvalidate();
    }
    return rootId;
}
exports.addRoot = addRoot;
function removeRoot(id) {
    var root = roots[id];
    if (!root)
        return;
    if (root.n)
        removeNode(root.n);
    delete roots[id];
}
exports.removeRoot = removeRoot;
function updateRoot(id, factory) {
    assert(rootIds != null, "updateRoot could be called only from render");
    var root = roots[id];
    assert(root != null);
    if (factory != null)
        root.f = factory;
    var rootNode = root.n;
    if (rootNode == null)
        return;
    var ctx = rootNode.ctx;
    ctx[ctxInvalidated] = frameCounter;
    ctx[ctxDeepness] = 1e6;
}
exports.updateRoot = updateRoot;
function getRoots() {
    return roots;
}
exports.getRoots = getRoots;
function finishInitialize() {
    initializing = false;
    exports.invalidate();
}
var beforeInit = finishInitialize;
function firstInvalidate() {
    initializing = true;
    beforeInit();
    beforeInit = finishInitialize;
}
function init(factory, element) {
    assert(rootIds == null, "init should not be called from render");
    removeRoot("0");
    roots["0"] = { f: factory, e: element, c: [], p: undefined, n: undefined };
    firstInvalidate();
}
exports.init = init;
function setBeforeInit(callback) {
    var prevBeforeInit = beforeInit;
    beforeInit = function () {
        callback(prevBeforeInit);
    };
}
exports.setBeforeInit = setBeforeInit;
function bubble(node, name, param) {
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
    return undefined;
}
exports.bubble = bubble;
function broadcastEventToNode(node, name, param) {
    if (!node)
        return undefined;
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
                return undefined;
        }
    }
    var ch = node.children;
    if (exports.isArray(ch)) {
        for (var i = 0; i < ch.length; i++) {
            var res = broadcastEventToNode(ch[i], name, param);
            if (res != null)
                return res;
        }
    }
    return undefined;
}
function broadcast(name, param) {
    var k = Object.keys(roots);
    for (var i = 0; i < k.length; i++) {
        var ch = roots[k[i]].n;
        if (ch != null) {
            var res = broadcastEventToNode(ch, name, param);
            if (res != null)
                return res;
        }
    }
    return undefined;
}
exports.broadcast = broadcast;
function merge(f1, f2) {
    return function () {
        var params = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            params[_i] = arguments[_i];
        }
        var result = f1.apply(this, params);
        if (result)
            return result;
        return f2.apply(this, params);
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
                res[i] = (origM != null ? origM : "") + "/" + m;
            }
            else if (isFunction(m) && origM != null && isFunction(origM)) {
                res[i] = merge(origM, m);
            }
            else {
                res[i] = m;
            }
        }
    }
    return res;
}
function overrideComponents(originalComponent, overridingComponent) {
    var res = Object.create(originalComponent);
    res.super = originalComponent;
    for (var i_6 in overridingComponent) {
        if (!(i_6 in emptyObject)) {
            var m = overridingComponent[i_6];
            var origM = originalComponent[i_6];
            if (i_6 === "id") {
                res[i_6] = (origM != null ? origM : "") + "/" + m;
            }
            else {
                res[i_6] = m;
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
exports.preEnhance = preEnhance;
function postEnhance(node, methods) {
    var comp = node.component;
    if (!comp) {
        node.component = methods;
        return node;
    }
    node.component = mergeComponents(comp, methods);
    return node;
}
exports.postEnhance = postEnhance;
function preventDefault(event) {
    var pd = event.preventDefault;
    if (pd)
        pd.call(event);
    else
        event.returnValue = false;
}
exports.preventDefault = preventDefault;
function cloneNodeArray(a) {
    a = a.slice(0);
    for (var i = 0; i < a.length; i++) {
        var n = a[i];
        if (exports.isArray(n)) {
            a[i] = cloneNodeArray(n);
        }
        else if (isObject(n)) {
            a[i] = cloneNode(n);
        }
    }
    return a;
}
function cloneNode(node) {
    var r = exports.assign({}, node);
    if (r.attrs) {
        r.attrs = exports.assign({}, r.attrs);
    }
    if (isObject(r.style)) {
        r.style = exports.assign({}, r.style);
    }
    var ch = r.children;
    if (ch) {
        if (exports.isArray(ch)) {
            r.children = cloneNodeArray(ch);
        }
        else if (isObject(ch)) {
            r.children = cloneNode(ch);
        }
    }
    return r;
}
exports.cloneNode = cloneNode;
function setStyleShim(name, action) {
    mapping[name] = action;
}
exports.setStyleShim = setStyleShim;
// PureFuncs: uptime, lastFrameDuration, frame, invalidated
function uptime() {
    return uptimeMs;
}
exports.uptime = uptime;
function lastFrameDuration() {
    return lastFrameDurationMs;
}
exports.lastFrameDuration = lastFrameDuration;
function frame() {
    return frameCounter;
}
exports.frame = frame;
function invalidated() {
    return scheduled;
}
exports.invalidated = invalidated;
var media = null;
var breaks = [
    [414, 800, 900],
    [736, 1280, 1440] //landscape widths
];
function emitOnMediaChange() {
    media = null;
    exports.invalidate();
    return false;
}
var events = ["resize", "orientationchange"];
for (var i = 0; i < events.length; i++)
    addEvent(events[i], 10, emitOnMediaChange);
function accDeviceBreaks(newBreaks) {
    if (newBreaks != null) {
        breaks = newBreaks;
        emitOnMediaChange();
    }
    return breaks;
}
exports.accDeviceBreaks = accDeviceBreaks;
var viewport = window.document.documentElement;
var isAndroid = /Android/i.test(navigator.userAgent);
var weirdPortrait; // Some android devices provide reverted orientation
function getMedia() {
    if (media == null) {
        var w = viewport.clientWidth;
        var h = viewport.clientHeight;
        var o = window.orientation;
        var p = h >= w;
        if (o == null)
            o = p ? 0 : 90;
        if (isAndroid) {
            // without this keyboard change screen rotation because h or w changes
            var op = Math.abs(o) % 180 === 90;
            if (weirdPortrait == null) {
                weirdPortrait = op === p;
            }
            else {
                p = op === weirdPortrait;
            }
        }
        var device = 0;
        while (w > breaks[+!p][device])
            device++;
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
exports.getMedia = getMedia;
exports.asap = (function () {
    var callbacks = [];
    function executeCallbacks() {
        var cbList = callbacks;
        callbacks = [];
        for (var i = 0, len = cbList.length; i < len; i++) {
            cbList[i]();
        }
    }
    var onreadystatechange = "onreadystatechange";
    // Modern browsers, fastest async
    if (window.MutationObserver) {
        var hiddenDiv = document.createElement("div");
        new MutationObserver(executeCallbacks).observe(hiddenDiv, {
            attributes: true
        });
        return function (callback) {
            if (!callbacks.length) {
                hiddenDiv.setAttribute("yes", "no");
            }
            callbacks.push(callback);
        };
        // Browsers that support postMessage
    }
    else if (!window.setImmediate && window.postMessage && window.addEventListener) {
        var MESSAGE_PREFIX = "basap" + Math.random(), hasPostMessage = false;
        var onGlobalMessage = function (event) {
            if (event.source === window && event.data === MESSAGE_PREFIX) {
                hasPostMessage = false;
                executeCallbacks();
            }
        };
        window.addEventListener("message", onGlobalMessage, false);
        return function (fn) {
            callbacks.push(fn);
            if (!hasPostMessage) {
                hasPostMessage = true;
                window.postMessage(MESSAGE_PREFIX, "*");
            }
        };
        // IE browsers without postMessage
    }
    else if (!window.setImmediate && onreadystatechange in document.createElement("script")) {
        var scriptEl;
        return function (callback) {
            callbacks.push(callback);
            if (!scriptEl) {
                scriptEl = document.createElement("script");
                scriptEl[onreadystatechange] = function () {
                    scriptEl[onreadystatechange] = null;
                    scriptEl.parentNode.removeChild(scriptEl);
                    scriptEl = null;
                    executeCallbacks();
                };
                document.body.appendChild(scriptEl);
            }
        };
        // All other browsers
    }
    else {
        var timeout;
        var timeoutFn = window.setImmediate || setTimeout;
        return function (callback) {
            callbacks.push(callback);
            if (!timeout) {
                timeout = timeoutFn(function () {
                    timeout = undefined;
                    executeCallbacks();
                }, 0);
            }
        };
    }
})();
if (!window.Promise) {
    (function () {
        // Polyfill for Function.prototype.bind
        function bind(fn, thisArg) {
            return function () {
                fn.apply(thisArg, arguments);
            };
        }
        function handle(deferred) {
            var _this = this;
            if (this.s /*tate*/ === null) {
                this.d /*eferreds*/
                    .push(deferred);
                return;
            }
            exports.asap(function () {
                var cb = _this.s /*tate*/ ? deferred[0] : deferred[1];
                if (cb == null) {
                    (_this.s /*tate*/ ? deferred[2] : deferred[3])(_this.v /*alue*/);
                    return;
                }
                var ret;
                try {
                    ret = cb(_this.v /*alue*/);
                }
                catch (e) {
                    deferred[3](e);
                    return;
                }
                deferred[2](ret);
            });
        }
        function finale() {
            for (var i = 0, len = this.d /*eferreds*/.length; i < len; i++) {
                handle.call(this, this.d /*eferreds*/[i]);
            }
            this.d /*eferreds*/ = null;
        }
        function reject(newValue) {
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
        function doResolve(fn, onFulfilled, onRejected) {
            var done = false;
            try {
                fn(function (value) {
                    if (done)
                        return;
                    done = true;
                    onFulfilled(value);
                }, function (reason) {
                    if (done)
                        return;
                    done = true;
                    onRejected(reason);
                });
            }
            catch (ex) {
                if (done)
                    return;
                done = true;
                onRejected(ex);
            }
        }
        function resolve(newValue) {
            try {
                //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === this)
                    throw new TypeError("Promise self resolve");
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
            }
            catch (e) {
                reject.call(this, e);
            }
        }
        function Promise(fn) {
            this.s /*tate*/ = null;
            this.v /*alue*/ = null;
            this.d /*eferreds*/ = [];
            doResolve(fn, bind(resolve, this), bind(reject, this));
        }
        Promise.prototype.then = function (onFulfilled, onRejected) {
            var me = this;
            return new Promise(function (resolve, reject) {
                handle.call(me, [onFulfilled, onRejected, resolve, reject]);
            });
        };
        Promise.prototype["catch"] = function (onRejected) {
            return this.then(undefined, onRejected);
        };
        Promise.all = function () {
            var args = [].slice.call(arguments.length === 1 && exports.isArray(arguments[0]) ? arguments[0] : arguments);
            return new Promise(function (resolve, reject) {
                if (args.length === 0) {
                    resolve(args);
                    return;
                }
                var remaining = args.length;
                function res(i, val) {
                    try {
                        if (val && (typeof val === "object" || typeof val === "function")) {
                            var then = val.then;
                            if (typeof then === "function") {
                                then.call(val, function (val) {
                                    res(i, val);
                                }, reject);
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    }
                    catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };
        Promise.resolve = function (value) {
            if (value && typeof value === "object" && value.constructor === Promise) {
                return value;
            }
            return new Promise(function (resolve) {
                resolve(value);
            });
        };
        Promise.reject = function (value) {
            return new Promise(function (_resolve, reject) {
                reject(value);
            });
        };
        Promise.race = function (values) {
            return new Promise(function (resolve, reject) {
                for (var i = 0, len = values.length; i < len; i++) {
                    values[i].then(resolve, reject);
                }
            });
        };
        window["Promise"] = Promise;
    })();
}
// Bobril.StyleShim
if (ieVersion() === 9) {
    (function () {
        function addFilter(s, v) {
            if (s.zoom == null)
                s.zoom = "1";
            var f = s.filter;
            s.filter = f == null ? v : f + " " + v;
        }
        var simpleLinearGradient = /^linear\-gradient\(to (.+?),(.+?),(.+?)\)/gi;
        setStyleShim("background", function (s, v, oldName) {
            var match = simpleLinearGradient.exec(v);
            if (match == null)
                return;
            var dir = match[1];
            var color1 = match[2];
            var color2 = match[3];
            var tmp;
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
            addFilter(s, "progid:DXImageTransform.Microsoft.gradient(startColorstr='" +
                color1 +
                "',endColorstr='" +
                color2 +
                "', gradientType='" +
                dir +
                "')");
        });
    })();
}
else {
    (function () {
        var testStyle = document.createElement("div").style;
        testStyle.cssText = "background:-webkit-linear-gradient(top,red,red)";
        if (testStyle.background.length > 0) {
            (function () {
                var startsWithGradient = /^(?:repeating\-)?(?:linear|radial)\-gradient/gi;
                var revDirs = {
                    top: "bottom",
                    bottom: "top",
                    left: "right",
                    right: "left"
                };
                function gradientWebkitConvertor(style, value, name) {
                    if (startsWithGradient.test(value)) {
                        var pos = value.indexOf("(to ");
                        if (pos > 0) {
                            pos += 4;
                            var posEnd = value.indexOf(",", pos);
                            var dir = value.slice(pos, posEnd);
                            dir = dir
                                .split(" ")
                                .map(function (v) { return revDirs[v] || v; })
                                .join(" ");
                            value = value.slice(0, pos - 3) + dir + value.slice(posEnd);
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
function isCheckboxLike(el) {
    var t = el.type;
    return t === "checkbox" || t === "radio";
}
function stringArrayEqual(a1, a2) {
    var l = a1.length;
    if (l !== a2.length)
        return false;
    for (var j = 0; j < l; j++) {
        if (a1[j] !== a2[j])
            return false;
    }
    return true;
}
function stringArrayContains(a, v) {
    for (var j = 0; j < a.length; j++) {
        if (a[j] === v)
            return true;
    }
    return false;
}
function selectedArray(options) {
    var res = [];
    for (var j = 0; j < options.length; j++) {
        if (options[j].selected)
            res.push(options[j].value);
    }
    return res;
}
var prevSetValueCallback = setSetValue(function (el, node, newValue, oldValue) {
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
        node.ctx[bValue] = newValue;
    }
    var isMultiSelect = isSelect && el.multiple;
    var emitDiff = false;
    if (isMultiSelect) {
        var options = el.options;
        var currentMulti = selectedArray(options);
        if (!stringArrayEqual(newValue, currentMulti)) {
            if (oldValue === undefined ||
                stringArrayEqual(currentMulti, oldValue) ||
                !stringArrayEqual(newValue, node.ctx[bValue])) {
                for (var j = 0; j < options.length; j++) {
                    options[j].selected = stringArrayContains(newValue, options[j].value);
                }
                currentMulti = selectedArray(options);
                if (stringArrayEqual(currentMulti, newValue)) {
                    emitDiff = true;
                }
            }
            else {
                emitDiff = true;
            }
        }
    }
    else if (isInput || isSelect) {
        if (isInput && isCheckboxLike(el)) {
            var currentChecked = el.checked;
            if (newValue !== currentChecked) {
                if (oldValue === undefined || currentChecked === oldValue || newValue !== node.ctx[bValue]) {
                    el.checked = newValue;
                }
                else {
                    emitDiff = true;
                }
            }
        }
        else {
            var isCombobox = isSelect && el.size < 2;
            var currentValue = el[tValue];
            if (newValue !== currentValue) {
                if (oldValue === undefined || currentValue === oldValue || newValue !== node.ctx[bValue]) {
                    if (isSelect) {
                        if (newValue === "") {
                            el.selectedIndex = isCombobox ? 0 : -1;
                        }
                        else {
                            el[tValue] = newValue;
                        }
                        if (newValue !== "" || isCombobox) {
                            currentValue = el[tValue];
                            if (newValue !== currentValue) {
                                emitDiff = true;
                            }
                        }
                    }
                    else {
                        el[tValue] = newValue;
                    }
                }
                else {
                    emitDiff = true;
                }
            }
        }
    }
    if (emitDiff) {
        emitOnChange(undefined, el, node);
    }
    else {
        node.ctx[bValue] = newValue;
    }
});
function emitOnChange(ev, target, node) {
    if (target && target.nodeName === "OPTION") {
        target = document.activeElement;
        node = deref(target);
    }
    if (!node) {
        return false;
    }
    var c = node.component;
    var hasProp = node.attrs && node.attrs[bValue];
    var hasOnChange = c && c.onChange != null;
    var hasPropOrOnChange = hasProp || hasOnChange;
    var hasOnSelectionChange = c && c.onSelectionChange != null;
    if (!hasPropOrOnChange && !hasOnSelectionChange)
        return false;
    var ctx = node.ctx;
    var tagName = target.tagName;
    var isSelect = tagName === "SELECT";
    var isMultiSelect = isSelect && target.multiple;
    if (hasPropOrOnChange && isMultiSelect) {
        var vs = selectedArray(target.options);
        if (!stringArrayEqual(ctx[bValue], vs)) {
            ctx[bValue] = vs;
            if (hasProp)
                hasProp(vs);
            if (hasOnChange)
                c.onChange(ctx, vs);
        }
    }
    else if (hasPropOrOnChange && isCheckboxLike(target)) {
        // Postpone change event so onClick will be processed before it
        if (ev && ev.type === "change") {
            setTimeout(function () {
                emitOnChange(undefined, target, node);
            }, 10);
            return false;
        }
        if (target.type === "radio") {
            var radios = document.getElementsByName(target.name);
            for (var j = 0; j < radios.length; j++) {
                var radio = radios[j];
                var radioNode = deref(radio);
                if (!radioNode)
                    continue;
                var rbHasProp = node.attrs[bValue];
                var radioComponent = radioNode.component;
                var rbHasOnChange = radioComponent && radioComponent.onChange != null;
                if (!rbHasProp && !rbHasOnChange)
                    continue;
                var radioCtx = radioNode.ctx;
                var vrb = radio.checked;
                if (radioCtx[bValue] !== vrb) {
                    radioCtx[bValue] = vrb;
                    if (rbHasProp)
                        rbHasProp(vrb);
                    if (rbHasOnChange)
                        radioComponent.onChange(radioCtx, vrb);
                }
            }
        }
        else {
            var vb = target.checked;
            if (ctx[bValue] !== vb) {
                ctx[bValue] = vb;
                if (hasProp)
                    hasProp(vb);
                if (hasOnChange)
                    c.onChange(ctx, vb);
            }
        }
    }
    else {
        if (hasPropOrOnChange) {
            var v = target.value;
            if (ctx[bValue] !== v) {
                ctx[bValue] = v;
                if (hasProp)
                    hasProp(v);
                if (hasOnChange)
                    c.onChange(ctx, v);
            }
        }
        if (hasOnSelectionChange) {
            var sStart = target.selectionStart;
            var sEnd = target.selectionEnd;
            var sDir = target.selectionDirection;
            var swap = false;
            var oStart = ctx[bSelectionStart];
            if (sDir == null) {
                if (sEnd === oStart)
                    swap = true;
            }
            else if (sDir === "backward") {
                swap = true;
            }
            if (swap) {
                var s = sStart;
                sStart = sEnd;
                sEnd = s;
            }
            emitOnSelectionChange(node, sStart, sEnd);
        }
    }
    return false;
}
function emitOnSelectionChange(node, start, end) {
    var c = node.component;
    var ctx = node.ctx;
    if (c && (ctx[bSelectionStart] !== start || ctx[bSelectionEnd] !== end)) {
        ctx[bSelectionStart] = start;
        ctx[bSelectionEnd] = end;
        if (c.onSelectionChange)
            c.onSelectionChange(ctx, {
                startPosition: start,
                endPosition: end
            });
    }
}
function select(node, start, end) {
    if (end === void 0) { end = start; }
    node.element.setSelectionRange(Math.min(start, end), Math.max(start, end), start > end ? "backward" : "forward");
    emitOnSelectionChange(node, start, end);
}
exports.select = select;
function emitOnMouseChange(ev, _target, _node) {
    var f = focused();
    if (f)
        emitOnChange(ev, f.element, f);
    return false;
}
// click here must have lower priority (higher number) over mouse handlers
var events = ["input", "cut", "paste", "keydown", "keypress", "keyup", "click", "change"];
for (var i = 0; i < events.length; i++)
    addEvent(events[i], 10, emitOnChange);
var mouseEvents = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel"];
for (var i = 0; i < mouseEvents.length; i++)
    addEvent(mouseEvents[i], 2, emitOnMouseChange);
function buildParam(ev) {
    return {
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        meta: ev.metaKey || false,
        which: ev.which || ev.keyCode
    };
}
function emitOnKeyDown(ev, _target, node) {
    if (!node)
        return false;
    var param = buildParam(ev);
    if (bubble(node, "onKeyDown", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyUp(ev, _target, node) {
    if (!node)
        return false;
    var param = buildParam(ev);
    if (bubble(node, "onKeyUp", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyPress(ev, _target, node) {
    if (!node)
        return false;
    if (ev.which === 0 || // don't want special key presses
        ev.altKey // Ignore Alt+num in Firefox
    )
        return false;
    var param = { charCode: ev.which || ev.keyCode };
    if (bubble(node, "onKeyPress", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
addEvent("keydown", 50, emitOnKeyDown);
addEvent("keyup", 50, emitOnKeyUp);
addEvent("keypress", 50, emitOnKeyPress);
var MoveOverIsNotTap = 13;
var TapShouldBeShorterThanMs = 750;
var MaxBustDelay = 500;
var MaxBustDelayForIE = 800;
var BustDistance = 50;
var ownerCtx = null;
var invokingOwner;
var onClickText = "onClick";
var onDoubleClickText = "onDoubleClick";
// PureFuncs: isMouseOwner, isMouseOwnerEvent
function isMouseOwner(ctx) {
    return ownerCtx === ctx;
}
exports.isMouseOwner = isMouseOwner;
function isMouseOwnerEvent() {
    return invokingOwner;
}
exports.isMouseOwnerEvent = isMouseOwnerEvent;
function registerMouseOwner(ctx) {
    ownerCtx = ctx;
}
exports.registerMouseOwner = registerMouseOwner;
function releaseMouseOwner() {
    ownerCtx = null;
}
exports.releaseMouseOwner = releaseMouseOwner;
function invokeMouseOwner(handlerName, param) {
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
function hasPointerEventsNoneB(node) {
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
function hasPointerEventsNone(target) {
    var bNode = deref(target);
    return hasPointerEventsNoneB(bNode);
}
function revertVisibilityChanges(hiddenEls) {
    if (hiddenEls.length) {
        for (var i = hiddenEls.length - 1; i >= 0; --i) {
            hiddenEls[i].t.style.visibility = hiddenEls[i].p;
        }
        return true;
    }
    return false;
}
function pushAndHide(hiddenEls, t) {
    hiddenEls.push({ t: t, p: t.style.visibility });
    t.style.visibility = "hidden";
}
function pointerThroughIE(ev, target, _node) {
    var hiddenEls = [];
    var t = target;
    while (hasPointerEventsNone(t)) {
        pushAndHide(hiddenEls, t);
        t = document.elementFromPoint(ev.x, ev.y);
    }
    if (revertVisibilityChanges(hiddenEls)) {
        try {
            t.dispatchEvent(ev);
        }
        catch (e) {
            return false;
        }
        preventDefault(ev);
        return true;
    }
    return false;
}
function addEvent5(name, callback) {
    addEvent(name, 5, callback);
}
var pointersEventNames = ["PointerDown", "PointerMove", "PointerUp", "PointerCancel"];
var i;
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
function type2Bobril(t) {
    if (t === "mouse" || t === 4)
        return 0 /* Mouse */;
    if (t === "pen" || t === 3)
        return 2 /* Pen */;
    return 1 /* Touch */;
}
function pointerEventsNoneFix(x, y, target, node) {
    var hiddenEls = [];
    var t = target;
    while (hasPointerEventsNoneB(node)) {
        pushAndHide(hiddenEls, t);
        t = document.elementFromPoint(x, y);
        node = deref(t);
    }
    revertVisibilityChanges(hiddenEls);
    return [t, node];
}
function buildHandlerPointer(name) {
    return function handlePointerDown(ev, target, node) {
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        var button = ev.button + 1;
        var type = type2Bobril(ev.pointerType);
        var buttons = ev.buttons;
        if (button === 0 && type === 0 /* Mouse */ && buttons) {
            button = 1;
            while (!(buttons & 1)) {
                buttons = buttons >> 1;
                button++;
            }
        }
        var param = {
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
function buildHandlerTouch(name) {
    return function handlePointerDown(ev, target, node) {
        var preventDef = false;
        for (var i = 0; i < ev.changedTouches.length; i++) {
            var t = ev.changedTouches[i];
            target = document.elementFromPoint(t.clientX, t.clientY);
            node = deref(target);
            var param = {
                id: t.identifier + 2,
                type: 1 /* Touch */,
                x: t.clientX,
                y: t.clientY,
                button: 1,
                shift: ev.shiftKey,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                meta: ev.metaKey || false,
                count: ev.detail
            };
            if (emitEvent("!" + name, param, target, node))
                preventDef = true;
        }
        if (preventDef) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}
function buildHandlerMouse(name) {
    return function handlePointer(ev, target, node) {
        target = document.elementFromPoint(ev.clientX, ev.clientY);
        node = deref(target);
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        var param = {
            id: 1,
            type: 0 /* Mouse */,
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
if (window.ontouchstart !== undefined) {
    addEvent5("touchstart", buildHandlerTouch(pointersEventNames[0] /*"PointerDown"*/));
    addEvent5("touchmove", buildHandlerTouch(pointersEventNames[1] /*"PointerMove"*/));
    addEvent5("touchend", buildHandlerTouch(pointersEventNames[2] /*"PointerUp"*/));
    addEvent5("touchcancel", buildHandlerTouch(pointersEventNames[3] /*"PointerCancel"*/));
    listenMouse();
}
else if (window.onpointerdown !== undefined) {
    for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
        var name = pointersEventNames[i];
        addEvent5(name.toLowerCase(), buildHandlerPointer(name));
    }
}
else if (window.onmspointerdown !== undefined) {
    for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
        var name = pointersEventNames[i];
        addEvent5("@MS" + name, buildHandlerPointer(name));
    }
}
else {
    listenMouse();
}
for (var j = 0; j < 4 /*pointersEventNames.length*/; j++) {
    (function (name) {
        var onName = "on" + name;
        addEvent("!" + name, 50, function (ev, _target, node) {
            return invokeMouseOwner(onName, ev) || bubble(node, onName, ev) != null;
        });
    })(pointersEventNames[j]);
}
var pointersDown = newHashObj();
var toBust = [];
var firstPointerDown = -1;
var firstPointerDownTime = 0;
var firstPointerDownX = 0;
var firstPointerDownY = 0;
var tapCanceled = false;
var lastMouseEv;
function diffLess(n1, n2, diff) {
    return Math.abs(n1 - n2) < diff;
}
var prevMousePath = [];
function revalidateMouseIn() {
    if (lastMouseEv)
        mouseEnterAndLeave(lastMouseEv);
}
exports.revalidateMouseIn = revalidateMouseIn;
function mouseEnterAndLeave(ev) {
    lastMouseEv = ev;
    var t = document.elementFromPoint(ev.x, ev.y);
    var toPath = vdomPath(t);
    var node = toPath.length == 0 ? undefined : toPath[toPath.length - 1];
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(ev.x, ev.y, t, node == null ? undefined : node);
        t = fixed[0];
        toPath = vdomPath(t);
    }
    bubble(node, "onMouseOver", ev);
    var common = 0;
    while (common < prevMousePath.length && common < toPath.length && prevMousePath[common] === toPath[common])
        common++;
    var n;
    var c;
    var i = prevMousePath.length;
    if (i > 0) {
        n = prevMousePath[i - 1];
        if (n) {
            c = n.component;
            if (c && c.onMouseOut)
                c.onMouseOut(n.ctx, ev);
        }
    }
    while (i > common) {
        i--;
        n = prevMousePath[i];
        if (n) {
            c = n.component;
            if (c && c.onMouseLeave)
                c.onMouseLeave(n.ctx, ev);
        }
    }
    while (i < toPath.length) {
        n = toPath[i];
        if (n) {
            c = n.component;
            if (c && c.onMouseEnter)
                c.onMouseEnter(n.ctx, ev);
        }
        i++;
    }
    prevMousePath = toPath;
    if (i > 0) {
        n = prevMousePath[i - 1];
        if (n) {
            c = n.component;
            if (c && c.onMouseIn)
                c.onMouseIn(n.ctx, ev);
        }
    }
    return false;
}
function noPointersDown() {
    return Object.keys(pointersDown).length === 0;
}
function bustingPointerDown(ev, _target, _node) {
    if (firstPointerDown === -1 && noPointersDown()) {
        firstPointerDown = ev.id;
        firstPointerDownTime = exports.now();
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
function bustingPointerMove(ev, target, node) {
    // Browser forgot to send mouse up? Let's fix it
    if (ev.type === 0 /* Mouse */ && ev.button === 0 && pointersDown[ev.id] != null) {
        ev.button = 1;
        emitEvent("!PointerUp", ev, target, node);
        ev.button = 0;
    }
    if (firstPointerDown === ev.id) {
        mouseEnterAndLeave(ev);
        if (!diffLess(firstPointerDownX, ev.x, MoveOverIsNotTap) ||
            !diffLess(firstPointerDownY, ev.y, MoveOverIsNotTap))
            tapCanceled = true;
    }
    else if (noPointersDown()) {
        mouseEnterAndLeave(ev);
    }
    return false;
}
var clickingSpreeStart = 0;
var clickingSpreeCount = 0;
function shouldPreventClickingSpree(clickCount) {
    if (clickingSpreeCount == 0)
        return false;
    var n = exports.now();
    if (n < clickingSpreeStart + 1000 && clickCount >= clickingSpreeCount) {
        clickingSpreeStart = n;
        clickingSpreeCount = clickCount;
        return true;
    }
    clickingSpreeCount = 0;
    return false;
}
function preventClickingSpree() {
    clickingSpreeCount = 2;
    clickingSpreeStart = exports.now();
}
exports.preventClickingSpree = preventClickingSpree;
function bustingPointerUp(ev, target, node) {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        mouseEnterAndLeave(ev);
        firstPointerDown = -1;
        if (ev.type == 1 /* Touch */ && !tapCanceled) {
            if (exports.now() - firstPointerDownTime < TapShouldBeShorterThanMs) {
                emitEvent("!PointerCancel", ev, target, node);
                shouldPreventClickingSpree(1);
                var handled = invokeMouseOwner(onClickText, ev) || bubble(node, onClickText, ev) != null;
                var delay = ieVersion() ? MaxBustDelayForIE : MaxBustDelay;
                toBust.push([ev.x, ev.y, exports.now() + delay, handled ? 1 : 0]);
                return handled;
            }
        }
    }
    return false;
}
function bustingPointerCancel(ev, _target, _node) {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        firstPointerDown = -1;
    }
    return false;
}
function bustingClick(ev, _target, _node) {
    var n = exports.now();
    for (var i = 0; i < toBust.length; i++) {
        var j = toBust[i];
        if (j[2] < n) {
            toBust.splice(i, 1);
            i--;
            continue;
        }
        if (diffLess(j[0], ev.clientX, BustDistance) && diffLess(j[1], ev.clientY, BustDistance)) {
            toBust.splice(i, 1);
            if (j[3])
                preventDefault(ev);
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
function createHandlerMouse(handlerName) {
    return function (ev, _target, node) {
        if (firstPointerDown != ev.id && !noPointersDown())
            return false;
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
function decodeButton(ev) {
    return ev.which || ev.button;
}
function createHandler(handlerName, allButtons) {
    return function (ev, target, node) {
        if (listeningEventDeepness == 1 &&
            (target == null || target.nodeName != "INPUT" || ev.clientX != 0 || ev.clientY != 0)) {
            // Fix target node only for browser triggered events + crazy heuristic to ignore click
            target = document.elementFromPoint(ev.clientX, ev.clientY);
            node = deref(target);
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
                target = fixed[0];
                node = fixed[1];
            }
        }
        var button = decodeButton(ev) || 1;
        // Ignore non left mouse click/dblclick event, but not for contextmenu event
        if (!allButtons && button !== 1)
            return false;
        var param = {
            x: ev.clientX,
            y: ev.clientY,
            button: button,
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail || 1
        };
        if (handlerName == onDoubleClickText)
            param.count = 2;
        if (shouldPreventClickingSpree(param.count) ||
            invokeMouseOwner(handlerName, param) ||
            bubble(node, handlerName, param)) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}
function nodeOnPoint(x, y) {
    var target = document.elementFromPoint(x, y);
    var node = deref(target);
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(x, y, target, node);
        node = fixed[1];
    }
    return node;
}
exports.nodeOnPoint = nodeOnPoint;
function handleSelectStart(ev, _target, node) {
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
var wheelSupport = ("onwheel" in document.createElement("div") ? "" : "mouse") + "wheel";
function handleMouseWheel(ev, target, node) {
    if (hasPointerEventsNoneB(node)) {
        var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
        target = fixed[0];
        node = fixed[1];
    }
    var button = ev.button + 1;
    var buttons = ev.buttons;
    if (button === 0 && buttons) {
        button = 1;
        while (!(buttons & 1)) {
            buttons = buttons >> 1;
            button++;
        }
    }
    var dx = 0, dy;
    if (wheelSupport == "mousewheel") {
        dy = -1 / 40 * ev.wheelDelta;
        ev.wheelDeltaX && (dx = -1 / 40 * ev.wheelDeltaX);
    }
    else {
        dx = ev.deltaX;
        dy = ev.deltaY;
    }
    var param = {
        dx: dx,
        dy: dy,
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
exports.pointersDownCount = function () { return Object.keys(pointersDown).length; };
exports.firstPointerDownId = function () { return firstPointerDown; };
exports.ignoreClick = function (x, y) {
    var delay = ieVersion() ? MaxBustDelayForIE : MaxBustDelay;
    toBust.push([x, y, exports.now() + delay, 1]);
};
// Bobril.Focus
var currentActiveElement = undefined;
var currentFocusedNode = undefined;
var nodeStack = [];
function emitOnFocusChange(inFocus) {
    var newActiveElement = document.hasFocus() || inFocus ? document.activeElement : undefined;
    if (newActiveElement !== currentActiveElement) {
        currentActiveElement = newActiveElement;
        var newStack = vdomPath(currentActiveElement);
        var common = 0;
        while (common < nodeStack.length && common < newStack.length && nodeStack[common] === newStack[common])
            common++;
        var i = nodeStack.length - 1;
        var n;
        var c;
        if (i >= common) {
            n = nodeStack[i];
            if (n) {
                c = n.component;
                if (c && c.onBlur)
                    c.onBlur(n.ctx);
            }
            i--;
        }
        while (i >= common) {
            n = nodeStack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocusOut)
                    c.onFocusOut(n.ctx);
            }
            i--;
        }
        i = common;
        while (i + 1 < newStack.length) {
            n = newStack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocusIn)
                    c.onFocusIn(n.ctx);
            }
            i++;
        }
        if (i < newStack.length) {
            n = newStack[i];
            if (n) {
                c = n.component;
                if (c && c.onFocus)
                    c.onFocus(n.ctx);
            }
            i++;
        }
        nodeStack = newStack;
        currentFocusedNode = nodeStack.length == 0 ? undefined : null2undefined(nodeStack[nodeStack.length - 1]);
    }
    return false;
}
function emitOnFocusChangeDelayed() {
    setTimeout(function () { return emitOnFocusChange(false); }, 10);
    return false;
}
addEvent("^focus", 50, function () { return emitOnFocusChange(true); });
addEvent("^blur", 50, emitOnFocusChangeDelayed);
function focused() {
    return currentFocusedNode;
}
exports.focused = focused;
function focus(node) {
    if (node == null)
        return false;
    if (isString(node))
        return false;
    var style = node.style;
    if (style != null) {
        if (style.visibility === "hidden")
            return false;
        if (style.display === "none")
            return false;
    }
    var attrs = node.attrs;
    if (attrs != null) {
        var ti = attrs.tabindex;
        if (ti !== undefined || isNaturalyFocusable(node.tag, attrs)) {
            var el = node.element;
            el.focus();
            emitOnFocusChange(false);
            return true;
        }
    }
    var children = node.children;
    if (exports.isArray(children)) {
        for (var i = 0; i < children.length; i++) {
            if (focus(children[i]))
                return true;
        }
        return false;
    }
    return false;
}
exports.focus = focus;
// Bobril.Scroll
var callbacks = [];
function emitOnScroll(_ev, _target, node) {
    var info = {
        node: node
    };
    for (var i = 0; i < callbacks.length; i++) {
        callbacks[i](info);
    }
    return false;
}
// capturing event to hear everything
addEvent("^scroll", 10, emitOnScroll);
function addOnScroll(callback) {
    callbacks.push(callback);
}
exports.addOnScroll = addOnScroll;
function removeOnScroll(callback) {
    for (var i = 0; i < callbacks.length; i++) {
        if (callbacks[i] === callback) {
            callbacks.splice(i, 1);
            return;
        }
    }
}
exports.removeOnScroll = removeOnScroll;
var isHtml = /^(?:html)$/i;
var isScrollOrAuto = /^(?:auto)$|^(?:scroll)$/i;
// inspired by https://github.com/litera/jquery-scrollintoview/blob/master/jquery.scrollintoview.js
function isScrollable(el) {
    var styles = window.getComputedStyle(el);
    var res = [true, true];
    if (!isHtml.test(el.nodeName)) {
        res[0] = isScrollOrAuto.test(styles.overflowX);
        res[1] = isScrollOrAuto.test(styles.overflowY);
    }
    res[0] = res[0] && el.scrollWidth > el.clientWidth;
    res[1] = res[1] && el.scrollHeight > el.clientHeight;
    return res;
}
exports.isScrollable = isScrollable;
// returns standard X,Y order
function getWindowScroll() {
    var left = window.pageXOffset;
    var top = window.pageYOffset;
    return [left, top];
}
exports.getWindowScroll = getWindowScroll;
// returns node offset on page in standard X,Y order
function nodePagePos(node) {
    var rect = getDomNode(node).getBoundingClientRect();
    var res = getWindowScroll();
    res[0] += rect.left;
    res[1] += rect.top;
    return res;
}
exports.nodePagePos = nodePagePos;
var CSSMatrix = /** @class */ (function () {
    function CSSMatrix(data) {
        this.data = data;
    }
    CSSMatrix.fromString = function (s) {
        var c = s.match(/matrix3?d?\(([^\)]+)\)/i)[1].split(",");
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
    };
    CSSMatrix.identity = function () {
        return new CSSMatrix([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
    };
    CSSMatrix.prototype.multiply = function (m) {
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
    };
    CSSMatrix.prototype.translate = function (tx, ty, tz) {
        var z = new CSSMatrix([1, 0, 0, tx, 0, 1, 0, ty, 0, 0, 1, tz, 0, 0, 0, 1]);
        return this.multiply(z);
    };
    CSSMatrix.prototype.inverse = function () {
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
    };
    CSSMatrix.prototype.transformPoint = function (x, y) {
        var m = this.data;
        return [m[0] * x + m[1] * y + m[3], m[4] * x + m[5] * y + m[7]];
    };
    return CSSMatrix;
}());
function getTransformationMatrix(element) {
    var identity = CSSMatrix.identity();
    var transformationMatrix = identity;
    var x = element;
    var doc = x.ownerDocument.documentElement;
    while (x != undefined && x !== doc && x.nodeType != 1)
        x = x.parentNode;
    while (x != undefined && x !== doc) {
        var computedStyle = window.getComputedStyle(x, undefined);
        var c = CSSMatrix.fromString((computedStyle.transform ||
            computedStyle.OTransform ||
            computedStyle.WebkitTransform ||
            computedStyle.msTransform ||
            computedStyle.MozTransform ||
            "none").replace(/^none$/, "matrix(1,0,0,1,0,0)"));
        transformationMatrix = c.multiply(transformationMatrix);
        x = x.parentNode;
    }
    var w;
    var h;
    if ((element.nodeName + "").toLowerCase() === "svg") {
        var cs = getComputedStyle(element, undefined);
        w = parseFloat(cs.getPropertyValue("width")) || 0;
        h = parseFloat(cs.getPropertyValue("height")) || 0;
    }
    else {
        w = element.offsetWidth;
        h = element.offsetHeight;
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
    var rect = element.getBoundingClientRect();
    transformationMatrix = identity.translate(rect.left - left, rect.top - top, 0).multiply(transformationMatrix);
    return transformationMatrix;
}
function convertPointFromClientToNode(node, pageX, pageY) {
    var element = getDomNode(node);
    if (element == null)
        element = document.body;
    return getTransformationMatrix(element)
        .inverse()
        .transformPoint(pageX, pageY);
}
exports.convertPointFromClientToNode = convertPointFromClientToNode;
var lastDndId = 0;
var dnds = [];
var systemDnd = null;
var rootId = null;
var bodyCursorBackup;
var userSelectBackup;
var shimmedStyle = { userSelect: "" };
shimStyle(shimmedStyle);
var shimedStyleKeys = Object.keys(shimmedStyle);
var userSelectPropName = shimedStyleKeys[shimedStyleKeys.length - 1]; // renamed is last
var DndCtx = function (pointerId) {
    this.id = ++lastDndId;
    this.pointerid = pointerId;
    this.enabledOperations = 7 /* MoveCopyLink */;
    this.operation = 0 /* None */;
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
    if (pointerId >= 0)
        pointer2Dnd[pointerId] = this;
    dnds.push(this);
};
function lazyCreateRoot() {
    if (rootId == null) {
        var dbs = document.body.style;
        bodyCursorBackup = dbs.cursor;
        userSelectBackup = dbs[userSelectPropName];
        dbs[userSelectPropName] = "none";
        rootId = addRoot(dndRootFactory);
    }
}
var DndComp = {
    render: function (ctx, me) {
        var dnd = ctx.data;
        me.tag = "div";
        me.style = { position: "absolute", left: dnd.x, top: dnd.y };
        me.children = dnd.dragView(dnd);
    }
};
function currentCursor() {
    var cursor = "no-drop";
    if (dnds.length !== 0) {
        var dnd = dnds[0];
        if (dnd.beforeDrag)
            return "";
        if (dnd.cursor != null)
            return dnd.cursor;
        if (dnd.system)
            return "";
        switch (dnd.operation) {
            case 3 /* Move */:
                cursor = "move";
                break;
            case 1 /* Link */:
                cursor = "alias";
                break;
            case 2 /* Copy */:
                cursor = "copy";
                break;
        }
    }
    return cursor;
}
var DndRootComp = {
    render: function (_ctx, me) {
        var res = [];
        for (var i = 0; i < dnds.length; i++) {
            var dnd = dnds[i];
            if (dnd.beforeDrag)
                continue;
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
        var dbs = document.body.style;
        var cur = currentCursor();
        if (cur && dbs.cursor !== cur)
            dbs.cursor = cur;
        me.children = res;
    },
    onDrag: function (ctx) {
        exports.invalidate(ctx);
        return false;
    }
};
function dndRootFactory() {
    return { component: DndRootComp };
}
var dndProto = DndCtx.prototype;
dndProto.setOperation = function (operation) {
    this.operation = operation;
};
dndProto.setDragNodeView = function (view) {
    this.dragView = view;
};
dndProto.addData = function (type, data) {
    this.data[type] = data;
    return true;
};
dndProto.listData = function () {
    return Object.keys(this.data);
};
dndProto.hasData = function (type) {
    return this.data[type] !== undefined;
};
dndProto.getData = function (type) {
    return this.data[type];
};
dndProto.setEnabledOps = function (ops) {
    this.enabledOperations = ops;
};
dndProto.cancelDnd = function () {
    dndMoved(undefined, this);
    this.destroy();
};
dndProto.destroy = function () {
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
    if (systemDnd === this) {
        systemDnd = null;
    }
    if (dnds.length === 0 && rootId != null) {
        removeRoot(rootId);
        rootId = null;
        var dbs = document.body.style;
        dbs.cursor = bodyCursorBackup;
        dbs[userSelectPropName] = userSelectBackup;
    }
};
var pointer2Dnd = newHashObj();
function handlePointerDown(ev, _target, node) {
    var dnd = pointer2Dnd[ev.id];
    if (dnd) {
        dnd.cancelDnd();
    }
    if (ev.button <= 1) {
        dnd = new DndCtx(ev.id);
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
            var boundFn = htmlNode.getBoundingClientRect;
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
        }
        else {
            dnd.destroy();
        }
    }
    return false;
}
function dndMoved(node, dnd) {
    dnd.overNode = node;
    dnd.targetCtx = bubble(node, "onDragOver", dnd);
    if (dnd.targetCtx == null) {
        dnd.operation = 0 /* None */;
    }
    broadcast("onDrag", dnd);
}
function updateDndFromPointerEvent(dnd, ev) {
    dnd.shift = ev.shift;
    dnd.ctrl = ev.ctrl;
    dnd.alt = ev.alt;
    dnd.meta = ev.meta;
    dnd.x = ev.x;
    dnd.y = ev.y;
}
function handlePointerMove(ev, _target, node) {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd)
        return false;
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
function handlePointerUp(ev, _target, node) {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd)
        return false;
    if (!dnd.beforeDrag) {
        updateDndFromPointerEvent(dnd, ev);
        dndMoved(node, dnd);
        var t = dnd.targetCtx;
        if (t && bubble(t.me, "onDrop", dnd)) {
            dnd.destroy();
        }
        else {
            dnd.cancelDnd();
        }
        exports.ignoreClick(ev.x, ev.y);
        return true;
    }
    dnd.destroy();
    return false;
}
function handlePointerCancel(ev, _target, _node) {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd)
        return false;
    if (dnd.system)
        return false;
    if (!dnd.beforeDrag) {
        dnd.cancelDnd();
    }
    else {
        dnd.destroy();
    }
    return false;
}
function updateFromNative(dnd, ev) {
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
function handleDragStart(ev, _target, node) {
    var dnd = systemDnd;
    if (dnd != null) {
        dnd.destroy();
    }
    var activePointerIds = Object.keys(pointer2Dnd);
    if (activePointerIds.length > 0) {
        dnd = pointer2Dnd[activePointerIds[0]];
        dnd.system = true;
        systemDnd = dnd;
    }
    else {
        var startX = ev.clientX, startY = ev.clientY;
        dnd = new DndCtx(-1);
        dnd.system = true;
        systemDnd = dnd;
        dnd.x = startX;
        dnd.y = startY;
        dnd.lastX = startX;
        dnd.lastY = startY;
        dnd.startX = startX;
        dnd.startY = startY;
        var sourceCtx = bubble(node, "onDragStart", dnd);
        if (sourceCtx) {
            var htmlNode = getDomNode(sourceCtx.me);
            if (htmlNode == null) {
                dnd.destroy();
                return false;
            }
            dnd.started = true;
            var boundFn = htmlNode.getBoundingClientRect;
            if (boundFn) {
                var rect = boundFn.call(htmlNode);
                dnd.deltaX = rect.left - startX;
                dnd.deltaY = rect.top - startY;
            }
            lazyCreateRoot();
        }
        else {
            dnd.destroy();
            return false;
        }
    }
    dnd.beforeDrag = false;
    var eff = effectAllowedTable[dnd.enabledOperations];
    var dt = ev.dataTransfer;
    dt.effectAllowed = eff;
    if (dt.setDragImage) {
        var div = document.createElement("div");
        div.style.pointerEvents = "none";
        dt.setDragImage(div, 0, 0);
    }
    else {
        // For IE10 and IE11 hack to hide default drag element
        var style = ev.target.style;
        var opacityBackup = style.opacity;
        var widthBackup = style.width;
        var heightBackup = style.height;
        var paddingBackup = style.padding;
        style.opacity = "0";
        style.width = "0";
        style.height = "0";
        style.padding = "0";
        window.setTimeout(function () {
            style.opacity = opacityBackup;
            style.width = widthBackup;
            style.height = heightBackup;
            style.padding = paddingBackup;
        }, 0);
    }
    var data = dnd.data;
    var dataKeys = Object.keys(data);
    for (var i = 0; i < dataKeys.length; i++) {
        try {
            var k = dataKeys[i];
            var d = data[k];
            if (!isString(d))
                d = JSON.stringify(d);
            ev.dataTransfer.setData(k, d);
        }
        catch (e) {
            if (DEBUG)
                if (window.console)
                    console.log("Cannot set dnd data to " + dataKeys[i]);
        }
    }
    updateFromNative(dnd, ev);
    return false;
}
function setDropEffect(ev, op) {
    ev.dataTransfer.dropEffect = ["none", "link", "copy", "move"][op];
}
function handleDragOver(ev, _target, _node) {
    var dnd = systemDnd;
    if (dnd == null) {
        dnd = new DndCtx(-1);
        dnd.system = true;
        systemDnd = dnd;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        dnd.startX = dnd.x;
        dnd.startY = dnd.y;
        dnd.local = false;
        var dt = ev.dataTransfer;
        var eff = 0;
        var effectAllowed = undefined;
        try {
            effectAllowed = dt.effectAllowed;
        }
        catch (e) { }
        for (; eff < 7; eff++) {
            if (effectAllowedTable[eff] === effectAllowed)
                break;
        }
        dnd.enabledOperations = eff;
        var dtTypes = dt.types;
        if (dtTypes) {
            for (var i = 0; i < dtTypes.length; i++) {
                var tt = dtTypes[i];
                if (tt === "text/plain")
                    tt = "Text";
                else if (tt === "text/uri-list")
                    tt = "Url";
                dnd.data[tt] = null;
            }
        }
        else {
            if (dt.getData("Text") !== undefined)
                dnd.data["Text"] = null;
        }
    }
    updateFromNative(dnd, ev);
    setDropEffect(ev, dnd.operation);
    if (dnd.operation != 0 /* None */) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function handleDrag(ev, _target, _node) {
    var x = ev.clientX;
    var y = ev.clientY;
    var m = getMedia();
    if (systemDnd != null && ((x === 0 && y === 0) || x < 0 || y < 0 || x >= m.width || y >= m.height)) {
        systemDnd.x = 0;
        systemDnd.y = 0;
        systemDnd.operation = 0 /* None */;
        broadcast("onDrag", systemDnd);
    }
    return false;
}
function handleDragEnd(_ev, _target, _node) {
    if (systemDnd != null) {
        systemDnd.destroy();
    }
    return false;
}
function handleDrop(ev, _target, _node) {
    var dnd = systemDnd;
    if (dnd == null)
        return false;
    dnd.x = ev.clientX;
    dnd.y = ev.clientY;
    if (!dnd.local) {
        var dataKeys = Object.keys(dnd.data);
        var dt = ev.dataTransfer;
        for (var i_7 = 0; i_7 < dataKeys.length; i_7++) {
            var k = dataKeys[i_7];
            var d;
            if (k === "Files") {
                d = [].slice.call(dt.files, 0); // What a useless FileList type! Get rid of it.
            }
            else {
                d = dt.getData(k);
            }
            dnd.data[k] = d;
        }
    }
    updateFromNative(dnd, ev);
    var t = dnd.targetCtx;
    if (t && bubble(t.me, "onDrop", dnd)) {
        setDropEffect(ev, dnd.operation);
        dnd.destroy();
        preventDefault(ev);
    }
    else {
        dnd.cancelDnd();
    }
    return true;
}
function justPreventDefault(ev, _target, _node) {
    preventDefault(ev);
    return true;
}
function handleDndSelectStart(ev, _target, _node) {
    if (dnds.length === 0)
        return false;
    preventDefault(ev);
    return true;
}
function anyActiveDnd() {
    for (var i_8 = 0; i_8 < dnds.length; i_8++) {
        var dnd = dnds[i_8];
        if (dnd.beforeDrag)
            continue;
        return dnd;
    }
    return undefined;
}
exports.anyActiveDnd = anyActiveDnd;
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
exports.getDnds = function () { return dnds; };
var waitingForPopHashChange = -1;
function emitOnHashChange() {
    if (waitingForPopHashChange >= 0)
        clearTimeout(waitingForPopHashChange);
    waitingForPopHashChange = -1;
    exports.invalidate();
    return false;
}
addEvent("hashchange", 10, emitOnHashChange);
var myAppHistoryDeepness = 0;
var programPath = "";
function push(path, inApp) {
    var l = window.location;
    if (inApp) {
        programPath = path;
        l.hash = path.substring(1);
        myAppHistoryDeepness++;
    }
    else {
        l.href = path;
    }
}
function replace(path, inApp) {
    var l = window.location;
    if (inApp) {
        programPath = path;
        l.replace(l.pathname + l.search + path);
    }
    else {
        l.replace(path);
    }
}
function pop(distance) {
    myAppHistoryDeepness -= distance;
    waitingForPopHashChange = setTimeout(emitOnHashChange, 50);
    window.history.go(-distance);
}
var rootRoutes;
var nameRouteMap = {};
function encodeUrl(url) {
    return encodeURIComponent(url).replace(/%20/g, "+");
}
function decodeUrl(url) {
    return decodeURIComponent(url.replace(/\+/g, " "));
}
function encodeUrlPath(path) {
    return String(path)
        .split("/")
        .map(encodeUrl)
        .join("/");
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
                return "([^/]+)";
            }
            else if (match === "*") {
                paramNames.push("splat");
                return "(.*?)";
            }
            else {
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
function extractParams(pattern, path) {
    var object = compilePattern(pattern);
    var match = decodeUrl(path).match(object.matcher);
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
    return pattern.replace(paramInjectMatcher, function (_match, paramName) {
        paramName = paramName || "splat";
        // If param is optional don't check for existence
        if (paramName.slice(-1) !== "?") {
            if (params[paramName] == null)
                throw new Error('Missing "' + paramName + '" parameter for path "' + pattern + '"');
        }
        else {
            paramName = paramName.slice(0, -1);
            if (params[paramName] == null) {
                return "";
            }
        }
        var segment;
        if (paramName === "splat" && Array.isArray(params[paramName])) {
            segment = params[paramName][splatIndex++];
            if (segment == null)
                throw new Error("Missing splat # " + splatIndex + ' for path "' + pattern + '"');
        }
        else {
            segment = params[paramName];
        }
        return encodeUrlPath(segment);
    });
}
function findMatch(path, rs, outParams) {
    var l = rs.length;
    var notFoundRoute;
    var defaultRoute;
    var params;
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
var activeRoutes = [];
var futureRoutes;
var activeParams = newHashObj();
var nodesArray = [];
var setterOfNodesArray = [];
var urlRegex = /.*(?:\:|\/).*/;
function isInApp(name) {
    return !urlRegex.test(name);
}
function isAbsolute(url) {
    return url[0] === "/";
}
function noop() {
    return undefined;
}
function getSetterOfNodesArray(idx) {
    while (idx >= setterOfNodesArray.length) {
        setterOfNodesArray.push((function (a, i) { return function (n) {
            if (n)
                a[i] = n;
        }; })(nodesArray, idx));
    }
    return setterOfNodesArray[idx];
}
var firstRouting = true;
function rootNodeFactory() {
    if (waitingForPopHashChange >= 0)
        return undefined;
    var browserPath = window.location.hash;
    var path = browserPath.substr(1);
    if (!isAbsolute(path))
        path = "/" + path;
    var out = { p: {} };
    var matches = findMatch(path, rootRoutes, out) || [];
    if (firstRouting) {
        firstRouting = false;
        currentTransition = {
            inApp: true,
            type: 2 /* Pop */,
            name: undefined,
            params: undefined
        };
        transitionState = -1;
        programPath = browserPath;
    }
    else {
        if (!currentTransition && matches.length > 0 && browserPath != programPath) {
            runTransition(createRedirectPush(matches[0].name, out.p));
        }
    }
    if (currentTransition && currentTransition.type === 2 /* Pop */ && transitionState < 0) {
        programPath = browserPath;
        currentTransition.inApp = true;
        if (currentTransition.name == null && matches.length > 0) {
            currentTransition.name = matches[0].name;
            currentTransition.params = out.p;
            nextIteration();
            if (currentTransition != null)
                return undefined;
        }
        else
            return undefined;
    }
    if (currentTransition == null) {
        activeRoutes = matches;
        while (nodesArray.length > activeRoutes.length)
            nodesArray.pop();
        while (nodesArray.length < activeRoutes.length)
            nodesArray.push(undefined);
        activeParams = out.p;
    }
    var fn = noop;
    for (var i = 0; i < activeRoutes.length; i++) {
        (function (fnInner, r, routeParams, i) {
            fn = function (otherData) {
                var data = r.data || {};
                exports.assign(data, otherData);
                data.activeRouteHandler = fnInner;
                data.routeParams = routeParams;
                var handler = r.handler;
                var res;
                if (isFunction(handler)) {
                    res = handler(data);
                }
                else {
                    res = {
                        key: undefined,
                        ref: undefined,
                        data: data,
                        component: handler
                    };
                }
                if (r.keyBuilder)
                    res.key = r.keyBuilder(routeParams);
                else
                    res.key = r.name;
                res.ref = getSetterOfNodesArray(i);
                return res;
            };
        })(fn, activeRoutes[i], activeParams, i);
    }
    return fn();
}
function joinPath(p1, p2) {
    if (isAbsolute(p2))
        return p2;
    if (p1[p1.length - 1] === "/")
        return p1 + p2;
    return p1 + "/" + p2;
}
function registerRoutes(url, rs) {
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
        }
        else if (r.isNotFound) {
            u = joinPath(url, "*");
        }
        else if (r.url) {
            u = joinPath(url, r.url);
        }
        r.url = u;
        if (r.children)
            registerRoutes(u, r.children);
    }
}
function routes(root) {
    if (!exports.isArray(root)) {
        root = [root];
    }
    registerRoutes("/", root);
    rootRoutes = root;
    init(rootNodeFactory);
}
exports.routes = routes;
function route(config, nestedRoutes) {
    return {
        name: config.name,
        url: config.url,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        children: nestedRoutes
    };
}
exports.route = route;
function routeDefault(config) {
    return {
        name: config.name,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        isDefault: true
    };
}
exports.routeDefault = routeDefault;
function routeNotFound(config) {
    return {
        name: config.name,
        data: config.data,
        handler: config.handler,
        keyBuilder: config.keyBuilder,
        isNotFound: true
    };
}
exports.routeNotFound = routeNotFound;
function isActive(name, params) {
    if (params) {
        for (var prop in params) {
            if (params.hasOwnProperty(prop)) {
                if (activeParams[prop] !== params[prop])
                    return false;
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
exports.isActive = isActive;
function urlOfRoute(name, params) {
    if (isInApp(name)) {
        var r = nameRouteMap[name];
        if (DEBUG) {
            if (rootRoutes == null)
                throw Error("Cannot use urlOfRoute before defining routes");
            if (r == null)
                throw Error("Route with name " + name + " if not defined in urlOfRoute");
        }
        return "#" + injectParams(r.url, params);
    }
    return name;
}
exports.urlOfRoute = urlOfRoute;
function link(node, name, params) {
    node.data = node.data || {};
    node.data.routeName = name;
    node.data.routeParams = params;
    postEnhance(node, {
        render: function (ctx, me) {
            var data = ctx.data;
            me.attrs = me.attrs || {};
            if (me.tag === "a") {
                me.attrs.href = urlOfRoute(data.routeName, data.routeParams);
            }
            me.className = me.className || "";
            if (isActive(data.routeName, data.routeParams)) {
                me.className += " active";
            }
        },
        onClick: function (ctx) {
            var data = ctx.data;
            runTransition(createRedirectPush(data.routeName, data.routeParams));
            return true;
        }
    });
    return node;
}
exports.link = link;
function createRedirectPush(name, params) {
    return {
        inApp: isInApp(name),
        type: 0 /* Push */,
        name: name,
        params: params || {}
    };
}
exports.createRedirectPush = createRedirectPush;
function createRedirectReplace(name, params) {
    return {
        inApp: isInApp(name),
        type: 1 /* Replace */,
        name: name,
        params: params || {}
    };
}
exports.createRedirectReplace = createRedirectReplace;
function createBackTransition(distance) {
    distance = distance || 1;
    return {
        inApp: myAppHistoryDeepness >= distance,
        type: 2 /* Pop */,
        name: undefined,
        params: {},
        distance: distance
    };
}
exports.createBackTransition = createBackTransition;
var currentTransition = null;
var nextTransition = null;
var transitionState = 0;
function doAction(transition) {
    switch (transition.type) {
        case 0 /* Push */:
            push(urlOfRoute(transition.name, transition.params), transition.inApp);
            break;
        case 1 /* Replace */:
            replace(urlOfRoute(transition.name, transition.params), transition.inApp);
            break;
        case 2 /* Pop */:
            pop(transition.distance);
            break;
    }
    exports.invalidate();
}
function nextIteration() {
    while (true) {
        if (transitionState >= 0 && transitionState < activeRoutes.length) {
            var node = nodesArray[transitionState];
            transitionState++;
            if (!node)
                continue;
            var comp = node.component;
            if (!comp)
                continue;
            var fn = comp.canDeactivate;
            if (!fn)
                continue;
            var res = fn.call(comp, node.ctx, currentTransition);
            if (res === true)
                continue;
            Promise
                .resolve(res)
                .then(function (resp) {
                if (resp === true) {
                }
                else if (resp === false) {
                    currentTransition = null;
                    nextTransition = null;
                    if (programPath)
                        replace(programPath, true);
                    return;
                }
                else {
                    nextTransition = resp;
                }
                nextIteration();
            })
                .catch(function (err) {
                if (typeof console !== "undefined" && console.log)
                    console.log(err);
            });
            return;
        }
        else if (transitionState == activeRoutes.length) {
            if (nextTransition) {
                if (currentTransition && currentTransition.type == 0 /* Push */) {
                    push(urlOfRoute(currentTransition.name, currentTransition.params), currentTransition.inApp);
                }
                currentTransition = nextTransition;
                nextTransition = null;
            }
            transitionState = -1;
            if (!currentTransition.inApp || currentTransition.type === 2 /* Pop */) {
                var tr = currentTransition;
                if (!currentTransition.inApp)
                    currentTransition = null;
                doAction(tr);
                return;
            }
        }
        else if (transitionState === -1) {
            var out = { p: {} };
            if (currentTransition.inApp) {
                futureRoutes =
                    findMatch(urlOfRoute(currentTransition.name, currentTransition.params).substring(1), rootRoutes, out) || [];
            }
            else {
                futureRoutes = [];
            }
            transitionState = -2;
        }
        else if (transitionState === -2 - futureRoutes.length) {
            if (nextTransition) {
                transitionState = activeRoutes.length;
                continue;
            }
            if (currentTransition.type !== 2 /* Pop */) {
                var tr = currentTransition;
                currentTransition = null;
                doAction(tr);
            }
            else {
                exports.invalidate();
            }
            currentTransition = null;
            return;
        }
        else {
            if (nextTransition) {
                transitionState = activeRoutes.length;
                continue;
            }
            var rr = futureRoutes[futureRoutes.length + 1 + transitionState];
            transitionState--;
            var handler = rr.handler;
            var comp = undefined;
            if (isFunction(handler)) {
                var node = handler({});
                if (!node)
                    continue;
                comp = node.component;
            }
            else {
                comp = handler;
            }
            if (!comp)
                continue;
            var fn = comp.canActivate;
            if (!fn)
                continue;
            var res = fn.call(comp, currentTransition);
            if (res === true)
                continue;
            Promise.resolve(res)
                .then(function (resp) {
                if (resp === true) {
                }
                else if (resp === false) {
                    currentTransition = null;
                    nextTransition = null;
                    return;
                }
                else {
                    nextTransition = resp;
                }
                nextIteration();
            })
                .catch(function (err) {
                if (typeof console !== "undefined" && console.log)
                    console.log(err);
            });
            return;
        }
    }
}
exports.transitionRunCount = 1;
function runTransition(transition) {
    exports.transitionRunCount++;
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
exports.runTransition = runTransition;
function anchor(children, name, params) {
    return {
        children: children,
        component: {
            id: "anchor",
            postUpdateDom: function (ctx, me) {
                var routeName;
                if (name) {
                    routeName = name;
                }
                else {
                    var firstChild = (me.children && me.children[0]);
                    routeName = firstChild.attrs && firstChild.attrs.id;
                }
                if (!isActive(routeName, params)) {
                    ctx.l = 0;
                    return;
                }
                if (ctx.l === exports.transitionRunCount)
                    return;
                getDomNode(me).scrollIntoView();
                ctx.l = exports.transitionRunCount;
            }
        }
    };
}
exports.anchor = anchor;
function getRoutes() {
    return rootRoutes;
}
exports.getRoutes = getRoutes;
function getActiveRoutes() {
    return activeRoutes;
}
exports.getActiveRoutes = getActiveRoutes;
function getActiveParams() {
    return activeParams;
}
exports.getActiveParams = getActiveParams;
var allStyles = newHashObj();
var allSprites = newHashObj();
var allNameHints = newHashObj();
var dynamicSprites = [];
var imageCache = newHashObj();
var injectedCss = "";
var rebuildStyles = false;
var htmlStyle = null;
var globalCounter = 0;
var isIE9 = ieVersion() === 9;
var chainedBeforeFrame = setBeforeFrame(beforeFrame);
var cssSubRuleDelimiter = /\:|\ |\>/;
function buildCssSubRule(parent) {
    var matchSplit = cssSubRuleDelimiter.exec(parent);
    if (!matchSplit)
        return allStyles[parent].name;
    var posSplit = matchSplit.index;
    return allStyles[parent.substring(0, posSplit)].name + parent.substring(posSplit);
}
function buildCssRule(parent, name) {
    var result = "";
    if (parent) {
        if (exports.isArray(parent)) {
            for (var i_9 = 0; i_9 < parent.length; i_9++) {
                if (i_9 > 0) {
                    result += ",";
                }
                result += "." + buildCssSubRule(parent[i_9]) + "." + name;
            }
        }
        else {
            result = "." + buildCssSubRule(parent) + "." + name;
        }
    }
    else {
        result = "." + name;
    }
    return result;
}
function flattenStyle(cur, curPseudo, style, stylePseudo) {
    if (isString(style)) {
        var externalStyle = allStyles[style];
        if (externalStyle === undefined) {
            throw new Error("Unknown style " + style);
        }
        flattenStyle(cur, curPseudo, externalStyle.style, externalStyle.pseudo);
    }
    else if (isFunction(style)) {
        style(cur, curPseudo);
    }
    else if (exports.isArray(style)) {
        for (var i_10 = 0; i_10 < style.length; i_10++) {
            flattenStyle(cur, curPseudo, style[i_10], undefined);
        }
    }
    else if (typeof style === "object") {
        for (var key in style) {
            if (!Object.prototype.hasOwnProperty.call(style, key))
                continue;
            var val = style[key];
            if (isFunction(val)) {
                val = val(cur, key);
            }
            cur[key] = val;
        }
    }
    if (stylePseudo != null && curPseudo != null) {
        for (var pseudoKey in stylePseudo) {
            var curPseudoVal = curPseudo[pseudoKey];
            if (curPseudoVal === undefined) {
                curPseudoVal = newHashObj();
                curPseudo[pseudoKey] = curPseudoVal;
            }
            flattenStyle(curPseudoVal, undefined, stylePseudo[pseudoKey], undefined);
        }
    }
}
var firstStyles = false;
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
            setTimeout(exports.invalidate, 200);
        }
        for (var i_11 = 0; i_11 < dynamicSprites.length; i_11++) {
            var dynSprite = dynamicSprites[i_11];
            var image = imageCache[dynSprite.url];
            if (image == null)
                continue;
            var colorStr = dynSprite.color();
            if (colorStr !== dynSprite.lastColor) {
                dynSprite.lastColor = colorStr;
                if (dynSprite.width == null)
                    dynSprite.width = image.width;
                if (dynSprite.height == null)
                    dynSprite.height = image.height;
                var lastUrl = recolorAndClip(image, colorStr, dynSprite.width, dynSprite.height, dynSprite.left, dynSprite.top);
                var stDef = allStyles[dynSprite.styleId];
                stDef.style = {
                    backgroundImage: "url(" + lastUrl + ")",
                    width: dynSprite.width,
                    height: dynSprite.height,
                    backgroundPosition: 0
                };
            }
        }
        var styleStr = injectedCss;
        for (var key in allStyles) {
            var ss = allStyles[key];
            var parent_1 = ss.parent;
            var name_1 = ss.name;
            var ssPseudo = ss.pseudo;
            var ssStyle = ss.style;
            if (isFunction(ssStyle) && ssStyle.length === 0) {
                _a = ssStyle(), ssStyle = _a[0], ssPseudo = _a[1];
            }
            if (isString(ssStyle) && ssPseudo == null) {
                ss.realName = ssStyle;
                assert(name_1 != null, "Cannot link existing class to selector");
                continue;
            }
            ss.realName = name_1;
            var style_1 = newHashObj();
            var flattenPseudo = newHashObj();
            flattenStyle(undefined, flattenPseudo, undefined, ssPseudo);
            flattenStyle(style_1, flattenPseudo, ssStyle, undefined);
            var extractedInlStyle = null;
            if (style_1["pointerEvents"]) {
                extractedInlStyle = newHashObj();
                extractedInlStyle["pointerEvents"] = style_1["pointerEvents"];
            }
            if (isIE9) {
                if (style_1["userSelect"]) {
                    if (extractedInlStyle == null)
                        extractedInlStyle = newHashObj();
                    extractedInlStyle["userSelect"] = style_1["userSelect"];
                    delete style_1["userSelect"];
                }
            }
            ss.inlStyle = extractedInlStyle;
            shimStyle(style_1);
            var cssStyle = inlineStyleToCssDeclaration(style_1);
            if (cssStyle.length > 0)
                styleStr += (name_1 == null ? parent_1 : buildCssRule(parent_1, name_1)) + " {" + cssStyle + "}\n";
            for (var key2 in flattenPseudo) {
                var item = flattenPseudo[key2];
                shimStyle(item);
                styleStr +=
                    (name_1 == null ? parent_1 + ":" + key2 : buildCssRule(parent_1, name_1 + ":" + key2)) +
                        " {" +
                        inlineStyleToCssDeclaration(item) +
                        "}\n";
            }
        }
        var styleElement = document.createElement("style");
        styleElement.type = "text/css";
        if (styleElement.styleSheet) {
            styleElement.styleSheet.cssText = styleStr;
        }
        else {
            styleElement.appendChild(document.createTextNode(styleStr));
        }
        var head = document.head || document.getElementsByTagName("head")[0];
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
    var _a;
}
function style(node) {
    var styles = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        styles[_i - 1] = arguments[_i];
    }
    var className = node.className;
    var inlineStyle = node.style;
    var stack = null;
    var i = 0;
    var ca = styles;
    while (true) {
        if (ca.length === i) {
            if (stack === null || stack.length === 0)
                break;
            ca = stack.pop();
            i = stack.pop() + 1;
            continue;
        }
        var s = ca[i];
        if (s == null || s === true || s === false || s === "") {
            // skip
        }
        else if (isString(s)) {
            var sd = allStyles[s];
            if (className == null)
                className = sd.realName;
            else
                className = className + " " + sd.realName;
            var inlS = sd.inlStyle;
            if (inlS) {
                if (inlineStyle == null)
                    inlineStyle = {};
                inlineStyle = exports.assign(inlineStyle, inlS);
            }
        }
        else if (exports.isArray(s)) {
            if (ca.length > i + 1) {
                if (stack == null)
                    stack = [];
                stack.push(i);
                stack.push(ca);
            }
            ca = s;
            i = 0;
            continue;
        }
        else {
            if (inlineStyle == null)
                inlineStyle = {};
            for (var key in s) {
                if (s.hasOwnProperty(key)) {
                    var val = s[key];
                    if (isFunction(val))
                        val = val();
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
exports.style = style;
var uppercasePattern = /([A-Z])/g;
var msPattern = /^ms-/;
function hyphenateStyle(s) {
    if (s === "cssFloat")
        return "float";
    return s
        .replace(uppercasePattern, "-$1")
        .toLowerCase()
        .replace(msPattern, "-ms-");
}
function inlineStyleToCssDeclaration(style) {
    var res = "";
    for (var key in style) {
        var v = style[key];
        if (v === undefined)
            continue;
        res += hyphenateStyle(key) + ":" + (v === "" ? '""' : v) + ";";
    }
    res = res.slice(0, -1);
    return res;
}
// PureFuncs: styleDef, styleDefEx, sprite, spriteb, spritebc, asset
function styleDef(style, pseudo, nameHint) {
    return styleDefEx(undefined, style, pseudo, nameHint);
}
exports.styleDef = styleDef;
function styleDefEx(parent, style, pseudo, nameHint) {
    if (nameHint && nameHint !== "b-") {
        nameHint = nameHint.replace(/[^a-z0-9_-]/gi, "_").replace(/^[0-9]/, "_$&");
        if (allNameHints[nameHint]) {
            var counter = 1;
            while (allNameHints[nameHint + counter])
                counter++;
            nameHint = nameHint + counter;
        }
        allNameHints[nameHint] = true;
    }
    else {
        nameHint = "b-" + globalCounter++;
    }
    allStyles[nameHint] = {
        name: nameHint,
        realName: nameHint,
        parent: parent,
        style: style,
        inlStyle: null,
        pseudo: pseudo
    };
    invalidateStyles();
    return nameHint;
}
exports.styleDefEx = styleDefEx;
function selectorStyleDef(selector, style, pseudo) {
    allStyles["b-" + globalCounter++] = {
        name: null,
        realName: null,
        parent: selector,
        style: style,
        inlStyle: null,
        pseudo: pseudo
    };
    invalidateStyles();
}
exports.selectorStyleDef = selectorStyleDef;
function invalidateStyles() {
    rebuildStyles = true;
    exports.invalidate();
}
exports.invalidateStyles = invalidateStyles;
function updateSprite(spDef) {
    var stDef = allStyles[spDef.styleId];
    var style = {
        backgroundImage: "url(" + spDef.url + ")",
        width: spDef.width,
        height: spDef.height
    };
    style.backgroundPosition = -spDef.left + "px " + -spDef.top + "px";
    stDef.style = style;
    invalidateStyles();
}
function emptyStyleDef(url) {
    return styleDef({ width: 0, height: 0 }, undefined, url);
}
var rgbaRegex = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;
function recolorAndClip(image, colorStr, width, height, left, top) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    ctx.drawImage(image, -left, -top);
    var imgData = ctx.getImageData(0, 0, width, height);
    var imgDataData = imgData.data;
    var rgba = rgbaRegex.exec(colorStr);
    var cRed, cGreen, cBlue, cAlpha;
    if (rgba) {
        cRed = parseInt(rgba[1], 10);
        cGreen = parseInt(rgba[2], 10);
        cBlue = parseInt(rgba[3], 10);
        cAlpha = Math.round(parseFloat(rgba[4]) * 255);
    }
    else {
        cRed = parseInt(colorStr.substr(1, 2), 16);
        cGreen = parseInt(colorStr.substr(3, 2), 16);
        cBlue = parseInt(colorStr.substr(5, 2), 16);
        cAlpha = parseInt(colorStr.substr(7, 2), 16) || 0xff;
    }
    if (cAlpha === 0xff) {
        for (var i = 0; i < imgDataData.length; i += 4) {
            // Horrible workaround for imprecisions due to browsers using premultiplied alpha internally for canvas
            var red = imgDataData[i];
            if (red === imgDataData[i + 1] &&
                red === imgDataData[i + 2] &&
                (red === 0x80 || (imgDataData[i + 3] < 0xff && red > 0x70))) {
                imgDataData[i] = cRed;
                imgDataData[i + 1] = cGreen;
                imgDataData[i + 2] = cBlue;
            }
        }
    }
    else {
        for (var i = 0; i < imgDataData.length; i += 4) {
            var red = imgDataData[i];
            var alpha = imgDataData[i + 3];
            if (red === imgDataData[i + 1] &&
                red === imgDataData[i + 2] &&
                (red === 0x80 || (alpha < 0xff && red > 0x70))) {
                if (alpha === 0xff) {
                    imgDataData[i] = cRed;
                    imgDataData[i + 1] = cGreen;
                    imgDataData[i + 2] = cBlue;
                    imgDataData[i + 3] = cAlpha;
                }
                else {
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
var lastFuncId = 0;
var funcIdName = "b@funcId";
var imagesWithCredentials = false;
function loadImage(url, onload) {
    var image = new Image();
    image.crossOrigin = imagesWithCredentials ? "use-credentials" : "anonymous";
    image.addEventListener("load", function () { return onload(image); });
    image.src = url;
}
function setImagesWithCredentials(value) {
    imagesWithCredentials = value;
}
exports.setImagesWithCredentials = setImagesWithCredentials;
function sprite(url, color, width, height, left, top) {
    assert(allStyles[url] === undefined, "Wrong sprite url");
    left = left || 0;
    top = top || 0;
    var colorId = color || "";
    var isVarColor = false;
    if (isFunction(color)) {
        isVarColor = true;
        colorId = color[funcIdName];
        if (colorId == null) {
            colorId = "" + lastFuncId++;
            color[funcIdName] = colorId;
        }
    }
    var key = url + ":" + colorId + ":" + (width || 0) + ":" + (height || 0) + ":" + left + ":" + top;
    var spDef = allSprites[key];
    if (spDef)
        return spDef.styleId;
    var styleId = emptyStyleDef(url);
    spDef = { styleId: styleId, url: url, width: width, height: height, left: left, top: top };
    if (isVarColor) {
        spDef.color = color;
        spDef.lastColor = "";
        spDef.lastUrl = "";
        dynamicSprites.push(spDef);
        if (imageCache[url] === undefined) {
            imageCache[url] = null;
            loadImage(url, function (image) {
                imageCache[url] = image;
                invalidateStyles();
            });
        }
        invalidateStyles();
    }
    else if (width == null || height == null || color != null) {
        loadImage(url, function (image) {
            if (spDef.width == null)
                spDef.width = image.width;
            if (spDef.height == null)
                spDef.height = image.height;
            if (color != null) {
                spDef.url = recolorAndClip(image, color, spDef.width, spDef.height, spDef.left, spDef.top);
                spDef.left = 0;
                spDef.top = 0;
            }
            updateSprite(spDef);
        });
    }
    else {
        updateSprite(spDef);
    }
    allSprites[key] = spDef;
    return styleId;
}
exports.sprite = sprite;
var bundlePath = window["bobrilBPath"] || "bundle.png";
function setBundlePngPath(path) {
    bundlePath = path;
}
exports.setBundlePngPath = setBundlePngPath;
function spriteb(width, height, left, top) {
    var url = bundlePath;
    var key = url + "::" + width + ":" + height + ":" + left + ":" + top;
    var spDef = allSprites[key];
    if (spDef)
        return spDef.styleId;
    var styleId = styleDef({ width: 0, height: 0 });
    spDef = {
        styleId: styleId,
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
exports.spriteb = spriteb;
function spritebc(color, width, height, left, top) {
    return sprite(bundlePath, color, width, height, left, top);
}
exports.spritebc = spritebc;
function injectCss(css) {
    injectedCss += css;
    invalidateStyles();
}
exports.injectCss = injectCss;
function asset(path) {
    return path;
}
exports.asset = asset;
// Bobril.svgExtensions
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = angleInDegrees * Math.PI / 180.0;
    return {
        x: centerX + radius * Math.sin(angleInRadians),
        y: centerY - radius * Math.cos(angleInRadians)
    };
}
function svgDescribeArc(x, y, radius, startAngle, endAngle, startWithLine) {
    var absDeltaAngle = Math.abs(endAngle - startAngle);
    var close = false;
    if (absDeltaAngle > 360 - 0.01) {
        if (endAngle > startAngle)
            endAngle = startAngle - 359.9;
        else
            endAngle = startAngle + 359.9;
        if (radius === 0)
            return "";
        close = true;
    }
    else {
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
    if (close)
        d += "Z";
    return d;
}
function svgPie(x, y, radiusBig, radiusSmall, startAngle, endAngle) {
    var p = svgDescribeArc(x, y, radiusBig, startAngle, endAngle, false);
    var nextWithLine = true;
    if (p[p.length - 1] === "Z")
        nextWithLine = false;
    if (radiusSmall === 0) {
        if (!nextWithLine)
            return p;
    }
    return p + svgDescribeArc(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "Z";
}
exports.svgPie = svgPie;
function svgCircle(x, y, radius) {
    return svgDescribeArc(x, y, radius, 0, 360, false);
}
exports.svgCircle = svgCircle;
function svgRect(x, y, width, height) {
    return "M" + x + " " + y + "h" + width + "v" + height + "h" + -width + "Z";
}
exports.svgRect = svgRect;
// Bobril.helpers
function withKey(content, key) {
    if (isObject(content) && !exports.isArray(content)) {
        content.key = key;
        return content;
    }
    return {
        key: key,
        children: content
    };
}
exports.withKey = withKey;
function withRef(node, ctx, name) {
    node.ref = [ctx, name];
    return node;
}
exports.withRef = withRef;
function extendCfg(ctx, propertyName, value) {
    var c = ctx.me.cfg;
    if (c !== undefined) {
        c[propertyName] = value;
    }
    else {
        c = Object.assign({}, ctx.cfg);
        c[propertyName] = value;
        ctx.me.cfg = c;
    }
}
exports.extendCfg = extendCfg;
// PureFuncs: styledDiv, createVirtualComponent, createComponent, createDerivedComponent, createOverridingComponent, prop, propi, propa, propim, getValue
function styledDiv(children) {
    var styles = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        styles[_i - 1] = arguments[_i];
    }
    return style({ tag: "div", children: children }, styles);
}
exports.styledDiv = styledDiv;
function createVirtualComponent(component) {
    return function (data, children) {
        if (children !== undefined) {
            if (data == null)
                data = {};
            data.children = children;
        }
        return { data: data, component: component };
    };
}
exports.createVirtualComponent = createVirtualComponent;
function createOverridingComponent(original, after) {
    var originalComponent = original().component;
    var overriding = overrideComponents(originalComponent, after);
    return createVirtualComponent(overriding);
}
exports.createOverridingComponent = createOverridingComponent;
function createComponent(component) {
    var originalRender = component.render;
    if (originalRender) {
        component.render = function (ctx, me, oldMe) {
            me.tag = "div";
            return originalRender.call(component, ctx, me, oldMe);
        };
    }
    else {
        component.render = function (_ctx, me) {
            me.tag = "div";
        };
    }
    return createVirtualComponent(component);
}
exports.createComponent = createComponent;
function createDerivedComponent(original, after) {
    var originalComponent = original().component;
    var merged = mergeComponents(originalComponent, after);
    return createVirtualComponent(merged);
}
exports.createDerivedComponent = createDerivedComponent;
function prop(value, onChange) {
    return function (val) {
        if (val !== undefined) {
            if (onChange !== undefined)
                onChange(val, value);
            value = val;
        }
        return value;
    };
}
exports.prop = prop;
function propi(value) {
    return function (val) {
        if (val !== undefined) {
            value = val;
            exports.invalidate();
        }
        return value;
    };
}
exports.propi = propi;
function propa(prop) {
    return function (val) {
        if (val !== undefined) {
            if (typeof val === "object" && isFunction(val.then)) {
                val.then(function (v) {
                    prop(v);
                }, function (err) {
                    if (window["console"] && console.error)
                        console.error(err);
                });
            }
            else {
                return prop(val);
            }
        }
        return prop();
    };
}
exports.propa = propa;
function propim(value, ctx, onChange) {
    return function (val) {
        if (val !== undefined && val !== value) {
            var oldVal = val;
            value = val;
            if (onChange !== undefined)
                onChange(val, oldVal);
            exports.invalidate(ctx);
        }
        return value;
    };
}
exports.propim = propim;
function getValue(value) {
    if (isFunction(value)) {
        return value();
    }
    return value;
}
exports.getValue = getValue;
function emitChange(data, value) {
    if (isFunction(data.value)) {
        data.value(value);
    }
    if (data.onChange !== undefined) {
        data.onChange(value);
    }
}
exports.emitChange = emitChange;
// bobril-clouseau needs this
// bobril-g11n needs ignoreShouldChange and setBeforeInit
if (!window.b)
    window.b = {
        deref: deref,
        getRoots: getRoots,
        setInvalidate: setInvalidate,
        invalidateStyles: invalidateStyles,
        ignoreShouldChange: ignoreShouldChange,
        setAfterFrame: setAfterFrame,
        setBeforeFrame: setBeforeFrame,
        getDnds: exports.getDnds,
        setBeforeInit: setBeforeInit
    };
function createElement(name, props) {
    var children = [];
    for (var i = 2; i < arguments.length; i++) {
        var ii = arguments[i];
        children.push(ii);
    }
    if (isString(name)) {
        var res = { tag: name, children: children };
        if (props == null) {
            return res;
        }
        var attrs = {};
        var someAttrs = false;
        for (var n in props) {
            if (!props.hasOwnProperty(n))
                continue;
            if (n === "style") {
                style(res, props[n]);
                continue;
            }
            if (n === "key" || n === "ref" || n === "className" || n === "component" || n === "data") {
                res[n] = props[n];
                continue;
            }
            someAttrs = true;
            attrs[n] = props[n];
        }
        if (someAttrs)
            res.attrs = attrs;
        return res;
    }
    else {
        var res_1 = name(props, children);
        if (props != null) {
            if (props.key != null)
                res_1.key = props.key;
            if (props.ref != null)
                res_1.ref = props.ref;
        }
        return res_1;
    }
}
exports.createElement = createElement;
exports.__spread = exports.assign;
