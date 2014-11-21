/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.onchange.d.ts"/>

((b: IBobrilStatic) => {
    var bvalue = "b$value";

    function isCheckboxlike(el: HTMLInputElement) {
        var t = el.type;
        return t === "checkbox" || t === "radio";
    }

    function emitOnChange(ev: Event, target: Node, node: IBobrilCacheNode) {
        if (!node)
            return false;
        var c = node.component;
        if (!c)
            return false;
        if (!c.onChange)
            return false;
        var ctx = node.ctx;
        if (isCheckboxlike(<HTMLInputElement>target)) {
            if ((<HTMLInputElement>target).type === "radio") {
                var radios = document.getElementsByName((<HTMLInputElement>target).name);
                for (var j = 0; j < radios.length; j++) {
                    var radio = radios[j];
                    var radionode = b.deref(radio);
                    if (!radionode) continue;
                    var radiocomponent = radionode.component;
                    if (!radiocomponent) continue;
                    if (!radiocomponent.onChange) continue;
                    var radioctx = radionode.ctx;
                    var vrb = (<HTMLInputElement>radio).checked;
                    if ((<any>radioctx)[bvalue] !== vrb) {
                        (<any>radioctx)[bvalue] = vrb;
                        radiocomponent.onChange(radioctx, vrb);
                    }
                }
            } else {
                var vb = (<HTMLInputElement>target).checked;
                if ((<any>ctx)[bvalue] !== vb) {
                    (<any>ctx)[bvalue] = vb;
                    c.onChange(ctx, vb);
                }
            }
        } else {
            var v = (<HTMLInputElement>target).value;
            if ((<any>ctx)[bvalue] !== v) {
                (<any>ctx)[bvalue] = v;
                c.onChange(ctx, v);
            }
        }
        return false;
    }

    var events = ["input", "cut", "paste", "keydown", "keypress", "keyup", "click"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 100, emitOnChange);
})(b);
