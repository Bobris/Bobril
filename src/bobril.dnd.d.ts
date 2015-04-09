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
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
}

interface IDndOverCtx extends IDndCtx {
    setTargetAndOperation(ctx: IBobrilCtx, operation: DndOp): void;
}

interface IDndStartCtx {
    setSource(ctx: IBobrilCtx): void;
    addData(type: string, data: any): boolean;
    setOpEnabled(link:boolean, copy:boolean, move:boolean): void;
}

interface IBobrilComponent {
    onDragStart?(ctx: Object, dndCtx: IDndStartCtx): boolean;
    onDrag?(ctx: Object, dndCtx: IDndCtx): boolean;
    onDragEnd?(ctx: Object, dndCtx: IDndCtx): boolean;

    onDragOver?(ctx: Object, dndCtx: IDndOverCtx): boolean;
    onDragEnter?(ctx: Object, dndCtx: IDndCtx): void;
    onDragLeave?(ctx: Object, dndCtx: IDndCtx): void;
    onDrop?(ctx: Object, dndCtx: IDndCtx): boolean;
}
