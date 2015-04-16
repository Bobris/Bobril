/// <reference path="../../../jasmine.d.ts" />
/// <reference path="../../../../examples/gameoflife/model/world.ts" />

module GameOfLifeApp{
    describe('Game Of Life model tests', () =>{
        describe('World', () =>{
            var world: World;
            
            describe('Constructor', () =>{
                it('Creat empty word when seed is not defined',() => {
                    world = new World();
                    expect(world.lifeCells).toBeDefined();
                });

                it('Create word whit life cells when seed is specified', () =>{
                    world = new World([new Cell(1, 1), new Cell(1, 2)]);
                    expect(world.lifeCells).toEqual([new Cell(1, 1), new Cell(1, 2)]);
                });
            });

            describe('GetAllNeighbours', () =>{
                beforeEach(() =>{
                    world = new World();
                });

                it('Return eight neighbours cells', () =>{
                    var neighbours = world.getAllNeighbours(new Cell(0, 0));
                    expect(neighbours.length).toBe(8);
                    expect(neighbours).toContain(new Cell(-1, -1));
                    expect(neighbours).toContain(new Cell(-1, 0));
                    expect(neighbours).toContain(new Cell(-1, 1));
                    expect(neighbours).toContain(new Cell(0, -1));
                    expect(neighbours).toContain(new Cell(0, 1));
                    expect(neighbours).toContain(new Cell(1, -1));
                    expect(neighbours).toContain(new Cell(1, 0));
                    expect(neighbours).toContain(new Cell(1, 1));
                });
            });

            describe('GetLifeNeighbours', () =>{
                beforeEach(() =>{
                    world = new World([new Cell(0, 0), new Cell(0, 1), new Cell(0, 2)]);
                });

                it('Return one neighbors for cell with one', () =>{
                    var lifeCells = world.getLifeNeighbors(new Cell(0, 0));
                    expect(lifeCells).toContain(new Cell(0, 1));
                    expect(lifeCells.length).toBe(1);
                });

                it('Return two neighbors for cell with two', () =>{
                    var lifeCells = world.getLifeNeighbors(new Cell(0, 1));
                    expect(lifeCells).toContain(new Cell(0, 0));
                    expect(lifeCells).toContain(new Cell(0, 2));
                    expect(lifeCells.length).toBe(2);
                });

                it('Return zero neighbors for cell without any', () =>{
                    var lifeCells = world.getLifeNeighbors(new Cell(0, 5));
                    expect(lifeCells.length).toBe(0);
                });

                it('Return one neighbor for death cell with any',() => {
                    var lifeCells = world.getLifeNeighbors(new Cell(-1, -1));
                    expect(lifeCells.length).toBe(1);
                });
            });

            describe('GetDethNeighbours', () =>{
                beforeEach(() =>{
                    world = new World([new Cell(0, 0), new Cell(0, 1), new Cell(0, 2)]);
                });

                it('Return one neighbors for cell with obe', () =>{
                    var lifeCells = world.getDethNeighbors(new Cell(0, 0));
                    expect(lifeCells).toContain(new Cell(-1, -1));
                    expect(lifeCells).toContain(new Cell(-1, 0));
                    expect(lifeCells).toContain(new Cell(-1, 1));
                    expect(lifeCells).toContain(new Cell(0, -1));
                    expect(lifeCells).toContain(new Cell(1, -1));
                    expect(lifeCells).toContain(new Cell(1, 0));
                    expect(lifeCells).toContain(new Cell(1, 1));
                    expect(lifeCells.length).toBe(7);
                });

                it('Return two neighbors for cell with two', () =>{
                    var lifeCells = world.getDethNeighbors(new Cell(0, 1));
                    expect(lifeCells.length).toBe(6);
                });
            });

            describe('IsCellAlive',() =>{
                beforeEach(() =>{
                    world = new World([new Cell(0, 0)]);
                });

                it('Return true for live cell', () =>{
                    expect(world.isCellAlive(new Cell(0, 0))).toBeTruthy();
                });

                it('Return false for death cell', () =>{
                    expect(world.isCellAlive(new Cell(0, 1))).toBeFalsy();
                });
            });

            describe('GetAllDeathNeighbours',() =>{
                it('Return empty array if there is no cell', () =>{
                    expect(new World().lifeCells.length).toBe(0);
                });

                it('Return all neighbours for alone cell', () =>{
                    world = new World([new Cell(1, 1)]);
                    var death = world.getAllDeathNeighbours();
                    expect(death.length).toBe(8);
                });

                it('Return not duplicate cells for neighbours',() => {
                    // 00000
                    // 01010
                    // 00000
                    world = new World([new Cell(1, 1), new Cell(1, 3)]);
                    var death = world.getAllDeathNeighbours();
                    expect(death).toContain(new Cell(0, 0));
                    expect(death).toContain(new Cell(0, 1));
                    expect(death).toContain(new Cell(0, 2));
                    expect(death).toContain(new Cell(0, 3));
                    expect(death).toContain(new Cell(0, 4));
                    expect(death).toContain(new Cell(1, 0));
                    expect(death).toContain(new Cell(1, 2));
                    expect(death).toContain(new Cell(1, 4));
                    expect(death).toContain(new Cell(2, 0));
                    expect(death).toContain(new Cell(2, 1));
                    expect(death).toContain(new Cell(2, 2));
                    expect(death).toContain(new Cell(2, 3));
                    expect(death).toContain(new Cell(2, 4));
                    expect(death.length).toBe(13);
                });
            });

            describe('NextMove', () =>{
                describe('Live cell with fewer than two live neighbours dies', () =>{
                    it('Cell without neighbours will die', () =>{
                        world = new World([new Cell(0, 0)]);
                        world.tick();
                        expect(world.lifeCells.length).toEqual(0);
                    });

                    it('Cell with one neighbour will die', () =>{
                        world = new World([new Cell(0, 0), new Cell(0, 1)]);
                        world.tick();
                        expect(world.lifeCells.length).toEqual(0);
                    });
                });

                describe('Any live cell with two or three live neighbours lives', () =>{
                    it('Cell with two neighbours will survive', () =>{
                        world = new World([new Cell(0, 0), new Cell(0, 1), new Cell(0, 2)]);
                        world.tick();
                        expect(world.lifeCells).toContain(new Cell(0, 1));
                    });

                    it('Cell with three neighbours will survive', () =>{
                        world = new World([new Cell(0, 0), new Cell(0, 1), new Cell(0, 2), new Cell(1, 1)]);
                        world.tick();
                        expect(world.lifeCells).toContain(new Cell(0, 1));
                    });
                });

                describe('Any live cell with more than three live neighbours dies', () =>{
                    it('Cell with four neighbours will die', () =>{
                        world = new World([
                            new Cell(-1, 1),
                            new Cell(0, 0), new Cell(0, 1), new Cell(0, 2),
                            new Cell(1, 1)
                        ]);
                        world.tick();
                        expect(world.lifeCells).not.toContain(new Cell(0, 1));
                    });

                    it('Cell with eight neighbours will die', () =>{
                        world = new World([
                            new Cell(0, 0), new Cell(0, 1), new Cell(0, 2),
                            new Cell(1, 0), new Cell(1, 1), new Cell(1, 2),
                            new Cell(2, 0), new Cell(2, 1), new Cell(2, 2),
                        ]);
                        world.tick();
                        expect(world.lifeCells).not.toContain(new Cell(1, 1));
                    });
                });

                it('Any dead cell with exactly three live neighbours becomes a live cell', () =>{
                    world = new World([
                        new Cell(0, 0), new Cell(0, 2),
                        new Cell(2, 1)
                    ]);
                    world.tick();
                    expect(world.lifeCells).toContain(new Cell(1, 1));
                });
            });
        });
    });
}
