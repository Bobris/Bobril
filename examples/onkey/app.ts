/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>

module OnKeyApp {
    function h(tag:string, ...args: any[]) {
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

    interface ITrackKeys {
        onAdd: (e: IEvent) => void;
    }

    class TrackKeys implements IBobrilComponent {
        static init(ctx: ITrackKeys, me: IBobrilNode) {
            ctx.onAdd = me.data.onAdd;
        }

        static postInitDom(ctx: Object, me: IBobrilNode, element: HTMLElement): void {
            element.focus();
        }

        static onKeyDown(ctx: ITrackKeys, event: IKeyDownUpEvent): boolean {
            ctx.onAdd(new KeyUpDown(true, event));
            return false;
        }

        static onKeyUp(ctx: ITrackKeys, event: IKeyDownUpEvent): boolean {
            ctx.onAdd(new KeyUpDown(false, event));
            return false;
        }

        static onKeyPress(ctx: ITrackKeys, event: IKeyPressEvent): boolean {
            ctx.onAdd(new KeyPress(event));
            return false;
        }
    }

    b.init(() => {
        return [
            {
                tag: "div",
                attrs: { tabindex: "0" },
                data: { onAdd: addEvent },
                component: TrackKeys,
                children: [
                    h("h1", "OnKey demo"),
                    h("p", "Press keys on keyboard and events will be displayed below (last is on top)"),
                    h("ul", evs.map((e) => h("li", e.toString())))
                ]
            }
        ];
    });
}
