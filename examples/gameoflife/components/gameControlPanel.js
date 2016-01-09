/// <reference path="button.ts" />
/// <reference path="spinner.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var GameControlPanel = (function () {
        function GameControlPanel() {
        }
        GameControlPanel.render = function (ctx, me) {
            me.tag = 'div';
            me.children = [
                {
                    component: GameOfLifeApp.Button,
                    data: {
                        content: 'Start',
                        disabled: ctx.data.running,
                        onClick: function () {
                            ctx.data.onStart();
                        }
                    }
                },
                {
                    component: GameOfLifeApp.Button,
                    data: {
                        content: 'Stop',
                        disabled: !ctx.data.running,
                        onClick: function () {
                            ctx.data.onStop();
                        }
                    }
                },
                {
                    tag: "span",
                    children: " Next round delay: "
                },
                {
                    component: GameOfLifeApp.Spinner,
                    data: {
                        value: ctx.data.delay,
                        min: 0,
                        max: 200,
                        step: 10,
                        onChange: function (value) {
                            ctx.data.onDelayChange(value);
                        }
                    }
                }
            ];
        };
        return GameControlPanel;
    }());
    GameOfLifeApp.GameControlPanel = GameControlPanel;
})(GameOfLifeApp || (GameOfLifeApp = {}));
