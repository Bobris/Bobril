/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="lib.touch.d.ts"/>

const enum Consts {
    MoveOverIsNotTap = 13,
    TabShouldBeShorterThanMs = 750,
    MaxBustDelay = 500,
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

    function hasPointerEventsNoneB(node: IBobrilNode): boolean {
        return node && node.style && node.style.pointerEvents === "none";
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
                if (b.ieVersion() < 9)
                    t.fireEvent("on" + ev.type, ev);
                else {
                    t.dispatchEvent(ev);
                }
            } catch (e) {
                return false;
            }
            preventDefault(ev);
            return true;
        }
        return false;
    }

    var addEvent = b.addEvent;

    function addEvent50(name: string, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean) {
        addEvent(name, 50, callback);
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
            var param: IBobrilPointerEvent = { id: ev.pointerId, type: type2Bobril(ev.pointerType), x: ev.clientX, y: ev.clientY };
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
                var param: IBobrilPointerEvent = { id: t.identifier + 2, type: BobrilPointerType.Touch, x: t.clientX, y: t.clientY };
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
        return function handlePointerDown(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
            if (hasPointerEventsNoneB(node)) {
                var fixed = pointerEventsNoneFix(ev.x, ev.y, target, node);
                target = fixed[0];
                node = fixed[1];
            }
            var param: IBobrilPointerEvent = { id: 1, type: BobrilPointerType.Mouse, x: ev.clientX, y: ev.clientY };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        }
    }

    if (window.onpointerdown !== undefined) {
        for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
            ((name: string) => {
                addEvent50(name.toLowerCase(), buildHandlerPointer(name));
            })(pointersEventNames[i]);
        }
    } else if (window.onmspointerdown !== undefined) {
        for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
            ((name: string) => {
                addEvent50("MS" + name, buildHandlerPointer(name));
            })(pointersEventNames[i]);
        }
    } else {
        if ((<any>window).ontouchstart !== undefined) {
            addEvent50("touchstart", buildHandlerTouch(pointersEventNames[0]/*"PointerDown"*/));
            addEvent50("touchmove", buildHandlerTouch(pointersEventNames[1]/*"PointerMove"*/));
            addEvent50("touchend", buildHandlerTouch(pointersEventNames[2]/*"PointerUp"*/));
            addEvent50("touchcancel", buildHandlerTouch(pointersEventNames[3]/*"PointerCancel"*/));
        }
        addEvent50("mousedown", buildHandlerMouse(pointersEventNames[0]/*"PointerDown"*/));
        addEvent50("mousemove", buildHandlerMouse(pointersEventNames[1]/*"PointerMove"*/));
        addEvent50("mouseup", buildHandlerMouse(pointersEventNames[2]/*"PointerUp"*/));
    }

    for (var j = 0; j < 4 /*pointersEventNames.length*/; j++) {
        ((name: string) => {
            var onname = "on" + name;
            addEvent("!" + name, 50,(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode) => {
                return invokeMouseOwner(onname, ev) || b.bubble(node, onname, ev);
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

    function diffLess(n1: number, n2: number, diff: number) {
        return Math.abs(n1 - n2) < diff;
    }

    var prevMousePath: IBobrilCacheNode[] = [];

    function mouseEnterAndLeave(ev: IBobrilPointerEvent) {
        var param: IBobrilMouseEvent = { x: ev.x, y: ev.y };
        var t = <HTMLElement>document.elementFromPoint(ev.x, ev.y);
        var toPath = b.vdomPath(t);
        var node = toPath.length == 0 ? null : toPath[toPath.length - 1];
        if (hasPointerEventsNoneB(node)) {
            var fixed = pointerEventsNoneFix(ev.x, ev.y, t, node);
            t = <HTMLElement>fixed[0];
            toPath = b.vdomPath(t);
        }

        b.bubble(node, "onMouseOver", param);

        var common = 0;
        while (common < prevMousePath.length && common < toPath.length && prevMousePath[common] === toPath[common])
            common++;

        var i = prevMousePath.length;
        var n: IBobrilCacheNode;
        var c: IBobrilComponent;
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
                if (now() - firstPointerDownTime < Consts.TabShouldBeShorterThanMs) {
                    b.emitEvent("!PointerCancel", ev, target, node);
                    var param: IBobrilMouseEvent = { x: ev.x, y: ev.y };
                    if (invokeMouseOwner(onClickText, param) || b.bubble(node, onClickText, param)) {
                        toBust.push([ev.x, ev.y, now() + Consts.MaxBustDelay]);
                        return true;
                    }
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
                preventDefault(ev);
                return true;
            }
        }
        return false;
    }

    var bustingEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click"];
    var bustingEventHandlers = [bustingPointerDown, bustingPointerMove, bustingPointerUp, bustingPointerCancel, bustingClick];
    for (var i = 0; i < 5 /*bustingEventNames.length*/; i++) {
        addEvent(bustingEventNames[i], 30, bustingEventHandlers[i]);
    }

    function createHandlerMouse(handlerName: string) {
        return (ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode) => {
            if (firstPointerDown != ev.id && !noPointersDown()) return false;
            var param: IBobrilMouseEvent = { x: ev.x, y: ev.y };
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

    function createHandler(handlerName: string) {
        return (ev: MouseEvent, target: Node, node: IBobrilCacheNode) => {
            var param: IBobrilMouseEvent = { x: ev.clientX, y: ev.clientY };
            if (invokeMouseOwner(handlerName, param) || b.bubble(node, handlerName, param)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }

    addEvent50("click", createHandler(onClickText));
    addEvent50("dblclick", createHandler("onDoubleClick"));

    b.pointersDownCount = () => Object.keys(pointersDown).length;
    b.firstPointerDownId = () => firstPointerDown;
    b.ignoreClick = (x: number, y: number) => {
        toBust.push([x, y, now()]);
    };

    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b, window, document);
