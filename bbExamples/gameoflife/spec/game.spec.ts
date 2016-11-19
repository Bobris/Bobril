import { Game } from '../src/game';
import { Cell, ICell } from '../src/model/cell';
import { createWorldFactoryMock } from './model/worldFactory.mock';
import { createWorldMock, IWorldMock } from './model/world.mock';

function generateCells(count: number) {
    let cells: Cell[] = new Array();
    for (let i = 0; i < count; i++) {
        cells.push(new Cell());
    }
    return cells;
}

describe('Game', () => {
    let currentCell: Cell;
    let currentWorld: IWorldMock;
    let nextIterationWorld: IWorldMock;
    let game: Game;

    beforeEach(() => {
        currentCell = new Cell();
        currentWorld = createWorldMock('currentWorld');
        currentWorld.getLiveCells.and.returnValue([currentCell]);
        nextIterationWorld = createWorldMock('nextIterationWorld');
        game = new Game(createWorldFactoryMock(currentWorld, nextIterationWorld));
        currentWorld.getDeadNeighbors.and.returnValue([]);
        currentWorld.getLiveNeighbors.and.returnValue([]);
    });

    describe('getLiveCells', () => {
        it('will return values from world', () => {
            let liveCell = new Cell();
            currentWorld.getLiveCells.and.returnValue([liveCell]);
            expect(game.getLiveCells()).toEqual([liveCell]);
        });

        it('getLiveCells will return values from nextIterationWorld after move', () => {
            let nextIterationLiveCell = new Cell();            
            nextIterationWorld.getLiveCells.and.returnValue([nextIterationLiveCell]);
            game.move();
            expect(game.getLiveCells()).toEqual([nextIterationLiveCell]);
        });
    });

    describe('Rules', () => {
        describe('Every life cell with les then two neighbors will die', () => {
            it('Cell with zero live neighbor will not be added to next iteration', () => {
                currentWorld.getLiveNeighbors.and.returnValue([]);
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });

            it('Cell with one live neighbor will not be added to next iteration', () => {
                currentWorld.getLiveNeighbors.and.returnValue(generateCells(1));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });
        });

        describe('Every life cell with two or three neighbors will survive', () => {
            it('Cell with two neighbors will be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(generateCells(2));
                game.move();
                expect(nextIterationWorld.addLiveCell).toHaveBeenCalledWith(currentCell);
            });

            it('Cell with three neighbors will be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(generateCells(3));
                game.move();
                expect(nextIterationWorld.addLiveCell).toHaveBeenCalledWith(currentCell);
            });
        });

        describe('Every life cell with four and more neighbors will die', () => {
            it('Cell with four neighbors will not be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(generateCells(4));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });

            it('Cell with nine neighbors will not be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(generateCells(9));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });
        });

        describe('Dead cells', () => {
            let deadCell: ICell;
            beforeEach(() => {
                deadCell = new Cell();
                currentWorld.getDeadNeighbors.and.returnValue([deadCell]);
            });

            it('Dead cell with three neighbors will come live', () => {
                currentWorld.getLiveCells.and.returnValue(generateCells(3));
                game.move();
                expect(nextIterationWorld.addLiveCell).toHaveBeenCalledWith(deadCell);
            });

            it('Dead cell with less than tree neighbors will remain dead', () => {
                currentWorld.getLiveCells.and.returnValue(generateCells(2));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(deadCell);
            });

            it('Dead cell with more than tree neighbors will remain dead', () => {
                currentWorld.getLiveCells.and.returnValue(generateCells(4));
                game.move();
                expect(currentWorld.addLiveCell).not.toHaveBeenCalledWith(deadCell);
            });
        });
    });
});