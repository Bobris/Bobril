/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>

interface IInternalStyle {
    name: string;
    realname: string;
    parent?: IBobrilStyleDef | IBobrilStyleDef[];
    style: any;
    inlStyle?: any;
    pseudo?: { [name: string]: string };
}

((b: IBobrilStatic, document: Document) => {
    var allStyles: { [id: string]: IInternalStyle } = Object.create(null);
    var allNameHints: { [name: string]: boolean } = Object.create(null);
    var imageCache: { [url: string]: HTMLImageElement } = Object.create(null);
    var rebuildStyles = false;
    var htmlStyle: HTMLStyleElement = null;
    var globalCounter: number = 0;
    const isIE9 = b.ieVersion() === 9;

    var chainedBeforeFrame = b.setBeforeFrame(beforeFrame);

    const cssSubRuleDelimiter = /\:|\ |\>/;

    function buildCssSubRule(parent: string): string {
        let matchSplit = cssSubRuleDelimiter.exec(parent);
        if (!matchSplit) return allStyles[parent].name;
        let posSplit = matchSplit.index;
        return allStyles[parent.substring(0, posSplit)].name + parent.substring(posSplit);
    }

    function buildCssRule(parent: string | string[], name: string): string {
        let result = "";
        if (parent) {
            if (b.isArray(parent)) {
                for (let i = 0; i < parent.length; i++) {
                    if (i > 0) {
                        result += ",";
                    }
                    result += "." + buildCssSubRule(parent[i]) + "." + name;
                }
            } else {
                result = "." + buildCssSubRule(<string>parent) + "." + name;
            }
        } else {
            result = "." + name;
        }
        return result;
    }

    function flattenStyle(cur: any, curPseudo: any, style: any, stylePseudo: any): void {
        if (typeof style === "string") {
            let externalStyle = allStyles[style];
            if (externalStyle === undefined) {
                throw new Error("uknown style " + style);
            }
            flattenStyle(cur, curPseudo, externalStyle.style, externalStyle.pseudo);
        } else if (typeof style === "function") {
            style(cur, curPseudo);
        } else if (b.isArray(style)) {
            for (let i = 0; i < style.length; i++) {
                flattenStyle(cur, curPseudo, style[i], undefined);
            }
        } else if (typeof style === "object") {
            for (let key in style) {
                if (!Object.prototype.hasOwnProperty.call(style, key)) continue;
                let val = style[key];
                if (typeof val === "function") {
                    val = val(cur, key);
                }
                cur[key] = val;
            }
        }
        if (stylePseudo != null && curPseudo != null) {
            for (let pseudoKey in stylePseudo) {
                let curPseudoVal = curPseudo[pseudoKey];
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
                let parent = ss.parent;
                let name = ss.name;
                let sspseudo = ss.pseudo;
                let ssstyle = ss.style;
                if (typeof ssstyle==="function" && ssstyle.length===0) {
                    [ssstyle, sspseudo] = ssstyle();
                }
                if (typeof ssstyle==="string" && sspseudo==null) {
                    ss.realname = ssstyle;
                    continue;
                }
                ss.realname = name;
                let style = Object.create(null);
                let flattenPseudo = Object.create(null);
                flattenStyle(undefined, flattenPseudo, undefined, sspseudo);
                flattenStyle(style, flattenPseudo, ssstyle, undefined);
                var extractedInlStyle: any = null;
                if (style["pointerEvents"]) {
                    extractedInlStyle = Object.create(null);
                    extractedInlStyle["pointerEvents"] = style["pointerEvents"];
                }
                if (isIE9) {
                    if (style["userSelect"]) {
                        if (extractedInlStyle == null)
                            extractedInlStyle = Object.create(null);
                        extractedInlStyle["userSelect"] = style["userSelect"];
                        delete style["userSelect"];
                    }
                }
                ss.inlStyle = extractedInlStyle;
                b.shimStyle(style);
                let cssStyle = inlineStyleToCssDeclaration(style);
                if (cssStyle.length > 0)
                    stylestr += buildCssRule(parent, name) + " {" + cssStyle + "}\n";
                for (var key2 in flattenPseudo) {
                    let sspi = flattenPseudo[key2];
                    b.shimStyle(sspi);
                    stylestr += buildCssRule(parent, name + ":" + key2) + " {" + inlineStyleToCssDeclaration(sspi) + "}\n";
                }
            }
            var styleElement = document.createElement("style");
            styleElement.type = 'text/css';
            if ((<any>styleElement).styleSheet) {
                (<any>styleElement).styleSheet.cssText = stylestr;
            } else {
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

    function style(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode {
        let className = node.className;
        let inlineStyle = node.style;
        let stack = <(IBobrilStyles | number)[]>null;
        let i = 0;
        let ca = styles;
        while (true) {
            if (ca.length === i) {
                if (stack === null || stack.length === 0) break;
                ca = <IBobrilStyles[]>stack.pop();
                i = <number>stack.pop() + 1;
                continue;
            }
            let s = ca[i];
            if (s == null || typeof s === "boolean" || s === '') {
                // skip
            } else if (typeof s === "string") {
                var sd = allStyles[s];
                if (className == null) className = sd.realname; else className = className + " " + sd.realname;
                var inls = sd.inlStyle;
                if (inls) {
                    inlineStyle = b.assign(inlineStyle, inls);
                }
            } else if (b.isArray(s)) {
                if (ca.length > i + 1) {
                    if (stack == null) stack = [];
                    stack.push(i); stack.push(ca);
                }
                ca = <IBobrilStyles[]>s; i = 0;
                continue;
            } else {
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

    function hyphenateStyle(s: string): string {
        if (s === "cssFloat") return "float";
        return s.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
    }

    function inlineStyleToCssDeclaration(style: any): string {
        var res = "";
        for (var key in style) {
            var v = style[key];
            if (v === undefined) continue;
            res += hyphenateStyle(key) + ":" + (v === "" ? '""' : v) + ";";
        }
        res = res.slice(0, -1);
        return res;
    }

    function styleDef(style: any, pseudo?: { [name: string]: any }, nameHint?: string): IBobrilStyleDef {
        return styleDefEx(null, style, pseudo, nameHint);
    }

    function styleDefEx(parent: IBobrilStyleDef | IBobrilStyleDef[], style: any, pseudo?: { [name: string]: any }, nameHint?: string): IBobrilStyleDef {
        if (nameHint && nameHint !== "b-") {
            if (allNameHints[nameHint]) {
                var counter = 1;
                while (allNameHints[nameHint + counter]) counter++;
                nameHint = nameHint + counter;
            }
            allNameHints[nameHint] = true;
        } else {
            nameHint = "b-" + globalCounter++;
        }
        allStyles[nameHint] = { name: nameHint, realname: nameHint, parent, style, inlStyle: null, pseudo };
        invalidateStyles();
        return nameHint;
    }

    function invalidateStyles(): void {
        rebuildStyles = true;
        b.invalidate();
    }

    function emptyStyleDef(url: string): IBobrilStyleDef {
        return styleDef({ width: 0, height: 0 }, null, url.replace(/[^a-z0-9_-]/gi, '_'));
    }

    b.style = style;
    b.styleDef = styleDef;
    b.styleDefEx = styleDefEx;
    b.invalidateStyles = invalidateStyles;
})(b, document);
