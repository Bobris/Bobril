/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.focus.d.ts"/>
(function (b) {
    var currentActiveElement = null;
    var currentFocusedNode = null;
    var nodestack = [];
    function emitOnFocusChange() {
        var newActiveElement = document.hasFocus() ? document.activeElement : null;
        if (newActiveElement !== currentActiveElement) {
            currentActiveElement = newActiveElement;
            var newstack = b.vdomPath(currentActiveElement);
            var common = 0;
            while (common < nodestack.length && common < newstack.length && nodestack[common] === newstack[common])
                common++;
            var i = nodestack.length - 1;
            var n;
            var c;
            if (i >= common) {
                n = nodestack[i];
                if (n) {
                    c = n.component;
                    if (c && c.onBlur)
                        c.onBlur(n.ctx);
                }
                i--;
            }
            while (i >= common) {
                n = nodestack[i];
                if (n) {
                    c = n.component;
                    if (c && c.onFocusOut)
                        c.onFocusOut(n.ctx);
                }
                i--;
            }
            i = common;
            while (i + 1 < newstack.length) {
                n = newstack[i];
                if (n) {
                    c = n.component;
                    if (c && c.onFocusIn)
                        c.onFocusIn(n.ctx);
                }
                i++;
            }
            if (i < newstack.length) {
                n = newstack[i];
                if (n) {
                    c = n.component;
                    if (c && c.onFocus)
                        c.onFocus(n.ctx);
                }
                i++;
            }
            nodestack = newstack;
            currentFocusedNode = nodestack.length == 0 ? null : nodestack[nodestack.length - 1];
        }
    }
    function emitOnFocusChangeDelayed() {
        setTimeout(emitOnFocusChange, 10);
    }
    b.addEvent("^focus", 50, emitOnFocusChange);
    b.addEvent("^blur", 50, emitOnFocusChangeDelayed);
    function focused() {
        return currentFocusedNode;
    }
    var focusableTag = /^input$|^select$|^textarea$|^button$/;
    function focus(node) {
        if (node == null)
            return false;
        if (typeof node === "string")
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
            var ti = attrs.tabindex != null ? attrs.tabindex : attrs.tabIndex; // < tabIndex is here because of backward compatibility
            if (ti !== undefined || focusableTag.test(node.tag)) {
                var el = node.element;
                el.focus();
                emitOnFocusChange();
                return true;
            }
        }
        var children = node.children;
        if (b.isArray(children)) {
            for (var i = 0; i < children.length; i++) {
                if (focus(children[i]))
                    return true;
            }
        }
        return false;
    }
    b.focused = focused;
    b.focus = focus;
})(b);
