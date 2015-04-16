interface IBobrilStatic {
    registerScrollable? (el: Element): void;
    unregisterScrollable? (el: Element): void;
    addOnScroll? (callback: () => void): void;
    removeOnScroll? (callback: () => void): void;
    // returns standart X,Y order
    isScrollable? (el: Element): [boolean, boolean];
    // returns standart X,Y order
    getWindowScroll?(): [number, number];
}
