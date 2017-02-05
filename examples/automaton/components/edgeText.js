var Automata;
(function (Automata) {
    var Components;
    (function (Components) {
        var EdgeText;
        (function (EdgeText) {
            var Component = {
                render: function (ctx, me, oldMe) {
                    var transition = ctx.data.transition;
                    me.tag = 'g';
                    me.children = [
                        {
                            tag: 'text',
                            className: 'edge-text',
                            attrs: {
                                x: transition.midPoint.x + transition.textPosition.x,
                                y: transition.midPoint.y + transition.textPosition.y
                            },
                            children: transition.from.name + " \u2192 " + transition.to.name
                        },
                        {
                            tag: 'path',
                            className: 'edge-text-line',
                            attrs: {
                                d: ''
                            }
                        }
                    ];
                },
                onPointerDown: function (ctx, event) {
                    b.registerMouseOwner(ctx);
                    ctx.downPoint = new Automata.Models.Point(event.x, event.y);
                    var textPosition = ctx.data.transition.textPosition;
                    ctx.prevPoint = new Automata.Models.Point(textPosition.x, textPosition.y);
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
                    var transition = ctx.data.transition;
                    var newX = ctx.prevPoint.x + event.x - ctx.downPoint.x;
                    var newY = ctx.prevPoint.y + event.y - ctx.downPoint.y;
                    transition.textPosition.setCoords(newX, newY);
                    b.invalidate();
                    return true;
                },
                postUpdateDom: function (ctx, me, element) {
                    var midPoint = ctx.data.transition.midPoint;
                    var bbox = element.getBBox();
                    var x;
                    var y;
                    if (bbox.x >= 0 && bbox.y >= 0) {
                        x = bbox.x + bbox.width / 2;
                        y = bbox.y + bbox.height / 2;
                    }
                    else {
                        x = midPoint.x;
                        y = midPoint.y;
                    }
                    var textLine = element.childNodes[1];
                    textLine.setAttribute('d', "M" + midPoint + "L" + x + "," + y);
                }
            };
            function Get(data) {
                return { component: Component, data: data };
            }
            EdgeText.Get = Get;
        })(EdgeText = Components.EdgeText || (Components.EdgeText = {}));
    })(Components = Automata.Components || (Automata.Components = {}));
})(Automata || (Automata = {}));
