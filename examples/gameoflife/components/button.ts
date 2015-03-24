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

        static onClick(ctx: IButtonCtx, event: IMouseEvent): boolean{
            ctx.data.onClick();
            return true;
        }
    }
}