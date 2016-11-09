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
                if (dnd.ended || dnd.beforeDrag)
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
    var NativeSourceComp = {
        init: function (ctx) {
            ctx.draggingId = 0;
            ctx.lastAction = "N/A";
        },
        render: function (ctx, me) {
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
            }
            else {
                me.attrs = { draggable: "true" };
            }
            me.children = ctx.data.nativeType + " " + ctx.lastAction;
        },
        onDragStart: function (ctx, dndCtx) {
            // Do not allow to drag this item again if it is already dragged
            if (ctx.draggingId > 0)
                return false;
            ctx.draggingId = dndCtx.id;
            dndCtx.addData(ctx.data.nativeType, ctx.data.content);
            dndCtx.setEnabledOps(7 /* MoveCopyLink */);
            dndCtx.setDragNodeView(function (dnd) { return ({ component: NativeSourceComp, data: { nativeType: ctx.data.nativeType, dnd: dnd } }); });
            b.invalidate(ctx);
            return true;
        },
        onDragEnd: function (ctx, dndCtx) {
            if (ctx.draggingId == 0)
                return false;
            switch (dndCtx.operation) {
                case 0 /* None */:
                    ctx.lastAction = "None";
                    break;
                case 1 /* Link */:
                    ctx.lastAction = "Link";
                    break;
                case 2 /* Copy */:
                    ctx.lastAction = "Copy";
                    break;
                case 3 /* Move */:
                    ctx.lastAction = "Move";
                    break;
                default:
                    ctx.lastAction = "Unknown";
                    break;
            }
            ctx.draggingId = 0;
            b.invalidate(ctx);
            return false;
        }
    };
    function nativeSource(nativeType, content) {
        return { component: NativeSourceComp, data: { nativeType: nativeType, content: content } };
    }
    var SvgSourceComp = {
        init: function (ctx) {
            ctx.draggingId = 0;
        },
        render: function (ctx, me) {
            me.tag = "path";
            me.style = { cursor: 'move' };
            me.attrs = { fill: '#111', stroke: '#0f0', 'stroke-width': '2', d: 'M10 10L90 10 50 90Z' };
            if (ctx.draggingId > 0) {
                me.attrs['fill'] = "#444";
            }
        },
        onDragStart: function (ctx, dndCtx) {
            // Do not allow to drag this item again if it is already dragged
            if (ctx.draggingId > 0)
                return false;
            ctx.draggingId = dndCtx.id;
            dndCtx.addData('Text', 'Svg');
            dndCtx.setEnabledOps(7 /* MoveCopyLink */);
            dndCtx.setDragNodeView(function (dnd) { return ({ component: NativeSourceComp, data: { nativeType: 'Text', dnd: dnd } }); });
            b.invalidate(ctx);
            return true;
        },
        onDragEnd: function (ctx, dndCtx) {
            if (ctx.draggingId == 0)
                return false;
            ctx.draggingId = 0;
            b.invalidate(ctx);
            return false;
        }
    };
    function svgSource() {
        return { component: SvgSourceComp };
    }
    var AnyTargetComp = {
        init: function (ctx) {
            ctx.text = "";
        },
        render: function (ctx, me) {
            me.tag = "div";
            me.style = { display: "inline-block", position: "relative", left: 0, top: 0, margin: 5, padding: 20, border: "1px solid #444" };
            var dnds = b.getDnds();
            var isPossibleTarget = false;
            var isSystem = false;
            for (var i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if (dnd.ended || dnd.beforeDrag)
                    continue;
                if (dnd.system)
                    isSystem = true;
                isPossibleTarget = true;
            }
            if (isPossibleTarget) {
                me.style.background = "#4f8";
            }
            me.children = {
                tag: "div", style: { display: "inline-block", top: -me.style.top, position: "relative", minWidth: 200, minHeight: 40 },
                children: [ctx.text, { tag: 'br' }, dnds.length > 0 ? dnds.length + (isSystem ? " System" : " Emulated") : '']
            };
        },
        onDragOver: function (ctx, dndCtx) {
            ctx.text = dndCtx.listData().join();
            dndCtx.setOperation(1 /* Link */);
            b.invalidate(ctx);
            return true;
        },
        onDrop: function (ctx, dndCtx) {
            var k = dndCtx.listData();
            var s = "";
            for (var i = 0; i < k.length; i++) {
                s += k[i] + " " + JSON.stringify(dndCtx.getData(k[i])) + " ";
            }
            ctx.text = s;
            b.invalidate(ctx);
            return true;
        },
        onDrag: function (ctx, dndCtx) {
            ctx.text = dndCtx.listData().join();
            b.invalidate(ctx);
            return false;
        },
        onDragEnd: function (ctx, dndCtx) {
            ctx.wasEnd = true;
            b.invalidate(ctx);
            return false;
        }
    };
    function anyTarget() {
        return { component: AnyTargetComp };
    }
    b.init(function () {
        return {
            tag: "div", style: { maxWidth: 700, touchAction: "none" }, children: [
                h("h1", "Drag and drop sample"),
                layoutPair(progLangs.map(function (l) { return progSource(l); }), progTarget({ test: function (l) { return true; }, content: [{ tag: "div", children: "Any language" }, progTarget({ test: function (l) { return l.gc; }, content: "Has GC" }), " ", progTarget({ test: function (l) { return l.jit; }, content: "Has JIT" })] })),
                layoutPair([nativeSource("Text", "Hello"), nativeSource("Url", "https://github.com/Bobris")], anyTarget()),
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
                            onDragStart: function (ctx, dndCtx) {
                                return true;
                            }
                        }
                    }
                }
            ]
        };
    });
})(DndApp || (DndApp = {}));
