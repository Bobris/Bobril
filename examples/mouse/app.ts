/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>

module MouseApp {
    interface ITrackClickData {
        onAdd: (e: IEvent) => void;
    }

    interface ITrackClickCtx {
        data: ITrackClickData;
    }

    var TrackClick: IBobrilComponent = {
        postInitDom(ctx: ITrackClickCtx, me: IBobrilNode, element: HTMLElement): void {
            element.focus();
        },

        onClick(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Click"));
            return true;
        },

        onDoubleClick(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Double Click"));
            return true;
        },

        onMouseDown(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Down"));
            return true;
        },

        onMouseUp(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Up"));
            return true;
        },

        onSwipeLeft(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Swipe Left"));
            return true;
        },

        onSwipeRight(ctx: ITrackClickCtx, event: IMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Swipe right"));
            return true;
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

    class EventWrapper implements IEvent {
        constructor(private ev: IMouseEvent, private eventName: string) { }

        toString(): string {
            return this.eventName +" ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
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
                style: { fontSize: "3em", marginBottom: "10px" },
                children: "Click button",
                component: TrackClick,
                data: {
                    onAdd: addEvent
                }
            },
            {
                tag: "div",
                style: { border: "1px solid", minHeight: "120px" },
                component: TrackClick,
                data: {
                    onAdd: addEvent
                },
                children: [{ tag: "div", children: "Click here or swipe!", style: { fontSize: "2em" } }]
                            .concat(events.map((ev: IEvent) => e(ev)))
            }
        ];
    });
}
