/// <reference path="../../../src/bobril.d.ts"/>
/// <reference path="../../../src/bobril.mouse.d.ts"/>

module GameOfLifeApp{
    export interface IButtonData{
        content: string;
        disabled?: boolean;
        onClick: Function;
    }

    export interface IButtonCtx{
        data: IButtonData;
    }

    export class Button implements IBobrilComponent{
        static render(ctx: IButtonCtx, me: IBobrilNode){
            me.tag = 'button';
            if(ctx.data.disabled)
                me.attrs = { disabled : "disabled" };
            me.children = ctx.data.content;
        }

        static onClick(ctx: IButtonCtx, event: IBobrilComponent): boolean{
            ctx.data.onClick();
            return true;
        }
    }
}