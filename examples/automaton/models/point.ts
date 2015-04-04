module Automata.Models {
    export class Point {
        constructor(public x: number, public y: number) {
        }

        addVector(vector: Automata.Models.Vector, scale: number): Point {
            this.x += vector.x * scale;
            this.y += vector.y * scale;
            return this;
        }

        setCoords(x: number, y: number): void {
            this.x = x;
            this.y = y;
        }

        equals(other: Point): boolean {
            return this.x === other.x && this.y === other.y;
        }

        toString(): string {
            return this.x + ',' + this.y;
        }
    }
}
