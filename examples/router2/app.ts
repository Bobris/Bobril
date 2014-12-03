/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>

module InputApp {
    function h(tag: string, ...args: any[]) {
        return { tag: tag, children: args };
    }

    function a(node: IBobrilNode, prop: string, value: any): IBobrilNode {
        var attrs = node.attrs;
        if (!attrs) {
            attrs = {};
            node.attrs = attrs;
        }
        attrs[prop] = value;
        return node;
    }

    var planetData = [
        { name: "Venus", image: "http://photojournal.jpl.nasa.gov/jpegMod/PIA00104_modest.jpg" },
        { name: "Earth", image: "http://solarsystem.nasa.gov/multimedia/gallery/VIIRS_4Jan2012_br.jpg" },
        { name: "Mars", image: "http://mars.jpl.nasa.gov/images/PIA02653-br2.jpg" }
    ];

    class About implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                h("h3", "About"),
                h("p", "This sample shows notFound and default handlers for Routing"),
                h("div", a(h("a", "invalid link"), "href", "#/boring")),
                h("div", a(h("a", "invalid planet"), "href", "#/planet/Unknownia"))
            ];
        }
    }

    class Empty implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "Welcome");
        }
    }

    class NotFound implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "This page does not exist please continue by clicking links above");
        }
    }

    class SelectPlanet implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "Select planet to show on left");
        }
    }

    class PlanetList implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "table";
            me.children = a(h("tr", [
                h("td", [
                    ctx.data.planets.map((planet: { name: string }) => {
                        return h("div", b.link(h("a", planet.name), "planet", { name: planet.name }));
                    })
                ]),
                h("td", me.data.activeRouteHandler())
            ]), "style", "vertical-align:top");
        }
    }

    class PlanetImage implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            var name = ctx.data.routeParams.name;
            var planet: { image: string } = null;
            for (var i = 0; i < planetData.length; i++) {
                if (planetData[i].name == name) planet = planetData[i];
            }
            if (planet) {
                me.tag = "img";
                me.attrs = {
                    style: { width: "20em" },
                    src: planet.image
                };
            } else {
                me.tag = "div";
                me.children = h("p", "Don't have image of " + name);
            }
        }
    }

    class App implements IBobrilComponent {
        static render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                h("h1", "Advanced Router sample"),
                h("ul",
                    h("li", b.link(h("a", "About"), "about")),
                    h("li", b.link(h("a", "Planets"), "planets"))),
                me.data.activeRouteHandler()
            ];
        }
    }

    b.routes(b.route({ handler: App }, [
        b.route({ name: "planets", data: { planets: planetData }, handler: PlanetList }, [
            b.route({ name: "planet", url: "/planet/:name", handler: PlanetImage }),
            b.routeDefault({ handler: SelectPlanet })
        ]),
        b.route({ name: "about", handler: About }),
        b.routeDefault({ handler: Empty }),
        b.routeNotFound({ name: "notFound", handler: NotFound })
    ]));
}
