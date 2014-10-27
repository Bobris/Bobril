interface IMouseEvent {
    clientX: number;
    clientY: number;
}

interface IBobrilComponent {
    // called on input element after click
    onClick? (ctx: Object, event: IKeyDownUpEvent): boolean;
} 