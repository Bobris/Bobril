import { ICell } from '../../src/model/cell';

export interface ICellMock extends ICell {
    getId: jasmine.Spy;
    getNeighbors: jasmine.Spy;
}

export function createCellMock(name: string) {
    let cell = <ICellMock>jasmine.createSpyObj<ICell>(name, ['getId', 'getNeighbors']);
    cell.getId.and.returnValue(name);
    return cell;
}

export function createCellsMock(count: number) {
    let cells: ICell[] = new Array();
    for (let i = 0; i < count; i++) {
        cells.push(createCellMock(i.toString()));
    }
    return cells;
}