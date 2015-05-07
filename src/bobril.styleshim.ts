/// <reference path="bobril.d.ts"/>

((b: IBobrilStatic) => {
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
                    dir = dir.split(" ").map(v=> revdirs[v] || v).join(" ");
                    value = (<string>value).slice(0, pos - 3) + dir + (<string>value).slice(posend);
                }
                value = "-webkit-" + value;
            }
            style[name] = value;
        };
        b.setStyleShim("background", gradientWebkitter);
        b.setStyleShim("backgroundImage", gradientWebkitter);
    }
})(b);
