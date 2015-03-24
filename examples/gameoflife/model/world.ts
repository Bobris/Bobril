/// <reference path="cell.ts" />

module GameOfLifeApp{
    export class World{
        lifeCells: Cell[];

        constructor(seed: Cell[] = new Array<Cell>()){
            this.lifeCells = seed;
        }

        getLifeNeighbors(cell: Cell): Array<Cell>{
            return this.getNeighbors(cell, true);
        }

        getDethNeighbors(cell: Cell): Array<Cell>{
            return this.getNeighbors(cell, false);
        }

        getNeighbors(cell: Cell, alive: boolean): Array<Cell>{
            return this.getAllNeighbours(cell).filter((neighboursCell: Cell) =>{
                return this.isCellAlive(neighboursCell) == alive;
            });
        }

        isCellAlive(cell: Cell): boolean{
            return this.lifeCells.filter((lifeCell: Cell) =>{
                return cell.equelTo(lifeCell);
            }).length > 0;
        }

        getAllNeighbours(cell: Cell): Array<Cell>{
            var neighbours = new Array<Cell>();
            for(var x = -1; x <= 1; x++){
                for(var y = -1; y <= 1; y++){
                    if(x == 0 && y == 0)
                        continue;
                    neighbours.push(new Cell(cell.positionX + x, cell.positionY + y));
                }
            }
            return neighbours;
        }

        getAllDeathNeighbours(): Array<Cell>{
            var deathNeighbours = new Array<Cell>();
            this.lifeCells.forEach((lifeCell) =>{
                this.getDethNeighbors(lifeCell).forEach((deathCell) =>{
                    if(deathNeighbours.filter((deathNeighbour: Cell) =>{
                        return deathNeighbour.equelTo(deathCell);
                    }).length == 0)
                        deathNeighbours.push(deathCell);
                });
            });
            return deathNeighbours;
        }

        tick(): void{
            var nextGenerationLifeCell = new Array<Cell>();
            this.lifeCells.forEach((lifeCell) =>{
                var numberOfLifeNeighbours = this.getLifeNeighbors(lifeCell).length;
                if(numberOfLifeNeighbours >= 2 && numberOfLifeNeighbours <= 3)
                    nextGenerationLifeCell.push(lifeCell);
            });

            this.getAllDeathNeighbours().forEach((deathCell: Cell) =>{
                if(this.getLifeNeighbors(deathCell).length == 3)
                    nextGenerationLifeCell.push(deathCell);
            });

            this.lifeCells = nextGenerationLifeCell;
        }
    }
}