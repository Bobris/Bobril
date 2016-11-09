/// <reference path="jasmine.d.ts"/>

describe("sandbox", () => {
    var root: HTMLDivElement;
    beforeEach(() => {
        root = document.createElement("div");
        root = <HTMLDivElement>document.body.appendChild(root);
    });
    afterEach(() => {
        document.body.removeChild(root);
    });
    it("works", () => {
        root.appendChild(document.createElement("div"));
        expect(root.innerHTML.toLowerCase()).toBe("<div></div>");
    });

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

    it("gradient", () => {
        var s = {};
        gradientWebkitter(s, "linear-gradient(to bottom,red,blue)", "background");
        expect((<any>s)["background"]).toBe("-webkit-linear-gradient(top,red,blue)");
    });
})
