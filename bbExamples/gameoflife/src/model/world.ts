import { ICell } from './Cell';
import * as Collections from 'typescript-collections';

export interface IWorld {
    getLiveNeighbors(cell: ICell): ICell[];
    getDeadNeighbors(cell: ICell): ICell[];
    addLiveCell(cell: ICell): void;
    getLiveCells(): ICell[];
}

export class World implements IWorld {
    private liveCells = new Collections.Set((cell: ICell) => cell.getId());

    getLiveNeighbors(cell: ICell): ICell[] {
        let liveNeighbors = new Array<ICell>();
        cell.getNeighbors().forEach(neighbor => {
            if (this.liveCells.contains(neighbor))
                liveNeighbors.push(neighbor);
        });
        return liveNeighbors;
    }

    getDeadNeighbors(cell: ICell): ICell[] {
        let deadNeighbors = new Array<ICell>();
        cell.getNeighbors().forEach(neighbor => {
            if (!this.liveCells.contains(neighbor))
                deadNeighbors.push(neighbor);
        });
        return deadNeighbors;
    }

    addLiveCell(cell: ICell) {
        this.liveCells.add(cell);
    }

    getLiveCells() {
        return this.liveCells.toArray();
    }
}