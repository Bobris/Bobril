/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>

module FreeDrawApp {

    interface IPointer {
        gid: string;
        startx: number;
        starty: number;
        lastx: number;
        lasty: number;
        timedown: number;
        path: any[];
    }

    interface IFreeDrawCtx {
        pointers: { [id: number]: IPointer }
        retained: IPointer[];
    }

    var globPointerCounter: number = 0;

    var FreeDrawComp: IBobrilComponent = {
        init(ctx: IFreeDrawCtx) {
            ctx.pointers = Object.create(null);
            ctx.retained = [];
        },
        render(ctx: IFreeDrawCtx, me: IBobrilNode) {
            var ch = <IBobrilNode[]>[];
            var now = b.now();
            function drawPointer(p: IPointer) {
                var time = now - p.timedown;
                if (time < 500) {
                    ch.push(<any>{ key: p.gid + "a", data: { path: ["circle", p.startx, p.starty, 50 - time * 0.09], stroke: "#ff8080", strokeWidth: 3 } });
                    b.invalidate();
                }
                ch.push(<any>{ key: p.gid, data: { path: p.path, stroke: "#202060", strokeWidth: 5 } });
            }
            for (var i = 0; i < ctx.retained.length; i++) {
                drawPointer(ctx.retained[i]);
            }
            for (var id in ctx.pointers) {
                var p = ctx.pointers[id];
                drawPointer(p);
            }
            me.children = { data: { width: "100%", height: "100%" }, component: b.vg, children: ch };
        },
        onPointerDown(ctx: IFreeDrawCtx, param: IBobrilPointerEvent): boolean {
            ctx.pointers[param.id] = {
                gid: "" + globPointerCounter++,
                startx: param.x,
                starty: param.y,
                lastx: param.x,
                lasty: param.y,
                timedown: b.now(),
                path: ["M", param.x, param.y]
            };
            b.invalidate();
            return true;
        },
        onPointerMove(ctx: IFreeDrawCtx, param: IBobrilPointerEvent): boolean {
            var p = ctx.pointers[param.id];
            if (p === undefined) return false;
            if (p.lastx != param.x || p.lasty != param.y) {
                p.lastx = param.x;
                p.lasty = param.y;
                p.path.push("L", param.x, param.y);
                b.invalidate();
            }
            return true;
        },
        onPointerUp(ctx: IFreeDrawCtx, param: IBobrilPointerEvent) {
            var p = ctx.pointers[param.id];
            if (p === undefined) return false;
            if (p.lastx != param.x || p.lasty != param.y) {
                p.lastx = param.x;
                p.lasty = param.y;
                p.path.push("L", param.x, param.y);
            }
            delete ctx.pointers[param.id];
            ctx.retained.push(p);
            b.invalidate();
            return true;
        },
        onPointerCancel(ctx: IFreeDrawCtx, param: IBobrilPointerEvent): boolean {
            delete ctx.pointers[param.id];
            return true;
        }
    };

    b.init(() => {
        return [
            {
                tag: "div", style: { touchAction: "none", width: "100%", height: "100%" }, component: FreeDrawComp
            },
            {
                tag: "div", style: {
                    position: "fixed", left: "20px", top: "20px", minWidth: "10px", height: "50px",
                    background: "#a0a0a0", opacity: 0.5, fontSize: "40px", padding: "4px",
                    pointerEvents: "none"
                }, children: "FreeDraw"
            }
        ];
    });
}
