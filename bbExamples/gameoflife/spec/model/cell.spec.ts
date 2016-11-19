import { Cell } from '../../src/model/cell';

describe('Cell', () => {
    describe('getId', () => {
        it('Will return coordinates in string', () => {
            expect(new Cell(0, 0).getId()).toBe('0/0');
        });
    });

    describe('getNeighbors', () => {
        it('Will return all cells close to given', () => {
            expect(new Cell(0, 0).getNeighbors().map(cell => cell.getId()))
                .toEqual(['-1/-1', '-1/0', '-1/1', '0/-1', '0/1', '1/-1', '1/0', '1/1']);
        });
    });
});
