/// <reference path="../../src/bobril.d.ts"/>
module BasicApp {
    function p(...args: any[]) {
        return { tag: "p", children: args };
    }

    b.init(() => {
        b.invalidate();
        return [
            { tag: "h1", children: "First Bobril sample" },
            p("I know, it is a little bit simplistic, but it is a start"),
            p(b.ieVersion() ? <any>("Your IE has version " + b.ieVersion()) : "You are lucky guy without IE"),
            p("Uptime: ", b.uptime().toFixed(0), "ms Frame: ", "" + b.frame(), " Frame duration:"+b.lastFrameDuration()," ms FPS:", (b.frame() * 1000 / b.uptime()).toFixed(1))
        ];
    });
}
