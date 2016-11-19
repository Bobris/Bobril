import * as b from 'bobril';
import { Game } from './game';
import { Cell } from './model/cell';
import { WorldFactory } from './model/worldFactory';
import { GameControlPanel } from './components/gameControlPanel';
import { Canvas } from './components/canvas';

export interface IGameOfLifeData {
    runing: boolean;
    delay: number;
    startLiveCell: Array<Array<number>>;
    width: number;
    height: number;
}

interface IGameOfLifeCtx extends b.IBobrilCtx {
    nextTickTime: number;
    game: Game;
    data: IGameOfLifeData;
}

export const GameController = b.createComponent<IGameOfLifeData>({
    init(ctx: IGameOfLifeCtx) {
        ctx.nextTickTime = b.uptime();        
        ctx.game = new Game(WorldFactory);
        ctx.data.startLiveCell.forEach(cordinates =>
            ctx.game.addLiveCell(new Cell(cordinates[0], cordinates[1])));       

        this.data = ctx.data;
    },

    render(ctx: IGameOfLifeCtx, me: b.IBobrilNode) {
        let a = b.uptime();
        while (a > ctx.nextTickTime) {
            if (this.data.runing) {
                ctx.game.move();
            }
            ctx.nextTickTime = b.uptime() + this.data.delay;
        }

        me.tag = 'div';
        me.children = [
            GameControlPanel({
                running: this.data.runing,
                onStart: () => {
                    this.data.runing = true;
                },
                onStop: () => {
                    this.data.runing = false;
                },
                delay: this.data.delay,
                onDelayChange: (value: number) => {
                    this.data.delay = value;
                }
            }),
            Canvas({
                lifeCels: ctx.game.getLiveCells(),
                width: ctx.data.width,
                height: ctx.data.height
            })
        ];
    }
});
