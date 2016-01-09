/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.vg.d.ts"/>
var HanoiApp;
(function (HanoiApp) {
    function h(tag) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return { tag: tag, children: args };
    }
    var boardX = 700;
    var boardY = 500;
    var Plate = (function () {
        function Plate(width, height, color) {
            this.color = color;
            this.width = width;
            this.height = height;
        }
        Plate.prototype.moveTo = function (x, y) {
            this.x = x;
            this.y = y;
        };
        Plate.prototype.getHeight = function () {
            return this.height;
        };
        Plate.prototype.getWidth = function () {
            return this.width;
        };
        Plate.prototype.toVg = function () {
            return {
                data: {
                    path: ["rect", this.x, this.y, this.width, this.height],
                    stroke: "#000000",
                    fill: this.color,
                    strokeWidth: 2
                }
            };
        };
        return Plate;
    }());
    var Stand = (function () {
        function Stand(x, height) {
            this.x = x;
            this.height = height;
            this.plates = new Array();
            this.platesHeight = 0;
        }
        Stand.prototype.push = function (plate) {
            this.platesHeight += plate.getHeight();
            plate.moveTo(this.x - plate.getWidth() / 2, this.height - this.platesHeight);
            this.plates.push(plate);
        };
        Stand.prototype.pop = function () {
            var plate = this.plates.pop();
            this.platesHeight -= plate.getHeight();
            return plate;
        };
        Stand.prototype.toVg = function () {
            return {
                data: {
                    path: ["M", this.x, this.height / 4, "L", this.x, this.height],
                    stroke: "#AA1010",
                    strokeWidth: 10
                }
            };
        };
        return Stand;
    }());
    var Move = (function () {
        function Move(from, to) {
            this.from = from;
            this.to = to;
        }
        return Move;
    }());
    var Tower = (function () {
        function Tower(width, height, platesCount, platesColor) {
            this.width = width;
            this.height = height;
            this.platesCount = platesCount;
            this.plateColor = platesColor;
            this.setup();
        }
        Tower.prototype.setup = function () {
            this.stands = new Array();
            this.moves = new Array();
            this.plates = new Array();
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
        };
        Tower.prototype.tick = function () {
            if (this.movesPos >= this.moves.length)
                return;
            var move = this.moves[this.movesPos++];
            var plate = this.stands[move.from].pop();
            this.stands[move.to].push(plate);
        };
        Tower.prototype.move = function (count, from, to, temp) {
            if (count == 1) {
                this.moves.push(new Move(from, to));
            }
            else {
                this.move(count - 1, from, temp, to);
                this.moves.push(new Move(from, to));
                this.move(count - 1, temp, to, from);
            }
        };
        Tower.prototype.toVg = function () {
            var frame = ["rect", 0, 0, this.width, this.height];
            return {
                data: { path: frame, stroke: "#000080", strokeWidth: 1 }
            };
        };
        return Tower;
    }());
    var TowerControler = (function () {
        function TowerControler() {
        }
        TowerControler.init = function (ctx, me) {
            ctx.time = b.uptime();
            ctx.tower = new Tower(ctx.data.width, ctx.data.height, ctx.data.plates, ctx.data.color);
        };
        TowerControler.render = function (ctx, me, oldMe) {
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
                            ctx.tower.stands.map(function (s) { return s.toVg(); }),
                            ctx.tower.plates.map(function (p) { return p.toVg(); })
                        ]
                    }
                ];
        };
        return TowerControler;
    }());
    b.init(function () {
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
})(HanoiApp || (HanoiApp = {}));
