/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="lib.touch.d.ts"/>
(function (b, window, document) {
    var ownerCtx = null;
    var invokingOwner;
    var onClickText = "onClick";
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
    function revertVisibilityChanges(hiddenEls) {
        if (hiddenEls.length) {
            for (var i = hiddenEls.length - 1; i >= 0; --i) {
                hiddenEls[i].t.style.visibility = hiddenEls[i].p;
            }
            return true;
        }
        return false;
    }
    function pushAndHide(hiddenEls, t) {
        hiddenEls.push({ t: t, p: t.style.visibility });
        t.style.visibility = "hidden";
    }
    function pointerThroughIE(ev, target, node) {
        var hiddenEls = [];
        var t = target;
        while (hasPointerEventsNone(t)) {
            pushAndHide(hiddenEls, t);
            t = document.elementFromPoint(ev.x, ev.y);
        }
        if (revertVisibilityChanges(hiddenEls)) {
            try {
                if (b.ieVersion() < 9)
                    t.fireEvent("on" + ev.type, ev);
                else {
                    t.dispatchEvent(ev);
                }
            }
            catch (e) {
                return false;
            }
            preventDefault(ev);
            return true;
        }
        return false;
    }
    var addEvent = b.addEvent;
    function addEvent5(name, callback) {
        addEvent(name, 5, callback);
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
            pushAndHide(hiddenEls, t);
            t = document.elementFromPoint(x, y);
            node = b.deref(t);
        }
        revertVisibilityChanges(hiddenEls);
        return [t, node];
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
        return function handlePointer(ev, target, node) {
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
        for (i = 0; i < 4; i++) {
            var name = pointersEventNames[i];
            addEvent5(name.toLowerCase(), buildHandlerPointer(name));
        }
    }
    else if (window.onmspointerdown !== undefined) {
        for (i = 0; i < 4; i++) {
            var name = pointersEventNames[i];
            addEvent5("MS" + name, buildHandlerPointer(name));
        }
    }
    else {
        if (window.ontouchstart !== undefined) {
            addEvent5("touchstart", buildHandlerTouch(pointersEventNames[0]));
            addEvent5("touchmove", buildHandlerTouch(pointersEventNames[1]));
            addEvent5("touchend", buildHandlerTouch(pointersEventNames[2]));
            addEvent5("touchcancel", buildHandlerTouch(pointersEventNames[3]));
        }
        addEvent5("mousedown", buildHandlerMouse(pointersEventNames[0]));
        addEvent5("mousemove", buildHandlerMouse(pointersEventNames[1]));
        addEvent5("mouseup", buildHandlerMouse(pointersEventNames[2]));
    }
    for (var j = 0; j < 4; j++) {
        (function (name) {
            var onname = "on" + name;
            addEvent("!" + name, 50, function (ev, target, node) {
                return invokeMouseOwner(onname, ev) || b.bubble(node, onname, ev);
            });
        })(pointersEventNames[j]);
    }
    var pointersDown = Object.create(null);
    var toBust = [];
    var firstPointerDown = -1;
    var firstPointerDownTime = 0;
    var firstPointerDownX = 0;
    var firstPointerDownY = 0;
    var tapCanceled = false;
    var now = b.now;
    function diffLess(n1, n2, diff) {
        return Math.abs(n1 - n2) < diff;
    }
    var prevMousePath = [];
    function mouseEnterAndLeave(ev) {
        var param = { x: ev.x, y: ev.y };
        var t = document.elementFromPoint(ev.x, ev.y);
        var toPath = b.vdomPath(t);
        var node = toPath.length == 0 ? null : toPath[toPath.length - 1];
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.x, ev.y, t, node);
            t = fixed[0];
            toPath = b.vdomPath(t);
        }
        b.bubble(node, "onMouseOver", param);
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
    function noPointersDown() {
        return Object.keys(pointersDown).length === 0;
    }
    function bustingPointerDown(ev, target, node) {
        if (firstPointerDown === -1 && noPointersDown()) {
            firstPointerDown = ev.id;
            firstPointerDownTime = now();
            firstPointerDownX = ev.x;
            firstPointerDownY = ev.y;
            tapCanceled = false;
            mouseEnterAndLeave(ev);
        }
        pointersDown[ev.id] = ev.type;
        if (firstPointerDown !== ev.id) {
            tapCanceled = true;
        }
        return false;
    }
    function bustingPointerMove(ev, target, node) {
        if (firstPointerDown === ev.id) {
            mouseEnterAndLeave(ev);
            if (!diffLess(firstPointerDownX, ev.x, 13 /* MoveOverIsNotTap */) || !diffLess(firstPointerDownY, ev.y, 13 /* MoveOverIsNotTap */))
                tapCanceled = true;
        }
        else if (noPointersDown()) {
            mouseEnterAndLeave(ev);
        }
        return false;
    }
    function bustingPointerUp(ev, target, node) {
        delete pointersDown[ev.id];
        if (firstPointerDown == ev.id) {
            mouseEnterAndLeave(ev);
            firstPointerDown = -1;
            if (ev.type == 1 /* Touch */ && !tapCanceled) {
                if (now() - firstPointerDownTime < 750 /* TabShouldBeShorterThanMs */) {
                    b.emitEvent("!PointerCancel", ev, target, node);
                    var param = { x: ev.x, y: ev.y };
                    var handled = invokeMouseOwner(onClickText, param) || b.bubble(node, onClickText, param);
                    toBust.push([ev.x, ev.y, now() + 500 /* MaxBustDelay */, handled ? 1 : 0]);
                    return handled;
                }
            }
        }
        return false;
    }
    function bustingPointerCancel(ev, target, node) {
        delete pointersDown[ev.id];
        if (firstPointerDown == ev.id) {
            firstPointerDown = -1;
        }
        return false;
    }
    function bustingClick(ev, target, node) {
        var n = now();
        for (var i = 0; i < toBust.length; i++) {
            var j = toBust[i];
            if (j[2] < n) {
                toBust.splice(i, 1);
                i--;
                continue;
            }
            if (diffLess(j[0], ev.clientX, 50 /* BustDistance */) && diffLess(j[1], ev.clientY, 50 /* BustDistance */)) {
                toBust.splice(i, 1);
                if (j[3])
                    preventDefault(ev);
                return true;
            }
        }
        return false;
    }
    var bustingEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click"];
    var bustingEventHandlers = [bustingPointerDown, bustingPointerMove, bustingPointerUp, bustingPointerCancel, bustingClick];
    for (var i = 0; i < 5; i++) {
        addEvent(bustingEventNames[i], 3, bustingEventHandlers[i]);
    }
    function createHandlerMouse(handlerName) {
        return function (ev, target, node) {
            if (firstPointerDown != ev.id && !noPointersDown())
                return false;
            var param = { x: ev.x, y: ev.y };
            if (invokeMouseOwner(handlerName, param) || b.bubble(node, handlerName, param)) {
                return true;
            }
            return false;
        };
    }
    var mouseHandlerNames = ["Down", "Move", "Up", "Up"];
    for (var i = 0; i < 4; i++) {
        addEvent(bustingEventNames[i], 80, createHandlerMouse("onMouse" + mouseHandlerNames[i]));
    }
    function createHandler(handlerName) {
        return function (ev, target, node) {
            var param = { x: ev.clientX, y: ev.clientY };
            if (invokeMouseOwner(handlerName, param) || b.bubble(node, handlerName, param)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }
    // click must have higher priority over onchange detection
    addEvent5("click", createHandler(onClickText));
    addEvent5("dblclick", createHandler("onDoubleClick"));
    b.pointersDownCount = function () { return Object.keys(pointersDown).length; };
    b.firstPointerDownId = function () { return firstPointerDown; };
    b.ignoreClick = function (x, y) {
        toBust.push([x, y, now() + 500 /* MaxBustDelay */, 1]);
    };
    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b, window, document);
//# sourceMappingURL=bobril.mouse.js.map