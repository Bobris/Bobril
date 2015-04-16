/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var MouseOwnerApp;
(function (MouseOwnerApp) {
    var button = {
        init: function (ctx, me) {
            ctx.backColor = "#f0f0f0";
        },
        render: function (ctx, me) {
            me.tag = "div";
            me.style = b.assign({}, ctx.data.style);
            me.children = ctx.data.children;
            me.style.backgroundColor = ctx.backColor;
        },
        onMouseDown: function (ctx) {
            ctx.backColor = "red";
            b.registerMouseOwner(ctx);
            b.invalidate(ctx);
            return true;
        },
        onMouseUp: function (ctx) {
            ctx.backColor = "#f0f0f0";
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
            b.invalidate(ctx);
            return true;
        }
    };
    function twice(obj) { return [obj, b.cloneNode(obj)]; }
    b.init(function () {
        return twice({
            tag: "div",
            style: { height: 500, width: 500, border: "solid 1px", position: "relative", cssFloat: "left" },
            children: {
                component: button, data: {
                    style: { width: 120, height: 20, position: "absolute", border: "1px solid #000", left: 190, top: 240 },
                    children: "Click and drag out"
                }
            }
        });
    });
})(MouseOwnerApp || (MouseOwnerApp = {}));
