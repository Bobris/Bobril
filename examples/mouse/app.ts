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
            return " ClientX: " + this.ev.clientX + " ClientY: " + this.ev.clientY;
        }
    }

    class SwipedLeft implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Swiped left ClientX: "+ this.ev.clientX + " ClientY: " + this.ev.clientY;
        }
    }

    class SwipedRight implements IEvent {
        constructor(private ev: IMouseEvent) { }

        toString(): string {
            return "Swiped right ClientX: " + this.ev.clientX + " ClientY: " + this.ev.clientY;
        }
    }


    var events :IEvent[]= [];

    b.init(() => {
        return [
            {
                tag: "div",
                attrs: { style: { border: "1px solid", minHeight: "120px" } },
                component: TrackClick,
                data: {
                    onAdd: (ev: IEvent) => {
                        events.push(ev);
                        b.invalidate();
                    }
                },
                children: [{ tag: "div", children: "Click here!"}].concat(events.map((ev: IEvent) => e(ev)))
            }
        ];
    });
}
