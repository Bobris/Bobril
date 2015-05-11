/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.style.d.ts"/>

module StyleApp {
    var redWithBorder = b.styleDef({ color: "red", border: "blue solid 3px", padding: 3 });
    var inline = b.styleDef({ display: "inline-block" });
    var icon = b.sprite("light.png");
    var iconShine = b.sprite("light.png", "#80ff80");

    b.init(() => {
        return [
            { tag: "h1", children: "Bobril sample for styling" },
            b.style({ tag: "div", children: "Red text with border" }, redWithBorder),
            b.style({ tag: "div" }, inline, icon),
            b.style({ tag: "div" }, inline, iconShine),
        ];
    });
}
