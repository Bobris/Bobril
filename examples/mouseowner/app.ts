/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>

module MouseOwnerApp {
    var button: IBobrilComponent = {
        init (ctx: any, me: IBobrilNode): void {
            ctx.backColor = "#f0f0f0";
        },
        render (ctx: any, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            b.reregisterMouseOwner(ctx, me);
            me.attrs.style.backgroundColor = ctx.backColor;
        },
        onMouseDown(ctx: any, event: IMouseEvent): boolean {
            ctx.backColor = "red";
            ctx.clickInProgress = true;
            b.invalidate();
            return true;
        },
        onMouseUp(ctx: any, event: IMouseEvent): boolean {
            ctx.backColor = "#f0f0f0";
            ctx.clickInProgress = false;
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
            b.invalidate();
            return true;
        },
        
        onMouseEnter(ctx: any, event: IMouseEvent): void {
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
        },
        onMouseLeave(ctx: any, event: IMouseEvent): void {
            if (ctx.clickInProgress) {
                b.registerMouseOwner(ctx, this);
            }
        },
    };

    b.init(() => {
        return [{
                tag: "div",
                attrs: { style: { height: "500px", width: "500px", border: "solid 1px", position: "relative", cssFloat: "left" } },
                children: {
                    tag: "div", component: button, attrs: { style: { width: "120px", height: "20px", position: "absolute", left:"190px", top: "240px" } },
                    children: "Click and drag out"
                }
            },
            {
                tag: "div",
                attrs: { style: { height: "500px", width: "500px", border: "solid 1px", position: "relative", cssFloat: "left" } },
                children: {
                    tag: "div", component: button, attrs: { style: { width: "120px", height: "20px", position: "absolute", left: "190px", top: "240px" } },
                    children: "Click and drag out"
                }
            }];
    });
}
