interface IMouseEvent {
    clientX: number;
    clientY: number;
}

interface IGenericCoords {
    x: number;
    y: number;
}

declare enum Swipe {
    Invalid = 0,
    Left = 1,
    Right = 2
}

interface IBobrilComponent {
    // called on input element after click
    onClick? (ctx: Object, event: IKeyDownUpEvent): boolean;
    onSwipeLeft? (ctx: Object, event: IKeyDownUpEvent): boolean;
    onSwipeRight? (ctx: Object, event: IKeyDownUpEvent): boolean;
} 