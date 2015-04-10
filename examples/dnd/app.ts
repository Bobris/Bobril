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
    }

    interface IProgLangSourceCtx extends IBobrilCtx {
        data: IProgLangSourceData;
    }

    var ProgLangSourceComp: IBobrilComponent = {
        render(ctx: IProgLangSourceCtx, me: IBobrilNode) {
            me.tag = "div";
            me.style = { display: "inline-block", margin: 5, padding: 10, border: "1px solid #444" };
            me.children = { tag: "div", style: { display: "inline-block", position: "relative", width: 50, height: 40 }, children: ctx.data.lang.name };
        },
        onDragStart(ctx: IProgLangSourceCtx, dndCtx: IDndStartCtx): boolean {
            dndCtx.setSource(ctx);
            dndCtx.addData("bobril/langprog", ctx.data.lang);
            dndCtx.setOpEnabled(false, false, true);
            return true;
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
        droppedList: string[];
    }

    var ProgLangTargetComp: IBobrilComponent = {
        init(ctx: IProgLangTargetCtx) {
            ctx.droppedList = [];
        },
        render(ctx: IProgLangTargetCtx, me: IBobrilNode) {
            me.tag = "div";
            me.style = { display: "inline-block", margin: 5, padding: 20, border: "1px solid #444" };
            me.children = {
                tag: "div", style: { display: "inline-block", position: "relative", minWidth: 50, minHeight: 40 },
                children: [ctx.data.content, { tag: "div", style: { position: "absolute", left: 0, bottom: -10 }, children: ctx.droppedList.join(", ") }]
            };
        },
        onDragOver(ctx: IProgLangTargetCtx, dndCtx: IDndOverCtx): boolean {
            if (dndCtx.hasData("bobril/langprog")) {
                dndCtx.setTargetAndOperation(ctx, DndOp.Move);
                return true;
            }
            return false;
        },
        onDrop(ctx: IProgLangTargetCtx, dndCtx: IDndCtx): boolean {
            var lang = dndCtx.getData("bobril/langprog");
            if (lang) {
                if (ctx.data.test(lang)) {
                    ctx.droppedList.push(lang.name);
                    b.invalidate(ctx);
                }
                return true;
            }
        }
    }

    function progTarget(data: IProgLangTargetData): IBobrilNode {
        return { component: ProgLangTargetComp, data };
    }

    b.init(() => {
        return {
            tag: "div", style: { maxWidth: 700, touchAction:"none" }, children: [
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
