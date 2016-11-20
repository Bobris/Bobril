import * as b from 'bobril';
import { Button, Feature, ButtonType, Slider, Paper } from 'bobril-m';

export interface IGameControlPanelData {
    running: boolean;
    onStart: Function;
    onStop: Function;
    speed: number;
    onSpeedChange: (value: number) => void;
}

interface IGameControlPanelCtx extends b.IBobrilCtx {
    data: IGameControlPanelData;
}

export const GameControlPanel = b.createComponent<IGameControlPanelData>({
    render(ctx: IGameControlPanelCtx, me: b.IBobrilNode) {
        me.tag = 'div';
        me.children = [
            Button({
                children: 'Start',
                disabled: ctx.data.running,
                action: () => {
                    ctx.data.onStart();
                },
                feature: Feature.Primary,
                type: ButtonType.Raised
            }),
            Button({
                children: 'Stop',
                disabled: !ctx.data.running,
                action: () => {
                    ctx.data.onStop();
                },
                feature: Feature.Secondary,
                type: ButtonType.Raised
            }),
            Slider({
                min: 1,
                max: 100,
                value: ctx.data.speed,
                onChange: (value: number) => { ctx.data.onSpeedChange(value); }
            })
        ];
    }
});
