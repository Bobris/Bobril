import * as b from 'bobril';

export interface IButtonData {
    content: string;
    disabled?: boolean;
    onClick: () => void;
}

interface IButtonCtx extends b.IBobrilCtx {
    data: IButtonData;
}

export const Button = b.createComponent<IButtonData>({
    render(ctx: IButtonCtx, me: b.IBobrilNode) {
        me.tag = 'button';
        me.attrs = { disabled: ctx.data.disabled };
        me.children = ctx.data.content;
    },
    onClick(ctx: IButtonCtx, event: b.IBobrilMouseEvent): boolean {
        ctx.data.onClick();
        return true;
    }
});
