/// <reference path="../../../src/bobril.d.ts"/>

module GameOfLifeApp {
    export enum HeaderLevel{
        H1,
        H2,
        H3
    }

    export interface IHeaderData {
        level: HeaderLevel;
        content: string;
    }

    export interface IHeaderCtx {
        data: IHeaderData;
    }

    export class Header implements IBobrilComponent {
        private static getTag(level: HeaderLevel): string{
            switch(level){
                case HeaderLevel.H1:
                    return "h1";
                case HeaderLevel.H2:
                    return "h2";
                case HeaderLevel.H3:
                    return "h3";
            }
        }

        static render(ctx: IHeaderCtx, me: IBobrilNode) {
            me.tag = this.getTag(ctx.data.level);
            me.children = ctx.data.content;
        }
    }
} 