interface IBobrilScroll {
    node: IBobrilCacheNode;    
}

interface IBobrilStatic {
    addOnScroll? (callback: (info?: IBobrilScroll) => void): void;
    removeOnScroll? (callback: (info?: IBobrilScroll) => void): void;
    // returns standart X,Y order
    isScrollable? (el: Element): [boolean, boolean];
    // returns standart X,Y order
    getWindowScroll?(): [number, number];
}
