/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.dnd.d.ts"/>
var DndApp;
(function (DndApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    function layoutPair(left, right, leftWidth) {
        if (leftWidth === void 0) { leftWidth = "50%"; }
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
    var progLangs = [{ name: "C++", gc: false, jit: false }, { name: "C#", gc: true, jit: true }, { name: "Go", gc: true, jit: false }, { name: "asm.js", gc: false, jit: true }];
    var ProgLangSourceComp = {
        init: function (ctx) {
            ctx.draggingId = 0;
        },
        render: function (ctx, me) {
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
            }
            else {
                me.attrs = { draggable: "true" };
            }
            me.children = ctx.data.lang.name;
        },
        onDragStart: function (ctx, dndCtx) {
            // Do not allow to drag this item again if it is already dragged
            if (ctx.draggingId > 0)
                return false;
            ctx.draggingId = dndCtx.id;
            dndCtx.addData("bobril/langprog", ctx.data.lang);
            dndCtx.setEnabledOps(4 /* Move */);
            dndCtx.setDragNodeView(function (dnd) { return ({ component: ProgLangSourceComp, data: { lang: ctx.data.lang, dnd: dnd } }); });
            b.invalidate(ctx);
            return true;
        },
        onDragEnd: function (ctx, dndCtx) {
            ctx.draggingId = 0;
            b.invalidate(ctx);
            return false;
        }
    };
    function progSource(lang) {
        return { component: ProgLangSourceComp, data: { lang: lang } };
    }
    var ProgLangTargetComp = {
        init: function (ctx) {
            ctx.successDrop = 0;
            ctx.failureDrop = 0;
        },
        render: function (ctx, me) {
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
            for (var i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if (dnd.ended)
                    continue;
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
                }
                else {
                    me.style.background = "#ff8";
                }
            }
            me.children = {
                tag: "div", style: { display: "inline-block", top: -me.style.top, position: "relative", minWidth: 50, minHeight: 40 },
                children: ctx.data.content
            };
        },
        onDragOver: function (ctx, dndCtx) {
            if (dndCtx.hasData("bobril/langprog")) {
                dndCtx.setOperation(3 /* Move */);
                return true;
            }
            return false;
        },
        onDrop: function (ctx, dndCtx) {
            var lang = dndCtx.getData("bobril/langprog");
            if (lang) {
                if (ctx.data.test(lang)) {
                    ctx.successDrop = b.now();
                }
                else {
                    ctx.failureDrop = b.now();
                }
                b.invalidate(ctx);
                return true;
            }
        },
        onDrag: function (ctx, dndCtx) {
            b.invalidate(ctx);
            return false;
        },
        onDragEnd: function (ctx, dndCtx) {
            b.invalidate(ctx);
            return false;
        }
    };
    function progTarget(data) {
        return { component: ProgLangTargetComp, data: data };
    }
    b.init(function () {
        return {
            tag: "div", style: { maxWidth: 700, touchAction: "none" }, children: [
                h("h1", "Drag and drop sample"),
                layoutPair(progLangs.map(function (l) { return progSource(l); }), progTarget({ test: function (l) { return true; }, content: [{ tag: "div", children: "Any language" }, progTarget({ test: function (l) { return l.gc; }, content: "Has GC" }), " ", progTarget({ test: function (l) { return l.jit; }, content: "Has JIT" })] })),
                h("p", "Frame: " + b.frame() + " Last frame duration:" + b.lastFrameDuration())
            ]
        };
    });
})(DndApp || (DndApp = {}));
