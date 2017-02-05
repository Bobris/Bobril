import * as b from "../../package/index";

interface IPointer {
    gid: string;
    startx: number;
    starty: number;
    lastx: number;
    lasty: number;
    timedown: number;
    path: string;
}

interface IFreeDrawCtx extends b.IBobrilCtx {
    pointers: { [id: number]: IPointer }
    retained: IPointer[];
}

var globPointerCounter: number = 0;

const FreeDrawComp = b.createVirtualComponent<void>({
    init(ctx: IFreeDrawCtx) {
        ctx.pointers = Object.create(null);
        ctx.retained = [];
    },
    render(ctx: IFreeDrawCtx, me: b.IBobrilNode) {
        me.tag = "svg";
        b.style(me, { width: "100%", height: "100%", fill: "transparent" });
        var ch = <b.IBobrilNode[]>[];
        var now = b.now();
        function drawPointer(p: IPointer) {
            var time = now - p.timedown;
            if (time < 500) {
                ch.push({ key: p.gid + "a", tag: "circle", attrs: { cx: p.startx, cy: p.starty, r: 50 - time * 0.09, stroke: "#ff8080", strokeWidth: 3 } });
                b.invalidate(ctx);
            }
            ch.push({ key: p.gid, tag: "path", attrs: { d: p.path, stroke: "#202060", strokeWidth: 5 } });
        }
        for (var i = 0; i < ctx.retained.length; i++) {
            drawPointer(ctx.retained[i]);
        }
        for (var id in ctx.pointers) {
            var p = ctx.pointers[id];
            drawPointer(p);
        }
        me.children = ch;
    },
    onPointerDown(ctx: IFreeDrawCtx, param: b.IBobrilPointerEvent): boolean {
        const pos = b.convertPointFromClientToNode(ctx.me, param.x, param.y);
        console.log(param, pos);
        ctx.pointers[param.id] = {
            gid: "" + globPointerCounter++,
            startx: pos[0],
            starty: pos[1],
            lastx: pos[0],
            lasty: pos[1],
            timedown: b.now(),
            path: "M" + pos[0] + " " + pos[1]
        };
        b.invalidate(ctx);
        return true;
    },
    onPointerMove(ctx: IFreeDrawCtx, param: b.IBobrilPointerEvent): boolean {
        const pos = b.convertPointFromClientToNode(ctx.me, param.x, param.y);
        var p = ctx.pointers[param.id];
        if (p === undefined) return false;
        if (p.lastx != pos[0] || p.lasty != pos[1]) {
            p.lastx = pos[0];
            p.lasty = pos[1];
            p.path += "L" + pos[0] + " " + pos[1];
            b.invalidate(ctx);
        }
        return true;
    },
    onPointerUp(ctx: IFreeDrawCtx, param: b.IBobrilPointerEvent) {
        const pos = b.convertPointFromClientToNode(ctx.me, param.x, param.y);
        var p = ctx.pointers[param.id];
        if (p === undefined) return false;
        if (p.lastx != pos[0] || p.lasty != pos[1]) {
            p.lastx = pos[0];
            p.lasty = pos[1];
            p.path += "L" + pos[0] + " " + pos[1];
        }
        delete ctx.pointers[param.id];
        ctx.retained.push(p);
        b.invalidate(ctx);
        return true;
    },
    onPointerCancel(ctx: IFreeDrawCtx, param: b.IBobrilPointerEvent): boolean {
        delete ctx.pointers[param.id];
        return true;
    }
});

b.init(() => {
    b.invalidate();
    let rotate = b.uptime() * 0.01 % 360;
    let skew = Math.sin(b.uptime() * 0.001) * 30;
    return [
        b.styledDiv([
            b.styledDiv("Free Draw", { position: "absolute", color: "#ccc" }),
            FreeDrawComp()
        ], { transform: `rotate(${rotate}deg) skewX(${skew}deg) translate(50px,50px)`, touchAction: "none", width: "300px", height: "200px", border: "1px solid black" })
    ];
});
