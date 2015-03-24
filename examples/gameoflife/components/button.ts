/// <reference path="../../../src/bobril.d.ts"/>
/// <reference path="../../../src/bobril.mouse.d.ts"/>

module GameOfLifeApp {
    export interface IButtonData {
        content: string;
        disabled?: boolean;
        onClick: ()=>void;
    }

    interface IButtonCtx extends IBobrilCtx {
        data: IButtonData;
    }

    var ButtonComponent: IBobrilComponent = {
        render(ctx: IButtonCtx, me: IBobrilNode) {
            me.tag = 'button';
            me.attrs = { disabled: ctx.data.disabled };
            me.children = ctx.data.content;
        },
        onClick(ctx: IButtonCtx, event: IBobrilMouseEvent): boolean {
            ctx.data.onClick();
            return true;
        }
    }
    
    export function Button(data:IButtonData):IBobrilNode {
        return { component: ButtonComponent, data: data };
    }
}
