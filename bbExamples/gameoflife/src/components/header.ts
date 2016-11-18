import * as b from 'bobril';

export interface IHeaderData {
    content: string;
}

export interface IHeaderCtx extends b.IBobrilCtx {
    data: IHeaderData;
}

export const Header = b.createComponent<IHeaderData>({
    render(ctx: IHeaderCtx, me: b.IBobrilNode) {
        me.tag = 'h1';
        me.children = ctx.data.content;
    }
})
