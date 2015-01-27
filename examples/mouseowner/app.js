/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var MouseOwnerApp;
(function (MouseOwnerApp) {
    var button = {
        init: function (ctx, me) {
            ctx.backColor = "#f0f0f0";
        },
        render: function (ctx, me, oldMe) {
            me.style.backgroundColor = ctx.backColor;
        },
        onMouseDown: function (ctx, event) {
            ctx.backColor = "red";
            b.registerMouseOwner(ctx);
            b.invalidate(ctx);
            return true;
        },
        onMouseUp: function (ctx, event) {
            ctx.backColor = "#f0f0f0";
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
            b.invalidate(ctx);
            return true;
        }
    };
    function twice(obj) {
        return [obj, b.cloneNode(obj)];
    }
    b.init(function () {
        return twice({
            tag: "div",
            style: { height: "500px", width: "500px", border: "solid 1px", position: "relative", cssFloat: "left" },
            children: {
                tag: "div",
                component: button,
                style: { width: "120px", height: "20px", position: "absolute", border: "1px solid #000", left: "190px", top: "240px" },
                children: "Click and drag out"
            }
        });
    });
})(MouseOwnerApp || (MouseOwnerApp = {}));
//# sourceMappingURL=app.js.map