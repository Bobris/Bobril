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
    function emitOnFocusChangeIE() {
        setTimeout(emitOnFocusChange, 10);
        emitOnFocusChange();
    }
    var events = ["focus", "blur", "keydown", "keyup", "keypress", "mousedown", "mouseup", "mousemove", "touchstart", "touchend"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 50, (b.ieVersion() ? emitOnFocusChangeIE : emitOnFocusChange));
    function focused() {
        return currentFocusedNode;
    }
    function focusAction(node, element) {
        element.focus();
        emitOnFocusChange();
    }
    var focusableTag = /^input$|^select$|^textarea$|^button$/g;
    function focus(node) {
        return callElementAction(node, selectableTag, focusAction);
    }
    var selectableTag = /^input$|^textarea$/g;
    function select(node, start, end) {
        if (end === void 0) { end = start; }
        return callElementAction(node, selectableTag, function (node, element) {
            element.setSelectionRange(Math.min(start, end), Math.max(start, end), start > end ? "backward" : "forward");
            var c = node.component;
            if (c && c.onSelectionChange) {
                c.onSelectionChange(node.ctx, { startPosition: start, endPosition: end });
            }
        });
    }
    function callElementAction(node, tags, action) {
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
            var ti = attrs.tabindex || attrs.tabIndex; // < tabIndex is here because of backward compatibility
            if (ti !== undefined || tags.test(node.tag)) {
                var el = node.element;
                action(node, el);
                return true;
            }
        }
        var children = node.children;
        if (b.isArray(children)) {
            for (var i_1 = 0; i_1 < children.length; i_1++) {
                if (callElementAction(children[i_1], tags, action))
                    return true;
            }
            return false;
        }
    }
    b.focused = focused;
    b.focus = focus;
    b.select = select;
})(b);
