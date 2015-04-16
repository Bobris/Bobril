/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.scroll.d.ts"/>
var StickyHeaderApp;
(function (StickyHeaderApp) {
    var fastInvalidate = true;
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
        return { tag: tag, style: style, children: args };
    }
    var OnChangeComponent = {
        onChange: function (ctx, v) {
            ctx.data.onChange(v);
        }
    };
    function checkbox(value, onChange) {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }
    function smallbutton(onAction, content) {
        return {
            tag: "button", style: { width: "2em", height: "2em" }, component: {
                onClick: function () { onAction(); return true; }
            }, children: content
        };
    }
    function pxinput(value, onChange) {
        return {
            tag: "span", children: [
                smallbutton(function () { onChange(value - 1); }, "-"),
                " " + value + "px ",
                smallbutton(function () { onChange(value + 1); }, "+")
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
    function stickyUpdateDomFix(ctx, me, element) {
        var scrollableArea = element.parentElement;
        while (scrollableArea && !b.isScrollable(scrollableArea)[1])
            scrollableArea = scrollableArea.parentElement;
        var isWindowScrolling = scrollableArea === document.documentElement || scrollableArea == null;
        var c = ctx;
        var tableElement = element;
        var origHeader = tableElement.firstChild;
        var newTopOffset = isWindowScrolling ? 0 : getOffset(scrollableArea)[1];
        var offset = getOffset(tableElement);
        var winScroll = b.getWindowScroll();
        var scrollTop = winScroll[1] + newTopOffset;
        var scrollLeft = winScroll[0];
        var scrolledPastTop = (isWindowScrolling ? scrollTop : newTopOffset) > offset[1];
        // twice header height for better UX
        var notScrolledPastBottom = (isWindowScrolling ? scrollTop : 0) <
            (offset[1] + getHeight(tableElement) - 2 * getHeight(origHeader) - newTopOffset);
        if (c.sticky !== (scrolledPastTop && notScrolledPastBottom)) {
            c.sticky = !c.sticky;
            if (fastInvalidate)
                b.invalidate(ctx, 1);
            else
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
            me.style = me.style || {};
            me.style.position = "fixed";
            me.style.marginTop = "0px";
            me.style.zIndex = "3";
            me.style.left = "0";
            me.style.top = "0";
        }
    };
    function cloneObj(o) {
        return b.assign({}, o);
    }
    var StickyTableFixComp = {
        id: "StickyTableFix",
        init: function (ctx) {
            ctx.onScroll = function () {
                if (fastInvalidate) {
                    b.invalidate(ctx, 0);
                }
                else {
                    b.invalidate();
                }
            };
            ctx.sticky = false;
            ctx.deltaCorr = 0;
        },
        render: function (ctx, me) {
            var header = ctx.data.header;
            me.tag = "table";
            me.style = ctx.data.style;
            ctx.lastSticky = ctx.sticky;
            ctx.borderCollapse = ctx.data.borderCollapse;
            if (ctx.sticky) {
                var clone = b.cloneNode(header);
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
            stickyUpdateDomFix(ctx, me, element);
        },
        postUpdateDom: function (ctx, me, element) {
            stickyUpdateDomFix(ctx, me, element);
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
    function stickyTableFix(borderCollapse, style, header, body) {
        style = cloneObj(style);
        style.borderCollapse = (borderCollapse ? "collapse" : "separate");
        return { data: { style: style, borderCollapse: borderCollapse, header: header, body: body }, component: StickyTableFixComp };
    }
    function stickyUpdateDomAbs(ctx, me, element) {
        var scrollableArea = element.parentElement;
        while (scrollableArea && !b.isScrollable(scrollableArea)[1])
            scrollableArea = scrollableArea.parentElement;
        var isWindowScrolling = scrollableArea === document.documentElement || scrollableArea == null;
        var c = ctx;
        var tableElement = element.firstChild;
        var origHeader = tableElement.firstChild;
        var newTopOffset = isWindowScrolling ? 0 : getOffset(scrollableArea)[1];
        var offset = getOffset(tableElement);
        var winScroll = b.getWindowScroll();
        var scrollTop = winScroll[1] + newTopOffset;
        var scrolledPastTop = (isWindowScrolling ? scrollTop : newTopOffset) > offset[1];
        // twice header height for better UX
        var notScrolledPastBottom = (isWindowScrolling ? scrollTop : 0) <
            (offset[1] + getHeight(tableElement) - 2 * getHeight(origHeader) - newTopOffset);
        var absElement = element.childNodes[1];
        var absElementStyle = absElement.style;
        if (scrolledPastTop && notScrolledPastBottom) {
            if (absElementStyle.visibility !== "visible")
                absElementStyle.visibility = "visible";
            var newTop = (isWindowScrolling ? winScroll[1] : newTopOffset) - offset[1];
            absElementStyle.left = c.deltaCorr + "px";
            absElementStyle.top = newTop + "px";
            var absHeader = ctx.refs["header"].element.firstChild;
            if (origHeader.firstChild) {
                var l1 = absHeader.firstChild.getBoundingClientRect().left;
                var l2 = origHeader.firstChild.getBoundingClientRect().left;
                var dif = l2 - l1;
                c.deltaCorr += dif;
                if (Math.abs(dif) > 0.1) {
                    absElementStyle.left = c.deltaCorr + "px";
                }
                var ieWeirdness = b.ieVersion() <= 9;
                for (var i = 0, l = origHeader.childNodes.length; i < l; i++) {
                    var w;
                    var origElc = origHeader.childNodes[i];
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
                    var s = absHeader.childNodes[i].style;
                    var w2 = w + "px";
                    if (s.minWidth !== w2 || s.maxWidth !== w2) {
                        s.minWidth = w2;
                        s.maxWidth = w2;
                    }
                    if (ieWeirdness) {
                        if (s.boxSizing !== "border-box")
                            s.boxSizing = "border-box";
                    }
                }
            }
        }
        else {
            if (absElementStyle.visibility !== "hidden")
                absElementStyle.visibility = "hidden";
        }
    }
    var StickyTableAbsComp = {
        id: "StickyTableAbs",
        init: function (ctx) {
            ctx.deltaCorr = 0;
            ctx.onScroll = function () {
                if (fastInvalidate) {
                    b.invalidate(ctx, 0);
                }
                else {
                    b.invalidate();
                }
            };
        },
        render: function (ctx, me) {
            var header = ctx.data.header;
            var headerClone = b.cloneNode(header);
            var styleClone = cloneObj(ctx.data.style);
            styleClone.border = "none";
            me.tag = "div";
            me.style = ctx.data.style;
            me.children = [
                {
                    tag: "table", attrs: me.attrs, className: me.className, style: me.style, children: [
                        header,
                        ctx.data.body
                    ]
                },
                {
                    tag: "div",
                    style: { visibility: "hidden", position: "absolute" },
                    children: {
                        tag: "table",
                        ref: [ctx, "header"],
                        className: me.className,
                        attrs: me.attrs,
                        style: styleClone,
                        children: headerClone
                    }
                }
            ];
            me.attrs = undefined;
            me.className = undefined;
            me.style = { position: "relative" };
        },
        postInitDom: function (ctx, me, element) {
            b.addOnScroll(ctx.onScroll);
            stickyUpdateDomAbs(ctx, me, element);
        },
        postUpdateDom: function (ctx, me, element) {
            stickyUpdateDomAbs(ctx, me, element);
        },
        destroy: function (ctx, me, element) {
            b.removeOnScroll(ctx.onScroll);
        }
    };
    function stickyTableAbs(borderCollapse, style, header, body) {
        style = cloneObj(style);
        style.borderCollapse = (borderCollapse ? "collapse" : "separate");
        return { data: { style: style, header: header, body: body }, component: StickyTableAbsComp };
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
    var borderSpacing = 5;
    var borderCollapse = false;
    var implStrategyAbs = true;
    b.init(function () {
        function rows() {
            return range(1, 100).map(function (i) {
                return h("tr", range(1, cols).map(function (j) { return bodyCell("Cell " + j + "/" + i); }));
            });
        }
        var stickyTable = implStrategyAbs ? stickyTableAbs : stickyTableFix;
        return [
            h("h1", "Sticky Header Bobril sample"),
            h("p", "Frame: " + b.frame() + " Duration Last: " + b.lastFrameDuration()),
            hs("div", { paddingBottom: 10 }, h("label", checkbox(fastInvalidate, function (v) {
                fastInvalidate = v;
                b.invalidate();
            }), "Fast Invalidate")),
            hs("div", { paddingBottom: 10 }, h("label", checkbox(implStrategyAbs, function (v) {
                implStrategyAbs = v;
                b.invalidate();
            }), "Absolute Positioning")),
            hs("div", { paddingBottom: 10 }, h("label", checkbox(borderCollapse, function (v) {
                borderCollapse = v;
                b.invalidate();
            }), "Collapse borders")),
            " Border Spacing: ", pxinput(borderSpacing, function (v) {
                borderSpacing = v;
                b.invalidate();
            }),
            {
                tag: "div",
                style: { height: "150px", width: "300px", overflow: "auto" },
                component: ScrollableComp,
                children: [
                    h("p", "Before table"),
                    stickyTable(borderCollapse, { borderSpacing: borderSpacing + "px", border: "1px solid #000" }, h("tr", range(1, cols).map(function (j) { return headerCell("Header " + j); })), rows()),
                    h("p", "Some text after table"),
                    range(1, 10).map(function (i) { return h("p", "" + i); })
                ]
            },
            stickyTable(borderCollapse, { borderSpacing: borderSpacing + "px", border: "1px solid #000" }, h("tr", range(1, cols).map(function (j) { return headerCell("Header " + j); })), rows()),
            h("p", "Some text after table"),
            range(1, 30).map(function (i) { return h("p", "" + i); })
        ];
    });
})(StickyHeaderApp || (StickyHeaderApp = {}));
