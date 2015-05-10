/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>

interface ISprite {
    styleid: string;
    url: string;
    width: number;
    height: number;
    image: HTMLImageElement;
}

interface IInternalStyle {
    name: string;
    cssStyle: string;
    fullInlStyle: any;
    inlStyle?: any;
    pseudo?: { [name: string]: string };
}

((b: IBobrilStatic, document: Document) => {
    var allStyles: { [id: string]: IInternalStyle } = Object.create(null);
    var allSprites: { [key: string]: ISprite } = Object.create(null);
    var allNameHints: { [name: string]: boolean } = Object.create(null);

    var rebuildStyles = false;
    var htmlStyle: HTMLStyleElement = null;
    var globalCounter: number = 0;

    var chainedBeforeFrame = b.setBeforeFrame(beforeFrame);

    function beforeFrame() {
        if (rebuildStyles) {
            var stylestr = "";
            for (var key in allStyles) {
                var ss = allStyles[key];
                if (ss.cssStyle.length > 0)
                    stylestr += "." + ss.name + " {" + ss.cssStyle + "}\n";
                var ssp = ss.pseudo;
                if (ssp) for (var key2 in ssp) {
                    stylestr += "." + ss.name + ":" + key2 + " {" + ssp[key2] + "}\n";
                }
            }
            var styleElement = document.createElement('style');
            styleElement.type = 'text/css';
            if ((<any>styleElement).styleSheet) {
                (<any>styleElement).styleSheet.cssText = style;
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

    function apply(s: IBobrilStyles, className: string, inlineStyle: any): [string, any] {
        if (typeof s === "string") {
            var sd = allStyles[s];
            if (inlineStyle != null) {
                inlineStyle = b.assign(inlineStyle, sd.fullInlStyle);
            } else {
                if (className == null) className = sd.name; else className = className + " " + sd.name;
                var inls = sd.inlStyle;
                if (inls) {
                    if (inlineStyle == null) inlineStyle = inls;
                    else inlineStyle = b.assign(inlineStyle, inls);
                }
            }
        } else if (Array.isArray(s)) {
            for (var i = 0; i < (<IBobrilStyle[]>s).length; i++) {
                [className, inlineStyle] = apply((<IBobrilStyle[]>s)[i], className, inlineStyle);
            }
        } else {
            if (inlineStyle == null) inlineStyle = s;
            else inlineStyle = b.assign(inlineStyle, s);
        }
        return [className, inlineStyle];
    }

    function style(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode {
        var className = node.className;
        var inlineStyle = node.style;
        for (var i = 0; i < styles.length; i++) {
            [className, inlineStyle] = apply(styles[i], className, inlineStyle);
        }
        node.className = className;
        node.style = inlineStyle;
        return node;
    }

    var uppercasePattern = /([A-Z])/g;
    var msPattern = /^ms-/;

    function hyphenateStyle(s:string):string {
      return s.replace(uppercasePattern, '-$1').toLowerCase().replace(msPattern, '-ms-');
    }

    function inlineStyleToCssDeclaration(style: any): string {
        var res="";
        for(var key in style) {
            res+=hyphenateStyle(key)+":"+style[key]+";";
        }
        return res;
    }

    function styleDef(style: any, pseudo?: { [name: string]: any }, nameHint?: string): IBobrilStyleDef {
        if (nameHint) {
            if (allNameHints[nameHint]) {
                var counter = 1;
                while (allNameHints[nameHint + counter]) counter++;
            }
            allNameHints[nameHint] = true;
        } else {
            nameHint = "b-" + globalCounter++;
        }
        b.shimStyle(style);
        allStyles[nameHint] = { name: nameHint, fullInlStyle: style, inlStyle: null, cssStyle: inlineStyleToCssDeclaration(style), pseudo: null };
        rebuildStyles = true;
        b.invalidate();
        return nameHint;
    }

    function sprite(url: string, width?: number, height?: number, left?: number, top?: number): IBobrilStyleDef {
        // TODO
        return url;
    }

    b.style = style;
    b.styleDef = styleDef;
    b.sprite = sprite;
})(b, document);
