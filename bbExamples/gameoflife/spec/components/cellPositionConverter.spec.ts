import { CellPositonConverter } from '../../src/components/cellPositonConverter';
import { Cell } from '../../src/model/cell';

describe('CellPositonConverter', () => {
    let cellPositonConverter: CellPositonConverter;

    beforeEach(() => {
        cellPositonConverter = new CellPositonConverter(3, 2);
    });

    describe('getPostionFromCell', () => {
        it('Will return positons with from 0/0 when width and height was not set', () => {
            expect(cellPositonConverter.getPostionFromCell(new Cell(5, 5))).toEqual({ x: 25, y: 25 });
        });

        it('Will offset positon to half of width and height', () => {
            cellPositonConverter.setWidth(100);
            cellPositonConverter.setHeight(1000);
            expect(cellPositonConverter.getPostionFromCell(new Cell(5, 5))).toEqual({ x: 75, y: 525 });
        });
    });

    describe('getCellFromPositon', () => {
        it('Will return cell with coordinates begin 0/0 when width and height was not set', () => {
            expect(cellPositonConverter.getCellFromPositon(25, 25)).toEqual(new Cell(5, 5));
        });

        it('Will return cell with coordinates begin half of width and height', () => {
            cellPositonConverter.setWidth(100);
            cellPositonConverter.setHeight(1000);
            expect(cellPositonConverter.getCellFromPositon(75, 525)).toEqual(new Cell(5, 5));
        });        
    });
});
