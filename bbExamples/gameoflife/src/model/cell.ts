export interface ICell {
    getId(): string;
    getNeighbors(): ICell[];
}

export class Cell implements ICell {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    getId() {
        return `${this.x}/${this.y}`;
    }

    getNeighbors() {
        let neigbors = new Array<Cell>();
        for (let dx = -1; dx < 2; dx++) {
            for (let dy = -1; dy < 2; dy++) {
                if (dx !== 0 || dy !== 0)
                    neigbors.push(new Cell(this.x + dx, this.y + dy));
            }
        }
        return neigbors;
    }
}