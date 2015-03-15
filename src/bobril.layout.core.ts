/// <reference path="bobril.d.ts"/>

type SizeDef = number | string;
interface ISizeInfo {
    minSize: [SizeDef, SizeDef];
    maxSize: [SizeDef, SizeDef];
    size: [SizeDef, SizeDef];
    margin: [SizeDef, SizeDef, SizeDef, SizeDef];
    border: [SizeDef, SizeDef, SizeDef, SizeDef];
    padding: [SizeDef, SizeDef, SizeDef, SizeDef];
}



((b: IBobrilStatic) => {

    var flexLayout: IBobrilLayout = {
        detectBigChange(n: IBobrilNode): boolean {
            if (n.style == null) return true;
            var d = n.style.display;
            return (d !== "b-flex") || (d !== "b-inline-flex");
        },
        isItem(style: any): boolean {
            if (style == null) return true;
            if (/^absolute$|^fixed$/.test(style.position)) return false;
            if (style.display === "none") return false;
            return true;
        },
        styleItemIgnore(name: string): boolean {
            return /^(position|left|top|right|bottom|width|height|flexGrow|flexShrink|flexBasis|alignSelf|flex)?$/.test(name);
        },
        styleIgnore(name: string): boolean {
            return /^(display|flexDirection|flexWrap|justifyContent|alignItems|alignContent)?$/.test(name);
        },
        initContainer(element: HTMLElement, style: any) {
            element.style.display = (/inline/.test(style.display)) ? "inline-block" : "block";
        },
        postLayoutDom(me: IBobrilCacheNode, element: HTMLElement): void {
            extractSizeInfo(me.style)
        }
    };

    function retFalse(): boolean {
        return false;
    }
    function getOrInitLayoutInCacheNode(c: IBobrilCacheNode): IBobrilNodeLayout {
        if (c.layout == null) {
            c.layout = {
                styleIgnore: retFalse,
                styleItemIgnore: retFalse,
                postLayoutDom: null,
                layout: null
            };
        }
        return c.layout;
    }

    function setupLayout(n: IBobrilNode, c: IBobrilCacheNode, parentLayout: IBobrilLayout): IBobrilLayout {
        if (n === c) {
            if (parentLayout != null) {
                if (parentLayout.isItem(n.style)) {
                    var l = getOrInitLayoutInCacheNode(c);
                    l.styleItemIgnore = parentLayout.styleItemIgnore;
                    (<HTMLElement>c.element).style.position = "relative";
                }
            }
            if (!flexLayout.detectBigChange(n)) {
                var l = getOrInitLayoutInCacheNode(c);
                l.layout = flexLayout;
                l.styleIgnore = flexLayout.styleIgnore;
                flexLayout.initContainer(<HTMLElement>c.element, n.style);
                (<HTMLElement>c.element).style.position = "relative";
                if (parentLayout == null) {
                    l.postLayoutDom = flexLayout.postLayoutDom;
                }
                (<HTMLElement>c.element).style.display = n.style.display. "
                return flexLayout;
            }
        }
        if (c.layout != null) return c.layout.layout;
        return null;
    }

    b.setSetupLayout(setupLayout);
})(b);
