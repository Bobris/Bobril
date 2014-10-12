/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.onchange.d.ts"/>

((b: IBobrilStatic) => {
    function emitOnChange(ev: Event, target: Node, node: IBobrilCacheNode) {
        if (!node)
            return false;
        var c = node.component;
        if (!c)
            return false;
        if (!c.onChange)
            return false;
        var ctx = node.ctx;
        var v = (<HTMLInputElement>target).value;
        if ((<any>ctx)["b$value"] !== v) {
            (<any>ctx)["b$value"] = v;
            c.onChange(ctx, v);
        }
        return false;
    }

    var events=["input","cut","paste","keydown","keypress","keyup"];
    for(var i=0;i<events.length;i++)
        b.addEvent(events[i],100,emitOnChange);
})(b);
