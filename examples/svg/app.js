/// <reference path="../../src/bobril.d.ts"/>
var SvgApp;
(function (SvgApp) {
    function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        var angleInRadians = angleInDegrees * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.sin(angleInRadians)), y: centerY - (radius * Math.cos(angleInRadians))
        };
    }

    function describeArc(x, y, radius, startAngle, endAngle, startWithLine) {
        var absDeltaAngle = Math.abs(endAngle - startAngle);
        var close = false;
        if (absDeltaAngle > 360 - 0.01) {
            if (endAngle > startAngle)
                endAngle = startAngle - 359.9;
            else
                endAngle = startAngle + 359.9;
            if (radius === 0)
                return "";
            close = true;
        } else {
            if (radius === 0) {
                return [
                    startWithLine ? "L" : "M", x, y
                ].join(" ");
            }
        }
        var start = polarToCartesian(x, y, radius, endAngle);
        var end = polarToCartesian(x, y, radius, startAngle);
        var arcSweep = (absDeltaAngle <= 180) ? "0" : "1";
        var largeArg = (endAngle > startAngle) ? "0" : "1";
        var d = [
            (startWithLine ? "L" : "M"), start.x, start.y, "A", radius, radius, 0, arcSweep, largeArg, end.x, end.y
        ].join(" ");
        if (close)
            d += "Z";
        return d;
    }

    function donutPie(x, y, radiusBig, radiusSmall, startAngle, endAngle) {
        var p = describeArc(x, y, radiusBig, startAngle, endAngle, false);
        var nextWithLine = true;
        if (p[p.length - 1] == "Z")
            nextWithLine = false;
        if (radiusSmall === 0) {
            if (!nextWithLine)
                return p;
        }
        return p + describeArc(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "Z";
    }

    b.init(function () {
        b.invalidate();
        var angle = Math.sin(b.uptime() * 0.0002) * 180 + 180;
        var angle2 = Math.sin(b.uptime() * 0.0003) * 180 + 180;
        var path = donutPie(200, 200, 195, 180, 0, angle) + donutPie(200, 200, 175, 160, 0, angle2) + donutPie(200, 200, 155, 140, angle, angle2) + donutPie(200, 200, 135, 0, angle, angle2);
        return [
            { tag: "h1", children: "Svg Bobril sample" },
            {
                tag: "svg", attrs: { height: "400px", width: "400px" }, children: [
                    { tag: "path", attrs: { d: path, fill: "#ff0000", stroke: "#000", "stroke-width": "2" } }
                ]
            }
        ];
    });
})(SvgApp || (SvgApp = {}));
//# sourceMappingURL=app.js.map
