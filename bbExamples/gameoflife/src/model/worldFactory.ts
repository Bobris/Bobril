import { World, IWorld } from './world';

export interface IWorldFactory {
    (): IWorld;   
}

export function WorldFactory() {
    return new World();
}