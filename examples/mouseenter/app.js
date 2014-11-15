/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var MouseEnterLeaveApp;
(function (MouseEnterLeaveApp) {
    var mouseEnter = "green";
    var mouseLeave = "red";

    var TrackInnerEvents = (function () {
        function TrackInnerEvents() {
        }
        TrackInnerEvents.init = function (ctx, me, oldMe) {
            ctx.backColor = ctx.backColor || "#B3C9DF";
            me.attrs = { style: constructInnerStyle(ctx.backColor) };
        };
        TrackInnerEvents.onMouseEnter = function (ctx, event) {
            ctx.backColor = mouseEnter;
            b.invalidate();
        };

        TrackInnerEvents.onMouseLeave = function (ctx, event) {
            ctx.backColor = mouseLeave;
            b.invalidate();
        };
        return TrackInnerEvents;
    })();

    var TrackEvents = (function () {
        function TrackEvents() {
        }
        TrackEvents.init = function (ctx, me, oldMe) {
            ctx.backColor = ctx.backColor || "#F0F0F0";

            me.tag = "div";
            me.attrs = { style: constructOuterStyle(ctx.backColor) };
            me.children = {
                tag: "span",
                children: "Inner Span",
                attrs: { style: constructInnerStyle("#B3C9DF") }
            };

            if (ctx.data.trackInner)
                me.children.component = TrackInnerEvents;
        };

        TrackEvents.onMouseEnter = function (ctx, event) {
            ctx.backColor = mouseEnter;
            b.invalidate();
        };

        TrackEvents.onMouseLeave = function (ctx, event) {
            ctx.backColor = mouseLeave;
            b.invalidate();
        };
        return TrackEvents;
    })();

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

    function constructOuterStyle(backColor) {
        return {
            backgroundColor: backColor,
            border: "1px solid #D0D0D0",
            "float": "left",
            height: "225px",
            position: "relative",
            width: "225px",
            marginRight: "20px"
        };
    }

    function constructInnerStyle(backColor) {
        return {
            backgroundColor: backColor,
            border: "1px solid #6492BF",
            color: "#FFFFFF",
            height: "100px",
            left: "62px",
            lineHeight: "98px",
            position: "absolute",
            textAlign: "center",
            top: "62px",
            width: "100px"
        };
    }

    b.init(function () {
        return [
            {
                tag: "div",
                attrs: { style: { height: "20px", width: "100px", backgroundColor: mouseEnter } },
                children: "Mouse enter"
            },
            {
                tag: "div",
                attrs: { style: { height: "20px", width: "100px", backgroundColor: mouseLeave } },
                children: "Mouse leave"
            },
            {
                component: TrackEvents,
                data: {
                    trackInner: false
                }
            },
            {
                component: TrackEvents,
                data: {
                    trackInner: true
                }
            }
        ];
    });
})(MouseEnterLeaveApp || (MouseEnterLeaveApp = {}));
//# sourceMappingURL=app.js.map
