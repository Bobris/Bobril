module GameOfLifeApp{
    export class Cell{
        constructor(public positionX: number, public positionY: number){
        }

        equelTo(cell: Cell): boolean{
            return this.positionX == cell.positionX && this.positionY == cell.positionY;
        }
    }
}