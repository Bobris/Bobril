/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.onkey.d.ts"/>
(function (b) {
    function buildParam(ev) {
        return {
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            which: ev.which || ev.keyCode,
        };
    }
    var preventDefault = b.preventDefault;
    function emitOnKeyDown(ev, target, node) {
        if (!node)
            return false;
        var param = buildParam(ev);
        if (b.bubble(node, "onKeyDown", param)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
    function emitOnKeyUp(ev, target, node) {
        if (!node)
            return false;
        var param = buildParam(ev);
        if (b.bubble(node, "onKeyUp", param)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
    function emitOnKeyPress(ev, target, node) {
        if (!node)
            return false;
        if (ev.which === 0)
            return false;
        var param = { charCode: ev.which || ev.keyCode };
        if (b.bubble(node, "onKeyPress", param)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
    var addEvent = b.addEvent;
    addEvent("keydown", 50, emitOnKeyDown);
    addEvent("keyup", 50, emitOnKeyUp);
    addEvent("keypress", 50, emitOnKeyPress);
})(b);
