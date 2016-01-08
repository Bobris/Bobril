/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="model/world.ts" />
/// <reference path="components/gamecontrolpanel.ts" />
/// <reference path="components/canvas.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var GameController = (function () {
        function GameController() {
        }
        GameController.init = function (ctx) {
            ctx.nextTickTime = b.uptime();
            ctx.world = new GameOfLifeApp.World(ctx.data.startLiveCell.map(function (cordinates) {
                return new GameOfLifeApp.Cell(cordinates[0], cordinates[1]);
            }));
            this.data = ctx.data;
        };
        GameController.render = function (ctx, me) {
            var _this = this;
            var a = b.uptime();
            while (a > ctx.nextTickTime) {
                if (this.data.runing) {
                    ctx.world.tick();
                }
                ctx.nextTickTime = b.uptime() + this.data.delay;
            }
            me.tag = 'div';
            me.children = [
                {
                    component: GameOfLifeApp.GameControlPanel,
                    data: {
                        running: this.data.runing,
                        onStart: function () {
                            _this.data.runing = true;
                        },
                        onStop: function () {
                            _this.data.runing = false;
                        },
                        delay: this.data.delay,
                        onDelayChange: function (value) {
                            _this.data.delay = value;
                        }
                    }
                },
                {
                    component: GameOfLifeApp.Canvas,
                    data: { lifeCels: ctx.world.lifeCells, width: ctx.data.width, height: ctx.data.height }
                }
            ];
        };
        return GameController;
    }());
    GameOfLifeApp.GameController = GameController;
})(GameOfLifeApp || (GameOfLifeApp = {}));
