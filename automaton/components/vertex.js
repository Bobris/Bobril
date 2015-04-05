var Automata;
(function (Automata) {
    var Components;
    (function (Components) {
        var Vertex;
        (function (Vertex) {
            var Component = {
                render: function (ctx, me, oldMe) {
                    var state = ctx.data.state;
                    me.tag = 'g';
                    me.className = ctx.data.isSelected ? 'vertex selected' : 'vertex';
                    me.children = [
                        {
                            tag: 'circle',
                            className: 'vertex-circle',
                            attrs: {
                                cx: state.point.x,
                                cy: state.point.y,
                                r: 18,
                                fill: state.color
                            }
                        },
                        {
                            tag: 'text',
                            className: 'vertex-text',
                            attrs: {
                                x: state.point.x,
                                y: state.point.y,
                                dy: 4
                            },
                            children: state.name
                        },
                        {
                            tag: 'circle',
                            className: 'vertex-circle-invisible',
                            attrs: {
                                cx: state.point.x,
                                cy: state.point.y,
                                r: 18
                            }
                        }
                    ];
                },
                onClick: function (ctx, event) {
                    if (ctx.data.dragMode === Automata.Models.DragMode.NewEdge) {
                        return true;
                    }
                    ctx.data.stateSelected(ctx.data.state);
                    b.invalidate();
                    return true;
                },
                onPointerDown: function (ctx, event) {
                    if (ctx.data.dragMode === Automata.Models.DragMode.Move) {
                        b.registerMouseOwner(ctx);
                        ctx.downPoint = new Automata.Models.Point(event.x, event.y);
                        return true;
                    }
                    if (ctx.data.dragMode == Automata.Models.DragMode.NewEdge) {
                        ctx.data.newTransition.from = ctx.data.state;
                        b.invalidate();
                        return true;
                    }
                },
                onPointerUp: function (ctx, event) {
                    if (ctx.data.dragMode === Automata.Models.DragMode.Move) {
                        if (b.isMouseOwner(ctx)) {
                            b.releaseMouseOwner();
                        }
                        return true;
                    }
                    if (ctx.data.dragMode == Automata.Models.DragMode.NewEdge) {
                        if (ctx.data.newTransition.from && (ctx.data.newTransition.from !== ctx.data.state || ctx.data.newTransition.firstLeft)) {
                            ctx.data.addTransition();
                            return true;
                        }
                    }
                },
                onPointerMove: function (ctx, event) {
                    if (ctx.data.dragMode === Automata.Models.DragMode.Move) {
                        if (!b.isMouseOwner(ctx)) {
                            return false;
                        }
                        var state = ctx.data.state;
                        var newX = state.point.x + event.x - ctx.downPoint.x;
                        var newY = state.point.y + event.y - ctx.downPoint.y;
                        ctx.downPoint.setCoords(event.x, event.y);
                        var newPoint = new Automata.Models.Point(newX, newY);
                        ctx.data.onMove(state, newPoint);
                        b.invalidate();
                        return true;
                    }
                    if (ctx.data.dragMode === Automata.Models.DragMode.NewEdge) {
                        ctx.data.newTransition.screenPoint = new Automata.Models.Point(event.x, event.y);
                        if (ctx.data.newTransition.from && (ctx.data.newTransition.from !== ctx.data.state || ctx.data.newTransition.firstLeft)) {
                            ctx.data.newTransition.to = ctx.data.state;
                        }
                        else {
                            ctx.data.newTransition.to = null;
                        }
                        b.invalidate();
                        return true;
                    }
                }
            };
            function Get(data) {
                return { component: Component, data: data };
            }
            Vertex.Get = Get;
        })(Vertex = Components.Vertex || (Components.Vertex = {}));
    })(Components = Automata.Components || (Automata.Components = {}));
})(Automata || (Automata = {}));
