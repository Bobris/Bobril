import { CSSStyles, CSSPseudoStyles, CSSStylesItem, CSSInlineStyles } from "./cssTypes";
import {
    applyDynamicStyle,
    ColorlessSprite,
    destroyDynamicStyle,
    IBobrilCacheChildren,
    IBobrilCacheNode,
    IBobrilCacheNodeUnsafe,
    IBobrilChildren,
    IBobrilNode,
    IBobrilStyleDef,
    IBobrilStyles,
    internalSetCssInJsCallbacks,
    invalidate,
} from "./core";
import { assert, createTextNode, hOP, newHashObj, noop } from "./localHelpers";
import { isArray, isFunction, isNumber, isObject, isString } from "./isFunc";
import { setAfterFrame } from "./frameCallbacks";
import { getMedia } from "./media";

declare var DEBUG: boolean;

const vendors = ["Webkit", "Moz", "O"];
const testingDivStyle: any = document.createElement("div").style;
function testPropExistence(name: string) {
    return isString(testingDivStyle[name]);
}

export type IBobrilShimStyleMapping = Map<string, (style: any, value: any, oldName: string) => void>;

var mapping: IBobrilShimStyleMapping = new Map();

var isUnitlessNumber: ReadonlySet<string> = new Set(
    "boxFlex boxFlexGroup columnCount flex flexGrow flexNegative flexPositive flexShrink fontWeight lineClamp lineHeight opacity order orphans strokeDashoffset widows zIndex zoom".split(
        " "
    )
);

function renamer(newName: string) {
    return (style: any, value: any, oldName: string) => {
        style[newName] = value;
        style[oldName] = undefined;
    };
}

function renamerPx(newName: string) {
    return (style: any, value: any, oldName: string) => {
        if (isNumber(value)) {
            style[newName] = value + "px";
        } else {
            style[newName] = value;
        }
        style[oldName] = undefined;
    };
}

function pxAdder(style: any, value: any, name: string) {
    if (isNumber(value)) style[name] = value + "px";
}

function shimStyle(newValue: any) {
    var k = Object.keys(newValue);
    for (var i = 0, l = k.length; i < l; i++) {
        var ki = k[i]!;
        var mi = mapping.get(ki);
        var vi = newValue[ki];
        if (vi === undefined) continue; // don't want to map undefined
        if (mi === undefined) {
            if (DEBUG) {
                if (/-/.test(ki))
                    console.warn("Style property " + ki + " contains dash (must use JS props instead of css names)");
            }
            if (testPropExistence(ki)) {
                mi = isUnitlessNumber.has(ki) ? noop : pxAdder;
            } else {
                var titleCaseKi = ki.replace(/^\w/, (match) => match.toUpperCase());
                for (var j = 0; j < vendors.length; j++) {
                    if (testPropExistence(vendors[j] + titleCaseKi)) {
                        mi = (isUnitlessNumber.has(ki) ? renamer : renamerPx)(vendors[j] + titleCaseKi);
                        break;
                    }
                }
                if (mi === undefined) {
                    mi = isUnitlessNumber.has(ki) ? noop : pxAdder;
                    if (
                        DEBUG &&
                        ["overflowScrolling", "touchCallout"].indexOf(ki) < 0 // whitelist rare but useful
                    )
                        console.warn("Style property " + ki + " is not supported in this browser");
                }
            }
            mapping.set(ki, mi);
        }
        mi(newValue, vi, ki);
    }
}

function removeStyleProperty(s: CSSStyleDeclaration, name: string) {
    s.removeProperty(hyphenateStyle(name));
}

function setStyleProperty(s: CSSStyleDeclaration, name: string, value: string) {
    let len = value.length;
    if (len > 11 && value.substr(len - 11, 11) === " !important") {
        s.setProperty(hyphenateStyle(name), value.substr(0, len - 11), "important");
        return;
    }
    s.setProperty(hyphenateStyle(name), value);
}

function setClassName(el: Element, className: string, inSvg: boolean) {
    if (inSvg) el.setAttribute("class", className);
    else (<HTMLElement>el).className = className;
}

export function updateElementStyle(
    el: HTMLElement,
    newStyle: Record<string, string | number | undefined> | undefined,
    oldStyle: Record<string, string | undefined> | undefined
) {
    var s = el.style;
    if (newStyle !== undefined) {
        shimStyle(newStyle);
        var rule: string;
        if (oldStyle !== undefined) {
            for (rule in oldStyle) {
                if (oldStyle[rule] === undefined) continue;
                if (newStyle[rule] === undefined) removeStyleProperty(s, rule);
            }
            for (rule in newStyle) {
                var v = newStyle[rule];
                if (v !== undefined && oldStyle[rule] !== v) setStyleProperty(s, rule, v as string);
            }
        } else {
            for (rule in newStyle) {
                var v = newStyle[rule];
                if (v !== undefined) setStyleProperty(s, rule, v as string);
            }
        }
    } else {
        if (oldStyle !== undefined) {
            for (rule in oldStyle) {
                removeStyleProperty(s, rule);
            }
        }
    }
}

function createNodeStyle(
    el: HTMLElement,
    newStyle: Record<string, string | number | undefined> | (() => IBobrilStyles) | undefined,
    newClass: string | undefined,
    c: IBobrilCacheNode,
    inSvg: boolean
) {
    if (isFunction(newStyle)) {
        assert(newClass === undefined);
        var appliedStyle = applyDynamicStyle(newStyle, c);
        newStyle = appliedStyle.style as Record<string, string | number | undefined> | undefined;
        newClass = appliedStyle.className;
    }
    if (newStyle) updateElementStyle(el, newStyle, undefined);
    if (newClass) setClassName(el, newClass, inSvg);
}

function updateNodeStyle(
    el: HTMLElement,
    newStyle: Record<string, string | number | undefined> | (() => IBobrilStyles) | undefined,
    newClass: string | undefined,
    c: IBobrilCacheNode,
    inSvg: boolean
) {
    if (isFunction(newStyle)) {
        assert(newClass === undefined);
        var appliedStyle = applyDynamicStyle(newStyle, c);
        newStyle = appliedStyle.style as Record<string, string | number | undefined> | undefined;
        newClass = appliedStyle.className;
    } else {
        destroyDynamicStyle(c);
    }
    updateElementStyle(el, newStyle, c.style);
    (c as IBobrilCacheNodeUnsafe).style = newStyle as Record<string, string | undefined>;
    if (newClass !== c.className) {
        setClassName(el, newClass || "", inSvg);
        (c as IBobrilCacheNodeUnsafe).className = newClass;
    }
}

interface ISprite {
    styleId: IBobrilStyleDef;
    url: string;
    width: number | undefined;
    height: number | undefined;
    left: number;
    top: number;
}

interface ISvgSprite {
    styleId: IBobrilStyleDef;
    svg: string;
}

interface IDynamicSprite extends ISprite {
    color: () => string;
    lastColor: string;
    lastUrl: string;
}

interface IResponsiveSprite {
    styleId: IBobrilStyleDef;
    width: number;
    height: number;
    left: number;
    top: number;
}

interface IResponsiveDynamicSprite extends IResponsiveSprite {
    color: string | (() => string);
    lastColor: string;
    lastUrl: string;
    used: boolean;
}

interface IInternalStyle {
    name: string | null;
    realName: string | null;
    parent?: string | IBobrilStyleDef | IBobrilStyleDef[];
    style: CSSStyles | (() => [CSSStyles, CSSPseudoStyles]);
    pseudo?: CSSPseudoStyles;
}

export type Keyframes = { from?: CSSStyles; to?: CSSStyles; [step: number]: CSSStyles };
interface IInternalKeyFrames {
    name: string;
    def: Keyframes;
}

interface IInteralMediaQuery {
    [key: string]: CSSStylesItem;
}

var allStyles: { [id: string]: IInternalStyle } = newHashObj();
var allAnimations: { [id: string]: IInternalKeyFrames } = newHashObj();
var allMediaQueries: { [id: string]: IInteralMediaQuery[] } = newHashObj();
var allSprites: { [key: string]: ISprite } = newHashObj();
var bundledSprites: { [key: string]: IResponsiveSprite } = newHashObj();
var allNameHints: { [name: string]: boolean } = newHashObj();
var dynamicSprites: IDynamicSprite[] = [];
var svgSprites = new Map<string, ColorlessSprite>();
var unusedBundled = new Map<string, IResponsiveDynamicSprite>();
var bundledDynamicSprites: IResponsiveDynamicSprite[] = [];
var imageCache: { [url: string]: ImageData | null } = newHashObj();
var injectedCss = "";
var rebuildStyles = false;
var htmlStyle: HTMLStyleElement | null = null;
var globalCounter: number = 0;

var chainedAfterFrame = setAfterFrame(afterFrame);

const cssSubRuleDelimiter = /\:|\ |\>/;

function buildCssSubRule(parent: string): string | null {
    let matchSplit = cssSubRuleDelimiter.exec(parent);
    if (!matchSplit) return allStyles[parent]!.name;
    let posSplit = matchSplit.index;
    return allStyles[parent.substring(0, posSplit)]!.name + parent.substring(posSplit);
}

function buildCssRule(parent: string | string[] | undefined, name: string): string {
    let result = "";
    if (parent) {
        if (isArray(parent)) {
            for (let i = 0; i < parent.length; i++) {
                if (i > 0) {
                    result += ",";
                }
                result += "." + buildCssSubRule(parent[i]!) + "." + name;
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
    if (isString(style)) {
        if (unusedBundled.has(style)) {
            unusedBundled.get(style)!.used = true;
            unusedBundled.delete(style);
            invalidateStyles();
        }
        let externalStyle = allStyles[style];
        if (externalStyle === undefined) {
            throw new Error("Unknown style " + style);
        }
        flattenStyle(cur, curPseudo, externalStyle.style, externalStyle.pseudo);
    } else if (isFunction(style)) {
        style(cur, curPseudo);
    } else if (isArray(style)) {
        for (let i = 0; i < style.length; i++) {
            flattenStyle(cur, curPseudo, style[i], undefined);
        }
    } else if (isObject(style)) {
        for (let key in style) {
            if (!hOP.call(style, key)) continue;
            let val = style[key];
            if (isFunction(val)) {
                val = val(cur, key);
            }
            cur[key] = val;
        }
    }
    if (stylePseudo != undefined && curPseudo != undefined) {
        for (let pseudoKey in stylePseudo) {
            let curPseudoVal = curPseudo[pseudoKey];
            if (curPseudoVal === undefined) {
                curPseudoVal = newHashObj();
                curPseudo[pseudoKey] = curPseudoVal;
            }
            flattenStyle(curPseudoVal, undefined, stylePseudo[pseudoKey], undefined);
        }
    }
}

let lastDppx = 0;
let lastSpriteUrl = "";
let lastSpriteDppx = 1;
let hasBundledSprites = false;
let wasSpriteUrlChanged = true;

function afterFrame(root: IBobrilCacheChildren | null) {
    var currentDppx = getMedia().dppx;
    if (hasBundledSprites && lastDppx != currentDppx) {
        lastDppx = currentDppx;
        let newSpriteUrl = bundlePath;
        let newSpriteDppx = 1;
        if (lastDppx > 1) {
            for (let i = 0; i < bundlePath2.length; i++) {
                [newSpriteUrl, newSpriteDppx] = bundlePath2[i]!;
                if (newSpriteDppx >= lastDppx) break;
            }
        }
        if (lastSpriteUrl != newSpriteUrl) {
            lastSpriteUrl = newSpriteUrl;
            lastSpriteDppx = newSpriteDppx;
            rebuildStyles = true;
            wasSpriteUrlChanged = true;
        }
    }
    if (rebuildStyles) {
        rebuildStyles = false;
        if (hasBundledSprites) {
            let imageSprite = imageCache[lastSpriteUrl];
            if (imageSprite === undefined) {
                imageSprite = null;
                imageCache[lastSpriteUrl] = imageSprite;
                loadImage(lastSpriteUrl, (image) => {
                    imageCache[lastSpriteUrl] = getImageData(image);
                    invalidateStyles();
                });
            }
            if (imageSprite != null) {
                for (let i = 0; i < bundledDynamicSprites.length; i++) {
                    let dynSprite = bundledDynamicSprites[i]!;
                    if (!dynSprite.used) continue;
                    let colorStr = dynSprite.color;
                    if (!isString(colorStr)) colorStr = colorStr();
                    if (wasSpriteUrlChanged || colorStr !== dynSprite.lastColor) {
                        dynSprite.lastColor = colorStr;
                        let mulWidth = (dynSprite.width * lastSpriteDppx) | 0;
                        let mulHeight = (dynSprite.height * lastSpriteDppx) | 0;
                        let lastUrl = recolorAndClip(
                            imageSprite,
                            colorStr,
                            mulWidth,
                            mulHeight,
                            (dynSprite.left * lastSpriteDppx) | 0,
                            (dynSprite.top * lastSpriteDppx) | 0
                        );
                        var stDef = allStyles[dynSprite.styleId]!;
                        stDef.style = {
                            backgroundImage: `url(${lastUrl})`,
                            width: dynSprite.width,
                            height: dynSprite.height,
                            backgroundPosition: 0,
                            backgroundSize: "100%",
                        };
                    }
                }
                if (wasSpriteUrlChanged) {
                    let iWidth = imageSprite.width / lastSpriteDppx;
                    let iHeight = imageSprite.height / lastSpriteDppx;
                    for (let key in bundledSprites) {
                        let sprite = bundledSprites[key]!;
                        if ((sprite as IResponsiveDynamicSprite).color !== undefined) continue;
                        var stDef = allStyles[sprite.styleId]!;
                        let width = sprite.width;
                        let height = sprite.height;
                        let percentWidth = (100 * iWidth) / width;
                        let percentHeight = (100 * iHeight) / height;
                        stDef.style = {
                            backgroundImage: `url(${lastSpriteUrl})`,
                            width: width,
                            height: height,
                            backgroundPosition: `${(100 * sprite.left) / (iWidth - width)}% ${
                                (100 * sprite.top) / (iHeight - height)
                            }%`,
                            backgroundSize: `${percentWidth}% ${percentHeight}%`,
                        };
                    }
                }
                wasSpriteUrlChanged = false;
            }
        }
        for (let i = 0; i < dynamicSprites.length; i++) {
            let dynSprite = dynamicSprites[i]!;
            let image = imageCache[dynSprite.url];
            if (image == undefined) continue;
            let colorStr = dynSprite.color();
            if (colorStr !== dynSprite.lastColor) {
                dynSprite.lastColor = colorStr;
                if (dynSprite.width == undefined) dynSprite.width = image.width;
                if (dynSprite.height == undefined) dynSprite.height = image.height;
                let lastUrl = recolorAndClip(
                    image,
                    colorStr,
                    dynSprite.width,
                    dynSprite.height,
                    dynSprite.left,
                    dynSprite.top
                );
                var stDef = allStyles[dynSprite.styleId]!;
                stDef.style = {
                    backgroundImage: `url(${lastUrl})`,
                    width: dynSprite.width,
                    height: dynSprite.height,
                    backgroundPosition: 0,
                };
            }
        }
        var styleStr = injectedCss;
        for (var key in allAnimations) {
            var anim = allAnimations[key]!;
            styleStr += "@keyframes " + anim.name + " {";
            for (var key2 in anim.def) {
                let item = anim.def[key2];
                let style = newHashObj();
                flattenStyle(style, undefined, item, undefined);
                shimStyle(style);
                styleStr +=
                    key2 +
                    (key2 == "from" || key2 == "to" ? "" : "%") +
                    " {" +
                    inlineStyleToCssDeclaration(style) +
                    "}\n";
            }
            styleStr += "}\n";
        }
        for (var key in allStyles) {
            var ss = allStyles[key]!;
            let parent = ss.parent;
            let name = ss.name;
            let ssPseudo = ss.pseudo;
            let ssStyle = ss.style;
            if (isFunction(ssStyle) && ssStyle.length === 0) {
                [ssStyle, ssPseudo] = (ssStyle as any)();
            }
            if (isString(ssStyle) && ssPseudo == undefined) {
                ss.realName = ssStyle;
                assert(name != undefined, "Cannot link existing class to selector");
                continue;
            }
            ss.realName = name;
            let style = newHashObj();
            let flattenPseudo = newHashObj();
            flattenStyle(undefined, flattenPseudo, undefined, ssPseudo);
            flattenStyle(style, flattenPseudo, ssStyle, undefined);
            shimStyle(style);
            let cssStyle = inlineStyleToCssDeclaration(style);
            if (cssStyle.length > 0)
                styleStr += (name == undefined ? parent : buildCssRule(parent, name)) + " {" + cssStyle + "}\n";
            for (var key2 in flattenPseudo) {
                let item = flattenPseudo[key2];
                shimStyle(item);
                styleStr +=
                    (name == undefined
                        ? parent + addDoubleDot(key2)
                        : buildCssRule(parent, name + addDoubleDot(key2))) +
                    " {" +
                    inlineStyleToCssDeclaration(item) +
                    "}\n";
            }
        }
        for (var key in allMediaQueries) {
            var mediaQuery = allMediaQueries[key]!;
            styleStr += "@media " + key + "{";
            for (var definition of mediaQuery) {
                for (var key2 in definition) {
                    let item = definition[key2];
                    let style = newHashObj();
                    flattenStyle(style, undefined, item, undefined);
                    shimStyle(style);
                    styleStr += "." + key2 + " {" + inlineStyleToCssDeclaration(style) + "}\n";
                }
            }
            styleStr += "}\n";
        }
        var styleElement = document.createElement("style");
        styleElement.appendChild(createTextNode(styleStr));

        var head = document.head || document.getElementsByTagName("head")[0];
        if (htmlStyle != null) {
            head.replaceChild(styleElement, htmlStyle);
        } else {
            head.appendChild(styleElement);
        }
        htmlStyle = styleElement;
    }
    chainedAfterFrame(root);
}

function addDoubleDot(pseudoOrElse: string) {
    var c = pseudoOrElse.charCodeAt(0);
    if (c == 32 || c == 0x5b || c == 0x2e)
        // " ", "[", "."
        return pseudoOrElse;
    return ":" + pseudoOrElse;
}

export function style(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode {
    let className = node.className;
    let inlineStyle = node.style;
    let stack: (IBobrilStyles | number)[] | null = null;
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
        if (s == undefined || s === true || s === false || s === "" || s === 0) {
            // skip
        } else if (isString(s)) {
            if (unusedBundled.has(s)) {
                unusedBundled.get(s)!.used = true;
                unusedBundled.delete(s);
                rebuildStyles = true;
            }
            var sd = allStyles[s];
            if (sd != undefined) {
                s = sd.realName! as IBobrilStyleDef;
            }
            if (className == undefined) className = s;
            else className += " " + s;
        } else if (isArray(s)) {
            if (ca.length > i + 1) {
                if (stack == undefined) stack = [];
                stack.push(i);
                stack.push(ca);
            }
            ca = <IBobrilStyles[]>s;
            i = 0;
            continue;
        } else {
            if (inlineStyle == undefined) inlineStyle = newHashObj();
            for (let key in s) {
                if (hOP.call(s, key)) {
                    let val = (<any>s)[key];
                    if (isFunction(val)) val = val();
                    (inlineStyle as any)[key] = val;
                }
            }
        }
        i++;
    }
    node.className = className;
    node.style = inlineStyle;
    return node;
}

const uppercasePattern = /([A-Z])/g;
const hyphenateCache = new Map([["cssFloat", "float"]]);

function hyphenateStyle(s: string): string {
    var res = hyphenateCache.get(s);
    if (res === undefined) {
        res = s.replace(uppercasePattern, "-$1").toLowerCase();
        hyphenateCache.set(s, res);
    }
    return res;
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

// PureFuncs: styleDef, styleDefEx, sprite, spriteb, spritebc, svg

export function styleDef(style: CSSStyles, pseudoOrAttr?: CSSPseudoStyles, nameHint?: string): IBobrilStyleDef {
    return styleDefEx(undefined, style, pseudoOrAttr, nameHint);
}

function makeName(nameHint?: string): string {
    if (nameHint && nameHint !== "b-") {
        nameHint = nameHint.replace(/[^a-z0-9_-]/gi, "_").replace(/^[0-9]/, "_$&");
        if (allNameHints[nameHint]) {
            var counter = 1;
            while (allNameHints[nameHint + counter]) counter++;
            nameHint = nameHint + counter;
        }
        allNameHints[nameHint] = true;
    } else {
        nameHint = "b-" + globalCounter++;
    }
    return nameHint;
}

export type AnimationNameFactory = ((params?: string) => string) & ((styles: CSSInlineStyles, key: string) => string);

export function keyframesDef(def: Keyframes, nameHint?: string): AnimationNameFactory {
    nameHint = makeName(nameHint);
    allAnimations[nameHint] = { name: nameHint, def };
    rebuildStyles = true;
    const res = (params?: string) => {
        if (isString(params)) return params + " " + nameHint;
        return nameHint!;
    };
    res.toString = res;
    return res as AnimationNameFactory;
}

type MediaQueryDefinition = {
    [key: string]: CSSStylesItem;
};

/**
 * create media query
 * @example
 * // can be called with string query definition
 * mediaQueryDef("only screen (min-width: 1200px)", {
                [style]: {
                    opacity: 1
                }
            });
 * @example
 * // also build can be used with builder           
 * mediaQueryDef(createMediaQuery()
 .rule("only", "screen")
    .and({type: "max-width", value: 1200, unit: "px"})
    .and({type: "min-width", value: 768, unit: "px"})
 .or()
 .rule()
    .and({type: "aspect-ratio", width: 11, height: 5})
 .build(), {
        [style]: {
            opacity: 1
        }
    });
 *
 **/
export function mediaQueryDef(def: string, mediaQueryDefinition: MediaQueryDefinition): void {
    let mediaQuery = allMediaQueries[def];
    if (!mediaQuery) {
        mediaQuery = [];
        allMediaQueries[def] = mediaQuery;
    }
    mediaQuery.push(mediaQueryDefinition);
    rebuildStyles = true;
}

export function namedStyleDefEx(
    name: string,
    parent: IBobrilStyleDef | IBobrilStyleDef[] | undefined,
    style: CSSStyles,
    pseudoOrAttr?: CSSPseudoStyles
): IBobrilStyleDef {
    var res = styleDefEx(parent, style, pseudoOrAttr, name);
    if (res != name) throw new Error("named style " + name + " is not unique");
    return res;
}

export function namedStyleDef(name: string, style: CSSStyles, pseudoOrAttr?: CSSPseudoStyles): IBobrilStyleDef {
    return namedStyleDefEx(name, undefined, style, pseudoOrAttr);
}

export function styleDefEx(
    parent: IBobrilStyleDef | IBobrilStyleDef[] | undefined,
    style: CSSStyles,
    pseudoOrAttr?: CSSPseudoStyles,
    nameHint?: string
): IBobrilStyleDef {
    nameHint = makeName(nameHint);
    allStyles[nameHint] = {
        name: nameHint,
        realName: nameHint,
        parent,
        style,
        pseudo: pseudoOrAttr,
    };
    if (isString(style) && pseudoOrAttr == undefined) {
        allStyles[nameHint]!.realName = style;
    } else rebuildStyles = true;
    return nameHint as IBobrilStyleDef;
}

export function selectorStyleDef(selector: string, style: CSSStyles, pseudoOrAttr?: CSSPseudoStyles) {
    allStyles["b-" + globalCounter++] = {
        name: null,
        realName: null,
        parent: selector,
        style,
        pseudo: pseudoOrAttr,
    };
    rebuildStyles = true;
}

let allowInvalidateStyles = true;

export function setAllowInvalidateStyles(value: boolean) {
    allowInvalidateStyles = value;
}

export function invalidateStyles(): void {
    if (!allowInvalidateStyles) return;
    rebuildStyles = true;
    invalidate();
}

function updateSprite(spDef: ISprite): void {
    var stDef = allStyles[spDef.styleId]!;
    var style: any = {
        backgroundImage: `url(${spDef.url})`,
        width: spDef.width,
        height: spDef.height,
        backgroundPosition: `${-spDef.left}px ${-spDef.top}px`,
        backgroundSize: `${spDef.width}px ${spDef.height}px`,
    };
    stDef.style = style;
    invalidateStyles();
}

function emptyStyleDef(url: string): IBobrilStyleDef {
    return styleDef({ width: 0, height: 0 }, undefined, url);
}

const rgbaRegex = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return [canvas, <CanvasRenderingContext2D>canvas.getContext("2d")];
}

function getImageData(image: HTMLImageElement): ImageData {
    let width = image.naturalWidth;
    let height = image.naturalHeight;
    let ctx = createCanvas(width, height)[1];
    ctx.drawImage(image, 0, 0);
    return ctx.getImageData(0, 0, width, height);
}

function recolorAndClip(
    imageData: ImageData,
    colorStr: string,
    width: number,
    height: number,
    left: number,
    top: number
): string {
    let [canvas, ctx] = createCanvas(width, height);
    let imgData = ctx.createImageData(width, height);
    let imgDataData = imgData.data;
    let rgba = rgbaRegex.exec(colorStr);
    let cRed: number, cGreen: number, cBlue: number, cAlpha: number;
    if (rgba) {
        cRed = parseInt(rgba[1]!, 10);
        cGreen = parseInt(rgba[2]!, 10);
        cBlue = parseInt(rgba[3]!, 10);
        cAlpha = Math.round(parseFloat(rgba[4]!) * 255);
    } else {
        cRed = parseInt(colorStr.slice(1, 3), 16);
        cGreen = parseInt(colorStr.slice(3, 5), 16);
        cBlue = parseInt(colorStr.slice(5, 7), 16);
        cAlpha = colorStr.length == 9 ? parseInt(colorStr.slice(7, 9), 16) : 0xff;
    }
    let targetOffset = 0;
    let targetStride = 4 * width;
    let sourceData = imageData.data;
    let sourceStride = 4 * imageData.width;
    let sourceOffset = left * 4 + top * sourceStride;

    for (let y = 0; y < height; y++) {
        imgDataData
            .subarray(targetOffset, targetOffset + targetStride)
            .set(sourceData.subarray(sourceOffset, sourceOffset + targetStride));
        targetOffset += targetStride;
        sourceOffset += sourceStride;
    }
    if (cAlpha === 0xff) {
        for (let i = 0; i < imgDataData.length; i += 4) {
            // Horrible workaround for imprecisions due to browsers using premultiplied alpha internally for canvas
            let red = imgDataData[i]!;
            if (
                red === imgDataData[i + 1] &&
                red === imgDataData[i + 2] &&
                (red === 0x80 || (imgDataData[i + 3]! < 0xff && red > 0x70))
            ) {
                imgDataData[i] = cRed;
                imgDataData[i + 1] = cGreen;
                imgDataData[i + 2] = cBlue;
            }
        }
    } else {
        for (let i = 0; i < imgDataData.length; i += 4) {
            let red = imgDataData[i]!;
            let alpha = imgDataData[i + 3]!;
            if (
                red === imgDataData[i + 1] &&
                red === imgDataData[i + 2] &&
                (red === 0x80 || (alpha < 0xff && red > 0x70))
            ) {
                if (alpha === 0xff) {
                    imgDataData[i] = cRed;
                    imgDataData[i + 1] = cGreen;
                    imgDataData[i + 2] = cBlue;
                    imgDataData[i + 3] = cAlpha;
                } else {
                    alpha = alpha * (1.0 / 255);
                    imgDataData[i] = Math.round(cRed * alpha);
                    imgDataData[i + 1] = Math.round(cGreen * alpha);
                    imgDataData[i + 2] = Math.round(cBlue * alpha);
                    imgDataData[i + 3] = Math.round(cAlpha * alpha);
                }
            }
        }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL();
}

let lastFuncId = 0;
const funcIdName = "b@funcId";
let imagesWithCredentials = false;
const colorLessSpriteMap = new Map<string, ISprite | IResponsiveSprite | ISvgSprite>();

function loadImage(url: string, onload: (image: HTMLImageElement) => void) {
    var image = new Image();
    image.crossOrigin = imagesWithCredentials ? "use-credentials" : "anonymous";
    image.addEventListener("load", () => onload(image));
    image.src = url;
}

export function setImagesWithCredentials(value: boolean) {
    imagesWithCredentials = value;
}

export function sprite(url: string): ColorlessSprite;
export function sprite(
    url: string,
    color: null | undefined,
    width?: number,
    height?: number,
    left?: number,
    top?: number
): ColorlessSprite;
export function sprite(
    url: string,
    color: string | (() => string),
    width?: number,
    height?: number,
    left?: number,
    top?: number
): IBobrilStyleDef;

export function sprite(
    url: string,
    color?: string | (() => string) | null | undefined,
    width?: number,
    height?: number,
    left?: number,
    top?: number
): IBobrilStyleDef {
    assert(allStyles[url] === undefined, "Wrong sprite url");
    left = left || 0;
    top = top || 0;
    let colorId = color || "";
    let isVarColor = false;
    if (isFunction(color)) {
        isVarColor = true;
        colorId = (<any>color)[funcIdName];
        if (colorId == undefined) {
            colorId = "" + lastFuncId++;
            (<any>color)[funcIdName] = colorId;
        }
    }
    var key = url + ":" + colorId + ":" + (width || 0) + ":" + (height || 0) + ":" + left + ":" + top;
    var spDef = allSprites[key]!;
    if (spDef) return spDef.styleId;
    var styleId = emptyStyleDef(url);
    spDef = { styleId, url, width, height, left, top };
    if (isVarColor) {
        (<IDynamicSprite>spDef).color = <() => string>color;
        (<IDynamicSprite>spDef).lastColor = "";
        (<IDynamicSprite>spDef).lastUrl = "";
        dynamicSprites.push(<IDynamicSprite>spDef);
        if (imageCache[url] === undefined) {
            imageCache[url] = null;
            loadImage(url, (image) => {
                imageCache[url] = getImageData(image);
                invalidateStyles();
            });
        }
        invalidateStyles();
    } else if (width == undefined || height == undefined || color != undefined) {
        loadImage(url, (image) => {
            if (spDef.width == undefined) spDef.width = image.width;
            if (spDef.height == undefined) spDef.height = image.height;
            if (color != undefined) {
                spDef.url = recolorAndClip(
                    getImageData(image),
                    color as string,
                    spDef.width,
                    spDef.height,
                    spDef.left,
                    spDef.top
                );
                spDef.left = 0;
                spDef.top = 0;
            }
            updateSprite(spDef);
        });
    } else {
        updateSprite(spDef);
    }
    allSprites[key] = spDef;
    if (colorId === "") {
        colorLessSpriteMap.set(styleId, spDef);
    }
    return styleId;
}

export function svg(content: string): ColorlessSprite {
    var key = content + ":1";
    var styleId = svgSprites.get(key);
    if (styleId !== undefined) return styleId;
    styleId = buildSvgStyle(content, 1);
    var svgSprite: ISvgSprite = {
        styleId,
        svg: content,
    };
    svgSprites.set(key, styleId);
    colorLessSpriteMap.set(styleId, svgSprite);
    return styleId;
}

export function isSvgSprite(id: ColorlessSprite) {
    let orig = colorLessSpriteMap.get(id);
    if (orig == undefined) throw new Error(id + " is not colorless sprite");
    return "svg" in orig;
}

/// Function can take colors as functions but they are evaluated immediately => use only in render like function
export function svgWithColor(
    id: ColorlessSprite,
    colors: string | (() => string) | Record<string, string | (() => string)>,
    size: number = 1
): IBobrilStyleDef {
    var original = colorLessSpriteMap.get(id);
    if (DEBUG && (original == undefined || !("svg" in original))) throw new Error(id + " is not colorless svg");
    var key = (original! as ISvgSprite).svg + ":" + size;
    if (isFunction(colors)) {
        colors = colors();
        key += ":gray:" + colors;
    } else if (isString(colors)) {
        key += ":gray:" + colors;
    } else
        for (let ckey in colors) {
            if (hOP.call(colors, ckey)) {
                let val = colors[ckey];
                if (isFunction(val)) val = val();
                key += ":" + ckey + ":" + val;
            }
        }
    var styleId = svgSprites.get(key);
    if (styleId !== undefined) return styleId;
    var colorsMap = new Map<string, string>();
    if (isString(colors)) {
        colorsMap.set("gray", colors);
    } else
        for (let ckey in colors) {
            if (hOP.call(colors, ckey)) {
                let val = colors[ckey];
                if (isFunction(val)) val = val();
                colorsMap.set(ckey, val as string);
            }
        }

    styleId = buildSvgStyle(
        (original! as ISvgSprite).svg.replace(/[\":][A-Z-]+[\";]/gi, (m) => {
            var c = colorsMap.get(m.substr(1, m.length - 2));
            return c !== undefined ? m[0] + c + m[m.length - 1] : m;
        }),
        size
    );
    svgSprites.set(key, styleId);
    return styleId;
}

function buildSvgStyle(content: string, size: number): ColorlessSprite {
    var sizeStr = content.split('"', 1)[0];
    var [width, height] = sizeStr!.split(" ").map((s) => parseFloat(s) * size);
    var backgroundImage =
        'url("data:image/svg+xml,' +
        encodeURIComponent(
            '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="' +
                width +
                '" height="' +
                height +
                '" viewBox="0 0 ' +
                content +
                "</svg>"
        ) +
        '")';
    return styleDef({ width, height, backgroundImage }) as ColorlessSprite;
}

var bundlePath = (<any>window)["bobrilBPath"] || "bundle.png";
var bundlePath2: [string, number][] = (<any>window)["bobrilBPath2"] || [];

export function setBundlePngPath(path: string) {
    bundlePath = path;
}

export function getSpritePaths(): [string, [string, number][]] {
    return [bundlePath, bundlePath2];
}

export function setSpritePaths(main: string, others: [string, number][]) {
    bundlePath = main;
    bundlePath2 = others;
}

export function spriteb(width: number, height: number, left: number, top: number): IBobrilStyleDef {
    var key = ":" + width + ":" + height + ":" + left + ":" + top;
    var spDef = bundledSprites[key];
    if (spDef) return spDef.styleId;
    hasBundledSprites = true;
    var styleId = styleDef({ width, height });
    spDef = {
        styleId,
        width,
        height,
        left,
        top,
    };
    bundledSprites[key] = spDef;
    wasSpriteUrlChanged = true;
    colorLessSpriteMap.set(styleId, spDef);
    return styleId;
}

export function spritebc(
    color: undefined | string | (() => string),
    width: number,
    height: number,
    left: number,
    top: number
): IBobrilStyleDef {
    if (color == undefined) {
        return spriteb(width, height, left, top);
    }
    var colorId: string;
    if (isString(color)) {
        colorId = color;
    } else {
        colorId = (<any>color)[funcIdName];
        if (colorId == undefined) {
            colorId = "" + lastFuncId++;
            (<any>color)[funcIdName] = colorId;
        }
    }
    var key = colorId + ":" + width + ":" + height + ":" + left + ":" + top;
    var spDef = bundledSprites[key] as IResponsiveDynamicSprite;
    if (spDef) return spDef.styleId;
    hasBundledSprites = true;
    var styleId = styleDef({ width, height });
    spDef = {
        styleId,
        width,
        height,
        left,
        top,
        used: false,
        color,
        lastColor: "",
        lastUrl: "",
    };
    bundledDynamicSprites.push(spDef);
    bundledSprites[key] = spDef;
    unusedBundled.set(styleId, spDef);
    return styleId;
}

/// Function can take colors as functions but they are evaluated immediately => use only in render like function
export function spriteWithColor(colorLessSprite: ColorlessSprite, color: string | (() => string)): IBobrilStyleDef {
    const original = colorLessSpriteMap.get(colorLessSprite);
    if (DEBUG && original == undefined) throw new Error(colorLessSprite + " is not colorless sprite");
    if ("svg" in original!) {
        return svgWithColor(colorLessSprite, { gray: color }, 1);
    } else if ("url" in original!) {
        return sprite(original.url, color, original.width, original.height, original.left, original.top);
    } else {
        return spritebc(color, original!.width, original!.height, original!.left, original!.top);
    }
}

export function injectCss(css: string): void {
    injectedCss += css;
    invalidateStyles();
}

// PureFuncs: styledDiv
export function styledDiv(children: IBobrilChildren, ...styles: IBobrilStyles[]): IBobrilNode {
    return style({ tag: "div", children }, styles);
}

export function setStyleShim(name: string, action: (style: any, value: any, oldName: string) => void) {
    mapping.set(name, action);
}

setStyleShim("float", renamer("cssFloat"));

internalSetCssInJsCallbacks(createNodeStyle, updateNodeStyle, style);
