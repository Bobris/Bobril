/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.onchange.d.ts"/>
(function (b) {
    var bvalue = "b$value";

    function isCheckboxlike(el) {
        var t = el.type;
        return t === "checkbox" || t === "radio";
    }

    function emitOnChange(ev, target, node) {
        if (!node)
            return false;
        var c = node.component;
        if (!c)
            return false;
        if (!c.onChange)
            return false;
        var ctx = node.ctx;
        if (isCheckboxlike(target)) {
            if (target.type === "radio") {
                var radios = document.getElementsByName(target.name);
                for (var j = 0; j < radios.length; j++) {
                    var radio = radios[j];
                    var radionode = b.deref(radio);
                    if (!radionode)
                        continue;
                    var radiocomponent = radionode.component;
                    if (!radiocomponent)
                        continue;
                    if (!radiocomponent.onChange)
                        continue;
                    var radioctx = radionode.ctx;
                    var vrb = radio.checked;
                    if (radioctx[bvalue] !== vrb) {
                        radioctx[bvalue] = vrb;
                        radiocomponent.onChange(radioctx, vrb);
                    }
                }
            } else {
                var vb = target.checked;
                if (ctx[bvalue] !== vb) {
                    ctx[bvalue] = vb;
                    c.onChange(ctx, vb);
                }
            }
        } else {
            var v = target.value;
            if (ctx[bvalue] !== v) {
                ctx[bvalue] = v;
                c.onChange(ctx, v);
            }
        }
        return false;
    }

    var events = ["input", "cut", "paste", "keydown", "keypress", "keyup", "click"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 100, emitOnChange);
})(b);
//# sourceMappingURL=bobril.onchange.js.map
