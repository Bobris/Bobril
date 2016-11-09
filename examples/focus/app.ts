/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.focus.d.ts"/>

module FocusApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    function layoutPair(left: any, right: any, leftWidth= "50%"): IBobrilNode {
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

    function setValue(v: string) {
        value = v;
        b.invalidate();
    }

    interface IOnChangeData {
        onChange: (value: any) => void;
    }

    interface IOnChangeCtx {
        data: IOnChangeData;
    }

    var OnChangeComponent: IBobrilComponent = {
        onChange(ctx: IOnChangeCtx, v: any): void {
            ctx.data.onChange(v);
        }
    }

    function textInput(value: string, onChange: (value: string) => void): IBobrilNode {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    var FocusInHighlight: IBobrilComponent = {
        init(ctx: any) {
            ctx.f = false;
            ctx.mef = false;
        },

        render(ctx: any, me: IBobrilNode) {
            var c = "#" + (ctx.f ? "8" : "f") + (ctx.mef ? "8" : "f") + "f";
            me.style = me.style || {};
            me.style.background = c;
        },

        onFocusIn(ctx: any) {
            ctx.f = true;
            b.invalidate();
        },

        onFocusOut(ctx: any) {
            ctx.f = false;
            b.invalidate();
        },

        onFocus(ctx: any) {
            ctx.mef = true;
            b.invalidate();
        },

        onBlur(ctx: any) {
            ctx.mef = false;
            b.invalidate();
        }
    }

    function withHighlight(id: string, n: IBobrilNode): IBobrilNode {
        b.postEnhance(n, FocusInHighlight);
        n.data = n.data || {};
        n.data.id = id;
        return n;
    }

    b.init(() => {
        frame++;
        return [
            h("h1", "Focus Bobril sample"),
            withHighlight("P1", h("div",
                withHighlight("I1", textInput(value, setValue)),
                spacer,
                withHighlight("I2", textInput(value, setValue)))),
            spacer,
            withHighlight("P2", h("div",
                withHighlight("I3", textInput(value, setValue)),
                spacer,
                withHighlight("I4", textInput(value, setValue)))),
            h("p", "Focused id: ", b.focused() ? (b.focused().data ? b.focused().data.id: "no data") : "null"),
            h("p", "Frame: " + frame)
        ];
    });
}
