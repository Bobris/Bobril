declare const enum DndOp {
    None = 0,
    Link = 1,
    Copy = 2,
    Move = 3
}

declare const enum DndEnabledOps {
    None = 0,
    Link = 1,
    Copy = 2,
    LinkCopy = 3,
    Move = 4,
    MoveLink = 5,
    MoveCopy = 6,
    MoveCopyLink = 7
}

interface IDndCtx {
    id: number;
    listData(): string[];
    hasData(type: string): boolean;
    getData(type: string): any;
    enabledOperations: DndEnabledOps;
    operation: DndOp;
    overNode: IBobrilCacheNode;
    // way to overrride mouse cursor, leave null to emulate dnd cursor
    cursor: string;
    // dnd is wating for activation by moving atleast distanceToStart pixels
    started: boolean;
    beforeDrag: boolean;
    system: boolean;
    local: boolean;
    ended: boolean;
    // default value is 10, but you can assign to this >=0 number in onDragStart
    distanceToStart: number;    
    // drag started at this pointer position
    startX: number;
    startY: number;
    // distance moved - only increasing
    totalX: number;
    totalY: number;
    // previous mouse/touch pointer position
    lastX: number;
    lastY: number;
    // actual mouse/touch pointer position
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

interface IDndStartCtx extends IDndCtx {
    addData(type: string, data: any): boolean;
    setEnabledOps(ops: DndEnabledOps): void;
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

interface IBobrilStatic {
    getDnds?(): IDndCtx[];
    anyActiveDnd?(): IDndCtx;
}
