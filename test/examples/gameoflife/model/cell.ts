/// <reference path="../../../jasmine.d.ts" />
/// <reference path="../../../../examples/gameoflife/model/cell.ts" />

module GameOfLifeApp{
    describe('Cell',() => {
        var cell:Cell;

        beforeEach(() =>{
            cell = new Cell(0, 0);
        });

        describe('EquelTo',() => {
            it('Return true for cells wiht eaquel values',() =>{
                expect(cell.equelTo(new Cell(0, 0))).toBeTruthy();
            });

            it('Return false for cells wiht diferent values', () =>{
                expect(cell.equelTo(new Cell(0, 1))).toBeFalsy();
                expect(cell.equelTo(new Cell(1, 0))).toBeFalsy();
            });
        });
    });
}