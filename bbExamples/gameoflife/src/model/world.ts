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
        return cell.getNeighbors().filter(neighbor => this.liveCells.contains(neighbor));
    }

    getDeadNeighbors(cell: ICell): ICell[] {
        return cell.getNeighbors().filter(neighbor => !this.liveCells.contains(neighbor));
    }

    addLiveCell(cell: ICell) {
        this.liveCells.add(cell);
    }

    getLiveCells() {
        return this.liveCells.toArray();
    }
}