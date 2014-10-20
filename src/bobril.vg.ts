/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.vg.d.ts"/>

((b: IBobrilStatic) => {
    function recSetComponent(a: any, c:IBobrilComponent) {
        if (!a) return;
        if (b.isArray(a)) {
            var l = a.length;
            for (var i = 0; i < l; i++) {
                recSetComponent(a[i], c);
            }
        }
        else if (a === Object(a)) {
            a.component = c;
        }
    }

    function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
        var angleInRadians = angleInDegrees * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.sin(angleInRadians)), y: centerY - (radius * Math.cos(angleInRadians))
        };
    }

    function describeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, startWithLine: boolean) {
        var absDeltaAngle = Math.abs(endAngle - startAngle);
        var close = false;
        if (absDeltaAngle > 360 - 0.01) {
            if (endAngle > startAngle) endAngle = startAngle - 359.9;
            else endAngle = startAngle + 359.9;
            if (radius === 0) return "";
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
        if (close) d += "Z";
        return d;
    }

    function donutPie(x: number, y: number, radiusBig: number, radiusSmall: number, startAngle: number, endAngle: number): string {
        var p = describeArc(x, y, radiusBig, startAngle, endAngle, false);
        var nextWithLine = true;
        if (p[p.length - 1] == "Z") nextWithLine = false;
        if (radiusSmall === 0) {
            if (!nextWithLine) return p;
        }
        return p + describeArc(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "Z";
    }

    var svgComponent = {
        init: (ctx: Object, me: IBobrilNode) => {
            me.tag = "svg";
            recSetComponent(me.children, svgChildComponent);
        },
        update: (ctx: Object, me: IBobrilNode, oldMe: IBobrilCacheNode) => {
            svgComponent.init(ctx, me);
        }
    }
    var svgChildComponent = {
        init: (ctx: Object, me: IBobrilNode) => {
            me.tag = "path";
            var attrs: any = {};
            var data = me.data;
            if (data.fill) attrs.fill = data.fill;
            if (data.fillOpacity) attrs["fill-opacity"] = "" + data.fillOpacity;
            if (data.stroke) attrs.stroke = data.stroke;
            if (data.strokeWidth) attrs["stroke-width"] = "" + data.strokeWidth;
            if (data.strokeOpacity) attrs["stroke-opacity"] = "" + data.strokeOpacity;
            var path = data.path || [];
            var resultPath = "";
            for (var i = 0; i < path.length;) {
                switch(path[i]) {
                    case "pie":
                        resultPath += donutPie.apply(null, path.slice(i + 1, i + 7));
                        i += 7;
                        break;
                }
            }
            attrs.d = resultPath;
            me.attrs = attrs;
        },
        update: (ctx: Object, me: IBobrilNode, oldMe: IBobrilCacheNode) => {
            svgChildComponent.init(ctx, me);
        }
    }
    b.vg = svgComponent;
})(b);
