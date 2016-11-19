export interface ICell {
    getId(): string;
    getNeighbors(): ICell[];
}

export class Cell implements ICell {
    getId() {
        return '';
    }

    getNeighbors() {
        return [];
    }
}