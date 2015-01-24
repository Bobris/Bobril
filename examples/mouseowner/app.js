/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var MouseOwnerApp;
(function (MouseOwnerApp) {
    var button = {
        init: function (ctx, me) {
            ctx.backColor = "#f0f0f0";
        },
        render: function (ctx, me, oldMe) {
            b.reregisterMouseOwner(ctx, me);
            me.attrs.style.backgroundColor = ctx.backColor;
        },
        onMouseDown: function (ctx, event) {
            ctx.backColor = "red";
            ctx.clickInProgress = true;
            b.invalidate();
            return true;
        },
        onMouseUp: function (ctx, event) {
            ctx.backColor = "#f0f0f0";
            ctx.clickInProgress = false;
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
            b.invalidate();
            return true;
        },
        onMouseEnter: function (ctx, event) {
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
        },
        onMouseLeave: function (ctx, event) {
            if (ctx.clickInProgress) {
                b.registerMouseOwner(ctx, this);
            }
        },
    };
    b.init(function () {
        return [{
            tag: "div",
            attrs: { style: { height: "500px", width: "500px", border: "solid 1px", position: "relative", cssFloat: "left" } },
            children: {
                tag: "div",
                component: button,
                attrs: { style: { width: "120px", height: "20px", position: "absolute", left: "190px", top: "240px" } },
                children: "Click and drag out"
            }
        }, {
            tag: "div",
            attrs: { style: { height: "500px", width: "500px", border: "solid 1px", position: "relative", cssFloat: "left" } },
            children: {
                tag: "div",
                component: button,
                attrs: { style: { width: "120px", height: "20px", position: "absolute", left: "190px", top: "240px" } },
                children: "Click and drag out"
            }
        }];
    });
})(MouseOwnerApp || (MouseOwnerApp = {}));
//# sourceMappingURL=app.js.map