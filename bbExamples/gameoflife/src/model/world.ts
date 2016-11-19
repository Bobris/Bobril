import { ICell } from './Cell';

export interface IWorld {
    getLiveNeighbors(cell: ICell): ICell[];
    getDeadNeighbors(cell: ICell): ICell[];
    addLiveCell(cell: ICell): void;
    getLiveCells(): ICell[];
}

export class World implements IWorld {
    getLiveNeighbors(cell: ICell): ICell[] {
        return [];
    }

    getDeadNeighbors(cell: ICell): ICell[] {
        return [];
    }
    
    addLiveCell(cell: ICell) { ; }

    getLiveCells() {
        return [];
    }
}