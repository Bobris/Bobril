import * as b from "../../package/index";

interface ITextInputCtx extends b.IBobrilCtx {
    v: b.IProp<string>;
}

let textInput = b.createVirtualComponent({
    init(ctx: ITextInputCtx) {
        ctx.v = b.prop("", () => {
            b.invalidate(ctx);
        });
    },
    render(ctx: ITextInputCtx, me: b.IBobrilNode) {
        me.tag = "input";
        me.attrs = { type: "text", value: ctx.v };
        b.style(me, { minWidth: "100% !important" });
    }
});

interface IButtonData {
    children?: b.IBobrilChildren;
    action: () => void;
}

interface IButtonCtx extends b.IBobrilCtx {
    data: IButtonData;
}

let button = b.createVirtualComponent<IButtonData>({
    render(ctx: IButtonCtx, me: b.IBobrilNode) {
        me.tag = "button";
        me.children = ctx.data.children;
    },
    onClick(ctx: IButtonCtx): boolean {
        ctx.data.action();
        return true;
    }
});

function createDialog() {
    let dialogctx: b.IBobrilCtx;
    let lastChild: string;
    let myself = b.addRoot(() => ({
        component: {
            init(ctx: b.IBobrilCtx) {
                dialogctx = ctx;
                b.registerFocusRoot(ctx);
            },
            render(ctx: b.IBobrilCtx, me: b.IBobrilNode) {
                me.tag = "div";
                me.style = {
                    position: "relative",
                    top: 10,
                    left: 10,
                    width: 200,
                    height: 100,
                    background: "#eee",
                    padding: 5
                };
                me.children = [
                    "Frame: " + b.frame(),
                    textInput(),
                    textInput(),
                    button(
                        {
                            action: () => {
                                b.removeRoot(myself);
                            }
                        },
                        "Close"
                    ),
                    button(
                        {
                            action: () => {
                                b.invalidate(dialogctx, 0);
                            }
                        },
                        "Invalidate"
                    ),
                    button(
                        {
                            action: () => {
                                b.invalidate(dialogctx);
                            }
                        },
                        "Deep Invalidate"
                    ),
                    button(
                        {
                            action: () => {
                                b.invalidate();
                            }
                        },
                        "Root Invalidate"
                    ),
                    button(
                        {
                            action: () => {
                                lastChild = createDialog();
                            }
                        },
                        "Dialog"
                    )
                ];
                if (b.getRoots()[lastChild] != null) b.updateRoot(lastChild);
            }
        }
    }));
    return myself;
}

b.init(() => {
    return [
        "Frame: " + b.frame(),
        textInput(),
        textInput(),
        button(
            {
                action: () => {
                    createDialog();
                }
            },
            "Dialog"
        )
    ];
});
