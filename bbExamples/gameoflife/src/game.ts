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
        let frequency = new Collections.Dictionary((cell: ICell) => cell.getId());
        this.world.getLiveCells().forEach(liveCell => {
            let liveNeigborsCount = this.world.getLiveNeighbors(liveCell).length;
            if (liveNeigborsCount === 2 || liveNeigborsCount === 3)
                newWorld.addLiveCell(liveCell);
            this.world.getDeadNeighbors(liveCell).forEach(deadCell => {
                if (frequency.containsKey(deadCell))
                    frequency.setValue(deadCell, <number>frequency.getValue(deadCell) + 1);
                else
                    frequency.setValue(deadCell, 1);
            });
        });
        frequency.forEach((cell, count) => {
            if (count === 3)
                newWorld.addLiveCell(cell);
        });
        this.world = newWorld;
    }

    getLiveCells(): ICell[] {
        return this.world.getLiveCells();
    }
}