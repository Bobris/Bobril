module Automata.Components.Edge {
    function getStandardPath(transition: Models.Transition): string {
        var fromPoint: Models.Point = transition.from.point;
        var toPoint: Models.Point = transition.to.point;
        var midPoint: Models.Point = transition.midPoint;

        var vectFromTo: Models.Vector = new Models.Vector(fromPoint, toPoint);
        var fromTo: number = vectFromTo.getLength();
        var fromMid: number = new Models.Vector(fromPoint, midPoint).getLength();
        var midTo: number = new Models.Vector(midPoint, toPoint).getLength();
        if (Math.abs(fromMid + midTo - fromTo) < 0.001) {
            return `M${fromPoint}L${toPoint}`;
        } else {
            var scale: number = fromTo / (fromMid + midTo) / 2;
            var c1: Models.Point = new Models.Point(midPoint.x, midPoint.y).addVector(vectFromTo, -fromMid * scale / fromTo);
            var c2: Models.Point = new Models.Point(midPoint.x, midPoint.y).addVector(vectFromTo, midTo * scale / fromTo);
            return `M${fromPoint}Q${c1},${midPoint}Q${c2},${toPoint}`;
        }
    }

    function getLoopPath(transition: Models.Transition): string {
        var fromPoint: Models.Point = transition.from.point;
        var midPoint: Models.Point = transition.midPoint;
        var perpendicuar: Models.Vector = new Models.Vector(fromPoint, midPoint).getPerpendicular();
        var c1: Models.Point = new Models.Point(midPoint.x, midPoint.y).addVector(perpendicuar, -0.4);
        var c2: Models.Point = new Models.Point(midPoint.x, midPoint.y).addVector(perpendicuar, 0.4);
        return `M${fromPoint}Q${c1},${midPoint}Q${c2},${fromPoint}`;
    }

    function getEdgePath(transition: Models.Transition): string {
        return transition.isLoop() ? getLoopPath(transition) : getStandardPath(transition);
    }

    function getEdgeLine(className: string, d: string): IBobrilNode {
        return {
            tag: 'path',
            className,
            style: {
                markerEnd: 'url(#arrow)'
            },
            attrs: { d }
        };
    }

    function getEdgeLines(transition: Models.Transition): IBobrilNode[] {
        var d: string = getEdgePath(transition);
        return [
            getEdgeLine('edge-line', d),
            getEdgeLine('edge-invisible', d)
        ];
    }

    var Component: IBobrilComponent = {
        render(ctx: ICtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var transition: Models.Transition = ctx.data.transition;

            me.tag = 'g';
            me.className = ctx.data.isSelected ? 'edge selected' : 'edge';
            me.children = [
                getEdgeLines(transition),
                Components.MidPoint.Get({
                    midPoint: transition.midPoint,
                    resetMidPoint: () => transition.resetMidPoint(),
                    moveMidPoint: (point: Models.Point) => transition.moveMidPoint(point)
                }),
                Components.EdgeText.Get({ transition })
            ];
        },
        onClick(ctx: ICtx, event: IBobrilMouseEvent): boolean {
            ctx.data.transitionSelected(ctx.data.transition);
            b.invalidate();
            return true;
        }
    };

    interface ICtx extends IBobrilCtx {
        data: IData;
    }

    export interface IData {
        transition: Models.Transition;
        transitionSelected(transition: Models.Transition): void;
        isSelected: boolean;
    }

    export function Get(data: IData): IBobrilNode {
        return { component: Component, data };
    }
}
