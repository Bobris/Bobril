import { IWorld } from './model/world';
import { IWorldFactory } from './model/worldFactory';
import { ICell } from './/model/Cell';
import * as Collections from 'typescript-collections';

export class Game {
    private world: IWorld;
    private worldFactory: IWorldFactory;

    constructor(worldFactory: IWorldFactory) {
        this.worldFactory = worldFactory;
        this.world = worldFactory();
    }

    move() {
        let newWorld = this.worldFactory();
        let deadCellFrequency = new Collections.Dictionary((cell: ICell) => cell.getId());
        this.world.getLiveCells().forEach(liveCell => {
            let liveNeigborsCount = this.world.getLiveNeighbors(liveCell).length;
            if (liveNeigborsCount === 2 || liveNeigborsCount === 3)
                newWorld.addLiveCell(liveCell);
            this.world.getDeadNeighbors(liveCell).forEach(deadCell => {
                if (deadCellFrequency.containsKey(deadCell))
                    deadCellFrequency.setValue(deadCell, <number>deadCellFrequency.getValue(deadCell) + 1);
                else
                    deadCellFrequency.setValue(deadCell, 1);
            });
        });
        deadCellFrequency.forEach((cell, count) => {
            if (count === 3)
                newWorld.addLiveCell(cell);
        });
        this.world = newWorld;
    }

    getLiveCells(): ICell[] {
        return this.world.getLiveCells();
    }

    addLiveCell(cell: ICell) {
        this.world.addLiveCell(cell);
    }
}