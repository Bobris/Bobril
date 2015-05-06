/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>

((b: IBobrilStatic) => {
    function style(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode {
        return node;
    }

    function styleDef(style: any, nameHint?: string): IBobrilStyleDef {
        return nameHint;
    }

    function styleMod(parent: IBobrilStyleDef, pseudoClass: string, style: any): void {

    }

    function sprite(url: string, width?: number, height?: number, left?: number, top?: number): IBobrilStyleDef {
        return url;
    }

    b.style = style;
    b.styleDef = styleDef;
    b.styleMod = styleMod;
    b.sprite = sprite;
})(b);
