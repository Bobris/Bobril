/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.scroll.d.ts"/>
var StickyHeaderApp;
(function (StickyHeaderApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    function hs(tag, style) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        return { tag: tag, attrs: { style: style }, children: args };
    }
    var OnChangeComponent = (function () {
        function OnChangeComponent() {
        }
        OnChangeComponent.onChange = function (ctx, v) {
            ctx.data.onChange(v);
        };
        return OnChangeComponent;
    })();
    function checkbox(value, onChange) {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }
    function smallbutton(onAction, content) {
        return {
            tag: "button",
            attrs: { style: { width: "2em", height: "2em" } },
            component: {
                onClick: function () {
                    onAction();
                    return true;
                }
            },
            children: content
        };
    }
    function pxinput(value, onChange) {
        return {
            tag: "span",
            children: [
                smallbutton(function () {
                    onChange(value - 1);
                }, "-"),
                " " + value + "px ",
                smallbutton(function () {
                    onChange(value + 1);
                }, "+")
            ]
        };
    }
    function getOffset(element) {
        var box = element.getBoundingClientRect();
        var docElem = document.documentElement;
        var winScroll = b.getWindowScroll();
        return [
            box.left + winScroll[0] - docElem.clientLeft,
            box.top + winScroll[1] - docElem.clientTop
        ];
    }
    function getHeight(element) {
        return element.scrollHeight;
    }
    function stickyUpdateDom(ctx, me, element) {
        var scrollableArea = element.parentElement;
        while (!b.isScrollable(scrollableArea))
            scrollableArea = scrollableArea.parentElement;
        var isWindowScrolling = scrollableArea === document.body;
        var c = ctx;
        var tableElement = element;
        var origHeader = tableElement.firstChild;
        var newTopOffset = isWindowScrolling ? 0 : getOffset(scrollableArea)[1];
        var offset = getOffset(tableElement);
        var winScroll = b.getWindowScroll();
        var scrollTop = winScroll[1] + newTopOffset;
        var scrollLeft = winScroll[0];
        var scrolledPastTop = (isWindowScrolling ? scrollTop : newTopOffset) > offset[1];
        var notScrolledPastBottom = (isWindowScrolling ? scrollTop : 0) < (offset[1] + getHeight(tableElement) - getHeight(origHeader) - newTopOffset);
        if (c.sticky !== (scrolledPastTop && notScrolledPastBottom)) {
            c.sticky = !c.sticky;
            b.invalidate();
            return;
        }
        if (c.lastSticky) {
            var fixElement = tableElement.childNodes[1];
            var fixElementStyle = fixElement.style;
            var newLeft = offset[0] - scrollLeft + c.deltaCorr;
            var newTop = newTopOffset - (isWindowScrolling ? 0 : winScroll[1]);
            fixElementStyle.left = newLeft + "px";
            fixElementStyle.top = newTop + "px";
            if (fixElement.firstChild) {
                var l1 = fixElement.firstChild.getBoundingClientRect().left;
                var l2 = origHeader.firstChild.getBoundingClientRect().left;
                var dif = l2 - l1;
                c.deltaCorr += dif;
                if (Math.abs(dif) > 0.1) {
                    newLeft = offset[0] - scrollLeft + c.deltaCorr;
                    fixElementStyle.left = newLeft + "px";
                }
            }
        }
    }
    var StickyHeaderFixedComp = {
        render: function (ctx, me) {
            me.attrs = me.attrs || {};
            me.attrs.style = me.attrs.style || {};
            me.attrs.style.position = "fixed";
            me.attrs.style.marginTop = "0px";
            me.attrs.style.zIndex = "3";
            me.attrs.style.left = "0";
            me.attrs.style.top = "0";
        }
    };
    function cloneObj(o) {
        return b.assign({}, o);
    }
    var StickyTableComp = {
        init: function (ctx) {
            ctx.onScroll = function () { return b.invalidate(); };
            ctx.sticky = false;
            ctx.deltaCorr = 0;
        },
        render: function (ctx, me) {
            var header = ctx.data.header;
            ctx.lastSticky = ctx.sticky;
            ctx.borderCollapse = ctx.data.borderCollapse;
            if (ctx.sticky) {
                var clone = cloneObj(header);
                if (clone.attrs) {
                    clone.attrs = cloneObj(clone.attrs);
                    if (clone.attrs.style)
                        clone.attrs.style = cloneObj(clone.attrs.style);
                }
                b.postEnhance(clone, StickyHeaderFixedComp);
                clone.key = "StickyH";
                me.children = [header, clone, ctx.data.body];
            }
            else {
                me.children = [header, ctx.data.body];
            }
        },
        postInitDom: function (ctx, me, element) {
            b.addOnScroll(ctx.onScroll);
            stickyUpdateDom(ctx, me, element);
        },
        postUpdateDom: function (ctx, me, element) {
            stickyUpdateDom(ctx, me, element);
            if (!ctx.lastSticky)
                return;
            var origEl = element.firstChild;
            var cloEl = origEl.nextSibling;
            var ieWeirdness = b.ieVersion() <= 9;
            for (var i = 0, l = origEl.childNodes.length; i < l; i++) {
                var w;
                var origElc = origEl.childNodes[i];
                if (ieWeirdness) {
                    // w = origElc.offsetWidth; this does not work correctly in IE9
                    var clientRect = origElc.getBoundingClientRect();
                    w = clientRect.right - clientRect.left;
                }
                else {
                    var computedStyle = window.getComputedStyle(origElc, null);
                    if (computedStyle.boxSizing === "border-box") {
                        w = origElc.offsetWidth;
                    }
                    else {
                        w = parseFloat(computedStyle.width);
                    }
                }
                var s = cloEl.childNodes[i].style;
                var w2 = w + "px";
                s.minWidth = w2;
                s.maxWidth = w2;
                if (ieWeirdness) {
                    s.boxSizing = "border-box";
                }
            }
        },
        destroy: function (ctx, me, element) {
            b.removeOnScroll(ctx.onScroll);
        }
    };
    function stickyTable(borderCollapse, style, header, body) {
        style = cloneObj(style);
        style.borderCollapse = (borderCollapse ? "collapse" : "separate");
        return { tag: "table", attrs: { style: style }, data: { borderCollapse: borderCollapse, header: header, body: body }, component: StickyTableComp };
    }
    function headerCell(content) {
        return hs("th", { backgroundColor: "#ffc", border: "1px solid #300" }, content);
    }
    function bodyCell(content) {
        return hs("td", { border: "1px solid #600" }, content);
    }
    function range(from, to) {
        var res = [];
        for (var i = from; i <= to; i++) {
            res.push(i);
        }
        return res;
    }
    var ScrollableComp = {
        postInitDom: function (ctx, me, element) {
            b.registerScrollable(element);
        },
        destroy: function (ctx, me, element) {
            b.unregisterScrollable(element);
        }
    };
    var cols = 20;
    var frame = 0;
    var borderSpacing = 5;
    var borderCollapse = false;
    b.init(function () {
        frame++;
        function rows() {
            return range(1, 100).map(function (i) {
                return h("tr", range(1, cols).map(function (j) { return bodyCell("Cell " + j + "/" + i); }));
            });
        }
        return [
            h("h1", "Sticky Header Bobril sample"),
            h("p", "Frame: " + frame),
            h("label", checkbox(borderCollapse, function (v) {
                borderCollapse = v;
                b.invalidate();
            }), "Collapse borders"),
            " Border Spacing: ",
            pxinput(borderSpacing, function (v) {
                borderSpacing = v;
                b.invalidate();
            }),
            { tag: "div", attrs: { style: { height: "150px", width: "300px", overflow: "auto" } }, component: ScrollableComp, children: stickyTable(borderCollapse, { borderSpacing: borderSpacing + "px", border: "1px solid #000" }, h("tr", range(1, cols).map(function (j) { return headerCell("Header " + j); })), rows()) },
            stickyTable(borderCollapse, { borderSpacing: borderSpacing + "px", border: "1px solid #000" }, h("tr", range(1, cols).map(function (j) { return headerCell("Header " + j); })), rows()),
            h("p", "Some text after table"),
            range(1, 30).map(function (i) { return h("p", "" + i); })
        ];
    });
})(StickyHeaderApp || (StickyHeaderApp = {}));
//# sourceMappingURL=app.js.map