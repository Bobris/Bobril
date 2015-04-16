/// <reference path="../../../jasmine.d.ts" />
/// <reference path="../../../../examples/gameoflife/model/world.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    describe('Game Of Life model tests', function () {
        describe('World', function () {
            var world;
            describe('Constructor', function () {
                it('Creat empty word when seed is not defined', function () {
                    world = new GameOfLifeApp.World();
                    expect(world.lifeCells).toBeDefined();
                });
                it('Create word whit life cells when seed is specified', function () {
                    world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(1, 1), new GameOfLifeApp.Cell(1, 2)]);
                    expect(world.lifeCells).toEqual([new GameOfLifeApp.Cell(1, 1), new GameOfLifeApp.Cell(1, 2)]);
                });
            });
            describe('GetAllNeighbours', function () {
                beforeEach(function () {
                    world = new GameOfLifeApp.World();
                });
                it('Return eight neighbours cells', function () {
                    var neighbours = world.getAllNeighbours(new GameOfLifeApp.Cell(0, 0));
                    expect(neighbours.length).toBe(8);
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(-1, -1));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(-1, 0));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(-1, 1));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(0, -1));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(0, 1));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(1, -1));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(1, 0));
                    expect(neighbours).toContain(new GameOfLifeApp.Cell(1, 1));
                });
            });
            describe('GetLifeNeighbours', function () {
                beforeEach(function () {
                    world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1), new GameOfLifeApp.Cell(0, 2)]);
                });
                it('Return one neighbors for cell with one', function () {
                    var lifeCells = world.getLifeNeighbors(new GameOfLifeApp.Cell(0, 0));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(0, 1));
                    expect(lifeCells.length).toBe(1);
                });
                it('Return two neighbors for cell with two', function () {
                    var lifeCells = world.getLifeNeighbors(new GameOfLifeApp.Cell(0, 1));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(0, 0));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(0, 2));
                    expect(lifeCells.length).toBe(2);
                });
                it('Return zero neighbors for cell without any', function () {
                    var lifeCells = world.getLifeNeighbors(new GameOfLifeApp.Cell(0, 5));
                    expect(lifeCells.length).toBe(0);
                });
                it('Return one neighbor for death cell with any', function () {
                    var lifeCells = world.getLifeNeighbors(new GameOfLifeApp.Cell(-1, -1));
                    expect(lifeCells.length).toBe(1);
                });
            });
            describe('GetDethNeighbours', function () {
                beforeEach(function () {
                    world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1), new GameOfLifeApp.Cell(0, 2)]);
                });
                it('Return one neighbors for cell with obe', function () {
                    var lifeCells = world.getDethNeighbors(new GameOfLifeApp.Cell(0, 0));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(-1, -1));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(-1, 0));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(-1, 1));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(0, -1));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(1, -1));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(1, 0));
                    expect(lifeCells).toContain(new GameOfLifeApp.Cell(1, 1));
                    expect(lifeCells.length).toBe(7);
                });
                it('Return two neighbors for cell with two', function () {
                    var lifeCells = world.getDethNeighbors(new GameOfLifeApp.Cell(0, 1));
                    expect(lifeCells.length).toBe(6);
                });
            });
            describe('IsCellAlive', function () {
                beforeEach(function () {
                    world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0)]);
                });
                it('Return true for live cell', function () {
                    expect(world.isCellAlive(new GameOfLifeApp.Cell(0, 0))).toBeTruthy();
                });
                it('Return false for death cell', function () {
                    expect(world.isCellAlive(new GameOfLifeApp.Cell(0, 1))).toBeFalsy();
                });
            });
            describe('GetAllDeathNeighbours', function () {
                it('Return empty array if there is no cell', function () {
                    expect(new GameOfLifeApp.World().lifeCells.length).toBe(0);
                });
                it('Return all neighbours for alone cell', function () {
                    world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(1, 1)]);
                    var death = world.getAllDeathNeighbours();
                    expect(death.length).toBe(8);
                });
                it('Return not duplicate cells for neighbours', function () {
                    // 00000
                    // 01010
                    // 00000
                    world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(1, 1), new GameOfLifeApp.Cell(1, 3)]);
                    var death = world.getAllDeathNeighbours();
                    expect(death).toContain(new GameOfLifeApp.Cell(0, 0));
                    expect(death).toContain(new GameOfLifeApp.Cell(0, 1));
                    expect(death).toContain(new GameOfLifeApp.Cell(0, 2));
                    expect(death).toContain(new GameOfLifeApp.Cell(0, 3));
                    expect(death).toContain(new GameOfLifeApp.Cell(0, 4));
                    expect(death).toContain(new GameOfLifeApp.Cell(1, 0));
                    expect(death).toContain(new GameOfLifeApp.Cell(1, 2));
                    expect(death).toContain(new GameOfLifeApp.Cell(1, 4));
                    expect(death).toContain(new GameOfLifeApp.Cell(2, 0));
                    expect(death).toContain(new GameOfLifeApp.Cell(2, 1));
                    expect(death).toContain(new GameOfLifeApp.Cell(2, 2));
                    expect(death).toContain(new GameOfLifeApp.Cell(2, 3));
                    expect(death).toContain(new GameOfLifeApp.Cell(2, 4));
                    expect(death.length).toBe(13);
                });
            });
            describe('NextMove', function () {
                describe('Live cell with fewer than two live neighbours dies', function () {
                    it('Cell without neighbours will die', function () {
                        world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0)]);
                        world.tick();
                        expect(world.lifeCells.length).toEqual(0);
                    });
                    it('Cell with one neighbour will die', function () {
                        world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1)]);
                        world.tick();
                        expect(world.lifeCells.length).toEqual(0);
                    });
                });
                describe('Any live cell with two or three live neighbours lives', function () {
                    it('Cell with two neighbours will survive', function () {
                        world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1), new GameOfLifeApp.Cell(0, 2)]);
                        world.tick();
                        expect(world.lifeCells).toContain(new GameOfLifeApp.Cell(0, 1));
                    });
                    it('Cell with three neighbours will survive', function () {
                        world = new GameOfLifeApp.World([new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1), new GameOfLifeApp.Cell(0, 2), new GameOfLifeApp.Cell(1, 1)]);
                        world.tick();
                        expect(world.lifeCells).toContain(new GameOfLifeApp.Cell(0, 1));
                    });
                });
                describe('Any live cell with more than three live neighbours dies', function () {
                    it('Cell with four neighbours will die', function () {
                        world = new GameOfLifeApp.World([
                            new GameOfLifeApp.Cell(-1, 1),
                            new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1), new GameOfLifeApp.Cell(0, 2),
                            new GameOfLifeApp.Cell(1, 1)
                        ]);
                        world.tick();
                        expect(world.lifeCells).not.toContain(new GameOfLifeApp.Cell(0, 1));
                    });
                    it('Cell with eight neighbours will die', function () {
                        world = new GameOfLifeApp.World([
                            new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 1), new GameOfLifeApp.Cell(0, 2),
                            new GameOfLifeApp.Cell(1, 0), new GameOfLifeApp.Cell(1, 1), new GameOfLifeApp.Cell(1, 2),
                            new GameOfLifeApp.Cell(2, 0), new GameOfLifeApp.Cell(2, 1), new GameOfLifeApp.Cell(2, 2),
                        ]);
                        world.tick();
                        expect(world.lifeCells).not.toContain(new GameOfLifeApp.Cell(1, 1));
                    });
                });
                it('Any dead cell with exactly three live neighbours becomes a live cell', function () {
                    world = new GameOfLifeApp.World([
                        new GameOfLifeApp.Cell(0, 0), new GameOfLifeApp.Cell(0, 2),
                        new GameOfLifeApp.Cell(2, 1)
                    ]);
                    world.tick();
                    expect(world.lifeCells).toContain(new GameOfLifeApp.Cell(1, 1));
                });
            });
        });
    });
})(GameOfLifeApp || (GameOfLifeApp = {}));
