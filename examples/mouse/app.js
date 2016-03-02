/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
var MouseApp;
(function (MouseApp) {
    function d(style, content) {
        return {
            tag: "div",
            style: style,
            children: content
        };
    }
    function h(name, content) {
        return { tag: name, children: content };
    }
    function style(style, content) {
        content.style = style;
        return content;
    }
    function comp(component, content) {
        if (content.component) {
            b.postEnhance(content, component);
        }
        else {
            content.component = component;
        }
        return content;
    }
    function layoutPair(left, right, leftWidth) {
        if (leftWidth === void 0) { leftWidth = "50%"; }
        return d({ display: "table", width: "100%" }, [
            d({ display: "table-cell", verticalAlign: "top", width: leftWidth }, left),
            d({ display: "table-cell", verticalAlign: "top" }, right)
        ]);
    }
    function checkbox(value, onChange) {
        return { tag: "input", attrs: { type: "checkbox", value: value }, component: { onChange: function (ctx, v) { return onChange(v); } } };
    }
    var TrackClick = {
        postInitDom: function (ctx, me, element) {
            element.focus();
        },
        onClick: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Click"));
            return ctx.data.stopPropagation;
        },
        onDoubleClick: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Double Click"));
            return ctx.data.stopPropagation;
        },
        onContextMenu: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Context Menu"));
            return ctx.data.stopPropagation;
        },
        onMouseDown: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Down"));
            return ctx.data.stopPropagation;
        },
        onMouseUp: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Up"));
            return ctx.data.stopPropagation;
        },
        onSwipeLeft: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Swipe Left"));
            return ctx.data.stopPropagation;
        },
        onSwipeRight: function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Swipe right"));
            return ctx.data.stopPropagation;
        },
        onMouseWheel: function (ctx, event) {
            ctx.data.onAdd(new EventWheelWrapper(event, "Wheel"));
            return ctx.data.stopPropagation;
        }
    };
    function e(ev) {
        return {
            tag: "div",
            children: ev.toString()
        };
    }
    var EventWrapper = (function () {
        function EventWrapper(ev, eventName) {
            this.ev = ev;
            this.eventName = eventName;
        }
        EventWrapper.prototype.toString = function () {
            return this.eventName + " ClientX: " + this.ev.x + " ClientY: " + this.ev.y + " Button:" + this.ev.button + " Shift:" + this.ev.shift + " Crtl:" + this.ev.ctrl + " Alt:" + this.ev.alt + " Meta:" + this.ev.meta;
        };
        return EventWrapper;
    }());
    var EventWheelWrapper = (function () {
        function EventWheelWrapper(ev, eventName) {
            this.ev = ev;
            this.eventName = eventName;
        }
        EventWheelWrapper.prototype.toString = function () {
            return this.eventName + " dx: " + this.ev.dx + " dy: " + this.ev.dy + " ClientX: " + this.ev.x + " ClientY: " + this.ev.y + " Button:" + this.ev.button + " Shift:" + this.ev.shift + " Crtl:" + this.ev.ctrl + " Alt:" + this.ev.alt + " Meta:" + this.ev.meta;
        };
        return EventWheelWrapper;
    }());
    var TextEvent = (function () {
        function TextEvent(eventName) {
            this.eventName = eventName;
        }
        TextEvent.prototype.toString = function () {
            return this.eventName;
        };
        return TextEvent;
    }());
    var events = [];
    function addEvent(ev) {
        events.push(ev);
        if (events.length > 20)
            events.shift();
        b.invalidate();
    }
    var v1 = false, v2 = false;
    b.init(function () {
        return [
            layoutPair([{
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
                d({ height: "2em" }, h("label", [checkbox(v1, function (v) { v1 = v; addEvent(new TextEvent("slow onChange")); }), "Slow click checkbox"])),
                d({ height: "2em" }, comp({
                    onClick: function () {
                        v2 = !v2;
                        b.invalidate();
                        addEvent(new TextEvent("fast onClick"));
                        return true;
                    }
                }, h("label", [checkbox(v2, function (v) {
                        v2 = v;
                        addEvent(new TextEvent("fast onChange"));
                    }), "Fast click checkbox"])))
            ]),
            {
                tag: "div",
                style: { border: "1px solid", minHeight: "120px", touchAction: "pan-y pinch-zoom" },
                component: TrackClick,
                data: {
                    onAdd: addEvent
                },
                children: [{ tag: "div", children: "Click here or swipe!", style: { fontSize: "2em" } }]
                    .concat(events.map(function (ev) { return e(ev); }))
            }
        ];
    });
})(MouseApp || (MouseApp = {}));
