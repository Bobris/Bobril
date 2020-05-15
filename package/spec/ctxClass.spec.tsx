import * as b from "../index";

describe("ctxClass", () => {
    it("works with {} as TData (never does not work in TS 3.9)", () => {
        class SampleCtx extends b.BobrilCtx<{}> {
            counter = 0;
        }

        const create = b.createVirtualComponent<{}>({
            ctxClass: SampleCtx,
            render(ctx: SampleCtx, me: b.IBobrilNode) {
                ctx.counter++;
                me.tag = "span";
                me.children = "Hello";
            },
        });

        b.init(() => create());
        b.syncUpdate();
        expect(document.body.innerText).toContain("Hello");
        b.init(() => undefined);
        b.syncUpdate();
    });
});
