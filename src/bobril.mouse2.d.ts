/// <reference path="../src/bobril.d.ts"/>

interface IBobrilMouseEvent {
    x: number;
    y: number;
}

declare const enum BobrilPointerType {
    Mouse = 0,
    Touch = 1,
    Pen = 2
}

interface IBobrilPointerEvent {
    id: number;
    type: BobrilPointerType;
    x: number;
    y: number;
}

interface IBobrilComponent {
    // called on input element after click
    onClick? (ctx: Object, event: IBobrilMouseEvent): boolean
    onDoubleClick? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseDown? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseUp? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseOver? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseEnter? (ctx: Object, event: IBobrilMouseEvent): void;
    onMouseLeave? (ctx: Object, event: IBobrilMouseEvent): void;
    onMouseMove? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onPointerDown? (ctx: Object, event: IBobrilPointerEvent): boolean;
    onPointerMove? (ctx: Object, event: IBobrilPointerEvent): boolean;
    onPointerUp? (ctx: Object, event: IBobrilPointerEvent): boolean;
    onPointerCancel? (ctx: Object, event: IBobrilPointerEvent): boolean;
}

interface IBobrilStatic {
    isMouseOwner?(ctx: any): boolean;
    isMouseOwnerEvent?(): boolean;
    registerMouseOwner?(ctx: any): void;
    releaseMouseOwner?(): void;
}
