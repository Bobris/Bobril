/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.media.d.ts"/>
module MediaApp {
    function p(...args: any[]) {
        return { tag: "p", children: args };
    }

    var frame = 0;
    b.init(() => {
        frame++;
        return [
            { tag: "h1", children: "Media detection sample" },
            p(JSON.stringify(b.getMedia())),
            p("Frame: ", ""+frame),
			{ tag: "input" }
        ];
    });
}
