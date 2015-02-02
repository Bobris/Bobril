/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.mouse2.d.ts"/>
/// <reference path="../src/lib.touch.d.ts"/>

((b: IBobrilStatic, window: Window) => {
    var ownerCtx: any = null;
    var invokingOwner: boolean;

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

    function pointerThroughIE(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
        var hiddenEls: { target: HTMLElement; prevVisibility: string }[] = [];
        var t = <HTMLElement>target;
        while (hasPointerEventsNone(t)) {
            hiddenEls.push({ target: t, prevVisibility: t.style.visibility });
            t.style.visibility = "hidden";
            t = <HTMLElement>document.elementFromPoint(ev.x, ev.y);
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
                } catch (e) {
                    return false;
                }
            }
            preventDefault(ev);
            return true;
        }

        return false;
    }

    var addEvent = b.addEvent;

    function addEvent500(name: string, callback: (ev: any, target: Node, node: IBobrilCacheNode) => boolean) {
        addEvent(name, 500, callback);
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
        var hiddenEls: { target: HTMLElement; prevVisibility: string }[] = [];
        var t = <HTMLElement>target;
        while (hasPointerEventsNoneB(node)) {
            hiddenEls.push({ target: t, prevVisibility: t.style.visibility });
            t.style.visibility = "hidden";
            t = <HTMLElement>document.elementFromPoint(x, y);
            node = b.deref(t);
        }
        if (hiddenEls.length) {
            for (var i = hiddenEls.length - 1; i >= 0; --i) {
                hiddenEls[i].target.style.visibility = hiddenEls[i].prevVisibility;
            }
        }
        return [target, node];
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
        for (i = 0; i < pointersEventNames.length; i++) {
            ((name: string) => {
                addEvent500(name.toLowerCase(), buildHandlerPointer(name));
            })(pointersEventNames[i]);
        }
    } else if (window.onmspointerdown !== undefined) {
        for (i = 0; i < pointersEventNames.length; i++) {
            ((name: string) => {
                addEvent500("MS" + name, buildHandlerPointer(name));
            })(pointersEventNames[i]);
        }
    } else {
        if ((<any>window).ontouchstart !== undefined) {
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
        ((name: string) => {
            var onname = "on" + name;
            addEvent("!" + name, 500,(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode) => {
                if (invokeMouseOwner(onname, ev))
                    return true;
                return b.bubble(node, onname, ev);
            });
        })(pointersEventNames[j]);
    }

    function cleverPointerDown(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        return false;
    }

    function cleverPointerMove(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        return false;
    }

    function cleverPointerUp(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        return false;
    }

    function cleverPointerCancel(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        return false;
    }

    function cleverClick(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        return false;
    }

    var prevMousePath:IBobrilCacheNode[] = [];

    function buildMouseParam(ev: MouseEvent): IBobrilMouseEvent {
        return { x: ev.clientX, y: ev.clientY };
    }

    function mouseEnterAndLeave(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
        var param = buildMouseParam(ev);
        var toPath = b.vdomPath(ev.toElement);

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

    var cleverEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click", "mouseover"];
    var cleverEventHandlers = [cleverPointerDown, cleverPointerMove, cleverPointerUp, cleverPointerCancel, cleverClick, mouseEnterAndLeave];
    for (var i = 0; i < cleverEventNames.length; i++) {
        addEvent(cleverEventNames[i], 300, cleverEventHandlers[i]);
    }

    function createHandler(handlerName: string, dontSupportMouseOwner?: number) {
        return (ev: MouseEvent, target: Node, node: IBobrilCacheNode) => {
            var param = buildMouseParam(ev);
            if ((dontSupportMouseOwner? false:invokeMouseOwner(handlerName, param)) || b.bubble(node, handlerName, param)) {
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
    addEvent500("mouseover", createHandler("onMouseOver",1));

    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b, window);
