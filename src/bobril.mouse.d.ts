﻿interface IMouseEvent extends ICoords {

}

interface IBobrilComponent {
    // called on input element after click
    onClick? (ctx: Object, event: IMouseEvent): boolean
    onDoubleClick? (ctx: Object, event: IMouseEvent): boolean;
    onMouseDown? (ctx: Object, event: IMouseEvent): boolean;
    onMouseUp? (ctx: Object, event: IMouseEvent): boolean;
    onMouseOver? (ctx: Object, event: IMouseEvent): boolean;
    onMouseEnter? (ctx: Object, event: IMouseEvent): void;
    onMouseLeave? (ctx: Object, event: IMouseEvent): void;
    onMouseMove? (ctx: Object, event: IMouseEvent): boolean;
} 