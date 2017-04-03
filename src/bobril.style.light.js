/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>
(function (b, document) {
    var allStyles = Object.create(null);
    var allNameHints = Object.create(null);
    var imageCache = Object.create(null);
    var rebuildStyles = false;
    var htmlStyle = null;
    var globalCounter = 0;
    var isIE9 = b.ieVersion() === 9;
    var chainedBeforeFrame = b.setBeforeFrame(beforeFrame);
    var cssSubRuleDelimiter = /\:|\ |\>/;
    function buildCssSubRule(parent) {
        var matchSplit = cssSubRuleDelimiter.exec(parent);
        if (!matchSplit)
            return allStyles[parent].name;
        var posSplit = matchSplit.index;
        return allStyles[parent.substring(0, posSplit)].name + parent.substring(posSplit);
    }
    function buildCssRule(parent, name) {
        var result = "";
        if (parent) {
            if (b.isArray(parent)) {
                for (var i = 0; i < parent.length; i++) {
                    if (i > 0) {
                        result += ",";
                    }
                    result += "." + buildCssSubRule(parent[i]) + "." + name;
                }
            }
            else {
                result = "." + buildCssSubRule(parent) + "." + name;
            }
        }
        else {
            result = "." + name;
        }
        return result;
    }
    function flattenStyle(cur, curPseudo, style, stylePseudo) {
        if (typeof style === "string") {
            var externalStyle = allStyles[style];
            if (externalStyle === undefined) {
                throw new Error("uknown style " + style);
            }
            flattenStyle(cur, curPseudo, externalStyle.style, externalStyle.pseudo);
        }
        else if (typeof style === "function") {
            style(cur, curPseudo);
        }
        else if (b.isArray(style)) {
            for (var i = 0; i < style.length; i++) {
                flattenStyle(cur, curPseudo, style[i], undefined);
            }
        }
        else if (typeof style === "object") {
            for (var key in style) {
                if (!Object.prototype.hasOwnProperty.call(style, key))
                    continue;
                var val = style[key];
                if (typeof val === "function") {
                    val = val(cur, key);
                }
                cur[key] = val;
            }
        }
        if (stylePseudo != null && curPseudo != null) {
            for (var pseudoKey in stylePseudo) {
                var curPseudoVal = curPseudo[pseudoKey];
                if (curPseudoVal === undefined) {
                    curPseudoVal = Object.create(null);
                    curPseudo[pseudoKey] = curPseudoVal;
                }
                flattenStyle(curPseudoVal, undefined, stylePseudo[pseudoKey], undefined);
            }
        }
    }
    function beforeFrame() {
        if (rebuildStyles) {
            var stylestr = "";
            for (var key in allStyles) {
                var ss = allStyles[key];
                var parent_1 = ss.parent;
                var name_1 = ss.name;
                var sspseudo = ss.pseudo;
                var ssstyle = ss.style;
                if (typeof ssstyle === "function" && ssstyle.length === 0) {
                    _a = ssstyle(), ssstyle = _a[0], sspseudo = _a[1];
                }
                if (typeof ssstyle === "string" && sspseudo == null) {
                    ss.realname = ssstyle;
                    continue;
                }
                ss.realname = name_1;
                var style_1 = Object.create(null);
                var flattenPseudo = Object.create(null);
                flattenStyle(undefined, flattenPseudo, undefined, sspseudo);
                flattenStyle(style_1, flattenPseudo, ssstyle, undefined);
                var extractedInlStyle = null;
                if (style_1["pointerEvents"]) {
                    extractedInlStyle = Object.create(null);
                    extractedInlStyle["pointerEvents"] = style_1["pointerEvents"];
                }
                if (isIE9) {
                    if (style_1["userSelect"]) {
                        if (extractedInlStyle == null)
                            extractedInlStyle = Object.create(null);
                        extractedInlStyle["userSelect"] = style_1["userSelect"];
                        delete style_1["userSelect"];
                    }
                }
                ss.inlStyle = extractedInlStyle;
                b.shimStyle(style_1);
                var cssStyle = inlineStyleToCssDeclaration(style_1);
                if (cssStyle.length > 0)
                    stylestr += buildCssRule(parent_1, name_1) + " {" + cssStyle + "}\n";
                for (var key2 in flattenPseudo) {
                    var sspi = flattenPseudo[key2];
                    b.shimStyle(sspi);
                    stylestr += buildCssRule(parent_1, name_1 + ":" + key2) + " {" + inlineStyleToCssDeclaration(sspi) + "}\n";
                }
            }
            var styleElement = document.createElement("style");
            styleElement.type = 'text/css';
            if (styleElement.styleSheet) {
                styleElement.styleSheet.cssText = stylestr;
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
        var _a;
    }
    function style(node) {
        var styles = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            styles[_i - 1] = arguments[_i];
        }
        var className = node.className;
        var inlineStyle = node.style;
        var stack = null;
        var i = 0;
        var ca = styles;
        while (true) {
            if (ca.length === i) {
                if (stack === null || stack.length === 0)
                    break;
                ca = stack.pop();
                i = stack.pop() + 1;
                continue;
            }
            var s = ca[i];
            if (s == null || typeof s === "boolean" || s === '') {
                // skip
            }
            else if (typeof s === "string") {
                var sd = allStyles[s];
                if (className == null)
                    className = sd.realname;
                else
                    className = className + " " + sd.realname;
                var inls = sd.inlStyle;
                if (inls) {
                    inlineStyle = b.assign(inlineStyle, inls);
                }
            }
            else if (b.isArray(s)) {
                if (ca.length > i + 1) {
                    if (stack == null)
                        stack = [];
                    stack.push(i);
                    stack.push(ca);
                }
                ca = s;
                i = 0;
                continue;
            }
            else {
                inlineStyle = b.assign(inlineStyle, s);
            }
            i++;
        }
        node.className = className;
        node.style = inlineStyle;
        return node;
    }
    var uppercasePattern = /([A-Z])/g;
    var msPattern = /^ms-/;
    function hyphenateStyle(s) {
        if (s === "cssFloat")
            return "float";
        return s.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
    }
    function inlineStyleToCssDeclaration(style) {
        var res = "";
        for (var key in style) {
            var v = style[key];
            if (v === undefined)
                continue;
            res += hyphenateStyle(key) + ":" + (v === "" ? '""' : v) + ";";
        }
        res = res.slice(0, -1);
        return res;
    }
    function styleDef(style, pseudo, nameHint) {
        return styleDefEx(null, style, pseudo, nameHint);
    }
    function styleDefEx(parent, style, pseudo, nameHint) {
        if (nameHint && nameHint !== "b-") {
            if (allNameHints[nameHint]) {
                var counter = 1;
                while (allNameHints[nameHint + counter])
                    counter++;
                nameHint = nameHint + counter;
            }
            allNameHints[nameHint] = true;
        }
        else {
            nameHint = "b-" + globalCounter++;
        }
        allStyles[nameHint] = { name: nameHint, realname: nameHint, parent: parent, style: style, inlStyle: null, pseudo: pseudo };
        invalidateStyles();
        return nameHint;
    }
    function invalidateStyles() {
        rebuildStyles = true;
        b.invalidate();
    }
    function emptyStyleDef(url) {
        return styleDef({ width: 0, height: 0 }, null, url.replace(/[^a-z0-9_-]/gi, '_'));
    }
    b.style = style;
    b.styleDef = styleDef;
    b.styleDefEx = styleDefEx;
    b.invalidateStyles = invalidateStyles;
})(b, document);
