/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.focus.d.ts"/>

((b: IBobrilStatic) => {
    var currentActiveElement: Element = null;
    var currentFocusedNode: IBobrilNode = null;
    var nodestack: IBobrilCacheNode[] = [];

    function emitOnFocusChange(): void {
        var newActiveElement = document.hasFocus() ? document.activeElement : null;
        if (newActiveElement !== currentActiveElement) {
            currentActiveElement = newActiveElement;
            var newstack = b.vdomPath(currentActiveElement);
            var common = 0;
            while (common < nodestack.length && common < newstack.length && nodestack[common] === newstack[common])
                common++;
            var i = nodestack.length - 1;
            var n:IBobrilCacheNode;
            var c:IBobrilComponent;
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

    function emitOnFocusChangeIE(): void {
        setTimeout(emitOnFocusChange, 10);
        emitOnFocusChange();
    }

    var events = ["focus","blur","keydown","keyup","keypress","mousedown","mouseup","mousemove","touchstart","touchend"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 50, <any>(b.ieVersion() ? emitOnFocusChangeIE : emitOnFocusChange));

    if (b.ieVersion() === 8) {
        setInterval(emitOnFocusChange, 100);
    }

    function focused(): IBobrilCacheNode {
        return currentFocusedNode;
    }

    var focusableTag = /^input$|^select$|^textarea$|^button$/;
    function focus(node: IBobrilCacheNode): boolean {
        if (node == null) return false;
        if (typeof node === "string") return false;
        var style = node.style;
        if (style != null) {
            if (style.visibility === "hidden")
                return false;
            if (style.display === "none")
                return false;
        }
        var attrs = node.attrs;
        if (attrs != null) {
            var ti = attrs.tabindex || (<any>attrs).tabIndex; // < tabIndex is here because of backward compatibility
            if (ti !== undefined || focusableTag.test(node.tag)) {
                if (+ti === -1)
                    return false;
                var el = node.element;
                (<HTMLElement>el).focus();
                emitOnFocusChange();
                return true;
            }
        }
        var children = node.children;
        if (b.isArray(children)) {
            for (var i = 0; i < (<IBobrilChild[]>children).length; i++) {
                if (focus((<IBobrilChild[]>children)[i]))
                    return true;
            }
            return false;
        }
        return focus(children);
    }

    b.focused = focused;
    b.focus = focus;
})(b);
