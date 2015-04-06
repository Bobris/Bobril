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
                { tag: "div", style: { display: "table-cell", "vertical-align": "top", width: leftWidth }, children: left },
                { tag: "div", style: { display: "table-cell", "vertical-align": "top" }, children: right }
            ]
        };
    }
    var spacer = { tag: "div", style: "height:1em" };
    var progLangs = [{ name: "C++", gc: false, jit: false }, { name: "C#", gc: true, jit: true }, { name: "Go", gc: true, jit: false }, { name: "asm.js", gc: false, jit: true }];
    var ProgLangSourceComp = {
        render: function (ctx, me) {
            me.tag = "div";
            me.style = { position: "relative", width: 50, height: 40 };
            me.children = ctx.data.lang.name;
        },
        onDragStart: function (ctx, dndCtx) {
            dndCtx.addData("bobril/langprog", ctx.data.lang);
            return true;
        }
    };
    function progSource(lang) {
        return { component: ProgLangSourceComp, data: { lang: lang } };
    }
    function progTarget() {
        return { children: "TODO" };
    }
    b.init(function () {
        return [
            h("h1", "Drag and drop sample"),
            layoutPair(progLangs.map(function (l) { return ({ tag: "div", style: { display: "inline-block", margin: 5, padding: 10, border: "1px solid #444" }, children: progSource(l) }); }), progTarget()),
            h("p", "Frame: " + b.frame() + " Last frame time:")
        ];
    });
})(DndApp || (DndApp = {}));
