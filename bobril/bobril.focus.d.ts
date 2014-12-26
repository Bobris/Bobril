interface IBobrilStatic {
    // return IBobrilCacheNode for currently focused element
    focused? (): IBobrilCacheNode;
    // set focus to bobril node in parameter usually should be called from postInitDom method
    focus? (node: IBobrilNode): void;
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
