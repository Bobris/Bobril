/// <reference path="../../../src/bobril.d.ts"/>
/// <reference path="../../../src/bobril.mouse.d.ts"/>
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var ButtonComponent = {
        render: function (ctx, me) {
            me.tag = 'button';
            me.attrs = { disabled: ctx.data.disabled };
            me.children = ctx.data.content;
        },
        onClick: function (ctx, event) {
            ctx.data.onClick();
            return true;
        }
    };
    function Button(data) {
        return { component: ButtonComponent, data: data };
    }
    GameOfLifeApp.Button = Button;
})(GameOfLifeApp || (GameOfLifeApp = {}));
