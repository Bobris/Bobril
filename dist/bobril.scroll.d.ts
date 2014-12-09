interface IBobrilStatic {
    registerScrollable?(el: Element): void;
    unregisterScrollable?(el: Element): void;
    addOnScroll?(callback:()=>void): void;
    removeOnScroll?(callback:()=>void): void;
    isScrollable?(el: Element): { x:boolean; y:boolean };
}
