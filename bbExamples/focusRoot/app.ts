import * as b from "../../package/index";

interface ITextInputCtx extends b.IBobrilCtx {
    v: b.IProp<string>;
}

let textInput = b.createVirtualComponent({
    init(ctx: ITextInputCtx) {
        ctx.v = b.prop("", () => { b.invalidate(ctx) });
    },
    render(ctx: ITextInputCtx, me: b.IBobrilNode) {
        me.tag = "input";
        me.attrs = { type: "text", value: ctx.v };
        b.style(me, { width: "100%" });
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
    let myself = b.addRoot(() => ({
        tag: "div",
        style: { position: "relative", top: 10, left: 10, width: 200, height: 100, background: "#eee", padding: 5 },
        children: [
            textInput(),
            textInput(),
            button({ action: () => { b.removeRoot(myself); } }, "Close"),
            button({
                action: () => {
                    createDialog();
                }
            }, "Dialog")
        ],
        component: {
            init(ctx: b.IBobrilCtx) {
                b.registerFocusRoot(ctx);
            }
        }
    }));
}

b.init(() => {
    return [
        textInput(),
        textInput(),
        button({
            action: () => {
                createDialog();
            }
        }, "Dialog")
    ];
});