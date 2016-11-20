import { IWorld } from '../../src/model/world';
import { IWorldFactory } from '../../src/model/worldFactory';

export function createWorldFactoryMock(currentWorld: IWorld, nextIterationWorld: IWorld): IWorldFactory {
    let callCount = 0;
    return function () {
        if (callCount === 0) {
            callCount++;
            return currentWorld;
        }
        return nextIterationWorld;
    };
}