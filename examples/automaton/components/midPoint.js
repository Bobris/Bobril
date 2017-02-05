var Automata;
(function (Automata) {
    var Components;
    (function (Components) {
        var MidPoint;
        (function (MidPoint) {
            var Component = {
                render: function (ctx, me, oldMe) {
                    var midPoint = ctx.data.midPoint;
                    me.tag = 'circle';
                    me.className = 'edge-mid-point';
                    me.attrs = {
                        cx: midPoint.x,
                        cy: midPoint.y,
                        r: 4
                    };
                },
                onPointerDown: function (ctx, event) {
                    b.registerMouseOwner(ctx);
                    ctx.downPoint = new Automata.Models.Point(event.x, event.y);
                    var midPoint = ctx.data.midPoint;
                    ctx.prevPoint = new Automata.Models.Point(midPoint.x, midPoint.y);
                    return true;
                },
                onPointerUp: function (ctx, event) {
                    if (b.isMouseOwner(ctx)) {
                        b.releaseMouseOwner();
                    }
                    return true;
                },
                onPointerMove: function (ctx, event) {
                    if (!b.isMouseOwner(ctx)) {
                        return false;
                    }
                    var newX = ctx.prevPoint.x + event.x - ctx.downPoint.x;
                    var newY = ctx.prevPoint.y + event.y - ctx.downPoint.y;
                    ctx.data.moveMidPoint(new Automata.Models.Point(newX, newY));
                    b.invalidate();
                    return true;
                },
                onDoubleClick: function (ctx, event) {
                    ctx.data.resetMidPoint();
                    b.invalidate();
                    return true;
                }
            };
            function Get(data) {
                return { component: Component, data: data };
            }
            MidPoint.Get = Get;
        })(MidPoint = Components.MidPoint || (Components.MidPoint = {}));
    })(Components = Automata.Components || (Automata.Components = {}));
})(Automata || (Automata = {}));
