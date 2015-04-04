module Automata.Components.Vertex {
    var Component: IBobrilComponent = {
        render(ctx: ICtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
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
            ]
        },
        onClick(ctx: ICtx, event: IBobrilMouseEvent): boolean {
            if (ctx.data.dragMode === Models.DragMode.NewEdge) {
                return true;
            }
            ctx.data.stateSelected(ctx.data.state);
            b.invalidate();
            return true;
        },
        onPointerDown(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (ctx.data.dragMode === Models.DragMode.Move) {
                b.registerMouseOwner(ctx);
                ctx.downPoint = new Models.Point(event.x, event.y);
                return true;
            }
            if (ctx.data.dragMode == Models.DragMode.NewEdge) {
                ctx.data.newTransition.from = ctx.data.state;
                b.invalidate();
                return true;
            }
        },
        onPointerUp(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (ctx.data.dragMode === Models.DragMode.Move) {
                if (b.isMouseOwner(ctx)) {
                    b.releaseMouseOwner();
                }
                return true;
            }
            if (ctx.data.dragMode == Models.DragMode.NewEdge) {
                if (ctx.data.newTransition.from && (ctx.data.newTransition.from !== ctx.data.state || ctx.data.newTransition.firstLeft)) {
                    ctx.data.addTransition();
                    return true;
                }
            }
        },
        onPointerMove(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (ctx.data.dragMode === Models.DragMode.Move) {
                if (!b.isMouseOwner(ctx)) {
                    return false;
                }
                var state: Models.State = ctx.data.state;
                var newX: number = state.point.x + event.x - ctx.downPoint.x;
                var newY: number = state.point.y + event.y - ctx.downPoint.y;
                ctx.downPoint.setCoords(event.x, event.y);
                var newPoint: Models.Point = new Models.Point(newX, newY);
                ctx.data.onMove(state, newPoint);
                b.invalidate();
                return true;
            }
            if (ctx.data.dragMode === Models.DragMode.NewEdge) {
                ctx.data.newTransition.screenPoint = new Models.Point(event.x, event.y);
                if (ctx.data.newTransition.from && (ctx.data.newTransition.from !== ctx.data.state || ctx.data.newTransition.firstLeft)) {
                    ctx.data.newTransition.to = ctx.data.state;
                } else {
                    ctx.data.newTransition.to = null;
                }
                b.invalidate();
                return true;
            }
        }
    };

    interface ICtx extends IBobrilCtx {
        data: IData;
        downPoint: Models.Point;
    }

    export interface IData {
        state: Models.State;
        onMove(state: Models.State, toPoint: Models.Point): void;
        dragMode: Models.DragMode;
        newTransition: Models.NewTransition;
        addTransition(): void;
        stateSelected(state: Models.State): void;
        isSelected: boolean;
    }

    export function Get(data: IData): IBobrilNode {
        return { component: Component, data }
    }
}
