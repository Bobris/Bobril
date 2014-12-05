/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>

module InputApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    class Page1 implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("h3", "Page1");
        }
    }

    class Page2 implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("h3", "Page2");
        }
    }

    class App implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                h("h1", "Basic Router sample"),
                h("ul",
                    h("li", b.link(h("a", "Page 1"), "page1")),
                    h("li", b.link(h("a", "Page 2"), "page2"))),
                me.data.activeRouteHandler()
            ];
        }
    }

    b.routes(b.route({ handler: App }, [
        b.route({ name: "page1", handler: Page1 }),
        b.route({ name: "page2", handler: Page2 })
    ]));
}
