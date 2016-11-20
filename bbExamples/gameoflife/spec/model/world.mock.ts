import { IWorld } from '../../src/model/world';

export interface IWorldMock extends IWorld {
    getLiveNeighbors: jasmine.Spy;
    getDeadNeighbors: jasmine.Spy;
    getLiveCells: jasmine.Spy;
    addLiveCell: jasmine.Spy;
}

export function createWorldMock(name: string) {
    return <IWorldMock>jasmine.createSpyObj<IWorld>(name, ['getLiveNeighbors', 'getDeadNeighbors', 'addLiveCell', 'getLiveCells']);
}