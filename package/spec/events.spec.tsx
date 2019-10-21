import * as b from "../index";

describe("events", ()=> {
    afterEach(() => {
        b.init(() => undefined);
        b.syncUpdate();
    });

    it("works with classic components", () => {
        interface ICompData {
            value?: number;
        }

        interface ICompCtx extends b.IBobrilCtx<ICompData>
        {
            local: number;
        }

        const Comp = b.createVirtualComponent<ICompData>({
            render(ctx: ICompCtx, me: b.IBobrilNode) {
                ctx.local = ctx.data.value || 0;
                me.tag = "span";
            },

            onFocusOut(ctx: ICompCtx): b.GenericEventResult {
                ctx.local++;
                return true;
            }
        });

        b.init(() => Comp({ value: 42 }));
        b.syncUpdate();
    });
});
