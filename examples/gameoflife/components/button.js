/// <reference path="../../../src/bobril.d.ts"/>
/// <reference path="../../../src/bobril.mouse.d.ts"/>
var GameOfLifeApp;
(function (GameOfLifeApp) {
    var Button = (function () {
        function Button() {
        }
        Button.render = function (ctx, me) {
            me.tag = 'button';
            if (ctx.data.disabled)
                me.attrs = { disabled: "disabled" };
            me.children = ctx.data.content;
        };
        Button.onClick = function (ctx, event) {
            ctx.data.onClick();
            return true;
        };
        return Button;
    })();
    GameOfLifeApp.Button = Button;
})(GameOfLifeApp || (GameOfLifeApp = {}));
//# sourceMappingURL=button.js.map