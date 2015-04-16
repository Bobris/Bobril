/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var MouseEnterLeaveApp;
(function (MouseEnterLeaveApp) {
    var mouseEnter = "green";
    var mouseLeave = "red";
    var TrackInnerEvents = {
        init: function (ctx, me) {
            ctx.backColor = "#B3C9DF";
        },
        render: function (ctx, me, oldMe) {
            me.style = constructInnerStyle(ctx.backColor);
        },
        onMouseEnter: function (ctx) {
            ctx.backColor = mouseEnter;
            b.invalidate();
        },
        onMouseLeave: function (ctx) {
            ctx.backColor = mouseLeave;
            b.invalidate();
        }
    };
    var TrackEvents = {
        init: function (ctx, me) {
            ctx.backColor = "#F0F0F0";
        },
        render: function (ctx, me, oldMe) {
            me.tag = "div";
            me.style = constructOuterStyle(ctx.backColor);
            me.children = {
                tag: "span",
                children: "Inner Span",
                style: constructInnerStyle("#B3C9DF")
            };
            if (ctx.data.trackInner)
                me.children.component = TrackInnerEvents;
        },
        onMouseEnter: function (ctx) {
            ctx.backColor = mouseEnter;
            b.invalidate();
        },
        onMouseLeave: function (ctx) {
            ctx.backColor = mouseLeave;
            b.invalidate();
        }
    };
    function constructOuterStyle(backColor) {
        return {
            backgroundColor: backColor,
            border: "1px solid #D0D0D0",
            cssFloat: "left",
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
                style: { height: "20px", width: "100px", backgroundColor: mouseEnter },
                children: "Mouse enter"
            },
            {
                tag: "div",
                style: { height: "20px", width: "100px", backgroundColor: mouseLeave },
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
