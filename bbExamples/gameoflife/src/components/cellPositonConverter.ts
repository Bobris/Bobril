import { Cell } from '../model/cell';

export class CellPositonConverter {
    private xOffset: number = 0;
    private yOffset: number = 0;
    private cellSize: number;
    private padding: number;

    constructor(cellSize: number, padding: number) {
        this.cellSize = cellSize;
        this.padding = padding;
    }

    setWidth(width: number) {
        this.xOffset = width / 2;
    }

    setHeight(height: number) {
        this.yOffset = height / 2;
    }

    getPostionFromCell(cell: Cell) {
        return {
            x: this.getPositionFromCellCoordinates(cell.x, this.xOffset),
            y: this.getPositionFromCellCoordinates(cell.y, this.yOffset)
        };
    }

    getCellFromPositon(x: number, y: number) {
        return new Cell(
            this.getCellCoordinatesFromPositon(x, this.xOffset),
            this.getCellCoordinatesFromPositon(y, this.yOffset));
    }

    private getPositionFromCellCoordinates(a: number, offset: number) {
        return a * (this.cellSize + this.padding) + offset;
    }

    private getCellCoordinatesFromPositon(postion: number, offset: number) {
        return Math.floor((postion - offset) / (this.cellSize + this.padding));
    }
}