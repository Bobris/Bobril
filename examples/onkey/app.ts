/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>

module OnKeyApp {
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
        // Normally this would be done though Array.map but I don't want to polyfill it now in this test
        var evsli = [];
        for (var i = 0; i < evs.length; i++) {
            evsli.push({ tag: "li", children: evs[i].toString() });
        }
        return [
            {
                tag: "div",
                attrs: { tabindex: "0" },
                data: { onAdd: addEvent },
                component: TrackKeys,
                children: [
                    { tag: "h1", children: "OnKey demo" },
                    { tag: "p", children: "Press keys on keyboard and events will be displayed below (last is on top)" },
                    { tag: "ul", children: evsli }
                ]
            }
        ];
    });
}
