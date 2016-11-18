import * as b from 'bobril';
import { Button } from './button';

export interface ISpinnerData {
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (value: number) => void;
}

interface ISpinnerCtx extends b.IBobrilCtx {
    data: ISpinnerData;
}

export const Spinner = b.createComponent<ISpinnerData>({
    render(ctx: ISpinnerCtx, me: b.IBobrilNode) {
        me.tag = 'span';
        me.children = [
            Button({
                content: '-',
                disabled: ctx.data.value === ctx.data.min,
                onClick: () => {
                    ctx.data.value -= ctx.data.step;
                    if (ctx.data.value < ctx.data.min)
                        ctx.data.value = ctx.data.min;
                    ctx.data.onChange(ctx.data.value);
                }
            }),
            ctx.data.value.toString(),
            Button({
                content: '+',
                disabled: ctx.data.value === ctx.data.max,
                onClick: () => {
                    ctx.data.value += ctx.data.step;
                    if (ctx.data.value > ctx.data.max)
                        ctx.data.value = ctx.data.max;
                    ctx.data.onChange(ctx.data.value);
                }
            })
        ];
    }
})

