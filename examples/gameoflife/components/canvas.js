/// <reference path="../../../src/bobril.d.ts"/>
/// <reference path="../../../src/bobril.vg.d.ts" />
/// <reference path="../model/cell.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var Canvas = (function () {
        function Canvas() {
        }
        Canvas.init = function (ctx) {
        };
        Canvas.render = function (ctx, me) {
            me.tag = 'div';
            me.children = [
                {
                    component: b.vg,
                    data: { width: ctx.data.width, height: ctx.data.height },
                    children: [
                        {
                            data: {
                                path: ["rect", 0, 0, ctx.data.width, ctx.data.height],
                                stroke: 'red'
                            }
                        },
                        ctx.data.lifeCels.map(function (cell) {
                            return {
                                data: {
                                    path: [
                                        'rect',
                                        cell.positionX * (4 + 1) + ctx.data.width / 2,
                                        cell.positionY * (4 + 1) + ctx.data.height / 2,
                                        4 - 1,
                                        4 - 1
                                    ],
                                    stroke: 'red',
                                    fill: 'red'
                                }
                            };
                        })
                    ]
                }
            ];
        };
        return Canvas;
    }());
    GameOfLifeApp.Canvas = Canvas;
})(GameOfLifeApp || (GameOfLifeApp = {}));
