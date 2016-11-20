import { IWorld, World } from '../../src/model/world';
import { createCellMock, ICellMock } from './cell.mock';

describe('World', () => {
    let world: IWorld;
    let currentCell: ICellMock;
    let liveNeighborCell: ICellMock;
    let deadNeighborCell: ICellMock;

    beforeEach(() => {
        world = new World();
        currentCell = createCellMock('currentCell');
        liveNeighborCell = createCellMock('liveNeighborCell');
        deadNeighborCell = createCellMock('deadNeighborCell');
        currentCell.getNeighbors.and.returnValue([liveNeighborCell, deadNeighborCell]);
        world.addLiveCell(liveNeighborCell);
    });

    describe('addLiveCell', () => {
        it('Will not add same cell multipletime', () => {
            world.addLiveCell(liveNeighborCell);
            expect(world.getLiveCells()).toEqual([liveNeighborCell]);
        });
    });

    describe('getLiveCells', () => {
        it('Will return all added cells', () => {
            expect(world.getLiveCells()).toEqual([liveNeighborCell]);
        });
    });

    describe('getLiveNeighbors', () => {
        it('Will return live cells in contact with given cell', () => {
            expect(world.getLiveNeighbors(currentCell)).toEqual([liveNeighborCell]);
        });
    });

    describe('getDeadNeighbors', () => {
        it('Will return dead cells in contact with given cell', () => {
            expect(world.getDeadNeighbors(currentCell)).toEqual([deadNeighborCell]);
        });
    });
});
