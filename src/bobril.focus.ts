/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.focus.d.ts"/>

((b: IBobrilStatic) => {
    var currentActiveElement: Element = null;
    var currentFocusedNode: IBobrilCacheNode = null;
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
            var n: IBobrilCacheNode;
            var c: IBobrilComponent;
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

    var events = ["focus", "blur", "keydown", "keyup", "keypress", "mousedown", "mouseup", "mousemove", "touchstart", "touchend"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 50, <any>(b.ieVersion() ? emitOnFocusChangeIE : emitOnFocusChange));

    function focused(): IBobrilCacheNode {
        return currentFocusedNode;
    }

    function focusAction(node: IBobrilCacheNode, element: HTMLElement) {
        element.focus();
        emitOnFocusChange();
    }

    var focusableTag = /^input$|^select$|^textarea$|^button$/g;
    function focus(node: IBobrilCacheNode): boolean {
        return callElementAction(node, selectableTag, focusAction);
    }

    const selectableTag = /^input$|^textarea$/g;
    function select(node: IBobrilCacheNode, start: number, end = start): boolean {
        return callElementAction(node, selectableTag,
            (node: IBobrilCacheNode, element: HTMLElement) => {
                (<any>element).setSelectionRange(Math.min(start, end), Math.max(start, end), start > end ? "backward" : "forward");
                let c = node.component;
                if (c && c.onSelectionChange) {
                    c.onSelectionChange(node.ctx, { startPosition: start, endPosition: end });
                }
            });
    }

    function callElementAction(node: IBobrilCacheNode, tags: RegExp, action: (node: IBobrilCacheNode, element: HTMLElement) => void): boolean {
        if (node == null) return false;
        if (typeof node === "string") return false;
        let style = node.style;
        if (style != null) {
            if (style.visibility === "hidden")
                return false;
            if (style.display === "none")
                return false;
        }
        let attrs = node.attrs;
        if (attrs != null) {
            var ti = attrs.tabindex || (<any>attrs).tabIndex; // < tabIndex is here because of backward compatibility
            if (ti !== undefined || tags.test(node.tag)) {
                var el = node.element;
                action(node, <HTMLElement>el);
                return true;
            }
        }
        let children = node.children;
        if (b.isArray(children)) {
            for (let i = 0; i < (<IBobrilCacheNode[]>children).length; i++) {
                if (callElementAction((<IBobrilCacheNode[]>children)[i], tags, action))
                    return true;
            }
            return false;
        }
    }

    b.focused = focused;
    b.focus = focus;
    b.select = select;
})(b);
