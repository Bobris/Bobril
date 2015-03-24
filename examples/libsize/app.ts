/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.media.d.ts"/>

declare var libSizeData: {
    parts: { name: string; tslines: number; jssize: number; minsize: number; gzipsize: number }[];
    total: { tslines: number; jssize: number; minsize: number; gzipsize: number };
    concatgzipsize: number
};

module LibSizeApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    function hex2(n: number): string {
        var res = n.toString(16);
        if (res.length < 2) return "0" + res;
        return res;
    }

    b.init(() => {
        var media = b.getMedia();
        var screenWidth = media.width;
        var screenHeight = media.height;
        var pieSize = Math.min(screenWidth, screenHeight);
        var pieRadius = pieSize * 0.4;
        var angle = 0;
        var path: any[] = [];
        var texts: any[] = [];
        var count = libSizeData.parts.length;
        texts.push({
            tag: "div", style: {
                position: "absolute",
                textAlign: "center",
                width: 500,
                fontSize: 20,
                top: Math.round(screenHeight * 0.5 - pieRadius - 35),
                left: Math.round(screenWidth * 0.5 - 250)
            },
            children: "Bobril Minified Component Size"
        });
        texts.push({
            tag: "div", style: {
                position: "absolute",
                textAlign: "center",
                width: 500,
                top: Math.round(screenHeight * 0.5 + pieRadius + 15),
                left: Math.round(screenWidth * 0.5 - 250)
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
            path.push(
                {
                    data: {
                        path: ["pie", screenWidth * 0.4 + expand * Math.sin(exangle), screenHeight * 0.5 - expand * Math.cos(exangle), pieRadius, 0, angle, angle + myangle,
                            "rect", legendx, legendy + i * legenddy, legendr, legendr], fill: "#" + hex2(red) + hex2(green) + hex2(blue), stroke: "#FFFFFF", strokeWidth: 1
                    }
                }
                );
            texts.push({
                tag: "div", style: {
                    position: "absolute",
                    top: Math.round(legendy + i * legenddy),
                    left: Math.round(legendx + legenddy)
                },
                children: libSizeData.parts[i].name
            });
            texts.push({
                tag: "div", style: {
                    position: "absolute",
                    textAlign: "right",
                    width: 60,
                    top: Math.round(legendy + i * legenddy),
                    left: Math.round(legendx + legenddy + 60)
                },
                children: libSizeData.parts[i].minsize.toString()
            });
            angle += myangle;
        }
        b.invalidate();
        return {
            tag: "div", style: { position: "relative", width: "100%", height: "100%" },
            children: [
                {
                    component: b.vg,
                    data: { width: screenWidth, height: screenHeight },
                    children: path
                },
                texts
            ]
        };
    });
}
