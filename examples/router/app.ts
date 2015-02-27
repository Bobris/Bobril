/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>

module RouterApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    var Page1: IBobrilComponent = {
		id: "Page1",
	    init(ctx: any, me: IBobrilNode) {
		    ctx.ticks = 0;
		    ctx.timer = setInterval(()=>{ ctx.ticks++; b.invalidate(); },1000);
		},
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [h("h3", "Page1"),h("p", "Ticks :"+ctx.ticks)];
        },
		destroy(ctx: any, me: IBobrilNode) {
			clearInterval(ctx.timer);
		}
    }

    var Page2: IBobrilComponent = {
		id: "Page2",
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("h3", "Page2");
        }
    }

    var App: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
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
