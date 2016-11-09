module Automata.Components.Graph {
    function getMarker(id: string, refx: string): IBobrilNode {
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

    function getEdges(transitions: Models.Transition[],
        selectedTransition: Models.Transition,
        transitionSelected: (transition: Models.Transition) => void): IBobrilNode[] {
        if (!transitions || !transitions.length) {
          return null;
        }
        return transitions.map((transition: Models.Transition) => {
            return Components.Edge.Get({
                transition,
                transitionSelected,
                isSelected: selectedTransition === transition
            });
        });
    }

    function getStandard(rect: ClientRect, transition: Models.NewTransition): string {
        var scr: Models.Point = transition.screenPoint;
        var trTo: Models.Point = transition.to ? transition.to.point : new Models.Point(scr.x - rect.left, scr.y - rect.top);
        transition.midPoint = null;
        return `M${transition.from.point}L${trTo}`;
    }

    function getLoop(rect: ClientRect, transition: Models.NewTransition): string {
        var from: Models.Point = transition.from.point;
        var scr: Models.Point = transition.screenPoint;
        var vect: Models.Vector = new Models.Vector(from, new Models.Point(scr.x - rect.left, scr.y - rect.top));
        var dist: number = vect.getLength();
        var point: Models.Point = new Models.Point(from.x, from.y).addVector(vect, 60 / dist);
        var perpendicuar: Models.Vector = new Models.Vector(from, point).getPerpendicular();
        var c1: Models.Point = new Models.Point(point.x, point.y).addVector(perpendicuar, -0.4);
        var c2: Models.Point = new Models.Point(point.x, point.y).addVector(perpendicuar, 0.4);
        transition.midPoint = point;
        return `M${from}Q${c1},${point}Q${c2},${from}`;
    }

    function getNewEdge(rect: ClientRect, transition: Models.NewTransition): IBobrilNode {
        if (!transition || !transition.from) {
            return null;
        }
        var url: string = transition.to ? '' : '-new-line';
        return {
            tag: 'path',
            className: 'new-line',
            attrs: {
                d: transition.isLoop() ? getLoop(rect, transition) : getStandard(rect, transition)
            },
            style: { markerEnd: 'url(#arrow' + url + ')' }
        }
    }

    function getVertices(ctx: ICtx,
        onMove: (state: Models.State, toPoint: Models.Point) => void,
        addTransition: () => void,
        stateSelected: (state: Models.State) => void): IBobrilNode[] {

        var states: Models.State[] = ctx.data.automaton.states;
        if (!states || !states.length) {
          return null;
        }

        return states.map((state: Models.State) => {
            return Components.Vertex.Get({
                state,
                onMove,
                addTransition,
                stateSelected,
                newTransition: ctx.newTransition,
                dragMode: ctx.dragMode,
                isSelected: ctx.selectedState == state
            });
        });
    }

    function addTransition(ctx: ICtx): void {
        var tr = ctx.newTransition;
        if (tr && tr.from && tr.to) {
            var transition = ctx.data.automaton.addTransition(tr.from, tr.to, tr.midPoint);
            ctx.selectedTransition = transition;
            ctx.selectedState = null;
            b.invalidate();
        }
    }

    var Component: IBobrilComponent = {
        init(ctx: ICtx, me: IBobrilCacheNode): void {
            ctx.dragMode = Models.DragMode.Move;
            b.invalidate();
        },
        render(ctx: ICtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var automaton: Models.Automaton = ctx.data.automaton;

            me.tag = 'svg';
            me.attrs = { tabindex: 0 };
            me.style = { width: '100%', height: '100%', outline: 'none' };
            me.children = [
                getEdges(automaton.transitions,
                    ctx.selectedTransition,
                    (transition: Models.Transition) => { ctx.selectedTransition = transition; ctx.selectedState = null; }),
                getNewEdge(ctx.rectangle, ctx.newTransition),
                getVertices(ctx,
                    (state: Models.State, toPoint: Models.Point) => automaton.moveState(state, toPoint),
                    () => addTransition(ctx),
                    (state: Models.State) => { ctx.selectedState = state; ctx.selectedTransition = null; }),
                {
                    tag: 'defs',
                    children: [
                        getMarker('arrow', '28'),
                        getMarker('arrow-new-line', '10')
                    ]
                }
            ];
        },
        onClick(ctx: ICtx, event: IBobrilMouseEvent): boolean {
            if (ctx.dragMode === Models.DragMode.NewEdge) {
                return true;
            }
            ctx.selectedState = null;
            ctx.selectedTransition = null;
            b.invalidate();
            return true;
        },
        onDoubleClick(ctx: ICtx, event: IBobrilMouseEvent): boolean {
            var automaton: Models.Automaton = ctx.data.automaton;

            var state = automaton.addState(new Models.Point(event.x - ctx.rectangle.left, event.y - ctx.rectangle.top));
            ctx.selectedState = state;
            ctx.selectedTransition = null;
            b.invalidate();
            return true;
        },
        postInitDom(ctx: ICtx, me: IBobrilNode, element: HTMLElement): void {
            if (element.focus) {
                element.focus();
            }
        },
        postUpdateDom(ctx: ICtx, me: IBobrilCacheNode, element: HTMLElement): void {
            ctx.rectangle = element.getBoundingClientRect();
            if (b.ieVersion() === undefined) {
                return;
            }
            var defs: Node = element.getElementsByTagName('defs')[0];
            element.removeChild(defs);
            element.appendChild(defs);
        },
        onPointerMove(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (ctx.dragMode === Models.DragMode.NewEdge) {
                ctx.newTransition.to = null;
                ctx.newTransition.screenPoint = new Models.Point(event.x, event.y);
                if (ctx.newTransition.from) {
                    ctx.newTransition.firstLeft = true;
                }
                b.invalidate();
                return true;
            }
            return false;
        },
        onPointerUp(ctx: ICtx, event: IBobrilPointerEvent): boolean {
            if (ctx.dragMode === Models.DragMode.NewEdge) {
                ctx.newTransition.from = null;
            }
            return true;
        },
        onKeyDown(ctx: ICtx, event: IKeyDownUpEvent): boolean {
            if (event.ctrl && ctx.dragMode === Models.DragMode.Move) {
                ctx.dragMode = Models.DragMode.NewEdge;
                ctx.newTransition = new Models.NewTransition(null, null);
                b.invalidate();
            }
            return true;
        },
        onKeyUp(ctx: ICtx, event: IKeyDownUpEvent): boolean {
            if (!event.ctrl && ctx.dragMode === Models.DragMode.NewEdge) {
                ctx.dragMode = Models.DragMode.Move;
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

    interface ICtx extends IBobrilCtx {
        data: IData;
        rectangle: ClientRect;
        dragMode: Models.DragMode;
        newTransition: Models.NewTransition;
        selectedState: Models.State;
        selectedTransition: Models.Transition;
    }

    export interface IData {
        automaton: Models.Automaton;
    }

    export function Get(data: IData): IBobrilNode {
        return { component: Component, data };
    }
}
