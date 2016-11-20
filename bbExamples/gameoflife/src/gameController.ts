import * as b from 'bobril';
import { Game } from './game';
import { Cell } from './model/cell';
import { WorldFactory } from './model/worldFactory';
import { GameControlPanel } from './components/gameControlPanel';
import { Canvas } from './components/canvas';

export interface IGameOfLifeData {
    runing: boolean;    
    startLiveCell: Array<Array<number>>;
}

interface IGameOfLifeCtx extends b.IBobrilCtx {
    nextTickTime: number;
    game: Game;
    data: IGameOfLifeData;
    runing: boolean;
    speed: number;
    height: number;
    width: number;
}

export const GameController = b.createComponent<IGameOfLifeData>({
    init(ctx: IGameOfLifeCtx) {
        ctx.nextTickTime = b.uptime();
        ctx.game = new Game(WorldFactory);
        ctx.data.startLiveCell.forEach(cordinates => ctx.game.addLiveCell(new Cell(cordinates[0], cordinates[1])));
        ctx.runing = ctx.data.runing;
        ctx.speed = 10;
    },
    render(ctx: IGameOfLifeCtx, me: b.IBobrilNode) {
        let a = b.uptime();
        while (a > ctx.nextTickTime) {
            if (ctx.runing) {
                ctx.game.move();
            }
            ctx.nextTickTime = b.uptime() + (1 / ctx.speed) * 1000;
        }
        me.style = { height: '100%', width: '100%' };
        me.tag = 'div';
        me.children = [
            GameControlPanel({
                running: ctx.runing,
                onStart: () => {
                    ctx.runing = true;
                },
                onStop: () => {
                    ctx.runing = false;
                },
                speed: ctx.speed,
                onSpeedChange: (value: number) => {
                    ctx.speed = value;
                }
            }),
            Canvas({
                lifeCels: ctx.game.getLiveCells(),
                onAddCell: cell => ctx.game.addLiveCell(cell)
            })
        ];
    }
});
