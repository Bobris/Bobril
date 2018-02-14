// definition for Bobril defined class
declare type IBobrilStyleDef = string;
// object case is for inline style declaration, undefined, null, true and false values are ignored
declare type IBobrilStyle = Object | IBobrilStyleDef | boolean;
// place inline styles at end for optimal speed
declare type IBobrilStyles = IBobrilStyle | IBobrilStyle[];

interface IBobrilStatic {
    // apply style to node, you can apply style only once to each node, you should not touch className, or style members before or after
    style?(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode;
    // declare new style think of it as class inside css, pseudo classes modifiers (hover,focus) pass in "pseudo" parameter
    // special feature if style is function with zero parameters it is evaluated on style invalidation and must
    // return array with 2 items new style and new pseudo object
    // if style is string and pseudo is undefined or null it is used directly as className
    styleDef?(style: any, pseudo?: { [name: string]: any }, nameHint?: string): IBobrilStyleDef;
    // declare new extending style think of it as class inside css, pseudo classes modifiers (hover,focus,hover:after) pass in "pseudo" parameter
    styleDefEx?(
        parent: IBobrilStyleDef | IBobrilStyleDef[],
        style: any,
        pseudo?: { [name: string]: any },
        nameHint?: string
    ): IBobrilStyleDef;
    // update style by name
    updateStyleDef?(what: IBobrilStyleDef, style: any, pseudo?: { [name: string]: any }): IBobrilStyleDef;
    // update extending style by name
    updateStyleDefEx?(
        what: IBobrilStyleDef,
        parent: IBobrilStyleDef | IBobrilStyleDef[],
        style: any,
        pseudo?: { [name: string]: any }
    ): IBobrilStyleDef;
    // define class for background with sprite usually you specify only first parameter and build system does rest
    // { background: `url(${url})`, width: `${width||widthofurl}px`, height: `${height||heightofurl}px` }
    sprite?(
        url: string,
        color?: string | (() => string),
        width?: number,
        height?: number,
        left?: number,
        top?: number
    ): IBobrilStyleDef;
    // already bundled image bundle.png
    spriteb?(width: number, height: number, left: number, top: number): IBobrilStyleDef;
    // already bundled image bundle.png but with dynamic recolor
    spritebc?(color: () => string, width: number, height: number, left: number, top: number): IBobrilStyleDef;
    // rebuilds all styles before next frame, it also calls Bobril invalidate
    invalidateStyles?(): void;
    // allows to define path to bundle.png
    setBundlePngPath?(path: string): void;
    // inject css to begging useful for normalization of browsers
    injectCss?(css: string): void;
}
