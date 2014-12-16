/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
var InputApp;
(function (InputApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    var Page1 = (function () {
        function Page1() {
        }
        Page1.render = function (ctx, me) {
            me.tag = "div";
            me.children = h("h3", "Page1");
        };
        return Page1;
    })();
    var Page2 = (function () {
        function Page2() {
        }
        Page2.render = function (ctx, me) {
            me.tag = "div";
            me.children = h("h3", "Page2");
        };
        return Page2;
    })();
    var App = (function () {
        function App() {
        }
        App.render = function (ctx, me) {
            me.tag = "div";
            me.children = [
                h("h1", "Basic Router sample"),
                h("ul", h("li", b.link(h("a", "Page 1"), "page1")), h("li", b.link(h("a", "Page 2"), "page2"))),
                me.data.activeRouteHandler()
            ];
        };
        return App;
    })();
    b.routes(b.route({ handler: App }, [
        b.route({ name: "page1", handler: Page1 }),
        b.route({ name: "page2", handler: Page2 })
    ]));
})(InputApp || (InputApp = {}));
//# sourceMappingURL=app.js.map