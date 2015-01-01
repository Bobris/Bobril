/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.scroll.d.ts"/>

module StickyHeaderApp {
    function h(tag: string, ...args: any[]): IBobrilNode {
        return { tag: tag, children: args };
    }

    function hs(tag: string, style: any, ...args: any[]): IBobrilNode {
        return { tag: tag, attrs: { style: style }, children: args };
    }

    interface IOnChangeData {
        onChange: (value: any) => void;
    }

    interface IOnChangeCtx {
        data: IOnChangeData;
    }

    class OnChangeComponent implements IBobrilComponent {
        static onChange(ctx: IOnChangeCtx, v: any): void {
            ctx.data.onChange(v);
        }
    }

    function checkbox(value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function smallbutton(onAction: () => void, content: any): IBobrilNode {
        return {
            tag: "button", attrs: { style: { width: "2em", height: "2em" } }, component: {
                onClick() { onAction(); return true; }
            }, children: content
        };
    }
    function pxinput(value: number, onChange: (value: number) => void): IBobrilNode {
        return {
            tag: "span", children: [
                smallbutton(() => { onChange(value - 1); }, "-"),
                " " + value + "px ",
                smallbutton(() => { onChange(value + 1); }, "+")
            ]
        };
    }

    function getWindowScroll(): { top: number; left: number } {
        var top = window.pageYOffset;
        var left = window.pageXOffset;
        if (top === undefined) { // IE8
            var de = document.documentElement;
            top = de.scrollTop;
            left = de.scrollLeft;
        }
        return { top: top, left: left };
    }

    function getOffset(element: HTMLElement): { top: number; left: number } {
        var box = element.getBoundingClientRect();
        var docElem = document.documentElement;
        var winScroll = getWindowScroll();
        return {
            top: box.top + winScroll.top - docElem.clientTop,
            left: box.left + winScroll.left - docElem.clientLeft
        };
    }

    function getHeight(element: HTMLElement): number {
        return element.scrollHeight;
    }

    function stickyUpdateDom(ctx: any, me: IBobrilNode, element: HTMLElement) {
        var c: any = ctx;
        var tableElement = element;
        var origHeader = <HTMLElement>tableElement.firstChild;
        var newTopOffset = c.isWindowScrolling ? 0 : c.$scrollableArea.offset().top;
        var offset = getOffset(tableElement);
        var winScroll = getWindowScroll();
        var scrollTop = winScroll.top + newTopOffset;
        var scrollLeft = winScroll.left;

        var scrolledPastTop = c.isWindowScrolling ? scrollTop > offset.top : newTopOffset > offset.top;
        var notScrolledPastBottom = (c.isWindowScrolling ? scrollTop : 0) <
            (offset.top + getHeight(tableElement) - getHeight(origHeader) - (c.isWindowScrolling ? 0 : newTopOffset));
        //console.log(c.sticky + " " + scrolledPastTop + " " + notScrolledPastBottom + " " + getHeight(tableElement) + " " + getHeight(element));
        if (c.sticky !== (scrolledPastTop && notScrolledPastBottom)) {
            c.sticky = !c.sticky;
            b.invalidate();
            return;
        }
        if (c.lastSticky) {
            var fixElement = <HTMLElement>tableElement.childNodes[1];
            var fixElementStyle = fixElement.style;
            var newLeft = offset.left - scrollLeft + c.deltaCorr;
            fixElementStyle.left = newLeft + "px";
            fixElementStyle.top = newTopOffset + "px";
            if (fixElement.firstChild) {
                var l1 = (<HTMLElement>fixElement.firstChild).getBoundingClientRect().left;
                var l2 = (<HTMLElement>origHeader.firstChild).getBoundingClientRect().left;
                var dif = l2 - l1;
                c.deltaCorr += dif;
                if (Math.abs(dif) > 0.1) {
                    newLeft = offset.left - scrollLeft + c.deltaCorr;
                    fixElementStyle.left = newLeft + "px";
                }
            }
        }
    }

    var StickyHeaderFixedComp: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.attrs = me.attrs || {};
            me.attrs.style = me.attrs.style || {};
            me.attrs.style.position = "fixed";
            me.attrs.style.marginTop = "0px";
            me.attrs.style.zIndex = "3";
            me.attrs.style.left = "0";
            me.attrs.style.top = "0";
        }
    }

    var StickyTableComp: IBobrilComponent = {
        init(ctx: any) {
            ctx.onScroll = () => b.invalidate();
            ctx.isWindowScrolling = true;
            ctx.sticky = false;
            ctx.deltaCorr = 0;
        },
        render(ctx: any, me: IBobrilNode) {
            var header: IBobrilNode = ctx.data.header;
            ctx.lastSticky = ctx.sticky;
            ctx.borderCollapse = ctx.data.borderCollapse;
            if (ctx.sticky) {
                var clone: IBobrilNode = b.assign({}, header);
                if (clone.attrs) {
                    clone.attrs = <any>b.assign({}, clone.attrs);
                    if (clone.attrs.style) clone.attrs.style = <any>b.assign({}, clone.attrs.style);
                }
                b.postEnhance(clone, StickyHeaderFixedComp);
                clone.key = "StickyH";
                me.children = [header, clone, ctx.data.body];
            } else {
                me.children = [header, ctx.data.body];
            }
        },
        postInitDom(ctx: any, me: IBobrilNode, element: HTMLElement) {
            b.addOnScroll(ctx.onScroll);
            stickyUpdateDom(ctx, me, element);
        },
        postUpdateDom(ctx: any, me: IBobrilCacheNode, element: HTMLElement) {
            stickyUpdateDom(ctx, me, element);
            if (!ctx.lastSticky) return;
            var origEl = element.firstChild;
            var cloEl = origEl.nextSibling;
            var ieWeirdness = b.ieVersion() <= 9;
            for (var i = 0, l = origEl.childNodes.length; i < l; i++) {
                var w: number;
                var origElc = <HTMLElement>origEl.childNodes[i];
                if (ieWeirdness) {
                    // w = origElc.offsetWidth; this does not work in IE9
                    var clientRect = origElc.getBoundingClientRect();
                    w = clientRect.right - clientRect.left;
                } else {
                    var computedStyle = window.getComputedStyle(origElc, null);
                    if (computedStyle.boxSizing === "border-box") {
                        w = origElc.offsetWidth;
                    } else {
                        w = parseFloat(computedStyle.width);
                    }
                }
                var s = (<HTMLElement>cloEl.childNodes[i]).style;
                var w2 = w + "px";
                s.minWidth = w2;
                s.maxWidth = w2;
                if (ieWeirdness) {
                    s.boxSizing = "border-box";
                }
            }
            (<HTMLElement>origEl).style.width = (<HTMLElement>cloEl).scrollWidth + "px";
        },
        destroy(ctx: any, me: IBobrilNode, element: HTMLElement) {
            b.removeOnScroll(ctx.onScroll);
        }
    };

    function stickyTable(borderCollapse: boolean, style: any, header: IBobrilNode, body: any): IBobrilNode {
        style = b.assign({}, style);
        style.borderCollapse = borderCollapse ? "collapse" : "separate";
        return { tag: "table", attrs: { style: style }, data: { borderCollapse: borderCollapse, header: header, body: body }, component: StickyTableComp };
    }

    function headerCell(content: string): IBobrilNode {
        return hs("th", { backgroundColor: "#ffc", border: "1px solid #300" }, content);
    }

    function bodyCell(content: string): IBobrilNode {
        return hs("td", { border: "1px solid #600" }, content);
    }

    function range(from: number, to: number) {
        var res: number[] = [];
        for (var i = from; i <= to; i++) {
            res.push(i);
        }
        return res;
    }

    var cols = 20;
    var frame = 0;
    var borderSpacing = 5;
    var borderCollapse = false;
    b.init(() => {
        frame++;
        var rows = range(1, 100).map(i => {
            return h("tr", range(1, cols).map(j => bodyCell("Cell " + j + "/" + i)));
        });
        return [
            h("h1", "Sticky Header Bobril sample"),
            h("p", "Frame: " + frame),
            h("label", checkbox(borderCollapse, v=> {
                borderCollapse = v;
                b.invalidate();
            }), "Collapse borders"),
            " Border Spacing: ", pxinput(borderSpacing, (v) => {
                borderSpacing = v;
                b.invalidate();
            }),
            stickyTable(borderCollapse, { borderSpacing: borderSpacing + "px", border: "1px solid #000" }, h("tr", range(1, cols).map(j=> headerCell("Header " + j))), rows),
            h("p", "Some text after table"),
            range(1, 30).map(i=> h("p", "" + i))
        ];
    });
}
