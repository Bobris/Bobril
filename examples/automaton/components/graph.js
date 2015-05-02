var Automata;
(function (Automata) {
    var Components;
    (function (Components) {
        var Graph;
        (function (Graph) {
            function getMarker(id, refx) {
                return {
                    tag: 'marker',
                    attrs: {
                        id: id,
                        markerWidth: '30',
                        markerHeight: '30',
                        refX: refx,
                        refY: '4',
                        orient: 'auto',
                        markerUnits: 'userSpaceOnUse'
                    },
                    children: {
                        tag: 'path',
                        attrs: {
                            d: 'M0,0 L0,9 L11,4 L0,0'
                        }
                    }
                };
            }
            function getEdges(transitions, selectedTransition, transitionSelected) {
                if (!transitions || !transitions.length) {
                    return null;
                }
                return transitions.map(function (transition) {
                    return Components.Edge.Get({
                        transition: transition,
                        transitionSelected: transitionSelected,
                        isSelected: selectedTransition === transition
                    });
                });
            }
            function getStandard(rect, transition) {
                var scr = transition.screenPoint;
                var trTo = transition.to ? transition.to.point : new Automata.Models.Point(scr.x - rect.left, scr.y - rect.top);
                transition.midPoint = null;
                return "M" + transition.from.point + "L" + trTo;
            }
            function getLoop(rect, transition) {
                var from = transition.from.point;
                var scr = transition.screenPoint;
                var vect = new Automata.Models.Vector(from, new Automata.Models.Point(scr.x - rect.left, scr.y - rect.top));
                var dist = vect.getLength();
                var point = new Automata.Models.Point(from.x, from.y).addVector(vect, 60 / dist);
                var perpendicuar = new Automata.Models.Vector(from, point).getPerpendicular();
                var c1 = new Automata.Models.Point(point.x, point.y).addVector(perpendicuar, -0.4);
                var c2 = new Automata.Models.Point(point.x, point.y).addVector(perpendicuar, 0.4);
                transition.midPoint = point;
                return "M" + from + "Q" + c1 + "," + point + "Q" + c2 + "," + from;
            }
            function getNewEdge(rect, transition) {
                if (!transition || !transition.from) {
                    return null;
                }
                var url = transition.to ? '' : '-new-line';
                return {
                    tag: 'path',
                    className: 'new-line',
                    attrs: {
                        d: transition.isLoop() ? getLoop(rect, transition) : getStandard(rect, transition)
                    },
                    style: { markerEnd: 'url(#arrow' + url + ')' }
                };
            }
            function getVertices(ctx, onMove, addTransition, stateSelected) {
                var states = ctx.data.automaton.states;
                if (!states || !states.length) {
                    return null;
                }
                return states.map(function (state) {
                    return Components.Vertex.Get({
                        state: state,
                        onMove: onMove,
                        addTransition: addTransition,
                        stateSelected: stateSelected,
                        newTransition: ctx.newTransition,
                        dragMode: ctx.dragMode,
                        isSelected: ctx.selectedState == state
                    });
                });
            }
            function addTransition(ctx) {
                var tr = ctx.newTransition;
                if (tr && tr.from && tr.to) {
                    var transition = ctx.data.automaton.addTransition(tr.from, tr.to, tr.midPoint);
                    ctx.selectedTransition = transition;
                    ctx.selectedState = null;
                    b.invalidate();
                }
            }
            var Component = {
                init: function (ctx, me) {
                    ctx.dragMode = Automata.Models.DragMode.Move;
                    b.invalidate();
                },
                render: function (ctx, me, oldMe) {
                    var automaton = ctx.data.automaton;
                    me.tag = 'svg';
                    me.attrs = { tabindex: 0 };
                    me.style = { width: '100%', height: '100%', outline: 'none' };
                    me.children = [
                        getEdges(automaton.transitions, ctx.selectedTransition, function (transition) { ctx.selectedTransition = transition; ctx.selectedState = null; }),
                        getNewEdge(ctx.rectangle, ctx.newTransition),
                        getVertices(ctx, function (state, toPoint) { return automaton.moveState(state, toPoint); }, function () { return addTransition(ctx); }, function (state) { ctx.selectedState = state; ctx.selectedTransition = null; }),
                        {
                            tag: 'defs',
                            children: [
                                getMarker('arrow', '28'),
                                getMarker('arrow-new-line', '10')
                            ]
                        }
                    ];
                },
                onClick: function (ctx, event) {
                    if (ctx.dragMode === Automata.Models.DragMode.NewEdge) {
                        return true;
                    }
                    ctx.selectedState = null;
                    ctx.selectedTransition = null;
                    b.invalidate();
                    return true;
                },
                onDoubleClick: function (ctx, event) {
                    var automaton = ctx.data.automaton;
                    var state = automaton.addState(new Automata.Models.Point(event.x - ctx.rectangle.left, event.y - ctx.rectangle.top));
                    ctx.selectedState = state;
                    ctx.selectedTransition = null;
                    b.invalidate();
                    return true;
                },
                postInitDom: function (ctx, me, element) {
                    if (element.focus) {
                        element.focus();
                    }
                },
                postUpdateDom: function (ctx, me, element) {
                    ctx.rectangle = element.getBoundingClientRect();
                    if (b.ieVersion() === undefined) {
                        return;
                    }
                    var defs = element.getElementsByTagName('defs')[0];
                    element.removeChild(defs);
                    element.appendChild(defs);
                },
                onPointerMove: function (ctx, event) {
                    if (ctx.dragMode === Automata.Models.DragMode.NewEdge) {
                        ctx.newTransition.to = null;
                        ctx.newTransition.screenPoint = new Automata.Models.Point(event.x, event.y);
                        if (ctx.newTransition.from) {
                            ctx.newTransition.firstLeft = true;
                        }
                        b.invalidate();
                        return true;
                    }
                    return false;
                },
                onPointerUp: function (ctx, event) {
                    if (ctx.dragMode === Automata.Models.DragMode.NewEdge) {
                        ctx.newTransition.from = null;
                    }
                    return true;
                },
                onKeyDown: function (ctx, event) {
                    if (event.ctrl && ctx.dragMode === Automata.Models.DragMode.Move) {
                        ctx.dragMode = Automata.Models.DragMode.NewEdge;
                        ctx.newTransition = new Automata.Models.NewTransition(null, null);
                        b.invalidate();
                    }
                    return true;
                },
                onKeyUp: function (ctx, event) {
                    if (!event.ctrl && ctx.dragMode === Automata.Models.DragMode.NewEdge) {
                        ctx.dragMode = Automata.Models.DragMode.Move;
                        ctx.newTransition = null;
                        b.invalidate();
                    }
                    if (event.which === 46) {
                        if (ctx.selectedState) {
                            ctx.data.automaton.removeState(ctx.selectedState);
                            b.invalidate();
                        }
                        if (ctx.selectedTransition) {
                            ctx.data.automaton.removeTransition(ctx.selectedTransition);
                            b.invalidate();
                        }
                    }
                    return true;
                }
            };
            function Get(data) {
                return { component: Component, data: data };
            }
            Graph.Get = Get;
        })(Graph = Components.Graph || (Components.Graph = {}));
    })(Components = Automata.Components || (Automata.Components = {}));
})(Automata || (Automata = {}));
