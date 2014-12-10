/// <reference path="bobril.mouse.d.ts" />

declare enum Swipe {
    Invalid = 0,
    Left = 1,
    Right = 2
}

interface IBobrilComponent {
    onSwipeLeft? (ctx: Object, event: IMouseEvent): boolean;
    onSwipeRight? (ctx: Object, event: IMouseEvent): boolean;
} 