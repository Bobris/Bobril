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
    function hex2(n) {
        var res = n.toString(16);
        if (res.length < 2)
            return "0" + res;
        return res;
    }
    b.init(function () {
        var media = b.getMedia();
        var screenWidth = media.width;
        var screenHeight = media.height;
        var pieSize = Math.min(screenWidth, screenHeight);
        var pieRadius = pieSize * 0.4;
        var angle = 0;
        var path = [];
        var texts = [];
        var count = libSizeData.parts.length;
        texts.push({
            tag: "div",
            style: {
                position: "absolute",
                textAlign: "center",
                width: "500px",
                fontSize: "20px",
                top: Math.round(screenHeight * 0.5 - pieRadius - 35).toString() + "px",
                left: Math.round(screenWidth * 0.5 - 250).toString() + "px"
            },
            children: "Bobril Minified Component Size"
        });
        texts.push({
            tag: "div",
            style: {
                position: "absolute",
                textAlign: "center",
                width: "500px",
                top: Math.round(screenHeight * 0.5 + pieRadius + 15).toString() + "px",
                left: Math.round(screenWidth * 0.5 - 250).toString() + "px"
            },
            children: "Total " + libSizeData.total.minsize.toString() + " bytes"
        });
        for (var i = 0; i < count; i++) {
            var frequency = 6 / count;
            var red = Math.round(Math.sin(frequency * i + 0) * 127 + 128);
            var green = Math.round(Math.sin(frequency * i + 2) * 127 + 128);
            var blue = Math.round(Math.sin(frequency * i + 4) * 127 + 128);
            var myangle = 360 * libSizeData.parts[i].minsize / libSizeData.total.minsize;
            var exangle = angle + myangle * 0.5;
            exangle = exangle / 180 * Math.PI;
            var expand = i == 0 ? pieRadius * 0.04 : 0;
            var legendx = screenWidth * 0.4 + pieRadius * 1.2;
            var legendr = 20;
            var legenddy = legendr + 5;
            var legendy = screenHeight * 0.5 - legenddy * count * 0.5;
            path.push({
                data: {
                    path: ["pie", screenWidth * 0.4 + expand * Math.sin(exangle), screenHeight * 0.5 - expand * Math.cos(exangle), pieRadius, 0, angle, angle + myangle, "rect", legendx, legendy + i * legenddy, legendr, legendr],
                    fill: "#" + hex2(red) + hex2(green) + hex2(blue),
                    stroke: "#FFFFFF",
                    strokeWidth: 1
                }
            });
            texts.push({
                tag: "div",
                style: {
                    position: "absolute",
                    top: Math.round(legendy + i * legenddy).toString() + "px",
                    left: Math.round(legendx + legenddy).toString() + "px"
                },
                children: libSizeData.parts[i].name
            });
            texts.push({
                tag: "div",
                style: {
                    position: "absolute",
                    textAlign: "right",
                    width: "60px",
                    top: Math.round(legendy + i * legenddy).toString() + "px",
                    left: Math.round(legendx + legenddy + 60).toString() + "px"
                },
                children: libSizeData.parts[i].minsize.toString()
            });
            angle += myangle;
        }
        b.invalidate();
        return {
            tag: "div",
            style: { position: "relative", width: "100%", height: "100%" },
            children: [
                {
                    component: b.vg,
                    data: { width: screenWidth + "px", height: screenHeight + "px" },
                    children: path
                },
                texts
            ]
        };
    });
})(LibSizeApp || (LibSizeApp = {}));
//# sourceMappingURL=app.js.map