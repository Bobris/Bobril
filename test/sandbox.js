/// <reference path="jasmine.d.ts"/>
describe("sandbox", function () {
    var root;
    beforeEach(function () {
        root = document.createElement("div");
        root = document.body.appendChild(root);
    });
    afterEach(function () {
        document.body.removeChild(root);
    });
    it("works", function () {
        root.appendChild(document.createElement("div"));
        expect(root.innerHTML.toLowerCase()).toBe("<div></div>");
    });
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
    it("gradient", function () {
        var s = {};
        gradientWebkitter(s, "linear-gradient(to bottom,red,blue)", "background");
        expect(s["background"]).toBe("-webkit-linear-gradient(top,red,blue)");
    });
});
