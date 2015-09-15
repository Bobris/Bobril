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
            me.style = { display: "inline-block", verticalAlign: "top", position: "relative", left: 0, top: 0, cursor: "move", margin: 5, width: 50, height: 40, padding: 10, userSelect: "none", border: "1px solid #444", background: "#eee" };
            if (ctx.draggingId > 0 && b.anyActiveDnd()) {
                me.style.background = "#444";
                return;
            }
            if (ctx.data.dnd) {
                var dnd = ctx.data.dnd;
                me.style.outline = "1px solid #f00";
                me.style.margin = 0;
                me.style.left = dnd.deltaX;
                me.style.top = dnd.deltaY;
                me.style.opacity = 0.5;
                me.children = ctx.data.lang.name.toUpperCase();
                return;
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
                if (dnd.ended || dnd.beforeDrag) continue;
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

    interface INativeSourceData {
        nativeType: string;
        content: any;
        dnd?: IDndCtx;
    }

    interface INativeSourceCtx extends IBobrilCtx {
        data: INativeSourceData;
        draggingId: number;
        lastAction: string;
    }

    var NativeSourceComp: IBobrilComponent = {
        init(ctx: INativeSourceCtx) {
            ctx.draggingId = 0;
            ctx.lastAction = "N/A";
        },
        render(ctx: INativeSourceCtx, me: IBobrilNode) {
            me.tag = "div";
            me.style = { display: "inline-block", verticalAlign: "top", position: "relative", left: 0, top: 0, cursor: "move", margin: 5, width: 60, height: 50, padding: 10, userSelect: "none", border: "1px solid #444", background: "#eee" };
            if (ctx.draggingId > 0 && b.anyActiveDnd()) {
                me.style.background = "#444";
                return;
            }
            if (ctx.data.dnd) {
                var dnd = ctx.data.dnd;
                me.style.outline = "1px solid #f00";
                me.style.userSelect = "none";
                me.style.margin = 0;
                me.style.left = dnd.deltaX;
                me.style.top = dnd.deltaY;
                me.style.opacity = 0.5;
                me.children = ctx.data.nativeType.toUpperCase();
                return;
            } else {
                me.attrs = { draggable: "true" };
            }
            me.children = ctx.data.nativeType + " " + ctx.lastAction;
        },
        onDragStart(ctx: INativeSourceCtx, dndCtx: IDndStartCtx): boolean {
            // Do not allow to drag this item again if it is already dragged
            if (ctx.draggingId > 0) return false;
            ctx.draggingId = dndCtx.id;
            dndCtx.addData(ctx.data.nativeType, ctx.data.content);
            dndCtx.setEnabledOps(DndEnabledOps.MoveCopyLink);
            dndCtx.setDragNodeView(dnd=> ({ component: NativeSourceComp, data: { nativeType: ctx.data.nativeType, dnd } }));
            b.invalidate(ctx);
            return true;
        },
        onDragEnd(ctx: INativeSourceCtx, dndCtx: IDndCtx): boolean {
            if (ctx.draggingId == 0) return false;
            switch (dndCtx.operation) {
                case DndOp.None: ctx.lastAction = "None"; break;
                case DndOp.Link: ctx.lastAction = "Link"; break;
                case DndOp.Copy: ctx.lastAction = "Copy"; break;
                case DndOp.Move: ctx.lastAction = "Move"; break;
                default: ctx.lastAction = "Unknown"; break;
            }
            ctx.draggingId = 0;
            b.invalidate(ctx);
            return false;
        }
    };

    function nativeSource(nativeType: string, content: any) {
        return { component: NativeSourceComp, data: { nativeType, content } };
    }

    var SvgSourceComp: IBobrilComponent = {
        init(ctx: INativeSourceCtx) {
            ctx.draggingId = 0;
        },
        render(ctx: INativeSourceCtx, me: IBobrilNode) {
            me.tag = "path";
            me.style = { cursor: 'move' };
            me.attrs = { fill: '#111', stroke: '#0f0', 'stroke-width': '2', d: 'M10 10L90 10 50 90Z' };
            if (ctx.draggingId > 0) {
                me.attrs['fill'] = "#444";
            }
        },
        onDragStart(ctx: INativeSourceCtx, dndCtx: IDndStartCtx): boolean {
            // Do not allow to drag this item again if it is already dragged
            if (ctx.draggingId > 0) return false;
            ctx.draggingId = dndCtx.id;
            dndCtx.addData('Text', 'Svg');
            dndCtx.setEnabledOps(DndEnabledOps.MoveCopyLink);
            dndCtx.setDragNodeView(dnd=> ({ component: NativeSourceComp, data: { nativeType: 'Text', dnd } }));
            b.invalidate(ctx);
            return true;
        },
        onDragEnd(ctx: INativeSourceCtx, dndCtx: IDndCtx): boolean {
            if (ctx.draggingId == 0) return false;
            ctx.draggingId = 0;
            b.invalidate(ctx);
            return false;
        }
    };

    function svgSource() {
        return { component: SvgSourceComp };
    }

    interface IAnyTargetCtx extends IBobrilCtx {
        text: string;
    }

    var AnyTargetComp: IBobrilComponent = {
        init(ctx: IAnyTargetCtx) {
            ctx.text = "";
        },
        render(ctx: IAnyTargetCtx, me: IBobrilNode) {
            me.tag = "div";
            me.style = { display: "inline-block", position: "relative", left: 0, top: 0, margin: 5, padding: 20, border: "1px solid #444" };
            var dnds = b.getDnds();
            var isPossibleTarget = false;
            var isSystem = false;
            for (let i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if (dnd.ended || dnd.beforeDrag) continue;
                if (dnd.system) isSystem = true;
                isPossibleTarget = true;
            }
            if (isPossibleTarget) {
                me.style.background = "#4f8";
            }
            me.children = {
                tag: "div", style: { display: "inline-block", top: -me.style.top, position: "relative", minWidth: 200, minHeight: 40 },
                children: [ctx.text, { tag:'br' }, dnds.length>0?dnds.length+(isSystem?" System":" Emulated"):'' ]
            };
        },
        onDragOver(ctx: IAnyTargetCtx, dndCtx: IDndOverCtx): boolean {
            ctx.text = dndCtx.listData().join();
            dndCtx.setOperation(DndOp.Link);
            b.invalidate(ctx);
            return true;
        },
        onDrop(ctx: IAnyTargetCtx, dndCtx: IDndCtx): boolean {
            var k = dndCtx.listData();
            var s = "";
            for (let i = 0; i < k.length; i++) {
                s += k[i] + " " + JSON.stringify(dndCtx.getData(k[i])) + " ";
            }
            ctx.text = s;
            b.invalidate(ctx);
            return true;
        },
        onDrag(ctx: IAnyTargetCtx, dndCtx: IDndCtx): boolean {
            ctx.text = dndCtx.listData().join();
            b.invalidate(ctx);
            return false;
        },
        onDragEnd(ctx: IAnyTargetCtx, dndCtx: IDndCtx): boolean {
            (<any>ctx).wasEnd = true;
            b.invalidate(ctx);
            return false;
        }
    }

    function anyTarget(): IBobrilNode {
        return { component: AnyTargetComp };
    }

    b.init(() => {
        return {
            tag: "div", style: { maxWidth: 700, touchAction: "none" }, children: [
                h("h1", "Drag and drop sample"),
                layoutPair(
                    progLangs.map(l=> progSource(l)),
                    progTarget({ test: l=> true, content: [{ tag: "div", children: "Any language" }, progTarget({ test: l=> l.gc, content: "Has GC" }), " ", progTarget({ test: l=> l.jit, content: "Has JIT" })] })
                ),
                layoutPair(
                    [nativeSource("Text", "Hello"), nativeSource("Url", "https://github.com/Bobris")],
                    anyTarget()
                ),
                h("p", "Frame: " + b.frame() + " Last frame duration:" + b.lastFrameDuration()),
                { tag: 'svg', attrs: { draggable: "true", width: '100px', height: '100px' }, children: svgSource() },
                {
                    tag: 'svg', style: { width: '100%', height: 80, background: 'lightblue' }, children: {
                        tag: 'g', attrs: { draggable: true }, children: {
                            tag: 'rect',
                            attrs: {
                                x: 10,
                                y: 10,
                                width: 50,
                                height: 50
                            },
                            style: { stroke: 'black', strokeWidth: 1, fill: 'white' }
                        }, component: {
                            onDragStart(ctx: IBobrilCtx, dndCtx: IDndStartCtx): boolean {
                                return true;
                            }
                        }
                    }
                }
            ]
        };
    });
}
