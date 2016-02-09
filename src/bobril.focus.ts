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

    function focused(): IBobrilCacheNode {
        return currentFocusedNode;
    }

    var focusableTag = /^input$|^select$|^textarea$|^button$/;
    function focus(node: IBobrilCacheNode): boolean {
        return callElementAction(node, selectableTag, (el: HTMLElement) => el.focus(), emitOnFocusChange);    
    }

    function emitOnSelectionChange(node: IBobrilCacheNode, s: ISelectionData) : void {
        let c = node.component;
        if (c && c.onSelectionChange) {
            let sEnd: number;
            let sStart: number;
            if (s.direction === 'backward') {
                sStart = s.end; sEnd = s.start;
            } else {
                s.start = s.start; sEnd = s.end;
            }
            c.onSelectionChange(node.ctx, {startPosition : sStart, endPosition : sEnd});
        }
    }

    const selectableTag = /^input$|^textarea$/;
    function select(node: IBobrilCacheNode, s: ISelectionData): boolean {
        return callElementAction(node, selectableTag,
            (el: HTMLElement) => (<any>el).setSelectionRange(s.start, s.end, s.direction),
            () => emitOnSelectionChange(node, s));
    }

    function callElementAction(node: IBobrilCacheNode, allowedTags: RegExp, action:(el: HTMLElement) => void, emit?:() => void): boolean {
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
            if (ti !== undefined || allowedTags.test(node.tag)) {
                var el = node.element;
                action(<HTMLElement>el);
                emit();
                return true;
            }
        }
        let children = node.children;
        if (isArray(children)) {
            for (let i = 0; i < (<IBobrilChild[]>children).length; i++) {
                if (callElementAction((<IBobrilChild[]>children)[i], allowedTags, action, emit))
                    return true;
            }
            return false;
        }
        return callElementAction(children, allowedTags, action, emit);
    }

    b.focused = focused;
    b.focus = focus;
    b.select = select;
})(b);
