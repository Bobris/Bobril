interface IMouseEvent extends  IGenericCoords {
    
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
    onSwipeLeft? (ctx: Object, event: IKeyDownUpEvent): boolean;
    onSwipeRight? (ctx: Object, event: IKeyDownUpEvent): boolean;
} 