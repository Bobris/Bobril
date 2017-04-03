/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.onchange.d.ts"/>
(function (b) {
    var bvalue = "b$value";
    var bSelectionStart = "b$selStart";
    var bSelectionEnd = "b$selEnd";
    var tvalue = "value";
    function isCheckboxlike(el) {
        var t = el.type;
        return t === "checkbox" || t === "radio";
    }
    function stringArrayEqual(a1, a2) {
        var l = a1.length;
        if (l !== a2.length)
            return false;
        for (var j = 0; j < l; j++) {
            if (a1[j] !== a2[j])
                return false;
        }
        return true;
    }
    function stringArrayContains(a, v) {
        for (var j = 0; j < a.length; j++) {
            if (a[j] === v)
                return true;
        }
        return false;
    }
    function selectedArray(options) {
        var res = [];
        for (var j = 0; j < options.length; j++) {
            if (options[j].selected)
                res.push(options[j].value);
        }
        return res;
    }
    var prevSetValueCallback = b.setSetValue(function (el, node, newValue, oldValue) {
        var tagName = el.tagName;
        var isSelect = tagName === "SELECT";
        var isInput = tagName === "INPUT" || tagName === "TEXTAREA";
        if (!isInput && !isSelect) {
            prevSetValueCallback(el, node, newValue, oldValue);
            return;
        }
        if (node.ctx === undefined) {
            node.ctx = { me: node };
            node.component = {};
        }
        if (oldValue === undefined) {
            node.ctx[bvalue] = newValue;
        }
        var isMultiSelect = isSelect && el.multiple;
        var emitDiff = false;
        if (isMultiSelect) {
            var options = el.options;
            var currentMulti = selectedArray(options);
            if (!stringArrayEqual(newValue, currentMulti)) {
                if (oldValue === undefined || stringArrayEqual(currentMulti, oldValue) || !stringArrayEqual(newValue, node.ctx[bvalue])) {
                    for (var j = 0; j < options.length; j++) {
                        options[j].selected = stringArrayContains(newValue, options[j].value);
                    }
                    currentMulti = selectedArray(options);
                    if (stringArrayEqual(currentMulti, newValue)) {
                        emitDiff = true;
                    }
                }
                else {
                    emitDiff = true;
                }
            }
        }
        else if (isInput || isSelect) {
            if (isInput && isCheckboxlike(el)) {
                var currentChecked = el.checked;
                if (newValue !== currentChecked) {
                    if (oldValue === undefined || currentChecked === oldValue || newValue !== node.ctx[bvalue]) {
                        el.checked = newValue;
                    }
                    else {
                        emitDiff = true;
                    }
                }
            }
            else {
                var isCombobox = isSelect && el.size < 2;
                var currentValue = (el[tvalue]);
                if (newValue !== currentValue) {
                    if (oldValue === undefined || currentValue === oldValue || newValue !== node.ctx[bvalue]) {
                        if (isSelect) {
                            if (newValue === "") {
                                el.selectedIndex = isCombobox ? 0 : -1;
                            }
                            else {
                                el[tvalue] = newValue;
                            }
                            if (newValue !== "" || isCombobox) {
                                currentValue = (el[tvalue]);
                                if (newValue !== currentValue) {
                                    emitDiff = true;
                                }
                            }
                        }
                        else {
                            el[tvalue] = newValue;
                        }
                    }
                    else {
                        emitDiff = true;
                    }
                }
            }
        }
        if (emitDiff) {
            emitOnChange(null, el, node);
        }
        else {
            node.ctx[bvalue] = newValue;
        }
    });
    function emitOnChange(ev, target, node) {
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
        var hasOnChange = c.onChange != null;
        var hasOnSelectionChange = c.onSelectionChange != null;
        if (!hasOnChange && !hasOnSelectionChange)
            return false;
        var ctx = node.ctx;
        var tagName = target.tagName;
        var isSelect = tagName === "SELECT";
        var isMultiSelect = isSelect && target.multiple;
        if (hasOnChange && isMultiSelect) {
            var vs = selectedArray(target.options);
            if (!stringArrayEqual(ctx[bvalue], vs)) {
                ctx[bvalue] = vs;
                c.onChange(ctx, vs);
            }
        }
        else if (hasOnChange && isCheckboxlike(target)) {
            // Postpone change event so onClick will be processed before it
            if (ev && ev.type === "change") {
                setTimeout(function () {
                    emitOnChange(null, target, node);
                }, 10);
                return false;
            }
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
            }
            else {
                var vb = target.checked;
                if (ctx[bvalue] !== vb) {
                    ctx[bvalue] = vb;
                    c.onChange(ctx, vb);
                }
            }
        }
        else {
            if (hasOnChange) {
                var v = target.value;
                if (ctx[bvalue] !== v) {
                    ctx[bvalue] = v;
                    c.onChange(ctx, v);
                }
            }
            if (hasOnSelectionChange) {
                var sStart = target.selectionStart;
                var sEnd = target.selectionEnd;
                var sDir = target.selectionDirection;
                var swap = false;
                var oStart = ctx[bSelectionStart];
                if (sDir == null) {
                    if (sEnd === oStart)
                        swap = true;
                }
                else if (sDir === "backward") {
                    swap = true;
                }
                if (swap) {
                    var s = sStart;
                    sStart = sEnd;
                    sEnd = s;
                }
                emitOnSelectionChange(node, sStart, sEnd);
            }
        }
        return false;
    }
    function emitOnSelectionChange(node, start, end) {
        var c = node.component;
        var ctx = node.ctx;
        if (c && (ctx[bSelectionStart] !== start || ctx[bSelectionEnd] !== end)) {
            ctx[bSelectionStart] = start;
            ctx[bSelectionEnd] = end;
            c.onSelectionChange(ctx, {
                startPosition: start,
                endPosition: end
            });
        }
    }
    function select(node, start, end) {
        if (end === void 0) { end = start; }
        node.element.setSelectionRange(Math.min(start, end), Math.max(start, end), start > end ? "backward" : "forward");
        emitOnSelectionChange(node, start, end);
    }
    function emitOnMouseChange(ev, target, node) {
        var f = b.focused && b.focused();
        if (f)
            emitOnChange(ev, f.element, f);
        return false;
    }
    // click here must have lower priority (higher number) over mouse handlers
    var events = ["input", "cut", "paste", "keydown", "keypress", "keyup", "click", "change"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 10, emitOnChange);
    var mouseEvents = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel"];
    for (var i = 0; i < mouseEvents.length; i++)
        b.addEvent(mouseEvents[i], 2, emitOnMouseChange);
    b.select = select;
})(b);
