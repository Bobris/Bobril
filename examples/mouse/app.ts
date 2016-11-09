/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>

module MouseApp {
    function d(style: any, content: IBobrilChildren): IBobrilNode {
        return {
            tag: "div",
            style: style,
            children: content
        };
    }

    function h(name: string, content: IBobrilChildren): IBobrilNode {
        return { tag: name, children: content };
    }

    function style(style: any, content: IBobrilNode): IBobrilNode {
        content.style = style;
        return content;
    }

    function comp(component: IBobrilComponent, content: IBobrilNode): IBobrilNode {
        if (content.component) {
            b.postEnhance(content, component);
        } else {
            content.component = component;
        }
        return content;
    }

    function layoutPair(left: any, right: any, leftWidth = "50%"): IBobrilNode {
        return d({ display: "table", width: "100%" }, [
            d({ display: "table-cell", verticalAlign: "top", width: leftWidth }, left),
            d({ display: "table-cell", verticalAlign: "top" }, right)
        ]);
    }

    function checkbox(value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "checkbox", value: value }, component: { onChange: (ctx: any, v: boolean) => onChange(v) } };
    }

    interface ITrackClickData {
        onAdd: (e: IEvent) => void;
        stopPropagation: boolean;
    }

    interface ITrackClickCtx {
        data: ITrackClickData;
    }

    var TrackClick: IBobrilComponent = {
        postInitDom(ctx: ITrackClickCtx, me: IBobrilNode, element: HTMLElement): void {
            element.focus();
        },

        onClick(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Click"));
            return ctx.data.stopPropagation;
        },

        onDoubleClick(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Double Click"));
            return ctx.data.stopPropagation;
        },

        onContextMenu(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Context Menu"));
            return ctx.data.stopPropagation;
        },

        onMouseDown(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Down"));
            return ctx.data.stopPropagation;
        },

        onMouseUp(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Up"));
            return ctx.data.stopPropagation;
        },

        onSwipeLeft(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Swipe Left"));
            return ctx.data.stopPropagation;
        },

        onSwipeRight(ctx: ITrackClickCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onAdd(new EventWrapper(event, "Swipe right"));
            return ctx.data.stopPropagation;
        },

        onMouseWheel(ctx: ITrackClickCtx, event: IBobrilMouseWheelEvent): boolean {
            ctx.data.onAdd(new EventWheelWrapper(event, "Wheel"));
            return ctx.data.stopPropagation;
        }
    }

    function e(ev: IEvent): any {
        return {
            tag: "div",
            children: ev.toString()
        }
    }

    interface IEvent {
        toString(): string;
    }

    class EventWrapper implements IEvent {
        constructor(private ev: IBobrilMouseEvent, private eventName: string) { }

        toString(): string {
            return this.eventName + " ClientX: " + this.ev.x + " ClientY: " + this.ev.y + " Button:" + this.ev.button + " Shift:" + this.ev.shift + " Crtl:" + this.ev.ctrl + " Alt:" + this.ev.alt + " Meta:" + this.ev.meta;
        }
    }

    class EventWheelWrapper implements IEvent {
        constructor(private ev: IBobrilMouseWheelEvent, private eventName: string) { }

        toString(): string {
            return this.eventName +" dx: "+this.ev.dx+" dy: "+this.ev.dy+ " ClientX: " + this.ev.x + " ClientY: " + this.ev.y + " Button:" + this.ev.button + " Shift:" + this.ev.shift + " Crtl:" + this.ev.ctrl + " Alt:" + this.ev.alt + " Meta:" + this.ev.meta;
        }
    }

    class TextEvent implements IEvent {
        constructor(private eventName: string) { }

        toString(): string {
            return this.eventName;
        }
    }

    var events: IEvent[] = [];

    function addEvent(ev: IEvent) {
        events.push(ev);
        if (events.length > 20)
            events.shift();
        b.invalidate();
    }

    var v1 = false, v2 = false;

    b.init(() => {
        return [
            layoutPair(
                [{
                    tag: "button",
                    style: { fontSize: "2em", marginBottom: "10px" },
                    children: "Click button",
                    component: TrackClick,
                    data: {
                        onAdd: addEvent,
                        stopPropagation: true
                    }
                }, {
                        tag: "button",
                        style: { fontSize: "2em", marginBottom: "10px" },
                        children: "Does not stop prop",
                        component: TrackClick,
                        data: {
                            onAdd: addEvent,
                            stopPropagation: false
                        }
                    }], [
                    d({ height: "2em" },
                        h("label", [checkbox(v1,(v) => { v1 = v; addEvent(new TextEvent("slow onChange")); }), "Slow click checkbox"])
                        ),
                    d({ height: "2em" },
                        comp({
                            onClick: () => {
                                v2 = !v2;
                                b.invalidate();
                                addEvent(new TextEvent("fast onClick"));
                                return true;
                            }
                        }, h("label", [checkbox(v2,(v) => {
                                v2 = v;
                                addEvent(new TextEvent("fast onChange"));
                            }), "Fast click checkbox"]))
                        )
                ]),
            {
                tag: "div",
                style: { border: "1px solid", minHeight: "120px", touchAction: "pan-y pinch-zoom" },
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
