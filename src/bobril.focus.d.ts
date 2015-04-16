interface IBobrilStatic {
    // return IBobrilCacheNode for currently focused element
    focused? (): IBobrilCacheNode;
    // set focus to first focusable node in parameter usually should be called from postInitDom method, return true is such node found
    focus? (node: IBobrilCacheNode): boolean;
}

interface IBobrilComponent {
    // this component gained focus
    onFocus? (ctx: Object): void;
    // this component lost focus
    onBlur? (ctx: Object): void;
    // focus moved from outside of this element to some child of this element
    onFocusIn? (ctx: Object): void;
    // focus moved from inside of this element to some outside element
    onFocusOut? (ctx: Object): void;
}
