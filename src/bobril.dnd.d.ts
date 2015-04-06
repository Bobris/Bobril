interface IDndCtx {
    addData(type: string, data: any): boolean;
    hasData(type: string): boolean;
    getData(type: string): any;
}

interface IBobrilComponent {
    onDragStart?(ctx: Object, dndCtx: IDndCtx): boolean;
    onDrag?(ctx: Object, dndCtx: IDndCtx): boolean;
    onDragEnd?(ctx: Object, dndCtx: IDndCtx): boolean;

    onDragOver?(ctx: Object, dndCtx: IDndCtx): boolean;
    onDragEnter?(ctx: Object, dndCtx: IDndCtx): void;
    onDragLeave?(ctx: Object, dndCtx: IDndCtx): void;
    onDrop?(ctx: Object, dndCtx: IDndCtx): boolean;
}
