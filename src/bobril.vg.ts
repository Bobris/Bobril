/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.vg.d.ts"/>

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

    var vmlScale = 10;

    function vmlCoord(x: number): string {
        return (x * vmlScale).toFixed(0);
    }

    function vmlDescribeArc(x: number, y: number, radius: number, startAngle: number, endAngle: number, startWithLine: boolean) {
        var absDeltaAngle = Math.abs(endAngle - startAngle);
        var close = false;
        if (absDeltaAngle > 360 - 0.01) {
            if (endAngle > startAngle) endAngle = startAngle - 359.9;
            else endAngle = startAngle + 359.9;
            if (radius === 0) return "";
            close = true;
        } else {
            if (radius === 0) {
                return (startWithLine ? "l" : "m") + [
                    vmlCoord(x), vmlCoord(y)
                ].join(",");
            }
        }
        var radiusInStr = vmlCoord(radius);
        var d = (startWithLine ? "ae" : "al") + [
            vmlCoord(x), vmlCoord(y), radiusInStr, radiusInStr,
            ((90 - startAngle) * 65536).toFixed(0),
            ((startAngle - endAngle) * 65536).toFixed(0)
        ].join(",");
        if (close) d += "x";
        return d;
    }

    function vmlPie(x: number, y: number, radiusBig: number, radiusSmall: number, startAngle: number, endAngle: number): string {
        var p = vmlDescribeArc(x, y, radiusBig, startAngle, endAngle, false);
        var nextWithLine = true;
        if (p[p.length - 1] === "x") nextWithLine = false;
        if (radiusSmall === 0) {
            if (!nextWithLine) return p;
        }
        return p + vmlDescribeArc(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "x";
    }

    function vmlCircle(x: number, y: number, radius: number): string {
        return vmlDescribeArc(x, y, radius, 0, 360, false);
    }

    function vmlRect(x: number, y: number, width: number, height: number): string {
        return "m" + vmlCoord(x) + " " + vmlCoord(y) + "r" + vmlCoord(width) + " 0 0 " + vmlCoord(height) + " " + vmlCoord(-width) + " 0x";
    }

    var commands = {
        "M": [2, "M", "m"],
        "L": [2, "L", "l"],
        "C": [6, "C", "c"],
        "Z": [0, "Z", "x"],
        "rect": [4, svgRect, vmlRect],
        "circle": [3, svgCircle, vmlCircle],
        "pie": [6, svgPie, vmlPie]
    };

    function svgChildComponentInit(ctx: Object, me: IBobrilNode) {
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

    var svgChildComponent:IBobrilComponent = {
        render: svgChildComponentInit
    };

    function svgComponentInit(ctx: Object, me: IBobrilNode) {
        me.tag = "svg";
        me.attrs = { width: me.data.width, height: me.data.height };
        recSetComponent(me.children, svgChildComponent);
    }

    var svgComponent:IBobrilComponent = {
        render: svgComponentInit
    }

    function vmlChildComponentInit(ctx: Object, me: IBobrilNode) {
        me.tag = "/";
        var s = "<v:shape coordorigin=\"0 0\" coordsize=\"100 100\"";
        var sInner = "";
        var data = me.data;
        var vfill = data.fill;
        var v: any;
        if (vfill) {
            v = data.fillOpacity;
            if (v)
                sInner += "<v:fill color=\"" + vfill + "\" opacity=\"" + v + "\"/>";
            else s += " fillcolor=\"" + vfill + "\"";
        } else {
            s += " filled=\"false\"";
        }
        v = data.stroke;
        if (v) {
            sInner += "<v:stroke color=\"" + v;
            v = data.strokeOpacity;
            if (v) sInner += "\" opacity=\"" + v;
            v = data.strokeWidth;
            if (v) sInner += "\" weight=\"" + v + "px";
            v = data.lineCap;
            if (v) sInner += "\" endcap=\"" + (v === "butt" ? "flat" : v);
            sInner += "\" joinstyle=\"" + (data.lineJoin || "miter");
            v = data.miterLimit;
            if (v) sInner += "\" miterlimit=\"" + v;
            sInner += "\"/>";
        } else {
            s += " stroked=\"false\"";
        }
        var path = data.path || <any>[];
        s += " path=\"";
        var index = 0;
        var descriptor: any;
        var paramCount = 0;
        var handler = <any>null;
        while (index < path.length) {
            if (isNaN(path[index])) {
                var command = path[index++];
                descriptor = (<any>commands)[command];
                paramCount = descriptor[0] >> 0;
                handler = descriptor[2];
            }
            if (typeof handler == "string") {
                s += handler;
                for (var i = 0; i < paramCount; i++) {
                    s += " " + vmlCoord(path[index + i]);
                }
            } else
                s += handler.apply(null, path.slice(index, index + paramCount));
            index += paramCount;
        }
        s += "\">" + sInner + "</v:shape>";
        me.children = s;
    }

    var vmlChildComponent:IBobrilComponent = {
        render: vmlChildComponentInit
    }

    function vmlComponentInit(ctx: Object, me: IBobrilNode) {
        me.tag = "div";
        me.attrs = { style: { position: "absolute", width: me.data.width, height: me.data.height, clip: "rect(0," + me.data.width + "," + me.data.height + ",0)" } };
        recSetComponent(me.children, vmlChildComponent);
        b.vmlNode();
    }

    var vmlComponent:IBobrilComponent = {
        render: vmlComponentInit
    }
    var defaultvml = "#default#VML";
    var urldefaultvml = "url(" + defaultvml + ")";
    var implType = ((<any>window).SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? 1 : 2);
    if (implType === 2) {
        var testingdiv = document.createElement("div");
        testingdiv.innerHTML = "<v:shape adj=\"1\"/>";
        var testingshape = testingdiv.firstChild;
        (<HTMLElement>testingshape).style.behavior = urldefaultvml;
        if (!(testingshape && typeof (<any>testingshape).adj == "object")) {
            implType = 0;
        }
    }
    if (implType === 2) {
        if (!(<any>document).namespaces["v"]) {
            document.namespaces.add("v", "urn:schemas-microsoft-com:vml", defaultvml);
        }
        var behaviururldefaultvml = "behavior:" + urldefaultvml + ";}";
        var ss = document.createStyleSheet();
        ss.cssText = "v\\:shape{position:absolute;width:10px;height:10px;" + behaviururldefaultvml +
        " v\\:fill{" + behaviururldefaultvml +
        " v\\:stroke{" + behaviururldefaultvml;
        b.vg = vmlComponent;
    } else if (implType === 1) {
        b.vg = svgComponent;
    } else {
        b.vg = {};
    }
})(b, window, document);
