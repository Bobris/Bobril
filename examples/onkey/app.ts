/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>

module OnKeyApp {
    function h(tag: string, ...args: any[]): IBobrilNode {
        return { tag: tag, children: args };
    }

    interface IEvent {
        toString(): string;
    }

    class KeyUpDown implements IEvent {
        constructor(private down: boolean, private value: IKeyDownUpEvent) {
        }

        toString(): string {
            var v = this.value;
            return (this.down ? "KeyDown " : "KeyUp ") + "Shift: " + v.shift + " Ctrl: " + v.ctrl + " Alt: " + v.alt + " Meta: " + v.meta + " Which: " + v.which;
        }
    }

    class KeyPress implements IEvent {
        constructor(private value: IKeyPressEvent) {
        }

        toString(): string {
            var v = this.value;
            return "KeyPress CharCode: " + v.charCode;
        }
    }

    var evs: IEvent[] = [];

    function addEvent(e: IEvent) {
        evs.unshift(e);
        if (evs.length > 15)
            evs.pop();
        b.invalidate();
    }

    interface ITrackKeysData {
        onAdd: (e: IEvent) => void;
    }

    interface ITrackKeysCtx {
        data: ITrackKeysData;
    }

    var TrackKeys: IBobrilComponent = {
        postInitDom(ctx: ITrackKeysCtx, me: IBobrilNode, element: HTMLElement): void {
            element.focus();
        },

        onKeyDown(ctx: ITrackKeysCtx, event: IKeyDownUpEvent): boolean {
            ctx.data.onAdd(new KeyUpDown(true, event));
            return false;
        },

        onKeyUp(ctx: ITrackKeysCtx, event: IKeyDownUpEvent): boolean {
            ctx.data.onAdd(new KeyUpDown(false, event));
            return false;
        },

        onKeyPress(ctx: ITrackKeysCtx, event: IKeyPressEvent): boolean {
            ctx.data.onAdd(new KeyPress(event));
            return false;
        }
    }

    b.init(() => {
        return [
            {
                tag: "div",
                attrs: { tabindex: 0 },
                data: { onAdd: addEvent },
                component: TrackKeys,
                children: [
                    h("h1", "OnKey demo"),
                    h("p", "Press keys on keyboard and events will be displayed below (last is on top)"),
                    h("ul", evs.map(e => h("li", e.toString())))
                ]
            }
        ];
    });
}
