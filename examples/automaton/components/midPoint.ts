module Automata.Components.MidPoint {
    var Component: IBobrilComponent = {
        render(ctx: ICtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var midPoint: Models.Point = ctx.data.midPoint;

            me.tag = 'circle';
            me.className = 'edge-mid-point';
            me.attrs = {
                cx: midPoint.x,
                cy: midPoint.y,
                r: 4
            }
        },
        onPointerDown(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            b.registerMouseOwner(ctx);
            ctx.downPoint = new Models.Point(event.x, event.y);
            var midPoint: Models.Point = ctx.data.midPoint;
            ctx.prevPoint = new Models.Point(midPoint.x, midPoint.y);
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
            var newX: number = ctx.prevPoint.x + event.x - ctx.downPoint.x;
            var newY: number = ctx.prevPoint.y + event.y - ctx.downPoint.y;
            ctx.data.moveMidPoint(new Models.Point(newX, newY));
            b.invalidate();
            return true;
        },
        onDoubleClick(ctx: ICtx, event: IBobrilMouseEvent): boolean {
            ctx.data.resetMidPoint();
            b.invalidate();
            return true;
        }
    }

    interface ICtx extends IBobrilCtx {
        data: IData;
        downPoint: Models.Point;
        prevPoint: Models.Point;
    }

    export interface IData {
        midPoint: Models.Point;
        resetMidPoint(): void;
        moveMidPoint(point: Models.Point): void;
    }

    export function Get(data: IData): IBobrilNode {
        return { component: Component, data };
    }
}
