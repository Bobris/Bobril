/// <reference path="../../src/bobril.d.ts"/>
module InputApp {
    function p(...args: any[]) {
        return { tag: "p", children: args };
    }

    var frame = 0;
    var value = "Change this";

    class MyInput implements IBobrilComponent {
        static onChange(ctx: Object, v: string) {
            value = v;
            b.invalidate();
        }
    }

    b.init(() => {
        frame++;
        return [
            { tag: "h1", children: "Input Bobril sample" },
            { tag: "input", attrs: { value: value }, component: MyInput },
            p("Entered: " + value),
            p("Frame: ", frame)
        ];
    });
}
