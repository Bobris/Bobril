/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.focus.d.ts"/>

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

    // set focus to bobril node in parameter usually should be called from postInitDom method
    function focus(node: IBobrilNode): void {
        if (node == null) return;
        var el = (<IBobrilCacheNode>node).element;
        if (b.isArray(el)) el = (<Node[]>el)[0];
        (<HTMLElement>el).focus();
        emitOnFocusChange();
    }

    b.focused = focused;
    b.focus = focus;
})(b);
 