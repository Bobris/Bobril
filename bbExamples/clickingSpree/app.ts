import * as b from 'bobril';

const buttonStyle = b.styleDef({
    border: "1px solid black",
    padding: "10px 5px",
    userSelect: "none"
});

interface IButtonData {
    children?: b.IBobrilChildren;
    action: () => void;
}

class ButtonCtx extends b.BobrilCtx<IButtonData> {
}

let gLog: string[] = [];

const Button = b.createComponent({
    ctxClass: ButtonCtx,
    render(ctx: ButtonCtx, me: b.IBobrilNode) {
        b.style(me, buttonStyle);
        me.children = ctx.data.children;
    },
    onClick(ctx: ButtonCtx, ev: b.IBobrilMouseEvent): boolean {
        gLog.push("Button Clicked Count:" + ev.count);
        if (ev.count == 1) ctx.data.action();
        return true;
    },

    onDoubleClick(ctx: ButtonCtx): boolean {
        gLog.push("Button Double Clicked");
        return true;
    }

})
b.routes(b.route({
    handler: (data) => {
        let h = data.activeRouteHandler;
        return [
            h ? h() : null,
            b.styledDiv(gLog.map(s => b.styledDiv(s)))
        ]
    }
}, [
        b.route({
            name: "a", handler: () => {
                return Button({
                    action: () => {
                        b.runTransition(b.createRedirectPush("b"));
                    }
                }, "A")
            }
        }),
        b.route({
            name: "b", handler: () => {
                return Button({
                    action: () => {
                        b.runTransition(b.createRedirectPush("a"));
                    }
                }, "B")
            }
        }),
        b.routeDefault({
            handler: {
                canActivate(transition: b.IRouteTransition): b.IRouteCanResult {
                    return b.createRedirectReplace("a");
                }
            }
        })
    ]
));
