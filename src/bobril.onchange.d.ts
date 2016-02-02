interface ISelectionChangeEvent {
    startPosition?: number;
    endPosition?: number;
}

interface ICaretPositionChangeEvent {
    position: number;
}

interface IBobrilComponent {
    // called on input element after any change with new value (string|boolean)
    onChange?(ctx: Object, value: any): void;
    onSelectionChange?(ctx: IBobrilCtx, event: ISelectionChangeEvent): void;
    onCaretPositionChange?(ctx: IBobrilCtx, event: ICaretPositionChangeEvent): void;
}
