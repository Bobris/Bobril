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
            me.attrs = { width: me.data.width, height: me.data.height };
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
            else attrs.fill = "none";
            if (data.fillOpacity) attrs["fill-opacity"] = "" + data.fillOpacity;
            if (data.stroke) attrs.stroke = data.stroke;
            else attrs.stroke = "none";
            if (data.strokeWidth) attrs["stroke-width"] = "" + data.strokeWidth;
            if (data.strokeOpacity) attrs["stroke-opacity"] = "" + data.strokeOpacity;
            var path = data.path || [];
            var resultPath = "";
            for (var i = 0; i < path.length;) {
                switch (path[i]) {
                    case "M":
                        resultPath += "M" + path[i + 1] + " " + path[i + 2];
                        i += 3;
                        break;
                    case "L":
                        resultPath += "L" + path[i + 1] + " " + path[i + 2];
                        i += 3;
                        break;
                    case "C":
                        resultPath += "C" + path.slice(i + 1, i + 7).join(" ");
                        i += 7;
                        break;
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

    var vmlScale = 10;

    function vmlCoord(x: number): string {
        return (x * vmlScale).toFixed(0);
    }

    function describeArcVml(x: number, y: number, radius: number, startAngle: number, endAngle: number, startWithLine: boolean) {
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

    function donutPieVml(x: number, y: number, radiusBig: number, radiusSmall: number, startAngle: number, endAngle: number): string {
        var p = describeArcVml(x, y, radiusBig, startAngle, endAngle, false);
        var nextWithLine = true;
        if (p[p.length - 1] === "x") nextWithLine = false;
        if (radiusSmall === 0) {
            if (!nextWithLine) return p + " e";
        }
        return p + describeArcVml(x, y, radiusSmall, endAngle, startAngle, nextWithLine) + "x e";
    }

    var vmlComponent = {
        init: (ctx: Object, me: IBobrilNode) => {
            me.tag = "div";
            me.attrs = { style: { position: "relative", width: me.data.width, height: me.data.height } };
            recSetComponent(me.children, vmlChildComponent);
            b.vmlNode();
        },
        update: (ctx: Object, me: IBobrilNode, oldMe: IBobrilCacheNode) => {
            vmlComponent.init(ctx, me);
        }
    }

    var vmlChildComponent = {
        init: (ctx: Object, me: IBobrilNode) => {
            me.tag = "/";
            var s = "<v:shape coordorigin=\"0 0\" coordsize=\"100 100\"";
            var sInner = "";
            var data = me.data;
            if (data.fillOpacity) {
                sInner += "<v:fill color=\"" + data.fill + "\" opacity=\"" + data.fillOpacity + "\"/>";
            } else if (data.fill) {
                s += " fillcolor=\"" + data.fill + "\"";
            } else {
                s += " filled=\"false\"";
            }
            if (data.strokeOpacity) {
                sInner += "<v:stroke color=\"" + data.stroke + "\" opacity=\"" + data.strokeOpacity + "\" weight=\"" + data.strokeWidth + "px\"/>";
            } else if (data.stroke) {
                s += " strokecolor=\"" + data.stroke + "\"";
                if (data.strokeWidth)
                    s += " strokeweight=\"" + data.strokeWidth + "px\"";
            } else {
                s += " stroked=\"false\"";
            }
            var path = data.path || [];
            s += " path=\"";
            for (var i = 0; i < path.length;) {
                switch (path[i]) {
                    case "M":
                        s += "m" + vmlCoord(path[i + 1]) + "," + vmlCoord(path[i + 2]);
                        i += 3;
                        break;
                    case "L":
                        s += "l" + vmlCoord(path[i + 1]) + "," + vmlCoord(path[i + 2]);
                        i += 3;
                        break;
                    case "C":
                        s += "c" + path.slice(i + 1, i + 7).map((pos:number) => vmlCoord(pos)).join(",");
                        i += 7;
                        break;
                    case "pie":
                        s += donutPieVml.apply(null, path.slice(i + 1, i + 7));
                        i += 7;
                        break;
                }
            }
            s += "\">";
            s += sInner;
            s += "</v:shape>";
            me.content = s;
        },
        update: (ctx: Object, me: IBobrilNode, oldMe: IBobrilCacheNode) => {
            vmlChildComponent.init(ctx, me);
        },

        postInitDom: (ctx: Object, me: IBobrilNode, element: HTMLElement) => {
        },

        postUpdateDom: (ctx: Object, me: IBobrilNode, element: HTMLElement) => {
            vmlChildComponent.postInitDom(ctx, me, element);
        }
    }

    var implType = ((<any>window).SVGAngle || document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#BasicStructure", "1.1") ? 1 : 2);
    if (implType == 2) {
        var testingdiv = document.createElement("div");
        testingdiv.innerHTML = '<v:shape adj="1"/>';
        var testingshape = testingdiv.firstChild;
        (<HTMLElement>testingshape).style.behavior = "url(#default#VML)";
        if (!(testingshape && typeof (<any>testingshape).adj == "object")) {
            implType = 0;
        }
    }
    if (implType == 2) {
        if (!document.namespaces['v']) {
            document.namespaces.add('v', 'urn:schemas-microsoft-com:vml', '#default#VML');
        }
        var ss = document.createStyleSheet();
        ss.cssText = 'v\\:shape { position:absolute; width:10px; height:10px; behavior:url(#default#VML); }' +
        ' v\\:fill { behavior:url(#default#VML); }' +
        ' v\\:stroke { behavior:url(#default#VML); }'
        ;
        b.vg = vmlComponent;
    } else if (implType == 1) {
        b.vg = svgComponent;
    } else {
        b.vg = {};
    }
})(b, window, document);
