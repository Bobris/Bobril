import * as b from "../index";

describe("ctxClass", () => {
    it("works with never as TData", () => {
        class SampleCtx extends b.BobrilCtx<never> {
            counter = 0;
        }

        const create = b.createVirtualComponent<never>({
            ctxClass: SampleCtx,
            render(ctx: SampleCtx, me: b.IBobrilNode) {
                ctx.counter++;
                me.tag = "span";
                me.children = "Hello";
            }
        });

        b.init(() => create());
        b.syncUpdate();
        expect(document.body.innerText).toContain("Hello");
        b.init(() => undefined);
        b.syncUpdate();
    });
});
