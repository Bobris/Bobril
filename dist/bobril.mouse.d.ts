/// <reference path="bobril.d.ts"/>

interface IBobrilMouseEvent {
    x: number;
    y: number;
    // 1 - left (or touch), 2 - middle, 3 - right <- it does not make sense but that's W3C
    button: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    count: number;
}

declare const enum BobrilPointerType {
    Mouse = 0,
    Touch = 1,
    Pen = 2
}

interface IBobrilPointerEvent extends IBobrilMouseEvent {
    id: number;
    type: BobrilPointerType;
}

interface IBobrilMouseWheelEvent extends IBobrilMouseEvent {
    dx: number;
    dy: number;
}

interface IBobrilComponent {
    // called on input element after click
    onClick? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onDoubleClick? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onContextMenu? (ctx: IBobrilCtx, event: IBobrilMouseEvent): boolean;
    onMouseDown? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseUp? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseOver? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseEnter? (ctx: Object, event: IBobrilMouseEvent): void;
    onMouseLeave? (ctx: Object, event: IBobrilMouseEvent): void;
    onMouseIn? (ctx: Object, event: IBobrilMouseEvent): void;
    onMouseOut? (ctx: Object, event: IBobrilMouseEvent): void;
    onMouseMove? (ctx: Object, event: IBobrilMouseEvent): boolean;
    onMouseWheel? (ctx: Object, event: IBobrilMouseWheelEvent): boolean;
    onPointerDown? (ctx: Object, event: IBobrilPointerEvent): boolean;
    onPointerMove? (ctx: Object, event: IBobrilPointerEvent): boolean;
    onPointerUp? (ctx: Object, event: IBobrilPointerEvent): boolean;
    onPointerCancel? (ctx: Object, event: IBobrilPointerEvent): boolean;
}

interface IBobrilStatic {
    pointersDownCount?(): number;
    firstPointerDownId?(): number;
    ignoreClick?(x:number, y:number): void;
    isMouseOwner?(ctx: any): boolean;
    isMouseOwnerEvent?(): boolean;
    registerMouseOwner?(ctx: any): void;
    releaseMouseOwner?(): void;
    nodeOnPoint?(x:number, y:number): IBobrilCacheNode;
    revalidateMouseIn?(): void;
}
