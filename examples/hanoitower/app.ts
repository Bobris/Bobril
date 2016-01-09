/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>

module HanoiApp {
    function h(tag: string, ...args: any[]):IBobrilNode {
        return { tag: tag, children: args };
    }

    var boardX = 700;
    var boardY = 500;

    class Plate {
        constructor(width: number, height: number, color: string) {
            this.color = color;
            this.width = width;
            this.height = height;
        }

        color: string;
        width: number;
        height: number;

        x: number;
        y: number;

        moveTo(x: number, y: number) {
            this.x = x;
            this.y = y;
        }

        getHeight(): number {
            return this.height;
        }

        getWidth(): number {
            return this.width;
        }

        toVg(): any {
            return {
                data: {
                    path: ["rect", this.x, this.y, this.width, this.height],
                    stroke: "#000000",
                    fill: this.color,
                    strokeWidth: 2
                }
            };
        }
    }

    class Stand {
        constructor(x: number, height: number) {
            this.x = x;
            this.height = height;
            this.plates = new Array<Plate>();
            this.platesHeight = 0;
        }

        x: number;
        height: number;
        plates: Array<Plate>;
        platesHeight: number;

        push(plate: Plate) {
            this.platesHeight += plate.getHeight();
            plate.moveTo(this.x - plate.getWidth() / 2, this.height - this.platesHeight);
            this.plates.push(plate);
        }

        pop(): Plate {
            var plate = this.plates.pop();
            this.platesHeight -= plate.getHeight();
            return plate;
        }

        toVg(): any {
            return {
                data: {
                    path: ["M", this.x, this.height / 4, "L", this.x, this.height],
                    stroke: "#AA1010",
                    strokeWidth: 10
                }
            };
        }
    }

    class Move {
        constructor(from: number, to: number) {
            this.from = from;
            this.to = to;
        }

        from: number;
        to: number;
    }

    class Tower {
        constructor(width: number, height: number, platesCount: number, platesColor: string) {
            this.width = width;
            this.height = height;
            this.platesCount = platesCount;
            this.plateColor = platesColor;
            this.setup();
        }

        width: number;
        height: number;
        platesCount: number;
        stands: Array<Stand>;
        plates: Array<Plate>;
        moves: Array<Move>;
        movesPos: number;
        plateColor: string;

        setup() {
            this.stands = new Array<Stand>();
            this.moves = new Array<Move>();
            this.plates = new Array<Plate>();
            this.movesPos = 0;

            var w = this.width / 3;
            var stand = new Stand(w / 2, this.height);
            var pw = w;
            for (var i = 0; i < this.platesCount; i++) {
                var plate = new Plate(pw - 4, this.height * 3 / 4 / this.platesCount, this.plateColor);
                stand.push(plate);
                this.plates.push(plate);
                pw *= 0.8;
            }
            this.stands.push(stand);
            this.stands.push(new Stand(w * 1.5, this.height));
            this.stands.push(new Stand(w * 2.5, this.height));

            this.move(this.platesCount, 0, 2, 1);
        }

        tick() {
            if (this.movesPos >= this.moves.length)
                return;
            var move = this.moves[this.movesPos++];
            var plate = this.stands[move.from].pop();
            this.stands[move.to].push(plate);
        }

        move(count: number, from: number, to: number, temp: number) {
            if (count == 1) {
                this.moves.push(new Move(from, to));
            } else {
                this.move(count - 1, from, temp, to);
                this.moves.push(new Move(from, to));
                this.move(count - 1, temp, to, from);
            }
        }

        toVg(): any {
            var frame = ["rect", 0, 0, this.width, this.height];

            return {
                data: { path: frame, stroke: "#000080", strokeWidth: 1 }
            };
        }
    }

    interface ITowerData {
        width: number;
        height: number;
        plates: number;
        color: string;
        speed: number;
    }

    interface ITowerCtx {
        time: number;
        tower: Tower;

        data: ITowerData;
    }

    class TowerControler implements IBobrilComponent {
        static init(ctx: ITowerCtx, me: IBobrilNode) {
            ctx.time = b.uptime();
            ctx.tower = new Tower(ctx.data.width, ctx.data.height, ctx.data.plates, ctx.data.color);
        }

        static render(ctx: ITowerCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var a = b.uptime();
            while (a > ctx.time) {
                ctx.tower.tick();
                ctx.time += ctx.data.speed;
            }
            me.tag = "div";
            me.children =
            [
                {
                    component: b.vg,
                    data: { width: ctx.tower.width + "px", height: ctx.tower.height + "px" },
                    children: [
                        ctx.tower.toVg(),
                        ctx.tower.stands.map(s => s.toVg()),
                        ctx.tower.plates.map(p => p.toVg())
                    ]
                }
            ];
        }
    }

    b.init(() => {
        b.invalidate();
        return [
            h("h1", "Hanoi Tower"),
            {
                tag: "div", attrs: { tabindex: 0 }, style: { width: boardX + "px", height: boardY + "px", outline: "0" },
                component: TowerControler,
                data: { width: boardX, height: boardY, plates: 10, color: "#00AA11", speed: 50 }
            },
            {
                tag: "div", attrs: { tabindex: 0 }, style: { width: boardX / 2 + "px", height: boardY / 2 + "px", outline: "0", "float": "left" },
                component: TowerControler,
                data: { width: boardX / 2, height: boardY / 2, plates: 8, color: "#992222", speed: 200 }
            },
            {
                tag: "div", attrs: { tabindex: 0 }, style: { width: boardX / 2 + "px", height: boardY / 2 + "px", outline: "0", "margin-left": boardX / 2 + "px" },
                component: TowerControler,
                data: { width: boardX / 2, height: boardY / 2, plates: 7, color: "#1111AA", speed: 400 }
            }
        ];
    });
}
