/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
var OnKeyApp;
(function (OnKeyApp) {
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
            return " ClientX: " + this.ev.clientX + " ClientY: " + this.ev.clientY;
        };
        return Clicked;
    })();

    var SwipedLeft = (function () {
        function SwipedLeft(ev) {
            this.ev = ev;
        }
        SwipedLeft.prototype.toString = function () {
            return "Swiped left ClientX: " + this.ev.clientX + " ClientY: " + this.ev.clientY;
        };
        return SwipedLeft;
    })();

    var SwipedRight = (function () {
        function SwipedRight(ev) {
            this.ev = ev;
        }
        SwipedRight.prototype.toString = function () {
            return "Swiped right ClientX: " + this.ev.clientX + " ClientY: " + this.ev.clientY;
        };
        return SwipedRight;
    })();

    var events = [];

    b.init(function () {
        return [
            {
                tag: "div",
                attrs: { style: { border: "1px solid", minHeight: "120px" } },
                component: TrackClick,
                data: {
                    onAdd: function (ev) {
                        events.push(ev);
                        b.invalidate();
                    }
                },
                children: [{ tag: "div", children: "Click here!" }].concat(events.map(function (ev) {
                    return e(ev);
                }))
            }
        ];
    });
})(OnKeyApp || (OnKeyApp = {}));
//# sourceMappingURL=app.js.map
