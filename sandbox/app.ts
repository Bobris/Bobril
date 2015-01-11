/// <reference path="../../src/bobril.d.ts"/>
module SandboxApp {
    function p(...args: any[]) {
        return { tag: "p", children: args };
    }

    var frame = 0;
    b.init(() => {
        b.invalidate();
        frame++;
        var rotation = frame * 2 % 360;
        return [
            { tag: "h1", children: "First Bobril sample" },
            p("Uptime: ", b.uptime().toFixed(0), "ms Frame: ", "" + frame, " FPS:", (frame * 1000 / b.uptime()).toFixed(1)),
            {
                tag: "div", attrs: { style: { display: "table", height: "200px" } }, children:
                {
                    tag: "div", attrs: { style: { display: "table-cell", textAlign: "center", verticalAlign: "middle" } }, children:
                    {
                        tag: "div", attrs: { style: { display:"inline-block", position:"relative", backgroundColor:"#90A0B0", width: "200px", height: "20px", transform: "rotate(" + rotation + "deg)" } }, children: "Hello world!"
                    }
                }
            }
        ];
    });
}
