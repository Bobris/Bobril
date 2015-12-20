var GameOfLifeApp;
(function (GameOfLifeApp) {
    var Cell = (function () {
        function Cell(positionX, positionY) {
            this.positionX = positionX;
            this.positionY = positionY;
        }
        Cell.prototype.equelTo = function (cell) {
            return this.positionX == cell.positionX && this.positionY == cell.positionY;
        };
        return Cell;
    }());
    GameOfLifeApp.Cell = Cell;
})(GameOfLifeApp || (GameOfLifeApp = {}));
