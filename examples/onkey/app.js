/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
var OnKeyApp;
(function (OnKeyApp) {
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

    var TrackKeys = (function () {
        function TrackKeys() {
        }
        TrackKeys.init = function (ctx, me) {
            ctx.onAdd = me.data.onAdd;
        };

        TrackKeys.postInitDom = function (ctx, me, element) {
            element.focus();
        };

        TrackKeys.onKeyDown = function (ctx, event) {
            ctx.onAdd(new KeyUpDown(true, event));
            return false;
        };

        TrackKeys.onKeyUp = function (ctx, event) {
            ctx.onAdd(new KeyUpDown(false, event));
            return false;
        };

        TrackKeys.onKeyPress = function (ctx, event) {
            ctx.onAdd(new KeyPress(event));
            return false;
        };
        return TrackKeys;
    })();

    b.init(function () {
        // Normally this would be done though Array.map but I don't want to polyfill it now in this test
        var evsli = [];
        for (var i = 0; i < evs.length; i++) {
            evsli.push({ tag: "li", children: evs[i].toString() });
        }
        return [
            {
                tag: "div",
                attrs: { tabindex: "0" },
                data: { onAdd: addEvent },
                component: TrackKeys,
                children: [
                    { tag: "h1", children: "OnKey demo" },
                    { tag: "p", children: "Press keys on keyboard and events will be displayed below (last is on top)" },
                    { tag: "ul", children: evsli }
                ]
            }
        ];
    });
})(OnKeyApp || (OnKeyApp = {}));
//# sourceMappingURL=app.js.map
