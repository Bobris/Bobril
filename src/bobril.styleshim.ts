/// <reference path="bobril.d.ts"/>

((b: IBobrilStatic) => {
    var setStyleShim = b.setStyleShim;

    if (b.ieVersion() === 9) {
        function addFilter(s: any, v: string) {
            if (s.zoom == null) s.zoom = "1";
            var f = s.filter;
            s.filter = (f == null) ? v : f + " " + v;
        }

        var simpleLinearGradient = /^linear\-gradient\(to (.+?),(.+?),(.+?)\)/ig;

        setStyleShim("background", (s: any, v: any, oldName: string) => {
            var match = simpleLinearGradient.exec(v);
            if (match == null) return;
            var dir = match[1];
            var color1 = match[2];
            var color2 = match[3];
            var tmp: string;
            switch (dir) {
                case "top": dir = "0"; tmp = color1; color1 = color2; color2 = tmp; break;
                case "bottom": dir = "0"; break;
                case "left": dir = "1"; tmp = color1; color1 = color2; color2 = tmp; break;
                case "right": dir = "1"; break;
                default: return;
            }
            s[oldName] = "none";
            addFilter(s, "progid:DXImageTransform.Microsoft.gradient(startColorstr='" + color1 + "',endColorstr='" + color2 + "', gradientType='" + dir + "')");
        });
    } else {
        var teststyle = document.createElement("div").style;
        teststyle.cssText = "background:-webkit-linear-gradient(top,red,red)";
        if (teststyle.background.length > 0) {
            var startsWithGradient = /^(?:repeating\-)?(?:linear|radial)\-gradient/ig;
            var revdirs = { top: "bottom", bottom: "top", left: "right", right: "left" };
            function gradientWebkitter(style: any, value: any, name: string) {
                if (startsWithGradient.test(value)) {
                    var pos = (<string>value).indexOf("(to ");
                    if (pos > 0) {
                        pos += 4;
                        var posend = (<string>value).indexOf(",", pos);
                        var dir = (<string>value).slice(pos, posend);
                        dir = dir.split(" ").map(v=> (<any>revdirs)[v] || v).join(" ");
                        value = (<string>value).slice(0, pos - 3) + dir + (<string>value).slice(posend);
                    }
                    value = "-webkit-" + value;
                }
                style[name] = value;
            };
            setStyleShim("background", gradientWebkitter);
        }
    }
})(b);
