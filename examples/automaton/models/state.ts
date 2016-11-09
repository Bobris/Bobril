module Automata.Models {
    export class State {
        name: string;
        isStart: boolean;
        isAccept: boolean;

        constructor(public point: Point, public color: string = 'white') {
        }

        setCoords(x: number, y: number): void {
            this.point.setCoords(x, y);
        }
    }
}
