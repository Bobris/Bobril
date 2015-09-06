/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.style.d.ts"/>

module StyleThemingApp {
    function colorLuminance(hex: string, lum: number): string {
        hex = hex.replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        let rgb = "#";
        for (let i = 0; i < 3; i++) {
            let c = parseInt(hex.substr(i * 2, 2), 16);
            let cs = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += cs.length === 1 ? "0" + cs : cs;
        }
        return rgb;
    }

    let mainColor = "#3498db";
    function setThemeColor(color: string) {
        mainColor = color;
        b.invalidateStyles();
    }
    const baseBackground = b.styleDef({ background: () => mainColor });
    const lighterBackground = b.styleDef({ background: () => colorLuminance(mainColor, 0.3) });
    const buttonStyle = b.styleDef(
        {
            display: "inline-block",
            overflow: "hidden",
            verticalAlign: "middle",
            borderRadius: 28,
            cursor: "pointer",
            margin: 5
        });
    // because of IE9 round border+gradient needs nested styles
    const buttonInnerStyle = b.styleDef(
        {
            background: () => "linear-gradient(to bottom," + mainColor + "," + colorLuminance(mainColor, -0.2) + ")",
            borderRadius: 28,
            color: "#ffffff",
            fontSize: 20,
            padding: "10px 20px 10px 20px",
            cursor: "pointer",
        }, {
            hover: {
                background: () => "linear-gradient(to bottom," + colorLuminance(mainColor, 0.1) + "," + colorLuminance(mainColor, -0.1) + ")"
            }
        });

    function button(content: IBobrilChildren, action: () => void) {
        return b.style({ tag: "div", children: b.style({ tag: "div", children: content }, buttonInnerStyle), component: { onClick: ()=> { action(); return true; } } }, buttonStyle);
    }

    b.init(() => {
        return [
            { tag: "h1", children: "Bobril sample for styling and theming" },
            b.style({
                tag: "div", children: [
                    b.style({ tag: "span", children: "Base Background" }, baseBackground),
                    b.style({ tag: "span", children: " Lighter" }, lighterBackground)
                ]
            }, { margin: 10 }),
            {
                tag: "div", children: [
                    "Choose theme: ",
                    button("Bluish", () => setThemeColor("#3498db")),
                    button("Greenish", () => setThemeColor("#34db98"))
                ]
            }
        ];
    });
}
