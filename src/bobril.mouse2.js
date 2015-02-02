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
    function hasPointerEventsNoneB(node) {
        return node && node.style && node.style.pointerEvents === "none";
    }
    function hasPointerEventsNone(target) {
        var bNode = b.deref(target);
        return hasPointerEventsNoneB(bNode);
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
            else {
                try {
                    t.dispatchEvent(ev);
                }
                catch (e) {
                    return false;
                }
            }
            preventDefault(ev);
            return true;
        }
        return false;
    }
    var addEvent = b.addEvent;
    function addEvent500(name, callback) {
        addEvent(name, 500, callback);
    }
    var pointersEventNames = ["PointerDown", "PointerMove", "PointerUp", "PointerCancel"];
    var i;
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
        for (i = 0; i < mouseEvents.length; ++i) {
            addEvent(mouseEvents[i], 1, pointerThroughIE);
        }
    }
    function type2Bobril(t) {
        if (t == "mouse")
            return 0 /* Mouse */;
        if (t == "pen")
            return 2 /* Pen */;
        return 1 /* Touch */;
    }
    function pointerEventsNoneFix(x, y, target, node) {
        var hiddenEls = [];
        var t = target;
        while (hasPointerEventsNoneB(node)) {
            hiddenEls.push({ target: t, prevVisibility: t.style.visibility });
            t.style.visibility = "hidden";
            t = document.elementFromPoint(x, y);
            node = b.deref(t);
        }
        if (hiddenEls.length) {
            for (var i = hiddenEls.length - 1; i >= 0; --i) {
                hiddenEls[i].target.style.visibility = hiddenEls[i].prevVisibility;
            }
        }
        return [target, node];
    }
    function buildHandlerPointer(name) {
        return function handlePointerDown(ev, target, node) {
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
                target = fixed[0];
                node = fixed[1];
            }
            var param = { id: ev.pointerId, type: type2Bobril(ev.pointerType), x: ev.clientX, y: ev.clientY };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }
    function buildHandlerTouch(name) {
        return function handlePointerDown(ev, target, node) {
            var preventDef = false;
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var t = ev.changedTouches[i];
                var param = { id: t.identifier + 2, type: 1 /* Touch */, x: t.clientX, y: t.clientY };
                if (b.emitEvent("!" + name, param, target, node))
                    preventDef = true;
            }
            if (preventDef) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }
    function buildHandlerMouse(name) {
        return function handlePointerDown(ev, target, node) {
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
                target = fixed[0];
                node = fixed[1];
            }
            var param = { id: 1, type: 0 /* Mouse */, x: ev.clientX, y: ev.clientY };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }
    if (window.onpointerdown !== undefined) {
        for (i = 0; i < pointersEventNames.length; i++) {
            (function (name) {
                addEvent500(name.toLowerCase(), buildHandlerPointer(name));
            })(pointersEventNames[i]);
        }
    }
    else if (window.onmspointerdown !== undefined) {
        for (i = 0; i < pointersEventNames.length; i++) {
            (function (name) {
                addEvent500("MS" + name, buildHandlerPointer(name));
            })(pointersEventNames[i]);
        }
    }
    else {
        if (window.ontouchstart !== undefined) {
            addEvent500("touchstart", buildHandlerTouch("PointerDown"));
            addEvent500("touchmove", buildHandlerTouch("PointerMove"));
            addEvent500("touchend", buildHandlerTouch("PointerUp"));
            addEvent500("touchcancel", buildHandlerTouch("PointerCancel"));
        }
        addEvent500("mousedown", buildHandlerMouse("PointerDown"));
        addEvent500("mousemove", buildHandlerMouse("PointerMove"));
        addEvent500("mouseup", buildHandlerMouse("PointerUp"));
    }
    for (var j = 0; j < pointersEventNames.length; j++) {
        (function (name) {
            var onname = "on" + name;
            addEvent("!" + name, 500, function (ev, target, node) {
                if (invokeMouseOwner(onname, ev))
                    return true;
                return b.bubble(node, onname, ev);
            });
        })(pointersEventNames[j]);
    }
    function cleverPointerDown(ev, target, node) {
        return false;
    }
    function cleverPointerMove(ev, target, node) {
        return false;
    }
    function cleverPointerUp(ev, target, node) {
        return false;
    }
    function cleverPointerCancel(ev, target, node) {
        return false;
    }
    function cleverClick(ev, target, node) {
        return false;
    }
    var prevMousePath = [];
    function buildMouseParam(ev) {
        return { x: ev.clientX, y: ev.clientY };
    }
    function mouseEnterAndLeave(ev, target, node) {
        var param = buildMouseParam(ev);
        var toPath = b.vdomPath(ev.toElement);
        var common = 0;
        while (common < prevMousePath.length && common < toPath.length && prevMousePath[common] === toPath[common])
            common++;
        var i = prevMousePath.length;
        var n;
        var c;
        while (i > common) {
            i--;
            n = prevMousePath[i];
            if (n) {
                c = n.component;
                if (c && c.onMouseLeave)
                    c.onMouseLeave(n.ctx, param);
            }
        }
        while (i < toPath.length) {
            n = toPath[i];
            if (n) {
                c = n.component;
                if (c && c.onMouseEnter)
                    c.onMouseEnter(n.ctx, param);
            }
            i++;
        }
        prevMousePath = toPath;
        return false;
    }
    ;
    var cleverEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click", "mouseover"];
    var cleverEventHandlers = [cleverPointerDown, cleverPointerMove, cleverPointerUp, cleverPointerCancel, cleverClick, mouseEnterAndLeave];
    for (var i = 0; i < cleverEventNames.length; i++) {
        addEvent(cleverEventNames[i], 300, cleverEventHandlers[i]);
    }
    function createHandler(handlerName, dontSupportMouseOwner) {
        return function (ev, target, node) {
            var param = buildMouseParam(ev);
            if ((dontSupportMouseOwner ? false : invokeMouseOwner(handlerName, param)) || b.bubble(node, handlerName, param)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }
    addEvent500("mousedown", createHandler("onMouseDown"));
    addEvent500("mouseup", createHandler("onMouseUp"));
    addEvent500("mousemove", createHandler("onMouseMove"));
    addEvent500("click", createHandler("onClick"));
    addEvent500("dblclick", createHandler("onDoubleClick"));
    addEvent500("mouseover", createHandler("onMouseOver", 1));
    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b, window);
//# sourceMappingURL=bobril.mouse2.js.map