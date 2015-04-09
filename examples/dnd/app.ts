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
                { tag: "div", style: { display: "table-cell", "vertical-align": "top", width: leftWidth }, children: left },
                { tag: "div", style: { display: "table-cell", "vertical-align": "top" }, children: right }
            ]
        };
    }

    var spacer = { tag: "div", style: "height:1em" };

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
            me.style = { position: "relative", width: 50, height: 40 };
            me.children = ctx.data.lang.name;
        },
        onDragStart(ctx: IProgLangSourceCtx, dndCtx: IDndStartCtx): boolean {
            dndCtx.setSource(ctx);
            dndCtx.addData("bobril/langprog", ctx.data.lang);
            dndCtx.setOpEnabled(false, false, true);
            return true;
        }
    };

    function progSource(lang: IProgLang) {
        return { component: ProgLangSourceComp, data: { lang: lang } };
    }

    function progTarget(): IBobrilNode {
        return { children: "TODO" };
    }

    b.init(() => {
        return [
            h("h1", "Drag and drop sample"),
            layoutPair(
                progLangs.map(l=> ({ tag: "div", style: { display: "inline-block", margin: 5, padding: 10, border: "1px solid #444" }, children: progSource(l) })),
                progTarget()
                ),
            h("p", "Frame: " + b.frame() + " Last frame time:")
        ];
    });
}
