/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.style.d.ts"/>

module StyleApp {
    var redWithBorder = b.styleDef({ color: "red", border: "blue solid 3px", padding: 3 });
    var inline = b.styleDef({ display: "inline-block", margin: 5 }, { hover: { outline: "blue solid 2px" } });
    var icon = b.sprite("light.png");
    var iconShine = b.sprite("light.png", "#80ff80");
    var iconOff = b.sprite("light.png", "#e03030");
    var leftfloat = b.styleDef({ cssFloat: "left", width:50, height:30 });
    var l = true;

    b.init(() => {
        return [
            { tag: "h1", children: "Bobril sample for styling" },
            b.style({ tag: "div", children: "Red text with border" }, redWithBorder),
            b.style({ tag: "div" }, inline, icon),
            b.style({ tag: "div", component: { onClick: () => { l = !l; b.invalidate(); } } }, inline, l && iconShine, l || iconOff),
            b.style({ tag: "div", children: "float"}, leftfloat),
            b.style({ tag: "div", children: "float2"}, leftfloat)
        ];
    });
}
