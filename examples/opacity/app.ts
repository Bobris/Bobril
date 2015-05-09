/// <reference path="../../src/bobril.d.ts"/>
module OpacityApp {
    var spacer = { tag: "div", style: { height: 2 } };

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
        var bg = "rgba(0,255,0," + ((opacity === "") ? 1 : opacity.toFixed(3)) + ")";
        return [
            { tag: "h1", children: "Bobril sample for opacity" },
            { tag: "p", style: { userSelect: "none" }, children: "This text should not be selectable" },
            radiobox("a", animtype, 0, (v) => animtype = v, "Solid"), spacer,
            radiobox("a", animtype, 1, (v) => animtype = v, "Half"), spacer,
            radiobox("a", animtype, 2, (v) => animtype = v, "Transparent"), spacer,
            radiobox("a", animtype, 3, (v) => animtype = v, "Pulsing"), spacer,
            { tag: "p", children: "Left has opacity:" + opacity + " Right has background:" + bg },
            {
                tag: "div",
                style: { background: "#f88", width: "30em", height: "10em" },
                children: [{
                    tag: "div",
                    style: { display: "inline-block", width: "5em", height: "5em", "padding": "2.5em" },
                    children: { tag: "div", style: { opacity: opacity, background: "#0F0", border: "2px solid #00F", width: "5em", height: "5em" }, children: "Hello" }
                }, {
                        tag: "div",
                        style: { display: "inline-block", width: "5em", height: "5em", "padding": "2.5em" },
                        children: { tag: "div", style: { background: bg, border: "2px solid #00F", width: "5em", height: "5em" }, children: "World" }
                    }, {
                        tag: "div",
                        style: { display: "inline-block", width: "5em", height: "5em", "padding": "2.5em" },
                        children: { tag: "div", style: { background: "linear-gradient(to bottom,red,blue)", border: "2px solid #00F", width: "5em", height: "5em" }, children: "Red top" }
                    }]
            }
        ];
    });
}
