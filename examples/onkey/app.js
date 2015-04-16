/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
var OnKeyApp;
(function (OnKeyApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    var KeyUpDown = (function () {
        function KeyUpDown(down, value) {
            this.down = down;
            this.value = value;
        }
        KeyUpDown.prototype.toString = function () {
            var v = this.value;
            return (this.down ? "KeyDown " : "KeyUp ") + "Shift: " + v.shift + " Ctrl: " + v.ctrl + " Alt: " + v.alt + " Meta: " + v.meta + " Which: " + v.which;
        };
        return KeyUpDown;
    })();
    var KeyPress = (function () {
        function KeyPress(value) {
            this.value = value;
        }
        KeyPress.prototype.toString = function () {
            var v = this.value;
            return "KeyPress CharCode: " + v.charCode;
        };
        return KeyPress;
    })();
    var evs = [];
    function addEvent(e) {
        evs.unshift(e);
        if (evs.length > 15)
            evs.pop();
        b.invalidate();
    }
    var TrackKeys = {
        postInitDom: function (ctx, me, element) {
            element.focus();
        },
        onKeyDown: function (ctx, event) {
            ctx.data.onAdd(new KeyUpDown(true, event));
            return false;
        },
        onKeyUp: function (ctx, event) {
            ctx.data.onAdd(new KeyUpDown(false, event));
            return false;
        },
        onKeyPress: function (ctx, event) {
            ctx.data.onAdd(new KeyPress(event));
            return false;
        }
    };
    b.init(function () {
        return [
            {
                tag: "div",
                attrs: { tabindex: "0" },
                data: { onAdd: addEvent },
                component: TrackKeys,
                children: [
                    h("h1", "OnKey demo"),
                    h("p", "Press keys on keyboard and events will be displayed below (last is on top)"),
                    h("ul", evs.map(function (e) { return h("li", e.toString()); }))
                ]
            }
        ];
    });
})(OnKeyApp || (OnKeyApp = {}));
