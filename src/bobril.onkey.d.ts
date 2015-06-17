interface IKeyDownUpEvent {
	shift: boolean;
	ctrl: boolean;
	alt: boolean;
	meta: boolean;
	which: number;
}

interface IKeyPressEvent {
	charCode: number;
}

interface IBobrilComponent {
    onKeyDown? (ctx: Object, event: IKeyDownUpEvent): boolean;
	onKeyUp? (ctx: Object, event: IKeyDownUpEvent): boolean;
	onKeyPress? (ctx: Object, event: IKeyPressEvent): boolean;
}
