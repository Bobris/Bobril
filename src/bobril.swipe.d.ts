/// <reference path="bobril.mouse.d.ts" />

interface IBobrilComponent {
    onSwipeLeft? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onSwipeRight? (ctx: Object, event: IBobrilMouseEvent): boolean;
}
