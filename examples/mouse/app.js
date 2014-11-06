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
            ctx.data.onAdd(new Clicked(event));
            return false;
        };

        TrackClick.onDoubleClick = function (ctx, event) {
            ctx.data.onAdd(new DoubleClicked(event));
            return false;
        };

        TrackClick.onMouseDown = function (ctx, event) {
            ctx.data.onAdd(new MouseDown(event));
            return false;
        };

        TrackClick.onMouseUp = function (ctx, event) {
            ctx.data.onAdd(new MouseUp(event));
            return false;
        };

        TrackClick.onMouseMove = function (ctx, event) {
            //ctx.data.onAdd(new MouseMove(event));
            return false;
        };

        TrackClick.onMouseEnter = function (ctx, event) {
            ctx.data.onAdd(new MouseEnter(event));
            return false;
        };

        TrackClick.onMouseLeave = function (ctx, event) {
            ctx.data.onAdd(new MouseLeave(event));
            return false;
        };

        TrackClick.onMouseOver = function (ctx, event) {
            //ctx.data.onAdd(new MouseOver(event));
            return false;
        };

        TrackClick.onSwipeLeft = function (ctx, event) {
            ctx.data.onAdd(new SwipedLeft(event));
            return false;
        };

        TrackClick.onSwipeRight = function (ctx, event) {
            ctx.data.onAdd(new SwipedRight(event));
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

    var Clicked = (function () {
        function Clicked(ev) {
            this.ev = ev;
        }
        Clicked.prototype.toString = function () {
            return "Clicked ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return Clicked;
    })();

    var DoubleClicked = (function () {
        function DoubleClicked(ev) {
            this.ev = ev;
        }
        DoubleClicked.prototype.toString = function () {
            return "Double clicked ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return DoubleClicked;
    })();

    var MouseDown = (function () {
        function MouseDown(ev) {
            this.ev = ev;
        }
        MouseDown.prototype.toString = function () {
            return "Mouse down ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return MouseDown;
    })();

    var MouseUp = (function () {
        function MouseUp(ev) {
            this.ev = ev;
        }
        MouseUp.prototype.toString = function () {
            return "Mouse up ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return MouseUp;
    })();

    var MouseMove = (function () {
        function MouseMove(ev) {
            this.ev = ev;
        }
        MouseMove.prototype.toString = function () {
            return "Mouse move ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return MouseMove;
    })();

    var MouseOver = (function () {
        function MouseOver(ev) {
            this.ev = ev;
        }
        MouseOver.prototype.toString = function () {
            return "Mouse over ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return MouseOver;
    })();

    var MouseEnter = (function () {
        function MouseEnter(ev) {
            this.ev = ev;
        }
        MouseEnter.prototype.toString = function () {
            return "Mouse enter ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return MouseEnter;
    })();

    var MouseLeave = (function () {
        function MouseLeave(ev) {
            this.ev = ev;
        }
        MouseLeave.prototype.toString = function () {
            return "Mouse leave ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return MouseLeave;
    })();

    var SwipedLeft = (function () {
        function SwipedLeft(ev) {
            this.ev = ev;
        }
        SwipedLeft.prototype.toString = function () {
            return "Swiped left ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return SwipedLeft;
    })();

    var SwipedRight = (function () {
        function SwipedRight(ev) {
            this.ev = ev;
        }
        SwipedRight.prototype.toString = function () {
            return "Swiped right ClientX: " + this.ev.x + " ClientY: " + this.ev.y;
        };
        return SwipedRight;
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
                children: [{ tag: "div", children: "Click here!" }].concat(events.map(function (ev) {
                    return e(ev);
                }))
            }
        ];
    });
})(MouseApp || (MouseApp = {}));
//# sourceMappingURL=app.js.map
