/// <reference path="../src/bobril.d.ts"/>

((b: IBobrilStatic) => {
    var chain = b.setSetStyle(styleShim);
    var vendors = ["webkit", "moz", "ms", "o"];
    var testingDivStyle:any = document.createElement("div").style;
    var mapping:any = {};
    if (b.ieVersion() === 8) {
        mapping.cssFloat = "styleFloat";
        mapping.opacity = (s:any,v:any) => {
            if (+v === v) {
                s.zoom = s.zoom || "1";
                s.opacity = undefined;
                s.filter = (s.filter || "") + " alpha(opacity=" + (((<number>v) * 100) | 0) + ")";
            }
        }
    }
    function styleShim(newValue: any) {
        var k = Object.keys(newValue);
        for (var i = 0, l = k.length; i < l; i++) {
            var ki = k[i];
            var mi = mapping[ki];
            var vi = newValue[ki];
            if (mi === undefined) {
                if (typeof testingDivStyle[ki] === "string") {
                    mi = null;
                } else {
                    var titleCaseKi = ki.replace(/^\w/, match => match.toUpperCase());
                    for (var j = 0; j < vendors.length; j++) {
                        if (typeof testingDivStyle[vendors[j] + titleCaseKi] === "string") {
                            mi = vendors[j] + titleCaseKi; break;
                        }
                    }
                    if (mi === undefined) {
                        mi = null;
                        if (window.console && console.warn) console.warn("style property " + ki + " is not supported in this browser");
                    }
                }
                mapping[ki] = mi;
            }
            if (mi === null) continue;
            if (typeof mi === "function") {
                mi(newValue, vi);
            } else {
                newValue[mi] = vi;
                newValue[ki] = undefined;
            }
        }
        chain(newValue);
    }
})(b);
