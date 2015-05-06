// definition for Bobril defined class
declare type IBobrilStyleDef = string;
// object case if for inline style declaration, undefined, null, true and false values are ignored
declare type IBobrilStyle = Object | IBobrilStyleDef | boolean;
// place inline styles at end for optimal speed
declare type IBobrilStyles = IBobrilStyle | IBobrilStyle[];

﻿interface IBobrilStatic {
    // apply style to node, you can apply style only once to each node, you should not touch className, or style members before or after
    style?(node: IBobrilNode, ...styles: IBobrilStyles[]): IBobrilNode;
    // declare new style think of it as class inside css
    styleDef?(style: any, nameHint?: string): IBobrilStyleDef;
    // attach class style modifier like hover, focus
    styleMod?(parent: IBobrilStyleDef, pseudoClass: string, style: any): void;
    // define class for background with sprite usually you specify only first parameter and build system does rest
    // { background: `url(${url})`, width: `${width||widthofurl}px`, height: `${height||heightofurl}px` }
    sprite?(url: string, width?: number, height?: number, left?: number, top?: number): IBobrilStyleDef;
}
