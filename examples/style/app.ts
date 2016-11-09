/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.style.d.ts"/>

module StyleApp {
    var redWithBorder = b.styleDef({ color: "red", border: "blue solid 3px", padding: 3 });
    var inline = b.styleDef({ display: "inline-block", margin: 5 }, { hover: { outline: "blue solid 2px" }, "hover:after": { content: "", background: "blue", position: "absolute", display: "block", height: 8, width: 8 } });
    var biggerMargin = b.styleDefEx(inline, { margin: 10 });
    var icon = b.sprite("light.png");
    var iconShine = b.sprite("light.png", "#80ff80");
    var iconOff = b.sprite("light.png", "#e03030");
    var iconTran = b.sprite("light.png", "rgba(80,40,40,0.3)");
    var leftfloat = b.styleDef([{ cssFloat: "left" }, { width: 50, height: 30 }]);
    var par1 = b.styleDef({ fontFamily: "Arial", fontSize: 10, margin: 5 });
    var par2 = b.styleDef({ fontFamily: "TimesNewRoman", fontSize: 20, margin: 5 });
    var ovr1 = b.styleDefEx([par1, par2], { fontSize: 15 });
    var par = b.styleDef({ background: "red", padding: 10 });
    var child = b.styleDefEx(par + ":hover>", { background: "green" });
    var unselectable = b.styleDef({ userSelect: "none" });
    var l = true;

    b.init(() => {
        return [
            { tag: "h1", children: "Bobril sample for styling" },
            {
                tag: "div", children: [
                    b.style({ tag: "div", children: "Red text with border" }, redWithBorder),
                    b.style({ tag: "div" }, inline, icon),
                    b.style({ tag: "div" }, inline, biggerMargin, icon),
                    b.style({ tag: "div" }, inline, iconTran),
                    b.style({ tag: "div", component: { onClick: () => { l = !l; b.invalidate(); return true; } } }, inline, l && iconShine, l || iconOff),
                    b.style({ tag: "div", children: "float" }, leftfloat),
                    b.style({ tag: "div", children: "float2" }, leftfloat)]
            },
            {
                tag: "div", children: [
                    b.style({ tag: "span", children: "P1" }, par1),
                    b.style({ tag: "span", children: "P2" }, par2),
                    b.style({ tag: "span", children: "P1O1" }, par1, ovr1),
                    b.style({ tag: "span", children: "P2O1" }, [[par2], ovr1])
                ]
            },
            b.style({
                tag: "div", children: b.style({ tag: "div", children: "inner" }, child)
            }, par),
            {
                tag: "div", children: [
                    b.style({ tag: "div", children: "unselectable as css" }, unselectable),
                    b.style({ tag: "div", children: "unselectable as inline" }, { userSelect: "none" }),
                ]
            }
        ];
    });
}
