/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="model/world.ts" />
/// <reference path="components/gamecontrolpanel.ts" />
/// <reference path="components/canvas.ts" />

module GameOfLifeApp{
    export interface IGameOfLifeData{
        runing: boolean;
        delay: number;
        startLiveCell: Array<Array<number>>;
        width: number;
        height: number;
    }

    export interface IGameOfLifeCtx{
        nextTickTime: number;
        world: World;

        data: IGameOfLifeData;
    }

    export class GameController implements IBobrilComponent{
        static data: IGameOfLifeData;

        static init(ctx: IGameOfLifeCtx){
            ctx.nextTickTime = b.uptime();
            ctx.world = new World(
                ctx.data.startLiveCell.map(cordinates =>
                    new Cell(cordinates[0], cordinates[1]))
            );
            this.data = ctx.data;
        }

        static render(ctx: IGameOfLifeCtx, me: IBobrilNode){
            var a = b.uptime();
            while(a > ctx.nextTickTime){
                if(this.data.runing){
                    ctx.world.tick();
                }
                ctx.nextTickTime = b.uptime() + this.data.delay;
            }

            me.tag = 'div';
            me.children = [
                {
                    component : GameControlPanel,
                    data : <IGameControlPanelData>{
                        running : this.data.runing,
                        onStart : () =>{
                            this.data.runing = true;
                        },
                        onStop : () =>{
                            this.data.runing = false;
                        },
                        delay : this.data.delay,
                        onDelayChange : (value: number) =>{
                            this.data.delay = value;
                        }
                    }
                },
                {
                    component : Canvas,
                    data : { lifeCels : ctx.world.lifeCells, width : ctx.data.width, height : ctx.data.height }
                }
            ];
        }
    }
}