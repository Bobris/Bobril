/// <reference path="bobril.d.ts"/>

((b: IBobrilStatic) => {
    if (b.ieVersion() === 8) {
        var setStyleShim = b.setStyleShim;

        function addFilter(s: any, v: string) {
            if (s.zoom == null) s.zoom = "1";
            var f = s.filter;
            s.filter = (f == null) ? v : f + " " + v;
        }

        setStyleShim("opacity", (s: any, v: any, oldName: string) => {
            s[oldName] = undefined;
            if (v === "") return;
            v = parseFloat(v);
            addFilter(s, "alpha(opacity=" + (((<number>v) * 100) | 0) + ")");
        });

        function hex2(n: number):string {
            if (n <= 0) return "00"; else if (n >= 255) return "ff";
            var r = Math.round(n).toString(16);
            if (r.length < 2) return "0" + r;
            return r;
        }

        var rergba = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;

        setStyleShim("background", (s: any, v: any, oldName: string) => {
            var match = rergba.exec(v);
            if (match == null) return;
            var colorstr = hex2(parseFloat(match[4]) * 255) + hex2(parseFloat(match[1])) + hex2(parseFloat(match[2])) + hex2(parseFloat(match[3]));
            s[oldName] = "none";
            addFilter(s, "progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + colorstr + ",endColorstr=#" + colorstr + ")");
        });

        var deg2radians = Math.PI * 2 / 360;

        setStyleShim("transform", (s: any, v: any, oldName: string) => {
            s[oldName] = undefined;
            var match = /^rotate\((\d+)deg\)$/.exec(v);
            if (match == null) return;
            var match2 = match[1];
            var deg = parseFloat(match2);
            var rad = deg * deg2radians;
            var costheta = Math.cos(rad);
            var sintheta = Math.sin(rad);
            var m11 = costheta;
            var m12 = -sintheta;
            var m21 = sintheta;
            var m22 = costheta;
            var maxX = 0, maxY = 0, minX = 0, minY = 0;

            function trans(x: number, y: number) {
                var xx = m11 * x + m12 * y;
                var yy = m21 * x + m22 * y;
                minX = Math.min(minX, xx);
                maxX = Math.max(maxX, xx);
                minY = Math.min(minY, yy);
                maxY = Math.max(maxY, yy);
            }

            var origHeight = parseFloat(s.height);
            var origWidth = parseFloat(s.width);
            trans(0, 0);
            trans(0, origHeight);
            trans(origWidth, 0);
            trans(origWidth, origHeight);
            addFilter(s, "progid:DXImageTransform.Microsoft.Matrix(M11=" + m11 + ",M12=" + m12 + ",M21=" + m21 + ",M22=" + m22 + ",sizingMethod='auto expand')");
            s.left = Math.round((origWidth - (maxX - minX)) * 0.5) + "px";
            s.top = Math.round((origHeight - (maxY - minY)) * 0.5) + "px";
        });
    }
})(b);
