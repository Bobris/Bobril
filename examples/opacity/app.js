/// <reference path="../../src/bobril.d.ts"/>
var BasicApp;
(function (BasicApp) {
    var spacer = { tag: "div", attrs: { style: "height:2px" } };
    var animtype = 0;
    var opacity = 0;
    function radiobox(groupName, value, constant, onChange, content) {
        return {
            tag: "label",
            children: [
                { tag: "input", attrs: { type: "radio", name: groupName, value: value === constant }, component: { onChange: function (ctx, v) {
                    if (v) {
                        onChange(constant);
                        b.invalidate();
                    }
                } } },
                content
            ]
        };
    }
    b.init(function () {
        switch (animtype) {
            case 0:
                opacity = "";
                break;
            case 1:
                opacity = 0.5;
                break;
            case 2:
                opacity = 0;
                break;
            case 3:
                opacity = Math.sin(b.uptime() * 0.01) * 0.5 + 0.5;
                b.invalidate();
                break;
        }
        return [
            { tag: "h1", children: "Bobril sample for opacity" },
            { tag: "p", attrs: { style: { userSelect: "none" } }, children: "This text should not be selectable" },
            radiobox("a", animtype, 0, function (v) { return animtype = v; }, "Solid"),
            spacer,
            radiobox("a", animtype, 1, function (v) { return animtype = v; }, "Half"),
            spacer,
            radiobox("a", animtype, 2, function (v) { return animtype = v; }, "Transparent"),
            spacer,
            radiobox("a", animtype, 3, function (v) { return animtype = v; }, "Pulsing"),
            spacer,
            {
                tag: "div",
                attrs: { style: { background: "#f88", width: "10em", height: "10em" } },
                children: {
                    tag: "div",
                    attrs: { style: { width: "5em", height: "5em", "padding": "2.5em" } },
                    children: { tag: "div", attrs: { style: { opacity: opacity, background: "#0F0", width: "5em", height: "5em" } }, children: "Hello" }
                }
            }
        ];
    });
})(BasicApp || (BasicApp = {}));
//# sourceMappingURL=app.js.map