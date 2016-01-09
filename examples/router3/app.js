/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.promise.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
var RouterApp;
(function (RouterApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    var OnChangeComponent = {
        onChange: function (ctx, v) {
            ctx.data.onChange(v);
        }
    };
    function textInput(value, onChange) {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }
    var needLogin = true;
    function checkAuthorization(tr) {
        if (needLogin) {
            // Faking calling API to check if logged in
            return new Promise(function (resolve, reject) {
                console.log("Faked call to check if logged in");
                setTimeout(function () {
                    console.log("Ha! We are not logged in.");
                    resolve(b.createRedirectPush("login"));
                }, 1000);
            });
        }
        else {
            return true;
        }
    }
    var Page1 = {
        id: "Page1",
        canActivate: checkAuthorization,
        canDeactivate: function (ctx, transition) {
            return ctx.text === "";
        },
        init: function (ctx, me) {
            ctx.ticks = 0;
            ctx.timer = setInterval(function () { ctx.ticks++; b.invalidate(); }, 1000);
            ctx.text = "";
        },
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [h("h3", "Page1"), h("p", "Ticks :" + ctx.ticks),
                h("p", "Edit some text :", textInput(ctx.text, function (v) {
                    ctx.text = v;
                })),
                h("p", "Nonempty text prevents changing of route")];
        },
        destroy: function (ctx, me) {
            clearInterval(ctx.timer);
        }
    };
    var Page2 = {
        id: "Page2",
        canActivate: checkAuthorization,
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [h("h3", "Page2")];
        },
        destroy: function (ctx, me) {
            clearInterval(ctx.timer);
        }
    };
    var PageLogin = {
        id: "PageLogin",
        init: function (ctx) {
            ctx.loginInProgress = false;
        },
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [h("h3", "Please Login"), {
                    tag: "button", attrs: { disabled: ctx.loginInProgress }, children: "Fake login", component: {
                        onClick: function (ctx) {
                            b.invalidate();
                            ctx.loginInProgress = true;
                            setTimeout(function () {
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
    };
    function onClick(content, action) {
        return { children: content, component: { onClick: function () { action(); return true; } } };
    }
    var App = {
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [
                h("h1", "Router sample with login"),
                h("ul", h("li", b.link(h("a", "Page 1 - needs to be logged in"), "page1")), h("li", b.link(h("a", "Page 2 - needs to be logged in"), "page2")), h("li", b.link(h("a", "Login"), "login")), h("li", b.link(h("a", "Bobril - external link"), "https://github.com/bobris/bobril")), h("li", onClick(h("u", "Single Back"), function () { return b.runTransition(b.createBackTransition()); })), h("li", onClick(h("u", "Double Back"), function () { return b.runTransition(b.createBackTransition(2)); }))),
                me.data.activeRouteHandler()
            ];
        }
    };
    b.routes(b.route({ name: "root", url: "/", handler: App }, [
        b.route({ name: "page1", handler: Page1 }),
        b.route({ name: "page2", handler: Page2 }),
        b.route({ name: "login", handler: PageLogin })
    ]));
})(RouterApp || (RouterApp = {}));
