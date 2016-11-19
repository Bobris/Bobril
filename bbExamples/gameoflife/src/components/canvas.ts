import * as b from 'bobril';
import { ICell, Cell } from '../model/cell';

export interface ICanvasData {
    lifeCels: ICell[];
    width: number;
    height: number;
}

export interface ICanvasCtx extends b.IBobrilCtx {
    data: ICanvasData;
}

export const Canvas = b.createComponent<ICanvasData>({
    render(ctx: ICanvasCtx, me: b.IBobrilNode) {
        me.style = { width: 500, height: 500};
        me.children = {
            tag: 'svg',
            style: { width: '100%', height: '100%', fill: 'transparent' }, 
            children: ctx.data.lifeCels.map((cell: Cell) => {
                return {
                    tag: 'rect', attrs: {
                        x: cell.x * (5) + ctx.data.width / 2,
                        y: cell.y * (5) + ctx.data.height / 2,
                        width: 3, 
                        height: 3, 
                        fill: 'red'
                    }
                };
            })
        };
    }
});
