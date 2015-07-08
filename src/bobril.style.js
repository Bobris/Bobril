/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>
(function (b, document) {
    var allStyles = Object.create(null);
    var allSprites = Object.create(null);
    var allNameHints = Object.create(null);
    var rebuildStyles = false;
    var htmlStyle = null;
    var globalCounter = 0;
    var isIE9 = b.ieVersion() === 9;
    var chainedBeforeFrame = b.setBeforeFrame(beforeFrame);
    function buildCssSubRule(parent) {
        var posColon = parent.indexOf(':');
        if (posColon === -1)
            return allStyles[parent].name;
        return allStyles[parent.substring(0, posColon)].name + parent.substring(posColon);
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
                var style_1 = Object.create(null);
                var flattenPseudo = Object.create(null);
                flattenStyle(undefined, flattenPseudo, undefined, ss.pseudo);
                flattenStyle(style_1, flattenPseudo, ss.style, undefined);
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
                if (stack === null)
                    break;
                ca = stack.pop();
                i = stack.pop() + 1;
                continue;
            }
            var s = ca[i];
            if (typeof s === "boolean") {
            }
            else if (typeof s === "string") {
                var sd = allStyles[s];
                if (className == null)
                    className = sd.name;
                else
                    className = className + " " + sd.name;
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
        b.shimStyle(style);
        var processedPseudo = null;
        if (pseudo) {
            processedPseudo = Object.create(null);
            for (var key in pseudo) {
                if (!Object.prototype.hasOwnProperty.call(pseudo, key))
                    continue;
                processedPseudo[key] = pseudo[key];
            }
        }
        allStyles[nameHint] = { name: nameHint, parent: parent, style: style, expStyle: null, inlStyle: null, pseudo: processedPseudo };
        invalidateStyles();
        return nameHint;
    }
    function invalidateStyles() {
        rebuildStyles = true;
        b.invalidate();
    }
    function updateSprite(spDef) {
        var stDef = allStyles[spDef.styleid];
        var style = { backgroundImage: "url(" + spDef.url + ")", width: spDef.width, height: spDef.height };
        if (spDef.left || spDef.top) {
            style.backgroundPosition = -spDef.left + "px " + -spDef.top + "px";
        }
        stDef.style = style;
        invalidateStyles();
    }
    function sprite(url, color, width, height, left, top) {
        var key = url + ":" + (color || "") + ":" + (width || 0) + ":" + (height || 0) + ":" + (left || 0) + ":" + (top || 0);
        var spDef = allSprites[key];
        if (spDef)
            return spDef.styleid;
        var styleid = styleDef({ width: 0, height: 0 });
        spDef = { styleid: styleid, url: url, width: width, height: height, left: left || 0, top: top || 0 };
        if (width == null || height == null || color != null) {
            var image = new Image();
            image.addEventListener("load", function () {
                if (spDef.width == null)
                    spDef.width = image.width;
                if (spDef.height == null)
                    spDef.height = image.height;
                if (color != null) {
                    var canvas = document.createElement("canvas");
                    canvas.width = spDef.width;
                    canvas.height = spDef.height;
                    var ctx = canvas.getContext("2d");
                    ctx.drawImage(image, -spDef.left, -spDef.top);
                    var imgdata = ctx.getImageData(0, 0, spDef.width, spDef.height);
                    var imgd = imgdata.data;
                    var cred = parseInt(color.substr(1, 2), 16);
                    var cgreen = parseInt(color.substr(3, 2), 16);
                    var cblue = parseInt(color.substr(5, 2), 16);
                    for (var i = 0; i < imgd.length; i += 4) {
                        if (imgd[i] === 0x80 && imgd[i + 1] === 0x80 && imgd[i + 2] === 0x80) {
                            imgd[i] = cred;
                            imgd[i + 1] = cgreen;
                            imgd[i + 2] = cblue;
                        }
                    }
                    ctx.putImageData(imgdata, 0, 0);
                    spDef.url = canvas.toDataURL();
                    spDef.left = 0;
                    spDef.top = 0;
                }
                updateSprite(spDef);
            });
            image.src = url;
        }
        else {
            updateSprite(spDef);
        }
        allSprites[key] = spDef;
        return styleid;
    }
    function spriteb(width, height, left, top) {
        var url = "bundle.png";
        var key = url + "::" + width + ":" + height + ":" + left + ":" + top;
        var spDef = allSprites[key];
        if (spDef)
            return spDef.styleid;
        var styleid = styleDef({ width: 0, height: 0 });
        spDef = { styleid: styleid, url: url, width: width, height: height, left: left, top: top };
        updateSprite(spDef);
        allSprites[key] = spDef;
        return styleid;
    }
    b.style = style;
    b.styleDef = styleDef;
    b.styleDefEx = styleDefEx;
    b.sprite = sprite;
    b.spriteb = spriteb;
    b.invalidateStyles = invalidateStyles;
})(b, document);
