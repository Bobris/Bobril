/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="components/button.ts" />
/// <reference path="components/canvas.ts" />
/// <reference path="components/spinner.ts" />
/// <reference path="components/gamecontrolpanel.ts" />
/// <reference path="model/world.ts" />
/// <reference path="gamecontroller.ts" />
/// <reference path="components/header.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var startLiveCell = [
        [-12, -6], [-12, -5],
        [-11, -6], [-11, -5],
        [-3, -6], [-3, -5], [-3, -4],
        [-2, -7],
        [-1, -8],
        [0, -8],
        [-2, -3],
        [-1, -2],
        [0, -2]
    ];
    b.init(function () {
        b.invalidate();
        return [
            {
                component: GameOfLifeApp.Header,
                data: { level: GameOfLifeApp.HeaderLevel.H1, content: "Game of life" }
            },
            {
                component: GameOfLifeApp.GameController,
                data: { runing: true, width: 700, height: 350, delay: 100, startLiveCell: startLiveCell },
            }
        ];
    });
})(GameOfLifeApp || (GameOfLifeApp = {}));
