import * as b from 'bobril';
import { IButtonData, Button } from './button';
import { ISpinnerData, Spinner } from './spinner';

export interface IGameControlPanelData {
    running: boolean;
    onStart: Function;
    onStop: Function;
    delay: number;
    onDelayChange: (value: number) => void;
}

interface IGameControlPanelCtx extends b.IBobrilCtx {
    data: IGameControlPanelData;
}

export const GameControlPanel = b.createComponent<IGameControlPanelData>({
    render(ctx: IGameControlPanelCtx, me: b.IBobrilNode) {
        me.tag = 'div';
        me.children = [
            Button({
                content: 'Start',
                disabled: ctx.data.running,
                onClick: () => {
                    ctx.data.onStart();
                }
            }),
            Button({
                content: 'Stop',
                disabled: !ctx.data.running,
                onClick: () => {
                    ctx.data.onStop();
                }
            }),
            {
                tag: 'span',
                children: ' Next round delay: '
            },
            Spinner({
                value: ctx.data.delay,
                min: 0,
                max: 200,
                step: 10,
                onChange: (value: number) => {
                    ctx.data.onDelayChange(value);
                }
            })
        ];
    }
});
