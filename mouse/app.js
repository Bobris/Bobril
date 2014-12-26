/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var MouseApp;
(function (MouseApp) {
    var TrackClick = (function () {
        function TrackClick() {
        }
        TrackClick.postInitDom = function (ctx, me, element) {
            element.focus();
        };
        TrackClick.onClick = function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Click"));
            return false;
        };
        TrackClick.onDoubleClick = function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Double Click"));
            return false;
        };
        TrackClick.onMouseDown = function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Down"));
            return false;
        };
        TrackClick.onMouseUp = function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Mouse Up"));
            return false;
        };
        TrackClick.onSwipeLeft = function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Swipe Left"));
            return false;
        };
        TrackClick.onSwipeRight = function (ctx, event) {
            ctx.data.onAdd(new EventWrapper(event, "Swipe right"));
            return false;
        };
        return TrackClick;
    })();
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
            return this.eventName + " ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return EventWrapper;
    })();
    var events = [];
    function addEvent(ev) {
        events.push(ev);
        if (events.length > 30)
            events.shift();
        b.invalidate();
    }
    b.init(function () {
        return [
            {
                tag: "button",
                attrs: { style: { fontSize: "3em", marginBottom: "10px" } },
                children: "Click button",
                component: TrackClick,
                data: {
                    onAdd: addEvent
                }
            },
            {
                tag: "div",
                attrs: { style: { border: "1px solid", minHeight: "120px" } },
                component: TrackClick,
                data: {
                    onAdd: addEvent
                },
                children: [{ tag: "div", children: "Click here or swipe!", attrs: { style: { fontSize: "2em" } } }].concat(events.map(function (ev) { return e(ev); }))
            }
        ];
    });
})(MouseApp || (MouseApp = {}));
//# sourceMappingURL=app.js.map