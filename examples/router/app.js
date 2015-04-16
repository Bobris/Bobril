/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
var RouterApp;
(function (RouterApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    var Page1 = {
        id: "Page1",
        init: function (ctx, me) {
            ctx.ticks = 0;
            ctx.timer = setInterval(function () { ctx.ticks++; b.invalidate(); }, 1000);
        },
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [h("h3", "Page1"), h("p", "Ticks :" + ctx.ticks)];
        },
        destroy: function (ctx, me) {
            clearInterval(ctx.timer);
        }
    };
    var Page2 = {
        id: "Page2",
        render: function (ctx, me) {
            me.tag = "div";
            me.children = h("h3", "Page2");
        }
    };
    var App = {
        render: function (ctx, me) {
            me.tag = "div";
            me.children = [
                h("h1", "Basic Router sample"),
                h("ul", h("li", b.link(h("a", "Page 1"), "page1")), h("li", b.link(h("a", "Page 2"), "page2"))),
                me.data.activeRouteHandler()
            ];
        }
    };
    b.routes(b.route({ handler: App }, [
        b.route({ name: "page1", handler: Page1 }),
        b.route({ name: "page2", handler: Page2 })
    ]));
})(RouterApp || (RouterApp = {}));
