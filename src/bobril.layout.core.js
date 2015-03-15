/// <reference path="bobril.d.ts"/>
(function (b) {
    var flexLayout = {
        detectBigChange: function (n) {
            if (n.style == null)
                return true;
            var d = n.style.display;
            return (d !== "b-flex") || (d !== "b-inline-flex");
        },
        isItem: function (style) {
            if (style == null)
                return true;
            if (/^absolute$|^fixed$/.test(style.position))
                return false;
            if (style.display === "none")
                return false;
            return true;
        },
        styleItemIgnore: function (name) {
            return /^(position|left|top|right|bottom|width|height|flexGrow|flexShrink|flexBasis|alignSelf|flex)?$/.test(name);
        },
        styleIgnore: function (name) {
            return /^(display|flexDirection|flexWrap|justifyContent|alignItems|alignContent)?$/.test(name);
        },
        postLayoutDom: function (me, element) {
            me.layout;
        }
    };
    function retFalse() {
        return false;
    }
    function getOrInitLayoutInCacheNode(c) {
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
    function setupLayout(n, c, parentLayout) {
        if (n === c) {
            if (parentLayout != null) {
                if (parentLayout.isItem(n.style)) {
                    var l = getOrInitLayoutInCacheNode(c);
                    l.styleItemIgnore = parentLayout.styleItemIgnore;
                    c.element.style.position = "absolute";
                }
            }
            if (!flexLayout.detectBigChange(n)) {
                var l = getOrInitLayoutInCacheNode(c);
                l.layout = flexLayout;
                l.styleIgnore = flexLayout.styleIgnore;
                if (parentLayout == null) {
                    c.element.style.position = "relative";
                    l.postLayoutDom = flexLayout.postLayoutDom;
                }
                else {
                    c.element.style.position = "absolute";
                }
                return flexLayout;
            }
        }
        if (c.layout != null)
            return c.layout.layout;
        return null;
    }
    b.setSetupLayout(setupLayout);
})(b);
//# sourceMappingURL=bobril.layout.core.js.map