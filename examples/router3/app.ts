/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.promise.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>

module RouterApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    // Text input custom component
    interface IOnChangeData {
        onChange: (value: any) => void;
    }

    interface IOnChangeCtx {
        data: IOnChangeData;
    }

    var OnChangeComponent: IBobrilComponent = {
        onChange(ctx: IOnChangeCtx, v: any): void {
            ctx.data.onChange(v);
        }
    }

    function textInput(value: string, onChange: (value: string) => void): IBobrilNode {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    var needLogin = true;
    function checkAuthorization(tr: IRouteTransition): (boolean | Promise<IRouteTransition>) {
        if (needLogin) {
            // Faking calling API to check if logged in
            return new Promise((resolve, reject) => {
                console.log("Faked call to check if logged in");
                setTimeout(() => {
                    console.log("Ha! We are not logged in.");
                    resolve(b.createRedirectPush("login"));
                }, 1000);
            });
        } else {
            return true;
        }
    }

    var Page1: IBobrilComponent = {
        id: "Page1",
        canActivate: checkAuthorization,
        canDeactivate(ctx: any, transition: IRouteTransition) {
            return ctx.text === "";
        },
        init(ctx: any, me: IBobrilNode) {
            ctx.ticks = 0;
            ctx.timer = setInterval(() => { ctx.ticks++; b.invalidate(); }, 1000);
            ctx.text = "";
        },
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [h("h3", "Page1"), h("p", "Ticks :" + ctx.ticks),
                h("p", "Edit some text :", textInput(ctx.text, (v) => {
                    ctx.text = v
                })),
                h("p", "Nonempty text prevents changing of route")];
        },
        destroy(ctx: any, me: IBobrilNode) {
            clearInterval(ctx.timer);
        }
    }

    var Page2: IBobrilComponent = {
        id: "Page2",
        canActivate: checkAuthorization,
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [h("h3", "Page2")];
        },
        destroy(ctx: any, me: IBobrilNode) {
            clearInterval(ctx.timer);
        }
    }

    interface IPageLoginCtx extends IBobrilCtx {
        loginInProgress: boolean;
    }

    var PageLogin: IBobrilComponent = {
        id: "PageLogin",
        init(ctx: IPageLoginCtx) {
            ctx.loginInProgress = false;
        },
        render(ctx: IPageLoginCtx, me: IBobrilNode) {
            me.tag = "div";
            me.children = [h("h3", "Please Login"), {
                tag: "button", attrs: { disabled: ctx.loginInProgress }, children: "Fake login", component: {
                    onClick: (ctx: IPageLoginCtx) => {
                        b.invalidate();
                        ctx.loginInProgress = true;
                        setTimeout(() => {
                            needLogin = false;
                            ctx.loginInProgress = false;
                            var tr = b.createBackTransition();
                            if (!tr.inApp) {
                                tr = b.createRedirectReplace("root");
                            }
                            b.runTransition(tr);
                        }, 3000);
                        return true;
                    }
                }
            }];
        }
    }

    function onClick(content: IBobrilChildren, action:()=>void): IBobrilNode {
        return { children: content, component: { onClick() { action(); return true; }}};
    }
    
    var App: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                h("h1", "Router sample with login"),
                h("ul",
                    h("li", b.link(h("a", "Page 1 - needs to be logged in"), "page1")),
                    h("li", b.link(h("a", "Page 2 - needs to be logged in"), "page2")),
                    h("li", b.link(h("a", "Login"), "login")),
                    h("li", b.link(h("a", "Bobril - external link"), "https://github.com/bobris/bobril")),
                    h("li", onClick(h("u", "Single Back"), ()=>b.runTransition(b.createBackTransition()))),
                    h("li", onClick(h("u", "Double Back"), ()=>b.runTransition(b.createBackTransition(2))))),
                me.data.activeRouteHandler()
            ];
        }
    }

    b.routes(b.route({ name: "root", url: "/", handler: App }, [
        b.route({ name: "page1", handler: Page1 }),
        b.route({ name: "page2", handler: Page2 }),
        b.route({ name: "login", handler: PageLogin })
    ]));
}
