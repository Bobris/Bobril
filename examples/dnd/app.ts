/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.dnd.d.ts"/>

module DndApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    function layoutPair(left: any, right: any, leftWidth = "50%"): IBobrilNode {
        return {
            tag: "div",
            style: { display: "table", width: "100%" },
            children: [
                { tag: "div", style: { display: "table-cell", verticalAlign: "top", width: leftWidth }, children: left },
                { tag: "div", style: { display: "table-cell", verticalAlign: "top" }, children: right }
            ]
        };
    }

    var spacer = { tag: "div", style: { height: "1em" } };

    interface IProgLang {
        name: string;
        gc: boolean;
        jit: boolean;
    }

    var progLangs = <IProgLang[]>[{ name: "C++", gc: false, jit: false }, { name: "C#", gc: true, jit: true }, { name: "Go", gc: true, jit: false }, { name: "asm.js", gc: false, jit: true }];

    interface IProgLangSourceData {
        lang: IProgLang;
        dnd?: IDndCtx;
    }

    interface IProgLangSourceCtx extends IBobrilCtx {
        data: IProgLangSourceData;
        draggingId: number;
    }

    var ProgLangSourceComp: IBobrilComponent = {
        init(ctx: IProgLangSourceCtx) {
            ctx.draggingId = 0;
        },
        render(ctx: IProgLangSourceCtx, me: IBobrilNode) {
            me.tag = "div";
            me.style = { display: "inline-block", position: "relative", left: 0, top: 0, cursor: "move", margin: 5, width: 50, height: 40, padding: 10, userSelect: "none", border: "1px solid #444", background: "#eee" };
            if (ctx.draggingId > 0) {
                me.style.background = "#444";
                me.children = String.fromCharCode(0xa0);
                return;
            }
            if (ctx.data.dnd) {
                var dnd = ctx.data.dnd;
                me.style.margin = 0;
                me.style.left = dnd.deltaX;
                me.style.top = dnd.deltaY;
                me.style.opacity = 0.5;
            } else {
                me.attrs = { draggable: "true" };
            }
            me.children = ctx.data.lang.name;
        },
        onDragStart(ctx: IProgLangSourceCtx, dndCtx: IDndStartCtx): boolean {
            // Do not allow to drag this item again if it is already dragged
            if (ctx.draggingId > 0) return false;
            ctx.draggingId = dndCtx.id;
            dndCtx.addData("bobril/langprog", ctx.data.lang);
            dndCtx.setEnabledOps(DndEnabledOps.Move);
            dndCtx.setDragNodeView(dnd=> ({ component: ProgLangSourceComp, data: { lang: ctx.data.lang, dnd } }));
            b.invalidate(ctx);
            return true;
        },
        onDragEnd(ctx: IProgLangSourceCtx, dndCtx: IDndCtx): boolean {
            ctx.draggingId = 0;
            b.invalidate(ctx);
            return false;
        }
    };

    function progSource(lang: IProgLang) {
        return { component: ProgLangSourceComp, data: { lang } };
    }

    interface IProgLangTargetData {
        test: (lang: IProgLang) => boolean;
        content: IBobrilChildren;
    }

    interface IProgLangTargetCtx extends IBobrilCtx {
        data: IProgLangTargetData;
        successDrop: number;
        failureDrop: number;
    }

    var ProgLangTargetComp: IBobrilComponent = {
        init(ctx: IProgLangTargetCtx) {
            ctx.successDrop = 0;
            ctx.failureDrop = 0;
        },
        render(ctx: IProgLangTargetCtx, me: IBobrilNode) {
            me.tag = "div";
            me.style = { display: "inline-block", position: "relative", left: 0, top: 0, margin: 5, padding: 20, border: "1px solid #444" };
            var now = b.now();
            if (ctx.successDrop + 1000 > now) {
                // Jojo animation
                me.style.top = Math.sin((now - ctx.successDrop) / 1000 * Math.PI * 4) * 5;
                b.invalidate(ctx);
            }
            if (ctx.failureDrop + 1000 > now) {
                // Nonononono animation
                me.style.left = Math.sin((now - ctx.failureDrop) / 1000 * Math.PI * 12) * 5;
                b.invalidate(ctx);
            }
            var dnds = b.getDnds();
            var isPossibleTarget = false;
            var isPositivePossibleTarget = false;
            for (let i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if (dnd.ended) continue;
                if (dnd.hasData("bobril/langprog")) {
                    isPossibleTarget = true;
                    var lang = dnd.getData("bobril/langprog");
                    if (lang) {
                        if (ctx.data.test(lang))
                            isPositivePossibleTarget = true;
                    }
                }
            }
            if (isPossibleTarget) {
                if (isPositivePossibleTarget) {
                    me.style.background = "#4f8";
                } else {
                    me.style.background = "#ff8";
                }
            }
            me.children = {
                tag: "div", style: { display: "inline-block", top: -me.style.top, position: "relative", minWidth: 50, minHeight: 40 },
                children: ctx.data.content
            };
        },
        onDragOver(ctx: IProgLangTargetCtx, dndCtx: IDndOverCtx): boolean {
            if (dndCtx.hasData("bobril/langprog")) {
                dndCtx.setOperation(DndOp.Move);
                return true;
            }
            return false;
        },
        onDrop(ctx: IProgLangTargetCtx, dndCtx: IDndCtx): boolean {
            var lang = dndCtx.getData("bobril/langprog");
            if (lang) {
                if (ctx.data.test(lang)) {
                    ctx.successDrop = b.now();
                } else {
                    ctx.failureDrop = b.now();
                }
                b.invalidate(ctx);
                return true;
            }
        },
        onDrag(ctx: IProgLangTargetCtx, dndCtx: IDndCtx): boolean {
            b.invalidate(ctx);
            return false;
        },
        onDragEnd(ctx: IProgLangTargetCtx, dndCtx: IDndCtx): boolean {
            b.invalidate(ctx);
            return false;
        }
    }

    function progTarget(data: IProgLangTargetData): IBobrilNode {
        return { component: ProgLangTargetComp, data };
    }

    b.init(() => {
        return {
            tag: "div", style: { maxWidth: 700, touchAction: "none" }, children: [
                h("h1", "Drag and drop sample"),
                layoutPair(
                    progLangs.map(l=> progSource(l)),
                    progTarget({ test: l=> true, content: [{ tag: "div", children: "Any language" }, progTarget({ test: l=> l.gc, content: "Has GC" }), " ", progTarget({ test: l=> l.jit, content: "Has JIT" })] })
                    ),
                h("p", "Frame: " + b.frame() + " Last frame duration:" + b.lastFrameDuration())
            ]
        };
    });
}
