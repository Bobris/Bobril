/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>
(function (b, window, document) {
    var allStyles = Object.create(null);
    var allSprites = Object.create(null);
    var allNameHints = Object.create(null);
    var dynamicSprites = [];
    var imageCache = Object.create(null);
    var injectedCss = "";
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
            for (var i = 0; i < dynamicSprites.length; i++) {
                var dynSprite = dynamicSprites[i];
                var image = imageCache[dynSprite.url];
                if (image == null)
                    continue;
                var colorStr = dynSprite.color();
                if (colorStr !== dynSprite.lastColor) {
                    dynSprite.lastColor = colorStr;
                    if (dynSprite.width == null)
                        dynSprite.width = image.width;
                    if (dynSprite.height == null)
                        dynSprite.height = image.height;
                    var lastUrl = recolorAndClip(image, colorStr, dynSprite.width, dynSprite.height, dynSprite.left, dynSprite.top);
                    var stDef = allStyles[dynSprite.styleid];
                    stDef.style = {
                        backgroundImage: "url(" + lastUrl + ")",
                        width: dynSprite.width,
                        height: dynSprite.height
                    };
                }
            }
            var stylestr = injectedCss;
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
                    stylestr +=
                        buildCssRule(parent_1, name_1 + ":" + key2) + " {" + inlineStyleToCssDeclaration(sspi) + "}\n";
                }
            }
            var styleElement = document.createElement("style");
            styleElement.type = "text/css";
            if (styleElement.styleSheet) {
                styleElement.styleSheet.cssText = stylestr;
            }
            else {
                styleElement.appendChild(document.createTextNode(stylestr));
            }
            var head = document.head || document.getElementsByTagName("head")[0];
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
            if (s == null || typeof s === "boolean" || s === "") {
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
                    if (inlineStyle == null)
                        inlineStyle = {};
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
                if (inlineStyle == null)
                    inlineStyle = {};
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
        return s
            .replace(uppercasePattern, "-$1")
            .toLowerCase()
            .replace(msPattern, "-ms-");
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
    function updateStyleDef(what, style, pseudo) {
        return updateStyleDefEx(what, null, style, pseudo);
    }
    function objectsEqual(obj1, obj2) {
        if (obj1 === obj2)
            return true;
        if (typeof obj1 !== typeof obj2) {
            return false;
        }
        for (var p in obj1) {
            if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) {
                return false;
            }
            var v1 = obj1[p];
            var v2 = obj2[p];
            if (typeof v1 !== typeof v2) {
                return false;
            }
            if (DEBUG && typeof v1 === "function")
                throw new Error("not supported");
            if (!objectsEqual(v1, v2)) {
                return false;
            }
        }
        for (var p in obj2) {
            if (!obj2.hasOwnProperty(p)) {
                continue;
            }
            if (!obj1.hasOwnProperty(p)) {
                return false;
            }
        }
        return true;
    }
    function updateStyleDefEx(what, parent, style, pseudo) {
        var originalStyle = allStyles[what];
        if (originalStyle === undefined) {
            throw new Error("Unknown style " + what);
        }
        if (objectsEqual(originalStyle.parent, parent) &&
            objectsEqual(originalStyle.style, style) &&
            objectsEqual(originalStyle.pseudo, pseudo)) {
            return;
        }
        allStyles[what] = { name: what, realname: what, parent: parent, style: style, inlStyle: null, pseudo: pseudo };
        invalidateStyles();
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
    function emptyStyleDef(url) {
        return styleDef({ width: 0, height: 0 }, null, url.replace(/[^a-z0-9_-]/gi, "_"));
    }
    var rgbaRegex = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;
    function recolorAndClip(image, colorStr, width, height, left, top) {
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var ctx = canvas.getContext("2d");
        ctx.drawImage(image, -left, -top);
        var imgdata = ctx.getImageData(0, 0, width, height);
        var imgd = imgdata.data;
        var rgba = rgbaRegex.exec(colorStr);
        var cred, cgreen, cblue, calpha;
        if (rgba) {
            cred = parseInt(rgba[1], 10);
            cgreen = parseInt(rgba[2], 10);
            cblue = parseInt(rgba[3], 10);
            calpha = Math.round(parseFloat(rgba[4]) * 255);
        }
        else {
            cred = parseInt(colorStr.substr(1, 2), 16);
            cgreen = parseInt(colorStr.substr(3, 2), 16);
            cblue = parseInt(colorStr.substr(5, 2), 16);
            calpha = parseInt(colorStr.substr(7, 2), 16) || 0xff;
        }
        if (calpha === 0xff) {
            for (var i = 0; i < imgd.length; i += 4) {
                // Horrible workaround for imprecisions due to browsers using premultiplied alpha internally for canvas
                var red = imgd[i];
                if (red === imgd[i + 1] &&
                    red === imgd[i + 2] &&
                    (red === 0x80 || (imgd[i + 3] < 0xff && red > 0x70))) {
                    imgd[i] = cred;
                    imgd[i + 1] = cgreen;
                    imgd[i + 2] = cblue;
                }
            }
        }
        else {
            for (var i = 0; i < imgd.length; i += 4) {
                var red = imgd[i];
                var alpha = imgd[i + 3];
                if (red === imgd[i + 1] && red === imgd[i + 2] && (red === 0x80 || (alpha < 0xff && red > 0x70))) {
                    if (alpha === 0xff) {
                        imgd[i] = cred;
                        imgd[i + 1] = cgreen;
                        imgd[i + 2] = cblue;
                        imgd[i + 3] = calpha;
                    }
                    else {
                        alpha = alpha * (1.0 / 255);
                        imgd[i] = Math.round(cred * alpha);
                        imgd[i + 1] = Math.round(cgreen * alpha);
                        imgd[i + 2] = Math.round(cblue * alpha);
                        imgd[i + 3] = Math.round(calpha * alpha);
                    }
                }
            }
        }
        ctx.putImageData(imgdata, 0, 0);
        return canvas.toDataURL();
    }
    function sprite(url, color, width, height, left, top) {
        left = left || 0;
        top = top || 0;
        if (typeof color === "function") {
            var styleid = emptyStyleDef(url);
            dynamicSprites.push({
                styleid: styleid,
                color: color,
                url: url,
                width: width,
                height: height,
                left: left,
                top: top,
                lastColor: "",
                lastUrl: ""
            });
            if (imageCache[url] === undefined) {
                imageCache[url] = null;
                var image = new Image();
                image.addEventListener("load", function () {
                    imageCache[url] = image;
                    invalidateStyles();
                });
                image.src = url;
            }
            return styleid;
        }
        var key = url + ":" + (color || "") + ":" + (width || 0) + ":" + (height || 0) + ":" + left + ":" + top;
        var spDef = allSprites[key];
        if (spDef)
            return spDef.styleid;
        var styleid = emptyStyleDef(url);
        spDef = { styleid: styleid, url: url, width: width, height: height, left: left, top: top };
        if (width == null || height == null || color != null) {
            var image = new Image();
            image.addEventListener("load", function () {
                if (spDef.width == null)
                    spDef.width = image.width;
                if (spDef.height == null)
                    spDef.height = image.height;
                if (color != null) {
                    spDef.url = recolorAndClip(image, color, spDef.width, spDef.height, spDef.left, spDef.top);
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
    var bundlePath = window["bobrilBPath"] || "bundle.png";
    function setBundlePngPath(path) {
        bundlePath = path;
    }
    function spriteb(width, height, left, top) {
        var url = bundlePath;
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
    function spritebc(color, width, height, left, top) {
        return sprite(bundlePath, color, width, height, left, top);
    }
    function injectCss(css) {
        injectedCss += css;
        invalidateStyles();
    }
    b.style = style;
    b.styleDef = styleDef;
    b.styleDefEx = styleDefEx;
    b.updateStyleDef = updateStyleDef;
    b.updateStyleDefEx = updateStyleDefEx;
    b.sprite = sprite;
    b.spriteb = spriteb;
    b.spritebc = spritebc;
    b.invalidateStyles = invalidateStyles;
    b.setBundlePngPath = setBundlePngPath;
    b.injectCss = injectCss;
})(b, window, document);
