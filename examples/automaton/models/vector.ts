module Automata.Models {
    export class Vector {
        x: number;
        y: number;

        constructor(from: Point, to: Point) {
            this.x = to.x - from.x;
            this.y = to.y - from.y;
        }

        getLength(): number {
            return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
        }

        getPerpendicular(): Vector {
            return new Vector(new Point(0, 0), new Point(-this.y, this.x));
        }

        toString(): string {
            return this.x + ',' + this.y;
        }
    }
}
