/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.focus.d.ts"/>
var FocusApp;
(function (FocusApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    function layoutPair(left, right, leftWidth) {
        if (leftWidth === void 0) { leftWidth = "50%"; }
        return {
            tag: "div",
            style: { display: "table", width: "100%" },
            children: [
                { tag: "div", style: { display: "table-cell", "vertical-align": "top", width: leftWidth }, children: left },
                { tag: "div", style: { display: "table-cell", "vertical-align": "top" }, children: right }
            ]
        };
    }
    var spacer = { tag: "div", style: "height:1em" };
    // Model
    var frame = 0;
    var value = "Change this";
    function setValue(v) {
        value = v;
        b.invalidate();
    }
    var OnChangeComponent = {
        onChange: function (ctx, v) {
            ctx.data.onChange(v);
        }
    };
    function textInput(value, onChange) {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }
    var FocusInHighlight = {
        init: function (ctx) {
            ctx.f = false;
            ctx.mef = false;
        },
        render: function (ctx, me) {
            var c = "#" + (ctx.f ? "8" : "f") + (ctx.mef ? "8" : "f") + "f";
            me.style = me.style || {};
            me.style.background = c;
        },
        onFocusIn: function (ctx) {
            ctx.f = true;
            b.invalidate();
        },
        onFocusOut: function (ctx) {
            ctx.f = false;
            b.invalidate();
        },
        onFocus: function (ctx) {
            ctx.mef = true;
            b.invalidate();
        },
        onBlur: function (ctx) {
            ctx.mef = false;
            b.invalidate();
        }
    };
    function withHighlight(id, n) {
        b.postEnhance(n, FocusInHighlight);
        n.data = n.data || {};
        n.data.id = id;
        return n;
    }
    b.init(function () {
        frame++;
        return [
            h("h1", "Focus Bobril sample"),
            withHighlight("P1", h("div", withHighlight("I1", textInput(value, setValue)), spacer, withHighlight("I2", textInput(value, setValue)))),
            spacer,
            withHighlight("P2", h("div", withHighlight("I3", textInput(value, setValue)), spacer, withHighlight("I4", textInput(value, setValue)))),
            h("p", "Focused id: ", b.focused() ? (b.focused().data ? b.focused().data.id : "no data") : "null"),
            h("p", "Frame: " + frame)
        ];
    });
})(FocusApp || (FocusApp = {}));
