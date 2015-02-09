/// <reference path="bobril.d.ts"/>
if (typeof DEBUG === "undefined")
    DEBUG = true;
(function (b) {
    var chain = b.setSetStyle(styleShim);
    var vendors = ["webkit", "Moz", "ms", "o"];
    var testingDivStyle = document.createElement("div").style;
    function testPropExistence(name) {
        return typeof testingDivStyle[name] === "string";
    }
    var mapping = {};
    function rename(newName) {
        return function (style, value, oldName) {
            style[newName] = value;
            style[oldName] = undefined;
        };
    }
    ;
    if (b.ieVersion() === 8) {
        mapping.cssFloat = rename("styleFloat");
        function addFilter(s, v) {
            if (s.zoom == null)
                s.zoom = "1";
            var f = s.filter;
            s.filter = (f == null) ? v : f + " " + v;
        }
        mapping.opacity = function (s, v, oldName) {
            s[oldName] = undefined;
            if (v === "")
                return;
            v = parseFloat(v);
            addFilter(s, "alpha(opacity=" + ((v * 100) | 0) + ")");
        };
        function hex2(n) {
            if (n <= 0)
                return "00";
            else if (n >= 255)
                return "ff";
            var r = Math.round(n).toString(16);
            if (r.length < 2)
                return "0" + r;
            return r;
        }
        var rergba = /\s*rgba\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d+|\d*\.\d+)\s*\)\s*/;
        mapping.background = function (s, v, oldName) {
            var match = rergba.exec(v);
            if (match == null)
                return;
            var colorstr = hex2(parseFloat(match[4]) * 255) + hex2(parseFloat(match[1])) + hex2(parseFloat(match[2])) + hex2(parseFloat(match[3]));
            s[oldName] = "none";
            addFilter(s, "progid:DXImageTransform.Microsoft.gradient(startColorstr=#" + colorstr + ",endColorstr=#" + colorstr + ")");
        };
        var deg2radians = Math.PI * 2 / 360;
        mapping.transform = function (s, v, oldName) {
            s[oldName] = undefined;
            var match = /^rotate\((\d+)deg\)$/.exec(v);
            if (match == null)
                return;
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
            function trans(x, y) {
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
        };
    }
    function styleShim(newValue) {
        var k = Object.keys(newValue);
        for (var i = 0, l = k.length; i < l; i++) {
            var ki = k[i];
            var mi = mapping[ki];
            var vi = newValue[ki];
            if (vi === undefined)
                continue; // don't want to map undefined
            if (mi === undefined) {
                if (DEBUG) {
                    if (ki === "float" && window.console && console.error)
                        console.error("In style instead of 'float' you have to use 'cssFloat'");
                    if (/-/.test(ki) && window.console && console.warn)
                        console.warn("Style property " + ki + " contains dash (must use JS props instead of css names)");
                }
                if (testPropExistence(ki)) {
                    mi = null;
                }
                else {
                    var titleCaseKi = ki.replace(/^\w/, function (match) { return match.toUpperCase(); });
                    for (var j = 0; j < vendors.length; j++) {
                        if (testPropExistence(vendors[j] + titleCaseKi)) {
                            mi = rename(vendors[j] + titleCaseKi);
                            break;
                        }
                    }
                    if (mi === undefined) {
                        mi = null;
                        if (DEBUG && window.console && console.warn)
                            console.warn("Style property " + ki + " is not supported in this browser");
                    }
                }
                mapping[ki] = mi;
            }
            if (mi !== null)
                mi(newValue, vi, ki);
        }
        chain(newValue);
    }
})(b);
//# sourceMappingURL=bobril.styleshim.js.map