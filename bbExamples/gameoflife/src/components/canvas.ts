import * as b from 'bobril';
import { ICell, Cell } from '../model/cell';
import { CellPositonConverter } from './cellPositonConverter';

export interface ICanvasData {
    lifeCels: ICell[];
    onAddCell: (cell: ICell) => void;
}

export interface ICanvasCtx extends b.IBobrilCtx {
    data: ICanvasData;
    cellPositonConverter: CellPositonConverter;
}

export const Canvas = b.createComponent<ICanvasData>({
    init(ctx: ICanvasCtx, me: b.IBobrilNode) {
        ctx.cellPositonConverter = new CellPositonConverter(3, 2);
    },
    render(ctx: ICanvasCtx, me: b.IBobrilNode) {
        me.style = { height: '100%', width: '100%' };
        me.children = {
            tag: 'svg',
            style: { width: '100%', height: '100%', fill: 'transparent' },
            children: ctx.data.lifeCels.map((cell: Cell) => {
                let position = ctx.cellPositonConverter.getPostionFromCell(cell);
                return {
                    tag: 'rect', attrs: {
                        x: position.x,
                        y: position.y,
                        width: 3,
                        height: 3,
                        fill: 'red'
                    }
                };
            })
        };
    },
    onClick(ctx: ICanvasCtx, event: b.IBobrilMouseEvent) {
        addCell(ctx, event.x, event.y);
        return true;
    },
    onMouseMove(ctx: ICanvasCtx, event: b.IBobrilMouseEvent) {
        if (event.button === 1) {
            addCell(ctx, event.x, event.y);
            return true;
        }
    },
    postUpdateDom(ctx: ICanvasCtx, me: b.IBobrilCacheNode, element: HTMLElement) {
        ctx.cellPositonConverter.setWidth(element.offsetWidth);
        ctx.cellPositonConverter.setHeight(element.offsetHeight);
    }
});

function addCell(ctx: ICanvasCtx, x: number, y: number) {
    const position = b.convertPointFromClientToNode(ctx.me, x, y);
    let cell = ctx.cellPositonConverter.getCellFromPositon(position[0], position[1]);
    ctx.data.onAddCell(cell);
}
