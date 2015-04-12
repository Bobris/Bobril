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
        render: function (ctx, me) {
            me.tag = "div";
            me.style = { display: "inline-block", position: "relative", left: 0, top: 0, cursor: "move", margin: 5, padding: 10, userSelect: "none", border: "1px solid #444", background: "#eee" };
            if (ctx.data.dnd) {
                var dnd = ctx.data.dnd;
                me.style.left = dnd.deltaX;
                me.style.top = dnd.deltaY;
            }
            me.children = { tag: "div", style: { display: "inline-block", position: "relative", width: 50, height: 40 }, children: ctx.data.lang.name };
        },
        onDragStart: function (ctx, dndCtx) {
            dndCtx.addData("bobril/langprog", ctx.data.lang);
            dndCtx.setOpEnabled(false, false, true);
            dndCtx.setDragNodeView(function (dnd) { return ({ component: ProgLangSourceComp, data: { lang: ctx.data.lang, dnd: dnd } }); });
            return true;
        }
    };
    function progSource(lang) {
        return { component: ProgLangSourceComp, data: { lang: lang } };
    }
    var ProgLangTargetComp = {
        init: function (ctx) {
            ctx.droppedList = [];
        },
        render: function (ctx, me) {
            me.tag = "div";
            me.style = { display: "inline-block", margin: 5, padding: 20, border: "1px solid #444" };
            me.children = {
                tag: "div", style: { display: "inline-block", position: "relative", minWidth: 50, minHeight: 40 },
                children: [ctx.data.content, { tag: "div", style: { position: "absolute", left: 0, bottom: -10 }, children: ctx.droppedList.join(", ") }]
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
                    ctx.droppedList.push(lang.name);
                    b.invalidate(ctx);
                }
                return true;
            }
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
