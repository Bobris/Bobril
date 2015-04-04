module Automata.Components.Canvas {
    var Component: IBobrilComponent = {
        render(ctx: ICtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = 'div';
            me.className = 'canvas';
            me.style = {
                width: 800,
                height: 480,
                border: '1px solid black',
                cssFloat: 'left'
            }
            me.children = ctx.data.content;
        }
    }

    interface ICtx extends IBobrilCtx {
        data: IData;
    }

    export interface IData {
        content: IBobrilChildren;
    }

    export function Get(data: IData): IBobrilNode {
        return { component: Component, data }
    }
}
