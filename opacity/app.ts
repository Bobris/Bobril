/// <reference path="../../src/bobril.d.ts"/>
module BasicApp {
    var spacer = { tag: "div", attrs: { style: "height:2px" } };

    var animtype = 0;
    var opacity: any = 0;

    function radiobox(groupName: string, value: number, constant: number, onChange: (value: number) => void, content: any): IBobrilNode {
        return {
            tag: "label", children: [
                { tag: "input", attrs: { type: "radio", name: groupName, value: value === constant }, component: { onChange: (ctx: any, v: boolean) => { if (v) { onChange(constant); b.invalidate(); } } } },
                content]
        };
    }

    b.init(() => {
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
            radiobox("a", animtype, 0, (v) => animtype = v, "Solid"), spacer,
            radiobox("a", animtype, 1, (v) => animtype = v, "Half"), spacer,
            radiobox("a", animtype, 2, (v) => animtype = v, "Transparent"), spacer,
            radiobox("a", animtype, 3, (v) => animtype = v, "Pulsing"), spacer,
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
}
