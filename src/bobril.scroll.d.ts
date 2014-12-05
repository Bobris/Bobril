interface IBobrilStatic {
    registerScrollable?(el: Element);
    unregisterScrollable?(el: Element);
    addOnScroll?(callback:()=>void);
    removeOnScroll?(callback:()=>void);
    isScrollable?(el: Element): { x:boolean; y:boolean };
}
// https://github.com/litera/jquery-scrollintoview/blob/master/jquery.scrollintoview.js