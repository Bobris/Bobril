/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.style.d.ts"/>
var StyleThemingApp;
(function (StyleThemingApp) {
    function colorLuminance(hex, lum) {
        hex = hex.replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        var rgb = "#";
        for (var i = 0; i < 3; i++) {
            var c = parseInt(hex.substr(i * 2, 2), 16);
            var cs = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += cs.length === 1 ? "0" + cs : cs;
        }
        return rgb;
    }
    var mainColor = "#3498db";
    function setThemeColor(color) {
        mainColor = color;
        b.invalidateStyles();
    }
    var baseBackground = b.styleDef({ background: function () { return mainColor; } });
    var lighterBackground = b.styleDef({ background: function () { return colorLuminance(mainColor, 0.3); } });
    var buttonStyle = b.styleDef({
        display: "inline-block",
        overflow: "hidden",
        verticalAlign: "middle",
        borderRadius: 28,
        cursor: "pointer",
        margin: 5
    });
    // because of IE9 round border+gradient needs nested styles
    var buttonInnerStyle = b.styleDef({
        background: function () { return "linear-gradient(to bottom," + mainColor + "," + colorLuminance(mainColor, -0.2) + ")"; },
        borderRadius: 28,
        color: "#ffffff",
        fontSize: 20,
        padding: "10px 20px 10px 20px",
        cursor: "pointer",
    }, {
        hover: {
            background: function () { return "linear-gradient(to bottom," + colorLuminance(mainColor, 0.1) + "," + colorLuminance(mainColor, -0.1) + ")"; }
        }
    });
    function button(content, action) {
        return b.style({ tag: "div", children: b.style({ tag: "div", children: content }, buttonInnerStyle), component: { onClick: function () { action(); return true; } } }, buttonStyle);
    }
    b.init(function () {
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
                    button("Bluish", function () { return setThemeColor("#3498db"); }),
                    button("Greenish", function () { return setThemeColor("#34db98"); })
                ]
            }
        ];
    });
})(StyleThemingApp || (StyleThemingApp = {}));
