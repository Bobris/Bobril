/// <reference path="button.ts" />
/// <reference path="spinner.ts" />

module GameOfLifeApp{
    export interface IGameControlPanelData{
        running: boolean;
        onStart: Function;
        onStop: Function;
        delay: number;
        onDelayChange: (value: number) => void;
    }

    export interface IGameControlPanelCtx{
        data: IGameControlPanelData;
    }

    export class GameControlPanel implements IBobrilComponent{
        static render(ctx: IGameControlPanelCtx, me: IBobrilNode){
            me.tag = 'div';
            me.children = [
                {
                    component : Button,
                    data: <IButtonData>{
                        content : 'Start',
                        disabled : ctx.data.running,
                        onClick : () =>{
                            ctx.data.onStart();
                        }
                    }
                },
                {
                    component : Button,
                    data : <IButtonData>{
                        content : 'Stop',
                        disabled : !ctx.data.running,
                        onClick : () =>{
                            ctx.data.onStop();
                        }
                    }
                },
                {
                    tag: "span",
                    children: " Next round delay: "
                },
                {
                    component : Spinner,
                    data : <ISpinnerData>{
                        value : ctx.data.delay,
                        min : 0,
                        max : 200,
                        step : 10,
                        onChange : (value: number) =>{
                            ctx.data.onDelayChange(value);
                        }
                    }
                }
            ];
        }
    }
}