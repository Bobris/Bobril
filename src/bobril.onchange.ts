/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.onchange.d.ts"/>

((b: IBobrilStatic) => {
    var bvalue = "b$value";
    var tvalue = "value";

    function isCheckboxlike(el: HTMLInputElement) {
        var t = el.type;
        return t === "checkbox" || t === "radio";
    }

    function stringArrayEqual(a1: string[], a2: string[]): boolean {
        var l = a1.length;
        if (l !== a2.length) return false;
        for (var j = 0; j < l; j++) {
            if (a1[j] !== a2[j]) return false;
        }
        return true;
    }

    function stringArrayContains(a: string[], v: string): boolean {
        for (var j = 0, l = a.length; j < l; j++) {
            if (a[j] === v) return true;
        }
        return false;
    }

    function selectedArray(options: HTMLSelectElement): string[] {
        var res: string[] = [];
        for (var j = 0; j < options.length; j++) {
            if (options[j].selected) res.push(options[j].value);
        }
        return res;
    }

    var prevSetValueCallback = b.setSetValue((el: Element, node: IBobrilCacheNode, newValue: any, oldValue: any) => {
        var tagName = el.tagName;
        var isSelect = tagName === "SELECT";
        var isInput = tagName === "INPUT" || tagName === "TEXTAREA";
        if (!isInput && !isSelect) {
            prevSetValueCallback(el, node, newValue, oldValue);
            return;
        }
        if (node.ctx === undefined) node.ctx = {};
        if (oldValue === undefined) {
            (<any>node.ctx)[bvalue] = newValue;
        }
        var isMultiSelect = isSelect && (<HTMLSelectElement>el).multiple;
        var emitDiff = false;
        if (isMultiSelect) {
            var options = (<HTMLSelectElement>el).options;
            var currentMulti = selectedArray(options);
            if (!stringArrayEqual(newValue, currentMulti)) {
                if (oldValue === undefined || stringArrayEqual(currentMulti, oldValue) || !stringArrayEqual(newValue, (<any>node.ctx)[bvalue])) {
                    for (var j = 0; j < options.length; j++) {
                        options[j].selected = stringArrayContains(newValue, options[j].value);
                    }
                    currentMulti = selectedArray(options);
                    if (stringArrayEqual(currentMulti, newValue)) {
                        emitDiff = true;
                    }
                } else {
                    emitDiff = true;
                }
            }
        } else if (isInput || isSelect) {
            if (isInput && isCheckboxlike(<HTMLInputElement>el)) {
                var currentChecked = (<any>el).checked;
                if (newValue !== currentChecked) {
                    if (oldValue === undefined || currentChecked === oldValue || newValue !== (<any>node.ctx)[bvalue]) {
                        (<any>el).checked = newValue;
                    } else {
                        emitDiff = true;
                    }
                }
            } else {
                var isCombobox = isSelect && (<HTMLSelectElement>el).size < 2;
                var currentValue = ((<any>el)[tvalue]);
                if (newValue !== currentValue) {
                    if (oldValue === undefined || currentValue === oldValue || newValue !== (<any>node.ctx)[bvalue]) {
                        if (isSelect) {
                            if (newValue === "") {
                                (<HTMLSelectElement>el).selectedIndex = isCombobox ? 0 : -1;
                            } else {
                                (<any>el)[tvalue] = newValue;
                            }
                            if (newValue !== "" || isCombobox) {
                                currentValue = ((<any>el)[tvalue]);
                                if (newValue !== currentValue) {
                                    emitDiff = true;
                                }
                            }
                        } else {
                            (<any>el)[tvalue] = newValue;
                        }
                    } else {
                        emitDiff = true;
                    }
                }
            }
        }
        if (emitDiff) {
            emitOnChange(null, el, node);
        } else {
            (<any>node.ctx)[bvalue] = newValue;
        }
    });

    function emitOnChange(ev: Event, target: Node, node: IBobrilCacheNode) {
        if (target && target.nodeName === "OPTION") {
            target = document.activeElement;
            node = b.deref(target);
        }
        if (!node) {
            return false;
        }
        var c = node.component;
        if (!c)
            return false;
        if (!c.onChange)
            return false;
        var ctx = node.ctx;
        var tagName = (<Element>target).tagName;
        var isSelect = tagName === "SELECT";
        var isMultiSelect = isSelect && (<HTMLSelectElement>target).multiple;
        if (isMultiSelect) {
            var vs = selectedArray((<HTMLSelectElement>target).options);
            if (!stringArrayEqual((<any>ctx)[bvalue], vs)) {
                (<any>ctx)[bvalue] = vs;
                c.onChange(ctx, vs);
            }
        } else if (isCheckboxlike(<HTMLInputElement>target)) {
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
