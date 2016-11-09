/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>

const enum Consts {
    MoveOverIsNotTap = 13,
    TapShouldBeShorterThanMs = 750,
    MaxBustDelay = 500,
    MaxBustDelayForIE = 800,
    BustDistance = 50
}

((b: IBobrilStatic, window: Window, document: Document) => {
    var ownerCtx: any = null;
    var invokingOwner: boolean;
    var onClickText = "onClick";

    function isMouseOwner(ctx: any): boolean {
        return ownerCtx === ctx;
    }

    function isMouseOwnerEvent(): boolean {
        return invokingOwner;
    }

    function registerMouseOwner(ctx: any): void {
        ownerCtx = ctx;
    }

    function releaseMouseOwner(): void {
        ownerCtx = null;
    }

    function invokeMouseOwner(handlerName: string, param: any): boolean {
        if (ownerCtx == null) {
            return false;
        }

        var handler = ownerCtx.me.component[handlerName];
        if (!handler) { // no handler available
            return false;
        }
        invokingOwner = true;
        var stop = handler(ownerCtx, param);
        invokingOwner = false;
        return stop;
    }

    var preventDefault = b.preventDefault;

    function hasPointerEventsNoneB(node: IBobrilCacheNode): boolean {
        while (node) {
            var s = node.style;
            if (s) {
                var e = s.pointerEvents;
                if (e !== undefined) {
                    if (e === "none")
                        return true;
                    return false;
                }
            }
            node = node.parent;
        }
        return false;
    }

    function hasPointerEventsNone(target: Node): boolean {
        var bNode = b.deref(target);
        return hasPointerEventsNoneB(bNode);
    }

    function revertVisibilityChanges(hiddenEls: { t: HTMLElement; p: string }[]): boolean {
        if (hiddenEls.length) {
            for (var i = hiddenEls.length - 1; i >= 0; --i) {
                hiddenEls[i].t.style.visibility = hiddenEls[i].p;
            }
            return true;
        }
        return false;
    }

    function pushAndHide(hiddenEls: { t: HTMLElement; p: string }[], t: HTMLElement) {
        hiddenEls.push({ t: t, p: t.style.visibility });
        t.style.visibility = "hidden";
    }

    function pointerThroughIE(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
        var hiddenEls: { t: HTMLElement; p: string }[] = [];
        var t = <HTMLElement>target;
        while (hasPointerEventsNone(t)) {
            pushAndHide(hiddenEls, t);
            t = <HTMLElement>document.elementFromPoint(ev.x, ev.y);
        }
        if (revertVisibilityChanges(hiddenEls)) {
            try {
                t.dispatchEvent(ev);
            } catch (e) {
                return false;
            }
            preventDefault(ev);
            return true;
        }
        return false;
    }

    var addEvent = b.addEvent;

    function addEvent5(name: string, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean) {
        addEvent(name, 5, callback);
    }

    var pointersEventNames = ["PointerDown", "PointerMove", "PointerUp", "PointerCancel"];
    var i: number;
    if (b.ieVersion() && b.ieVersion() < 11) {
        // emulate pointer-events: none in older ie
        var mouseEvents = [
            "click", "dblclick", "drag", "dragend",
            "dragenter", "dragleave", "dragover", "dragstart",
            "drop", "mousedown", "mousemove", "mouseout",
            "mouseover", "mouseup", "mousewheel", "scroll", "wheel"];
        for (i = 0; i < mouseEvents.length; ++i) {
            addEvent(mouseEvents[i], 1, pointerThroughIE);
        }
    }

    function type2Bobril(t: any): BobrilPointerType {
        if (t == "mouse") return BobrilPointerType.Mouse;
        if (t == "pen") return BobrilPointerType.Pen;
        return BobrilPointerType.Touch;
    }

    function pointerEventsNoneFix(x: number, y: number, target: Node, node: IBobrilCacheNode): [Node, IBobrilCacheNode] {
        var hiddenEls: { t: HTMLElement; p: string }[] = [];
        var t = <HTMLElement>target;
        while (hasPointerEventsNoneB(node)) {
            pushAndHide(hiddenEls, t);
            t = <HTMLElement>document.elementFromPoint(x, y);
            node = b.deref(t);
        }
        revertVisibilityChanges(hiddenEls);
        return [t, node];
    }

    function buildHandlerPointer(name: string) {
        return function handlePointerDown(ev: PointerEvent, target: Node, node: IBobrilCacheNode): boolean {
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
                target = fixed[0];
                node = fixed[1];
            }
            let button = ev.button + 1;
            let type = type2Bobril(ev.pointerType);
            let buttons = ev.buttons;
            if (button === 0 && type === BobrilPointerType.Mouse && buttons) {
                button = 1;
                while (!(buttons & 1)) { buttons = buttons >> 1; button++; }
            }
            var param: IBobrilPointerEvent = { id: ev.pointerId, type: type, x: ev.clientX, y: ev.clientY, button: button, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        }
    }

    function buildHandlerTouch(name: string) {
        return function handlePointerDown(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
            var preventDef = false;
            for (var i = 0; i < ev.changedTouches.length; i++) {
                var t = ev.changedTouches[i];
                target = <HTMLElement>document.elementFromPoint(t.clientX, t.clientY);
                node = b.deref(target);
                var param: IBobrilPointerEvent = { id: t.identifier + 2, type: BobrilPointerType.Touch, x: t.clientX, y: t.clientY, button: 1, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
                if (b.emitEvent("!" + name, param, target, node))
                    preventDef = true;
            }
            if (preventDef) {
                preventDefault(ev);
                return true;
            }
            return false;
        }
    }

    function buildHandlerMouse(name: string) {
        return function handlePointer(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
            target = <HTMLElement>document.elementFromPoint(ev.clientX, ev.clientY);
            node = b.deref(target);
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.clientX, ev.clientY, target, node);
                target = fixed[0];
                node = fixed[1];
            }
            var param: IBobrilPointerEvent = { id: 1, type: BobrilPointerType.Mouse, x: ev.clientX, y: ev.clientY, button: decodeButton(ev), shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        }
    }

    if (window.onpointerdown !== undefined) {
        for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
            var name = pointersEventNames[i];
            addEvent5(name.toLowerCase(), buildHandlerPointer(name));
        }
    } else if (window.onmspointerdown !== undefined) {
        for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
            var name = pointersEventNames[i];
            addEvent5("MS" + name, buildHandlerPointer(name));
        }
    } else {
        if ((<any>window).ontouchstart !== undefined) {
            addEvent5("touchstart", buildHandlerTouch(pointersEventNames[0]/*"PointerDown"*/));
            addEvent5("touchmove", buildHandlerTouch(pointersEventNames[1]/*"PointerMove"*/));
            addEvent5("touchend", buildHandlerTouch(pointersEventNames[2]/*"PointerUp"*/));
            addEvent5("touchcancel", buildHandlerTouch(pointersEventNames[3]/*"PointerCancel"*/));
        }
        addEvent5("mousedown", buildHandlerMouse(pointersEventNames[0]/*"PointerDown"*/));
        addEvent5("mousemove", buildHandlerMouse(pointersEventNames[1]/*"PointerMove"*/));
        addEvent5("mouseup", buildHandlerMouse(pointersEventNames[2]/*"PointerUp"*/));
    }

    for (var j = 0; j < 4 /*pointersEventNames.length*/; j++) {
        ((name: string) => {
            var onname = "on" + name;
            addEvent("!" + name, 50, (ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode) => {
                return invokeMouseOwner(onname, ev) || (b.bubble(node, onname, ev) != null);
            });
        })(pointersEventNames[j]);
    }

    var pointersDown: { [id: number]: BobrilPointerType } = Object.create(null);
    var toBust: Array<number>[] = [];
    var firstPointerDown = -1;
    var firstPointerDownTime = 0;
    var firstPointerDownX = 0;
    var firstPointerDownY = 0;
    var tapCanceled = false;
    var now = b.now;
    var lastMouseEv: IBobrilPointerEvent = null;

    function diffLess(n1: number, n2: number, diff: number) {
        return Math.abs(n1 - n2) < diff;
    }

    var prevMousePath: IBobrilCacheNode[] = [];

    function revalidateMouseIn() {
        if (lastMouseEv)
            mouseEnterAndLeave(lastMouseEv);
    }

    function mouseEnterAndLeave(ev: IBobrilPointerEvent) {
        lastMouseEv = ev;
        var t = <HTMLElement>document.elementFromPoint(ev.x, ev.y);
        var toPath = b.vdomPath(t);
        var node = toPath.length == 0 ? null : toPath[toPath.length - 1];
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.x, ev.y, t, node);
            t = <HTMLElement>fixed[0];
            toPath = b.vdomPath(t);
        }

        b.bubble(node, "onMouseOver", ev);

        var common = 0;
        while (common < prevMousePath.length && common < toPath.length && prevMousePath[common] === toPath[common])
            common++;

        var n: IBobrilCacheNode;
        var c: IBobrilComponent;
        var i = prevMousePath.length;
        if (i > 0) {
            n = prevMousePath[i - 1];
            if (n) {
                c = n.component;
                if (c && c.onMouseOut)
                    c.onMouseOut(n.ctx, ev);
            }
        }
        while (i > common) {
            i--;
            n = prevMousePath[i];
            if (n) {
                c = n.component;
                if (c && c.onMouseLeave)
                    c.onMouseLeave(n.ctx, ev);
            }
        }
        while (i < toPath.length) {
            n = toPath[i];
            if (n) {
                c = n.component;
                if (c && c.onMouseEnter)
                    c.onMouseEnter(n.ctx, ev);
            }
            i++;
        }
        prevMousePath = toPath;
        if (i > 0) {
            n = prevMousePath[i - 1];
            if (n) {
                c = n.component;
                if (c && c.onMouseIn)
                    c.onMouseIn(n.ctx, ev);
            }
        }
        return false;
    };

    function noPointersDown(): boolean {
        return Object.keys(pointersDown).length === 0;
    }

    function bustingPointerDown(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
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

    function bustingPointerMove(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        // Browser forgot to send mouse up? Let's fix it
        if (ev.type === BobrilPointerType.Mouse && ev.button === 0 && pointersDown[ev.id] != null) {
            ev.button = 1;
            b.emitEvent("!PointerUp", ev, target, node);
            ev.button = 0;
        }
        if (firstPointerDown === ev.id) {
            mouseEnterAndLeave(ev);
            if (!diffLess(firstPointerDownX, ev.x, Consts.MoveOverIsNotTap) || !diffLess(firstPointerDownY, ev.y, Consts.MoveOverIsNotTap))
                tapCanceled = true;
        } else if (noPointersDown()) {
            mouseEnterAndLeave(ev);
        }
        return false;
    }

    function bustingPointerUp(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        delete pointersDown[ev.id];
        if (firstPointerDown == ev.id) {
            mouseEnterAndLeave(ev);
            firstPointerDown = -1;
            if (ev.type == BobrilPointerType.Touch && !tapCanceled) {
                if (now() - firstPointerDownTime < Consts.TapShouldBeShorterThanMs) {
                    b.emitEvent("!PointerCancel", ev, target, node);
                    var handled = invokeMouseOwner(onClickText, ev) || (b.bubble(node, onClickText, ev) != null);
                    var delay = (b.ieVersion()) ? Consts.MaxBustDelayForIE : Consts.MaxBustDelay;
                    toBust.push([ev.x, ev.y, now() + delay, handled ? 1 : 0]);
                    return handled;
                }
            }
        }
        return false;
    }

    function bustingPointerCancel(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        delete pointersDown[ev.id];
        if (firstPointerDown == ev.id) {
            firstPointerDown = -1;
        }
        return false;
    }

    function bustingClick(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
        var n = now();
        for (var i = 0; i < toBust.length; i++) {
            var j = toBust[i];
            if (j[2] < n) {
                toBust.splice(i, 1);
                i--;
                continue;
            }
            if (diffLess(j[0], ev.clientX, Consts.BustDistance) && diffLess(j[1], ev.clientY, Consts.BustDistance)) {
                toBust.splice(i, 1);
                if (j[3]) preventDefault(ev);
                return true;
            }
        }
        return false;
    }

    var bustingEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click"];
    var bustingEventHandlers = [bustingPointerDown, bustingPointerMove, bustingPointerUp, bustingPointerCancel, bustingClick];
    for (var i = 0; i < 5 /*bustingEventNames.length*/; i++) {
        addEvent(bustingEventNames[i], 3, bustingEventHandlers[i]);
    }

    function createHandlerMouse(handlerName: string) {
        return (ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode) => {
            if (firstPointerDown != ev.id && !noPointersDown()) return false;
            if (invokeMouseOwner(handlerName, ev) || b.bubble(node, handlerName, ev)) {
                return true;
            }
            return false;
        };
    }

    var mouseHandlerNames = ["Down", "Move", "Up", "Up"];
    for (var i = 0; i < 4; i++) {
        addEvent(bustingEventNames[i], 80, createHandlerMouse("onMouse" + mouseHandlerNames[i]));
    }

    function decodeButton(ev: MouseEvent): number {
        return ev.which || ev.button;
    }

    function createHandler(handlerName: string, allButtons?: boolean) {
        return (ev: MouseEvent, target: Node, node: IBobrilCacheNode) => {
            let button = decodeButton(ev) || 1;
            // Ignore non left mouse click/dblclick event, but not for contextmenu event
            if (!allButtons && button !== 1) return false;
            var param: IBobrilMouseEvent = { x: ev.clientX, y: ev.clientY, button: button, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
            if (invokeMouseOwner(handlerName, param) || b.bubble(node, handlerName, param)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }

    function nodeOnPoint(x: number, y: number): IBobrilCacheNode {
        var target = <HTMLElement>document.elementFromPoint(x, y);
        var node = b.deref(target);
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(x, y, target, node);
            node = fixed[1];
        }
        return node;
    }

    function handleSelectStart(ev: any, target: Node, node: IBobrilCacheNode): boolean {
        while (node) {
            var s = node.style;
            if (s) {
                var us = s.userSelect;
                if (us === "none") {
                    preventDefault(ev);
                    return true;
                }
                if (us) {
                    break;
                }
            }
            node = node.parent;
        }
        return false;
    }

    addEvent5("selectstart", handleSelectStart);

    // click must have higher priority over onchange detection
    addEvent5("click", createHandler(onClickText));
    addEvent5("dblclick", createHandler("onDoubleClick"));
    addEvent5("contextmenu", createHandler("onContextMenu", true));

    let wheelSupport = ("onwheel" in document.createElement("div") ? "" : "mouse") + "wheel";
    function handleMouseWheel(ev: any, target: Node, node: IBobrilCacheNode): boolean {
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
            target = fixed[0];
            node = fixed[1];
        }
        let button = ev.button + 1;
        let buttons = ev.buttons;
        if (button === 0 && buttons) {
            button = 1;
            while (!(buttons & 1)) { buttons = buttons >> 1; button++; }
        }
        let dx = 0, dy: number;
        if (wheelSupport == "mousewheel") {
            dy = - 1 / 40 * ev.wheelDelta;
            ev.wheelDeltaX && (dx = - 1 / 40 * ev.wheelDeltaX);
        } else {
            dx = ev.deltaX;
            dy = ev.deltaY;
        }
        var param: IBobrilMouseWheelEvent = { dx, dy, x: ev.clientX, y: ev.clientY, button: button, shift: ev.shiftKey, ctrl: ev.ctrlKey, alt: ev.altKey, meta: ev.metaKey || false, count: ev.detail };
        if (invokeMouseOwner("onMouseWheel", param) || b.bubble(node, "onMouseWheel", param)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
    addEvent5(wheelSupport, handleMouseWheel);

    b.pointersDownCount = () => Object.keys(pointersDown).length;
    b.firstPointerDownId = () => firstPointerDown;
    b.ignoreClick = (x: number, y: number) => {
        var delay = (b.ieVersion()) ? Consts.MaxBustDelayForIE : Consts.MaxBustDelay;
        toBust.push([x, y, now() + delay, 1]);
    };

    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
    b.nodeOnPoint = nodeOnPoint;
    b.revalidateMouseIn = revalidateMouseIn;
})(b, window, document);
