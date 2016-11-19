export interface ICell {
    getId(): string;
}

export class Cell implements ICell {
    getId() {
        return '';
    }
}