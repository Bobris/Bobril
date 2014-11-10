/// <reference path="../../src/bobril.d.ts"/>
var BasicApp;
(function (BasicApp) {
    function p() {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 0); _i++) {
            args[_i] = arguments[_i + 0];
        }
        return { tag: "p", children: args };
    }

    var frame = 0;
    b.init(function () {
        b.invalidate();
        frame++;
        return [
            { tag: "h1", children: "First Bobril sample" },
            p("I know, it is a little bit simplistic, but it is a start"),
            p("Uptime: ", b.uptime().toFixed(0), "ms Frame: ", "" + frame, " FPS:", (frame * 1000 / b.uptime()).toFixed(1))
        ];
    });
})(BasicApp || (BasicApp = {}));
//# sourceMappingURL=app.js.map
