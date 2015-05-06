/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.style.d.ts"/>
(function (b) {
    function style(node) {
        var styles = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            styles[_i - 1] = arguments[_i];
        }
        return node;
    }
    function styleDef(style, nameHint) {
        return nameHint;
    }
    function styleMod(parent, pseudoClass, style) {
    }
    function sprite(url, width, height, left, top) {
        return url;
    }
    b.style = style;
    b.styleDef = styleDef;
    b.styleMod = styleMod;
    b.sprite = sprite;
})(b);
