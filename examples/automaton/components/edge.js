var Automata;
(function (Automata) {
    var Components;
    (function (Components) {
        var Edge;
        (function (Edge) {
            function getStandardPath(transition) {
                var fromPoint = transition.from.point;
                var toPoint = transition.to.point;
                var midPoint = transition.midPoint;
                var vectFromTo = new Automata.Models.Vector(fromPoint, toPoint);
                var fromTo = vectFromTo.getLength();
                var fromMid = new Automata.Models.Vector(fromPoint, midPoint).getLength();
                var midTo = new Automata.Models.Vector(midPoint, toPoint).getLength();
                if (Math.abs(fromMid + midTo - fromTo) < 0.001) {
                    return "M" + fromPoint + "L" + toPoint;
                }
                else {
                    var scale = fromTo / (fromMid + midTo) / 2;
                    var c1 = new Automata.Models.Point(midPoint.x, midPoint.y).addVector(vectFromTo, -fromMid * scale / fromTo);
                    var c2 = new Automata.Models.Point(midPoint.x, midPoint.y).addVector(vectFromTo, midTo * scale / fromTo);
                    return "M" + fromPoint + "Q" + c1 + "," + midPoint + "Q" + c2 + "," + toPoint;
                }
            }
            function getLoopPath(transition) {
                var fromPoint = transition.from.point;
                var midPoint = transition.midPoint;
                var perpendicuar = new Automata.Models.Vector(fromPoint, midPoint).getPerpendicular();
                var c1 = new Automata.Models.Point(midPoint.x, midPoint.y).addVector(perpendicuar, -0.4);
                var c2 = new Automata.Models.Point(midPoint.x, midPoint.y).addVector(perpendicuar, 0.4);
                return "M" + fromPoint + "Q" + c1 + "," + midPoint + "Q" + c2 + "," + fromPoint;
            }
            function getEdgePath(transition) {
                return transition.isLoop() ? getLoopPath(transition) : getStandardPath(transition);
            }
            function getEdgeLine(className, d) {
                return {
                    tag: 'path',
                    className: className,
                    style: {
                        markerEnd: 'url(#arrow)'
                    },
                    attrs: { d: d }
                };
            }
            function getEdgeLines(transition) {
                var d = getEdgePath(transition);
                return [
                    getEdgeLine('edge-line', d),
                    getEdgeLine('edge-invisible', d)
                ];
            }
            var Component = {
                render: function (ctx, me, oldMe) {
                    var transition = ctx.data.transition;
                    me.tag = 'g';
                    me.className = ctx.data.isSelected ? 'edge selected' : 'edge';
                    me.children = [
                        getEdgeLines(transition),
                        Components.MidPoint.Get({
                            midPoint: transition.midPoint,
                            resetMidPoint: function () { return transition.resetMidPoint(); },
                            moveMidPoint: function (point) { return transition.moveMidPoint(point); }
                        }),
                        Components.EdgeText.Get({ transition: transition })
                    ];
                },
                onClick: function (ctx, event) {
                    ctx.data.transitionSelected(ctx.data.transition);
                    b.invalidate();
                    return true;
                }
            };
            function Get(data) {
                return { component: Component, data: data };
            }
            Edge.Get = Get;
        })(Edge = Components.Edge || (Components.Edge = {}));
    })(Components = Automata.Components || (Automata.Components = {}));
})(Automata || (Automata = {}));
