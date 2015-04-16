/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.media.d.ts"/>
var MediaApp;
(function (MediaApp) {
    function p() {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i - 0] = arguments[_i];
        }
        return { tag: "p", children: args };
    }
    var frame = 0;
    b.init(function () {
        frame++;
        return [
            { tag: "h1", children: "Media detection sample" },
            p(JSON.stringify(b.getMedia())),
            p("Frame: ", "" + frame),
            { tag: "input" }
        ];
    });
})(MediaApp || (MediaApp = {}));
