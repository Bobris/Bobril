/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.style.d.ts"/>
var StyleApp;
(function (StyleApp) {
    var redWithBorder = b.styleDef({ color: "red", border: "blue solid 3px", padding: 3 });
    b.init(function () {
        return [
            { tag: "h1", children: "Bobril sample for styling" },
            b.style({ tag: "div", children: "Red text with border" }, redWithBorder)
        ];
    });
})(StyleApp || (StyleApp = {}));
