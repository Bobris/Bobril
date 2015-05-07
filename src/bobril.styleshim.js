/// <reference path="bobril.d.ts"/>
(function (b) {
    var teststyle = document.createElement("div").style;
    teststyle.cssText = "background:-webkit-linear-gradient(top,red,red)";
    if (teststyle.background.length > 0) {
        var startsWithGradient = /^(?:repeating\-)?(?:linear|radial)\-gradient/ig;
        var revdirs = { top: "bottom", bottom: "top", left: "right", right: "left" };
        function gradientWebkitter(style, value, name) {
            if (startsWithGradient.test(value)) {
                var pos = value.indexOf("(to ");
                if (pos > 0) {
                    pos += 4;
                    var posend = value.indexOf(",", pos);
                    var dir = value.slice(pos, posend);
                    dir = dir.split(" ").map(function (v) { return revdirs[v] || v; }).join(" ");
                    value = value.slice(0, pos - 3) + dir + value.slice(posend);
                }
                value = "-webkit-" + value;
            }
            style[name] = value;
        }
        ;
        b.setStyleShim("background", gradientWebkitter);
        b.setStyleShim("backgroundImage", gradientWebkitter);
    }
})(b);
