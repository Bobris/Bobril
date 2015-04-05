module Automata.Components.EdgeText {
    var Component: IBobrilComponent = {
        render(ctx: ICtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var transition: Models.Transition = ctx.data.transition;

            me.tag = 'g';
            me.children = [
                {
                    tag: 'text',
                    className: 'edge-text',
                    attrs: {
                        x: transition.midPoint.x + transition.textPosition.x,
                        y: transition.midPoint.y + transition.textPosition.y
                    },
                    children: `${transition.from.name} → ${transition.to.name}`
                },
                {
                    tag: 'path',
                    className: 'edge-text-line',
                    attrs: {
                        d: ''
                    }
                }
            ];
        },
        onPointerDown(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            b.registerMouseOwner(ctx);
            ctx.downPoint = new Models.Point(event.x, event.y);
            var textPosition: Models.Point = ctx.data.transition.textPosition;
            ctx.prevPoint = new Models.Point(textPosition.x, textPosition.y);
            return true;
        },
        onPointerUp(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
            }
            return true;
        },
        onPointerMove(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (!b.isMouseOwner(ctx)) {
                return false;
            }
            var transition: Models.Transition = ctx.data.transition;
            var newX: number = ctx.prevPoint.x + event.x - ctx.downPoint.x;
            var newY: number = ctx.prevPoint.y + event.y - ctx.downPoint.y;
            transition.textPosition.setCoords(newX, newY);
            b.invalidate();
            return true;
        },
        postUpdateDom(ctx: ICtx, me: IBobrilCacheNode, element: any): void {
            var midPoint: Models.Point = ctx.data.transition.midPoint;
            var bbox: any = element.getBBox();
            var x: number;
            var y: number;
            if (bbox.x >= 0 && bbox.y >= 0) {
                x = bbox.x + bbox.width / 2;
                y = bbox.y + bbox.height / 2;
            } else {
                x = midPoint.x;
                y = midPoint.y;
            }
            var textLine: any = element.childNodes[1];
            textLine.setAttribute('d', `M${midPoint}L${x},${y}`);
        }
    };

    interface ICtx extends IBobrilCtx {
        data: IData;
        downPoint: Models.Point;
        prevPoint: Models.Point;
    }

    export interface IData {
        transition: Models.Transition;
    }

    export function Get(data: IData): IBobrilNode {
        return { component: Component, data };
    }
}
