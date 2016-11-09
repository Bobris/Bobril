/// <reference path="button.ts" />
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var Spinner = (function () {
        function Spinner() {
        }
        Spinner.render = function (ctx, me) {
            me.tag = 'span';
            me.children = [
                GameOfLifeApp.Button({
                    content: '-',
                    disabled: ctx.data.value == ctx.data.min,
                    onClick: function () {
                        ctx.data.value -= ctx.data.step;
                        if (ctx.data.value < ctx.data.min)
                            ctx.data.value = ctx.data.min;
                        ctx.data.onChange(ctx.data.value);
                    }
                }),
                ctx.data.value.toString(),
                GameOfLifeApp.Button({
                    content: '+',
                    disabled: ctx.data.value == ctx.data.max,
                    onClick: function () {
                        ctx.data.value += ctx.data.step;
                        if (ctx.data.value > ctx.data.max)
                            ctx.data.value = ctx.data.max;
                        ctx.data.onChange(ctx.data.value);
                    }
                })
            ];
        };
        return Spinner;
    }());
    GameOfLifeApp.Spinner = Spinner;
})(GameOfLifeApp || (GameOfLifeApp = {}));
