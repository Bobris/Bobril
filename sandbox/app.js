/// <reference path="../../src/bobril.d.ts"/>
var SandboxApp;
(function (SandboxApp) {
    function p() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return { tag: "p", children: args };
    }
    var frame = 0;
    b.init(function () {
        b.invalidate();
        frame++;
        var rotation = frame * 2 % 360;
        return [
            { tag: "h1", children: "First Bobril sample" },
            p("Uptime: ", b.uptime().toFixed(0), "ms Frame: ", "" + frame, " FPS:", (frame * 1000 / b.uptime()).toFixed(1)),
            {
                tag: "div",
                attrs: { style: { display: "table", height: "200px" } },
                children: {
                    tag: "div",
                    attrs: { style: { display: "table-cell", textAlign: "center", verticalAlign: "middle" } },
                    children: {
                        tag: "div",
                        attrs: { style: { display: "inline-block", position: "relative", backgroundColor: "#90A0B0", width: "200px", height: "20px", transform: "rotate(" + rotation + "deg)" } },
                        children: "Hello world!"
                    }
                }
            }
        ];
    });
})(SandboxApp || (SandboxApp = {}));
//# sourceMappingURL=app.js.map