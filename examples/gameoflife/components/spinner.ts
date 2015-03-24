/// <reference path="button.ts" />

module GameOfLifeApp{
    export interface ISpinnerData {
        value: number;
        min: number;
        max: number;
        step: number;
        onChange: (value: number) => void;
    }

    export interface ISpinnerCtx {
        data: ISpinnerData;
    }

    export class Spinner implements IBobrilComponent{
        static render(ctx: ISpinnerCtx, me: IBobrilNode){
            me.tag = 'span';
            me.children = [
                Button({
                    content : '-',
                    disabled : ctx.data.value == ctx.data.min,
                    onClick : () =>{
                        ctx.data.value -= ctx.data.step;
                        if(ctx.data.value < ctx.data.min)
                            ctx.data.value = ctx.data.min;
                        ctx.data.onChange(ctx.data.value);
                    }
                }),
                ctx.data.value.toString(),
                Button({
                    content : '+',
                    disabled : ctx.data.value == ctx.data.max,
                    onClick : () =>{
                        ctx.data.value += ctx.data.step;
                        if(ctx.data.value > ctx.data.max)
                            ctx.data.value = ctx.data.max;
                        ctx.data.onChange(ctx.data.value);
                    }
                })
            ];
        }
    }
}
