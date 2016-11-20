import { Game } from '../src/game';
import { ICell } from '../src/model/cell';
import { createWorldFactoryMock } from './model/worldFactory.mock';
import { createWorldMock, IWorldMock } from './model/world.mock';
import { createCellMock, createCellsMock } from './model/cell.mock';

describe('Game', () => {
    let currentCell: ICell;
    let currentWorld: IWorldMock;
    let nextIterationWorld: IWorldMock;
    let game: Game;

    beforeEach(() => {
        currentCell = createCellMock('currentCell');
        currentWorld = createWorldMock('currentWorld');
        currentWorld.getLiveCells.and.returnValue([currentCell]);
        nextIterationWorld = createWorldMock('nextIterationWorld');
        game = new Game(createWorldFactoryMock(currentWorld, nextIterationWorld));
        currentWorld.getDeadNeighbors.and.returnValue([]);
        currentWorld.getLiveNeighbors.and.returnValue([]);
    });

    describe('getLiveCells', () => {
        it('will return values from world', () => {
            let liveCell = createCellMock('liveCell');
            currentWorld.getLiveCells.and.returnValue([liveCell]);
            expect(game.getLiveCells()).toEqual([liveCell]);
        });

        it('getLiveCells will return values from nextIterationWorld after move', () => {
            let nextIterationLiveCell = createCellMock('nextIterationLiveCell');
            nextIterationWorld.getLiveCells.and.returnValue([nextIterationLiveCell]);
            game.move();
            expect(game.getLiveCells()).toEqual([nextIterationLiveCell]);
        });
    });

    describe('addLiveCell', () => {
        it('Will call addLiveCell in world', () => {
            let newCell = createCellMock('newCell');
            game.addLiveCell(newCell);
            expect(currentWorld.addLiveCell).toHaveBeenCalledWith(newCell);
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
                currentWorld.getLiveNeighbors.and.returnValue(createCellsMock(1));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });
        });

        describe('Every life cell with two or three neighbors will survive', () => {
            it('Cell with two neighbors will be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(createCellsMock(2));
                game.move();
                expect(nextIterationWorld.addLiveCell).toHaveBeenCalledWith(currentCell);
            });

            it('Cell with three neighbors will be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(createCellsMock(3));
                game.move();
                expect(nextIterationWorld.addLiveCell).toHaveBeenCalledWith(currentCell);
            });
        });

        describe('Every life cell with four and more neighbors will die', () => {
            it('Cell with four neighbors will not be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(createCellsMock(4));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });

            it('Cell with nine neighbors will not be added to nextIterationWorld', () => {
                currentWorld.getLiveNeighbors.and.returnValue(createCellsMock(9));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(currentCell);
            });
        });

        describe('Dead cells', () => {
            let deadCell: ICell;
            beforeEach(() => {
                deadCell = createCellMock('deadCell');
                currentWorld.getDeadNeighbors.and.returnValue([deadCell]);
            });

            it('Dead cell with three neighbors will come live', () => {
                currentWorld.getLiveCells.and.returnValue(createCellsMock(3));
                game.move();
                expect(nextIterationWorld.addLiveCell).toHaveBeenCalledWith(deadCell);
            });

            it('Dead cell with less than tree neighbors will remain dead', () => {
                currentWorld.getLiveCells.and.returnValue(createCellsMock(2));
                game.move();
                expect(nextIterationWorld.addLiveCell).not.toHaveBeenCalledWith(deadCell);
            });

            it('Dead cell with more than tree neighbors will remain dead', () => {
                currentWorld.getLiveCells.and.returnValue(createCellsMock(4));
                game.move();
                expect(currentWorld.addLiveCell).not.toHaveBeenCalledWith(deadCell);
            });
        });
    });
});