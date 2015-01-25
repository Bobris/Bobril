/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.mouse2.d.ts"/>
/// <reference path="../src/lib.touch.d.ts"/>
(function (b, window) {
    var ownerCtx = null;
    var invokingOwner;
    function isMouseOwner(ctx) {
        return ownerCtx === ctx;
    }
    function isMouseOwnerEvent() {
        return invokingOwner;
    }
    function registerMouseOwner(ctx) {
        ownerCtx = ctx;
    }
    function releaseMouseOwner() {
        ownerCtx = null;
    }
    function invokeMouseOwner(handlerName, param) {
        if (ownerCtx == null) {
            return false;
        }
        var handler = ownerCtx.me.component[handlerName];
        if (!handler) {
            return false;
        }
        invokingOwner = true;
        var stop = handler(ownerCtx, param);
        invokingOwner = false;
        return stop;
    }
    var preventDefault = b.preventDefault;
    function hasPointerEventsNone(target) {
        var bNode = b.deref(target);
        return bNode && bNode.attrs && bNode.attrs.style && bNode.attrs.style.pointerEvents && bNode.attrs.style.pointerEvents == "none";
    }
    function pointerThroughIE(ev, target, node) {
        var hiddenEls = [];
        var t = target;
        while (hasPointerEventsNone(t)) {
            hiddenEls.push({ target: t, prevVisibility: t.style.visibility });
            t.style.visibility = "hidden";
            t = document.elementFromPoint(ev.x, ev.y);
        }
        if (hiddenEls.length) {
            for (var i = hiddenEls.length - 1; i >= 0; --i) {
                hiddenEls[i].target.style.visibility = hiddenEls[i].prevVisibility;
            }
            if (b.ieVersion() < 9)
                t.fireEvent("on" + ev.type, ev);
            else
                t.dispatchEvent(ev);
            preventDefault(ev);
            return true;
        }
        return false;
    }
    var addEvent = b.addEvent;
    if (b.ieVersion() && b.ieVersion() < 11) {
        // emulate pointer-events: none in older ie
        var mouseEvents = [
            "click",
            "dblclick",
            "drag",
            "dragend",
            "dragenter",
            "dragleave",
            "dragover",
            "dragstart",
            "drop",
            "mousedown",
            "mousemove",
            "mouseout",
            "mouseover",
            "mouseup",
            "mousewheel",
            "scroll",
            "wheel"
        ];
        if (window.onmspointerdown)
            mouseEvents.push("MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel");
        for (var i = 0; i < mouseEvents.length; ++i) {
            addEvent(mouseEvents[i], 1, pointerThroughIE);
        }
    }
    function type2Bobril(t) {
        if (t == "mouse")
            return BobrilPointerType.Mouse;
        if (t == "pen")
            return BobrilPointerType.Pen;
        return BobrilPointerType.Touch;
    }
    function buildHandlerPointer(name) {
        return function handlePointerDown(ev, target, node) {
            var param = { id: ev.pointerId + 2, type: type2Bobril(ev.pointerType), x: ev.clientX, y: ev.clientY };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }
    if (window.onpointerdown) {
        addEvent("pointerdown", 500, buildHandlerPointer("PointerDown"));
        addEvent("pointermove", 500, buildHandlerPointer("PointerMove"));
        addEvent("pointerup", 500, buildHandlerPointer("PointerUp"));
        addEvent("pointercancel", 500, buildHandlerPointer("PointerCancel"));
    }
    if (window.onmspointerdown) {
        addEvent("MSPointerDown", 500, buildHandlerPointer("PointerDown"));
        addEvent("MSPointerMove", 500, buildHandlerPointer("PointerMove"));
        addEvent("MSPointerUp", 500, buildHandlerPointer("PointerUp"));
        addEvent("MSPointerCancel", 500, buildHandlerPointer("PointerCancel"));
    }
    if (window.ontouchstart) {
    }
    addEvent("!PointerDown", 500, function (ev, target, node) {
        return b.bubble(node, "onPointerDown", ev);
    });
    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b, window);
//# sourceMappingURL=bobril.mouse2.js.map