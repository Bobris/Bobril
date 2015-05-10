/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>
(function (b, document) {
    var allStyles = Object.create(null);
    var allSprites = Object.create(null);
    var allNameHints = Object.create(null);
    var rebuildStyles = false;
    var htmlStyle = null;
    var globalCounter = 0;
    var chainedBeforeFrame = b.setBeforeFrame(beforeFrame);
    function beforeFrame() {
        if (rebuildStyles) {
            var stylestr = "";
            for (var key in allStyles) {
                var ss = allStyles[key];
                if (ss.cssStyle.length > 0)
                    stylestr += "." + ss.name + " {" + ss.cssStyle + "}\n";
                var ssp = ss.pseudo;
                if (ssp)
                    for (var key2 in ssp) {
                        stylestr += "." + ss.name + ":" + key2 + " {" + ssp[key2] + "}\n";
                    }
            }
            var styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            if (styleElement.styleSheet) {
                styleElement.styleSheet.cssText = style;
            }
            else {
                styleElement.appendChild(document.createTextNode(stylestr));
            }
            var head = document.head || document.getElementsByTagName('head')[0];
            if (htmlStyle != null) {
                head.replaceChild(styleElement, htmlStyle);
            }
            else {
                head.appendChild(styleElement);
            }
            htmlStyle = styleElement;
            rebuildStyles = false;
        }
        chainedBeforeFrame();
    }
    function apply(s, className, inlineStyle) {
        if (typeof s === "string") {
            var sd = allStyles[s];
            if (inlineStyle != null) {
                inlineStyle = b.assign(inlineStyle, sd.fullInlStyle);
            }
            else {
                if (className == null)
                    className = sd.name;
                else
                    className = className + " " + sd.name;
                var inls = sd.inlStyle;
                if (inls) {
                    if (inlineStyle == null)
                        inlineStyle = inls;
                    else
                        inlineStyle = b.assign(inlineStyle, inls);
                }
            }
        }
        else if (Array.isArray(s)) {
            for (var i = 0; i < s.length; i++) {
                _a = apply(s[i], className, inlineStyle), className = _a[0], inlineStyle = _a[1];
            }
        }
        else {
            if (inlineStyle == null)
                inlineStyle = s;
            else
                inlineStyle = b.assign(inlineStyle, s);
        }
        return [className, inlineStyle];
        var _a;
    }
    function style(node) {
        var styles = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            styles[_i - 1] = arguments[_i];
        }
        var className = node.className;
        var inlineStyle = node.style;
        for (var i = 0; i < styles.length; i++) {
            _a = apply(styles[i], className, inlineStyle), className = _a[0], inlineStyle = _a[1];
        }
        node.className = className;
        node.style = inlineStyle;
        return node;
        var _a;
    }
    var uppercasePattern = /([A-Z])/g;
    var msPattern = /^ms-/;
    function hyphenateStyle(s) {
        return s.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
    }
    function inlineStyleToCssDeclaration(style) {
        var res = "";
        for (var key in style) {
            res += hyphenateStyle(key) + ":" + style[key] + ";";
        }
        return res;
    }
    function styleDef(style, pseudo, nameHint) {
        if (nameHint) {
            if (allNameHints[nameHint]) {
                var counter = 1;
                while (allNameHints[nameHint + counter])
                    counter++;
            }
            allNameHints[nameHint] = true;
        }
        else {
            nameHint = "b-" + globalCounter++;
        }
        b.shimStyle(style);
        allStyles[nameHint] = { name: nameHint, fullInlStyle: style, inlStyle: null, cssStyle: inlineStyleToCssDeclaration(style), pseudo: null };
        rebuildStyles = true;
        b.invalidate();
        return nameHint;
    }
    function sprite(url, width, height, left, top) {
        // TODO
        return url;
    }
    b.style = style;
    b.styleDef = styleDef;
    b.sprite = sprite;
})(b, document);
