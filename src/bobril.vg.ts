/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.vg.d.ts"/>

((b: IBobrilStatic, window: Window, document: Document) => {
    function recSetComponent(a: any, c: IBobrilComponent) {
        if (!a) return;
        if (b.isArray(a)) {
            var l = a.length;
            for (var i = 0; i < l; i++) {
                recSetComponent(a[i], c);
            }
        }
        else if (a === Object(a)) {
            b.postEnhance(a, c);
        }
    }

    function polarToCartesian(centerX: number, centerY: number, radius: number, angleInDegrees: number): { x: number; y: number } {
        var angleInRadians = angleInDegrees * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.sin(angleInRadians)), y: centerY - (radius * Math.cos(angleInRadians))
        };
    }

    function svgDescribeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, startWithLine: boolean) {
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

    function svgPie(x: number, y: number, radiusBig: number, radiusSmall: number, startAngle: number, endAngle: number): string {
        var p = svgDescribeArc(x, y, radiusBig, startAngle, endAngle, false);
        var nextWithLine = true;
        if (p[p.length - 1] === "Z") nextWithLine = false;
        if (radiusSmall === 0) {
            if (!nextWithLine) return p;
        }
        return p + svgDescribeArc(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "Z";
    }

    function svgCircle(x: number, y: number, radius: number): string {
        return svgDescribeArc(x, y, radius, 0, 360, false);
    }

    function svgRect(x: number, y: number, width: number, height: number): string {
        return "M" + x + " " + y + "h" + width + "v" + height + "h" + (-width) + "Z";
    }

    var commands = {
        "M": [2, "M"],
        "L": [2, "L"],
        "C": [6, "C"],
        "Z": [0, "Z"],
        "rect": [4, svgRect],
        "circle": [3, svgCircle],
        "pie": [6, svgPie]
    };

    function svgChildComponentRender(ctx: Object, me: IBobrilNode) {
        me.tag = "path";
        var attrs: any = {};
        var data = me.data;
        var v = data.fill;
        attrs.fill = v ? v : "none";
        v = data.fillOpacity;
        if (v) attrs["fill-opacity"] = "" + v;
        v = data.stroke;
        attrs.stroke = v ? v : "none";
        v = data.strokeWidth;
        if (v) attrs["stroke-width"] = "" + v;
        v = data.strokeOpacity;
        if (v) attrs["stroke-opacity"] = "" + v;
        v = data.lineCap;
        if (v) attrs["stroke-linecap"] = v;
        v = data.lineJoin;
        if (v) attrs["stroke-linejoin"] = v;
        v = data.miterLimit;
        if (v) attrs["stroke-miterlimit"] = "" + v;
        v = data.dasharray;
        if (v && b.isArray(v))
            attrs["stroke-dasharray"] = (<Array<any>>v).join();
        var path = data.path || <any>[];
        var resultPath = "";
        var index = 0;
        var descriptor: any;
        var paramCount = 0;
        var handler = <any>null;
        while (index < path.length) {
            if (isNaN(path[index])) {
                var command = path[index++];
                descriptor = (<any>commands)[command];
                paramCount = descriptor[0] >> 0;
                handler = descriptor[1];
            }
            if (typeof handler == "string") {
                resultPath += handler;
                for (var i = 0; i < paramCount; i++) {
                    resultPath += " " + path[index + i];
                }
            } else
                resultPath += handler.apply(null, path.slice(index, index + paramCount));
            index += paramCount;
        }
        attrs.d = resultPath;
        me.attrs = attrs;
    }

    var svgChildComponent: IBobrilComponent = {
        render: svgChildComponentRender
    };

    function svgComponentInit(ctx: Object, me: IBobrilNode) {
        me.tag = "svg";
        me.attrs = { width: me.data.width, height: me.data.height };
        recSetComponent(me.children, svgChildComponent);
    }

    var svgComponent: IBobrilComponent = {
        render: svgComponentInit
    }

    b.vg = svgComponent;
})(b, window, document);
