/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.onchange.d.ts"/>
(function (b) {
    function emitOnChange(ev, target, node) {
        if (!node)
            return false;
        var c = node.component;
        if (!c)
            return false;
        if (!c.onChange)
            return false;
        var ctx = node.ctx;
        var v = target.value;
        if (ctx["b$value"] !== v) {
            ctx["b$value"] = v;
            c.onChange(ctx, v);
        }
        return false;
    }

    var events = ["input", "cut", "paste", "keydown", "keypress", "keyup"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 100, emitOnChange);
})(b);
//# sourceMappingURL=bobril.onchange.js.map
