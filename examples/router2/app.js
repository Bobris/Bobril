/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
var InputApp;
(function (InputApp) {
    function h(tag) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        return { tag: tag, children: args };
    }

    function a(node, prop, value) {
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

    var About = (function () {
        function About() {
        }
        About.render = function (ctx, me) {
            me.tag = "div";
            me.children = [
                h("h3", "About"),
                h("p", "This sample shows notFound and default handlers for Routing"),
                h("div", a(h("a", "invalid link"), "href", "#/boring")),
                h("div", a(h("a", "invalid planet"), "href", "#/planet/Unknownia"))
            ];
        };
        return About;
    })();

    var Empty = (function () {
        function Empty() {
        }
        Empty.render = function (ctx, me) {
            me.tag = "div";
            me.children = h("p", "Welcome");
        };
        return Empty;
    })();

    var NotFound = (function () {
        function NotFound() {
        }
        NotFound.render = function (ctx, me) {
            me.tag = "div";
            me.children = h("p", "This page does not exist please continue by clicking links above");
        };
        return NotFound;
    })();

    var SelectPlanet = (function () {
        function SelectPlanet() {
        }
        SelectPlanet.render = function (ctx, me) {
            me.tag = "div";
            me.children = h("p", "Select planet to show on left");
        };
        return SelectPlanet;
    })();

    var PlanetList = (function () {
        function PlanetList() {
        }
        PlanetList.render = function (ctx, me) {
            me.tag = "table";
            me.children = a(h("tr", [
                h("td", [
                    ctx.data.planets.map(function (planet) {
                        return h("div", b.link(h("a", planet.name), "planet", { name: planet.name }));
                    })
                ]),
                h("td", me.data.activeRouteHandler())
            ]), "style", "vertical-align:top");
        };
        return PlanetList;
    })();

    var PlanetImage = (function () {
        function PlanetImage() {
        }
        PlanetImage.render = function (ctx, me) {
            var name = ctx.data.routeParams.name;
            var planet = null;
            for (var i = 0; i < planetData.length; i++) {
                if (planetData[i].name == name)
                    planet = planetData[i];
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
        };
        return PlanetImage;
    })();

    var App = (function () {
        function App() {
        }
        App.render = function (ctx, me) {
            me.tag = "div";
            me.children = [
                h("h1", "Advanced Router sample"),
                h("ul", h("li", b.link(h("a", "About"), "about")), h("li", b.link(h("a", "Planets"), "planets"))),
                me.data.activeRouteHandler()
            ];
        };
        return App;
    })();

    b.routes(b.route({ handler: App }, [
        b.route({ name: "planets", data: { planets: planetData }, handler: PlanetList }, [
            b.route({ name: "planet", url: "/planet/:name", handler: PlanetImage }),
            b.routeDefault({ handler: SelectPlanet })
        ]),
        b.route({ name: "about", handler: About }),
        b.routeDefault({ handler: Empty }),
        b.routeNotFound({ name: "notFound", handler: NotFound })
    ]));
})(InputApp || (InputApp = {}));
//# sourceMappingURL=app.js.map
