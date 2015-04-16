/// <reference path="../../../jasmine.d.ts" />
/// <reference path="../../../../examples/gameoflife/model/cell.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    describe('Cell', function () {
        var cell;
        beforeEach(function () {
            cell = new GameOfLifeApp.Cell(0, 0);
        });
        describe('EquelTo', function () {
            it('Return true for cells wiht eaquel values', function () {
                expect(cell.equelTo(new GameOfLifeApp.Cell(0, 0))).toBeTruthy();
            });
            it('Return false for cells wiht diferent values', function () {
                expect(cell.equelTo(new GameOfLifeApp.Cell(0, 1))).toBeFalsy();
                expect(cell.equelTo(new GameOfLifeApp.Cell(1, 0))).toBeFalsy();
            });
        });
    });
})(GameOfLifeApp || (GameOfLifeApp = {}));
