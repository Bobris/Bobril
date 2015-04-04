var Automata;
(function (Automata) {
    var Components;
    (function (Components) {
        var Canvas;
        (function (Canvas) {
            var Component = {
                render: function (ctx, me, oldMe) {
                    me.tag = 'div';
                    me.className = 'canvas';
                    me.style = {
                        width: 800,
                        height: 480,
                        border: '1px solid black',
                        cssFloat: 'left'
                    };
                    me.children = ctx.data.content;
                }
            };
            function Get(data) {
                return { component: Component, data: data };
            }
            Canvas.Get = Get;
        })(Canvas = Components.Canvas || (Components.Canvas = {}));
    })(Components = Automata.Components || (Automata.Components = {}));
})(Automata || (Automata = {}));
