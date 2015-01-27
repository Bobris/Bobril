/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>

module MouseOwnerApp {
    var button: IBobrilComponent = {
        init (ctx: any, me: IBobrilNode): void {
            ctx.backColor = "#f0f0f0";
        },
        render (ctx: any, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.style.backgroundColor = ctx.backColor;
        },
        onMouseDown(ctx: any, event: IMouseEvent): boolean {
            ctx.backColor = "red";
            b.registerMouseOwner(ctx);
            b.invalidate(ctx);
            return true;
        },
        onMouseUp(ctx: any, event: IMouseEvent): boolean {
            ctx.backColor = "#f0f0f0";
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
            b.invalidate(ctx);
            return true;
        }
    };

    function twice(obj: any): any[] { return [obj, b.cloneNode(obj)]; }

    b.init(() => {
        return twice({
            tag: "div",
            style: { height: "500px", width: "500px", border: "solid 1px", position: "relative", cssFloat: "left" },
            children: {
                tag: "div", component: button, style: { width: "120px", height: "20px", position: "absolute", border: "1px solid #000", left: "190px", top: "240px" },
                children: "Click and drag out"
            }
        });
    });
}
