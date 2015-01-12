/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
var LibSizeApp;
(function (LibSizeApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    b.init(function () {
        var media = b.getMedia();
        var screenWidth = media.width;
        var screenHeight = media.height;
        var pieSize = Math.min(screenWidth, screenHeight);
        var pieRadius = pieSize * 0.4;
        var angle = 0;
        var path = [];
        for (var i = 0; i < libSizeData.parts.length; i++) {
            var myangle = 360 * libSizeData.parts[i].jssize / libSizeData.total.jssize;
            var exangle = angle + myangle * 0.5;
            exangle = exangle / 180 * Math.PI;
            var expand = i == 0 ? pieRadius * 0.05 : 0;
            path.push("pie", screenWidth * 0.5 + expand * Math.sin(exangle), screenHeight * 0.5 - expand * Math.cos(exangle), pieRadius, 0, angle, angle + myangle);
            angle += myangle;
        }
        b.invalidate();
        return {
            tag: "div",
            attrs: {
                style: { position: "relative", width: "100%", height: "100%" }
            },
            children: [
                {
                    component: b.vg,
                    data: { width: screenWidth + "px", height: screenHeight + "px" },
                    children: [
                        { data: { path: path, fill: "#ff0000", stroke: "#000000", strokeWidth: 2 } }
                    ]
                }
            ]
        };
    });
})(LibSizeApp || (LibSizeApp = {}));
//# sourceMappingURL=app.js.map