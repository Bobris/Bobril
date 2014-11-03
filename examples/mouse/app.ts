/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>

module OnKeyApp {
    interface ITrackClickData {
        onAdd: (e: IEvent) => void;
    }

    interface ITrackClickCtx {
        data: ITrackClickData;
    }

    class TrackClick implements IBobrilComponent {
        static postInitDom(ctx: ITrackClickCtx, me: IBobrilNode, element: HTMLElement): void {
            element.focus();
        }

        static onClick(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new Clicked(event));
            return false;
        }

        static onDoubleClick(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new DoubleClicked(event));
            return false;
        }

        static onMouseDown(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new MouseDown(event));
            return false;
        }

        static onMouseUp(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new MouseUp(event));
            return false;
        }

        static onMouseMove(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new MouseMove(event));
            return false;
        }

        static onMouseEnter(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new MouseEnter(event));
            return false;
        }

        static onMouseLeave(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new MouseLeave(event));
            return false;
        }

        static onMouseOver(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new MouseOver(event));
            return false;
        }

        static onSwipeLeft(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new SwipedLeft(event));
            return false;
        }

        static onSwipeRight(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new SwipedRight(event));
            return false;
        }
    }

    function e(ev: IEvent):any {
        return {
            tag: "div",
            children: ev.toString()
        }
    }

    interface IEvent {
        toString(): string;
    }

    class Clicked implements IEvent {
        constructor(private ev: IMouseEvent) {}

        toString(): string {
            return "Clicked ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class DoubleClicked implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Double clicked ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class MouseDown implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Mouse down ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class MouseUp implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Mouse up ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class MouseMove implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Mouse move ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class MouseOver implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Mouse over ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class MouseEnter implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Mouse enter ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class MouseLeave implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Mouse leave ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class SwipedLeft implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Swiped left ClientX: "+ this.ev.x + " ClientY: " + this.ev.y;
        }
    }

    class SwipedRight implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Swiped right ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        }
    }


    var events: IEvent[] = [];

    function addEvent(ev: IEvent) {
        events.push(ev);
        if (events.length > 30)
            events.shift();
        b.invalidate();
    }

    b.init(() => {
        return [
            {
                tag: "button",
                attrs: { style: { fontSize: "3em" } },
                children: "aaa",
                component: TrackClick,
                data: {
                    onAdd: addEvent
                }
            },
            {
                tag: "div",
                attrs: { style: { border: "1px solid", minHeight: "120px" }, id: "test" },
                component: TrackClick,
                data: {
                    onAdd: addEvent
                },
                children: [{ tag: "div", children: "Click here!"}].concat(events.map((ev: IEvent) => e(ev)))
            }
        ];
    });
}
