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

    function hasPointerEventsNone(target: Node): boolean {
        var bNode = b.deref(target);
        return bNode && bNode.attrs && bNode.attrs.style && bNode.attrs.style.pointerEvents && bNode.attrs.style.pointerEvents == "none";
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
            "click", "dblclick", "drag", "dragend",
            "dragenter", "dragleave", "dragover", "dragstart",
            "drop", "mousedown", "mousemove", "mouseout",
            "mouseover", "mouseup", "mousewheel", "scroll", "wheel"];
        if (window.onmspointerdown)
            mouseEvents.push("MSPointerDown", "MSPointerMove", "MSPointerUp", "MSPointerCancel");
        for (var i = 0; i < mouseEvents.length; ++i) {
            addEvent(mouseEvents[i], 1, pointerThroughIE);
        }
    }

    function type2Bobril(t: any): BobrilPointerType {
        if (t == "mouse") return BobrilPointerType.Mouse;
        if (t == "pen") return BobrilPointerType.Pen;
        return BobrilPointerType.Touch;
    }

    function buildHandlerPointer(name: string) {
        return function handlePointerDown(ev: PointerEvent, target: Node, node: IBobrilCacheNode): boolean {
            var param: IBobrilPointerEvent = { id: ev.pointerId + 2, type: type2Bobril(ev.pointerType), x: ev.clientX, y: ev.clientY };
            if (b.emitEvent("!" + name, param, target, node)) {
                preventDefault(ev);
                return true;
            }
            return false;
        }
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

    if ((<any>window).ontouchstart) {
        //addEvent("touchstart", 500, buildHandlerTouch("PointerDown"));
    }

    addEvent("!PointerDown", 500, (ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode) => {
        return b.bubble(node, "onPointerDown", ev);
    });

    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b, window);
