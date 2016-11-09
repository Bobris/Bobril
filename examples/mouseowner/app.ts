/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>

module MouseOwnerApp {
    var button: IBobrilComponent = {
        init(ctx: any, me: IBobrilNode): void {
            ctx.backColor = "#f0f0f0";
        },
        render(ctx: any, me: IBobrilNode): void {
            me.tag = "div";
            me.style = b.assign({}, ctx.data.style);
            me.children = ctx.data.children;
            me.style.backgroundColor = ctx.backColor;
        },
        onMouseDown(ctx: any): boolean {
            ctx.backColor = "red";
            b.registerMouseOwner(ctx);
            b.invalidate(ctx);
            return true;
        },
        onMouseUp(ctx: any): boolean {
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
            style: { height: 500, width: 500, border: "solid 1px", position: "relative", cssFloat: "left" },
            children: {
                component: button, data: {
                    style: { width: 120, height: 20, position: "absolute", border: "1px solid #000", left: 190, top: 240 },
                    children: "Click and drag out"
                }
            }
        });
    });
}
