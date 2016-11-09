/// <reference path="cell.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var World = (function () {
        function World(seed) {
            if (seed === void 0) { seed = new Array(); }
            this.lifeCells = seed;
        }
        World.prototype.getLifeNeighbors = function (cell) {
            return this.getNeighbors(cell, true);
        };
        World.prototype.getDethNeighbors = function (cell) {
            return this.getNeighbors(cell, false);
        };
        World.prototype.getNeighbors = function (cell, alive) {
            var _this = this;
            return this.getAllNeighbours(cell).filter(function (neighboursCell) {
                return _this.isCellAlive(neighboursCell) == alive;
            });
        };
        World.prototype.isCellAlive = function (cell) {
            return this.lifeCells.filter(function (lifeCell) {
                return cell.equelTo(lifeCell);
            }).length > 0;
        };
        World.prototype.getAllNeighbours = function (cell) {
            var neighbours = new Array();
            for (var x = -1; x <= 1; x++) {
                for (var y = -1; y <= 1; y++) {
                    if (x == 0 && y == 0)
                        continue;
                    neighbours.push(new GameOfLifeApp.Cell(cell.positionX + x, cell.positionY + y));
                }
            }
            return neighbours;
        };
        World.prototype.getAllDeathNeighbours = function () {
            var _this = this;
            var deathNeighbours = new Array();
            this.lifeCells.forEach(function (lifeCell) {
                _this.getDethNeighbors(lifeCell).forEach(function (deathCell) {
                    if (deathNeighbours.filter(function (deathNeighbour) {
                        return deathNeighbour.equelTo(deathCell);
                    }).length == 0)
                        deathNeighbours.push(deathCell);
                });
            });
            return deathNeighbours;
        };
        World.prototype.tick = function () {
            var _this = this;
            var nextGenerationLifeCell = new Array();
            this.lifeCells.forEach(function (lifeCell) {
                var numberOfLifeNeighbours = _this.getLifeNeighbors(lifeCell).length;
                if (numberOfLifeNeighbours >= 2 && numberOfLifeNeighbours <= 3)
                    nextGenerationLifeCell.push(lifeCell);
            });
            this.getAllDeathNeighbours().forEach(function (deathCell) {
                if (_this.getLifeNeighbors(deathCell).length == 3)
                    nextGenerationLifeCell.push(deathCell);
            });
            this.lifeCells = nextGenerationLifeCell;
        };
        return World;
    }());
    GameOfLifeApp.World = World;
})(GameOfLifeApp || (GameOfLifeApp = {}));
