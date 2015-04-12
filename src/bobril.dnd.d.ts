declare const enum DndOp {
    None = 0,
    Link = 1,
    Copy = 2,
    Move = 3
}

interface IDndCtx {
    id: number;
    hasData(type: string): boolean;
    getData(type: string): any;
    linkEnabled: boolean;
    copyEnabled: boolean;
    moveEnabled: boolean;
    operation: DndOp;
    x: number;
    y: number;
    // delta of left top position of dragged object when drag started, usually negative
    deltaX: number;
    deltaY: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}

interface IDndStartCtx {
    addData(type: string, data: any): boolean;
    setOpEnabled(link: boolean, copy: boolean, move: boolean): void;
    setDragNodeView(view: (dnd:IDndCtx) => IBobrilNode): void;
}

interface IDndOverCtx extends IDndCtx {
    setOperation(operation: DndOp): void;
}

interface IBobrilComponent {
    // if drag should start, bubbled
    onDragStart?(ctx: Object, dndCtx: IDndStartCtx): boolean;

    // broadcasted after drag started/moved/changed
    onDrag?(ctx: Object, dndCtx: IDndCtx): boolean;
    // broadcasted after drag ended even if without any action
    onDragEnd?(ctx: Object, dndCtx: IDndCtx): boolean;

    // Do you want to allow to drop here? bubbled
    onDragOver?(ctx: Object, dndCtx: IDndOverCtx): boolean;
    // User want to drop draged object here - do it - onDragOver before had to set you target
    onDrop?(ctx: Object, dndCtx: IDndCtx): boolean;
}
