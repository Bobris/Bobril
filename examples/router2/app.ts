/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>

module Router2App {
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

    var About: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = [
                h("h3", "About"),
                h("p", "This sample shows notFound and default handlers for Routing"),
                h("div", a(h("a", "invalid link"), "href", "#/boring")),
                h("div", a(h("a", "invalid planet"), "href", "#/planet/Unknownia"))
            ];
        }
    }

    var Empty: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "Welcome");
        }
    }

    var NotFound: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "This page does not exist please continue by clicking links above");
        }
    }

    var SelectPlanet: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            me.children = h("p", "Select planet to show on left");
        }
    }

    enum AnimState {
        New,
        WaitingForCreating,
        Creating,
        Showing,
        WaitingForHiding,
        Hiding,
        Hidden,
        Garbage
    }

    function isHiddenAnimState(state: AnimState) {
        return state === AnimState.New || state === AnimState.WaitingForCreating || state === AnimState.Hidden || state === AnimState.Garbage;
    }

    function isStableAnimState(state: AnimState) {
        return state === AnimState.Showing || state === AnimState.WaitingForHiding;
    }

    interface IAnimItem {
        node: IBobrilNode;
        animCtx: { state: AnimState; live: boolean; lastChange: number; value?: number; };
        nodeClone?: IBobrilNode;
    }


    var transitionGroupComp: IBobrilComponent = {
        id: "TransitionGroup",
        init(ctx: any, me: IBobrilNode): void {
            ctx.list = <any>[];
        },
        render(ctx: any, me: IBobrilNode, oldMe: IBobrilCacheNode): void {
            var curNodes = <IBobrilNode[]>me.children;
            if (curNodes == null) curNodes = <IBobrilNode[]>[];
            else if (!b.isArray(curNodes)) curNodes = <any>[curNodes];
            function build(node: IBobrilNode, rootCtx: any, animCtx: any) {
                node = <any>b.assign({}, node);
                b.postEnhance(node, {
                    render(ctx: any, me: IBobrilNode, oldMe: IBobrilCacheNode) {
                        me.style = me.style || {};
                        if (!animCtx.live) {
                            me.style.position = "absolute";
                            me.style.top = "0";
                            me.style.left = "0";
                        }
                        if (isStableAnimState(animCtx.state)) {
                            return;
                        }
                        if (isHiddenAnimState(animCtx.state)) {
                            me.style.visibility = "hidden";
                            return;
                        }
                        me.style.opacity = "" + animCtx.value;
                    }
                });
                return node;
            }

            var list = <IAnimItem[]>ctx.list;
            var i: number;
            for (i = 0; i < list.length; i++) {
                list[i].animCtx.live = false;
            }
            for (i = 0; i < curNodes.length; i++) {
                var curNode = curNodes[i];
                var curKey = curNode.key;
                var j = 0;
                for (; j < list.length; j++) {
                    if (list[j].node.key === curKey) {
                        list[j].node = build(curNode, ctx, list[j].animCtx);
                        list[j].animCtx.live = true;
                        break;
                    }
                }
                if (j === list.length) {
                    list.push({ node: null, animCtx: { state: AnimState.New, live: true, lastChange: b.uptime() } });
                    list[j].node = build(curNode, ctx, list[j].animCtx);
                }
            }
            for (i = 0; i < list.length; i++) {
                var a = list[i].animCtx;
                if (a.state === AnimState.New) {
                    if (a.live) {
                        a.state = AnimState.Creating;
                    } else {
                        a.state = AnimState.Garbage;
                    }
                }
                else if (a.state === AnimState.WaitingForCreating && !a.live) {
                    a.state = AnimState.Garbage;
                }
                else if (a.state === AnimState.Showing && !a.live) {
                    a.state = AnimState.Hiding;
                    a.lastChange = b.uptime();
                }
                else if (a.state === AnimState.Creating) {
                    a.value = (b.uptime() - a.lastChange) / 3000;
                    if (a.live) {
                        if (a.value > 1) {
                            a.state = AnimState.Showing;
                        }
                    } else {
                        a.lastChange = b.uptime() - (1 - a.value) * 3000;
                        a.state = AnimState.Hiding;
                    }
                }
                else if (a.state === AnimState.WaitingForHiding && a.live) {
                    a.state = AnimState.Showing;
                }
                else if (a.state === AnimState.Hiding) {
                    a.value = 1 - (b.uptime() - a.lastChange) / 3000;
                    if (a.live) {
                        a.state = AnimState.Creating;
                        a.lastChange = b.uptime() - a.value * 3000;
                    } else {
                        if (a.value < 0) {
                            a.state = AnimState.Garbage;
                        }
                    }
                }
                if (a.state === AnimState.Garbage) {
                    list.splice(i, 1);
                    i--;
                    continue;
                }
                if (!isStableAnimState(a.state)) {
                    b.invalidate();
                }

                if (a.live) {
                    list[i].nodeClone = b.cloneNode(list[i].node);
                } else {
                    list[i].node = b.cloneNode(list[i].nodeClone);
                }
            }
            me.children = list.map((item: any) => item.node);
        }
    };

    function relativeTransitionGroup(node: IBobrilNode): IBobrilNode {
        return { tag: "div", style: { position: "relative" }, children: node, component: transitionGroupComp };
    }

    var PlanetList: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "table";
            me.children = h("tr", [
                h("td", [
                    ctx.data.planets.map((planet: { name: string }) => {
                        return h("div", b.link(h("a", planet.name), "planet", { name: planet.name }));
                    })
                ]),
                h("td", relativeTransitionGroup(me.data.activeRouteHandler()))
            ]);
            (<IBobrilNode>me.children).style = { verticalAlign: "top" };
        }
    }

    var PlanetImage: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            var name = ctx.data.routeParams.name;
            var planet: { image: string } = null;
            for (var i = 0; i < planetData.length; i++) {
                if (planetData[i].name === name) planet = planetData[i];
            }
            if (planet) {
                me.tag = "img";
                me.style = { height: "auto", width: "20em" }; // < order of styles matter!
                me.attrs = {
                    src: planet.image
                };
            } else {
                me.tag = "div";
                me.children = h("p", "Don't have image of " + name);
            }
        }
    }

    var App: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
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
            b.route({ name: "planet", url: "/planet/:name", handler: PlanetImage, keyBuilder(p: Params) { return p["name"]; } }),
            b.routeDefault({ handler: SelectPlanet })
        ]),
        b.route({ name: "about", handler: About }),
        b.routeDefault({ handler: Empty }),
        b.routeNotFound({ name: "notFound", handler: NotFound })
    ]));
}
