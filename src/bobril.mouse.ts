/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.mouse.d.ts"/>
/// <reference path="../src/lib.touch.d.ts"/>

const enum ClickBusterConst { Threshold = 50 } // 50 pixels in any dimension is the limit for busting clicks.

class Coord implements ICoords {
    constructor(public x: number, public y: number) { }

    hit(x: number, y: number): boolean {
        return Math.abs(this.x - x) < ClickBusterConst.Threshold && Math.abs(this.y - y) < ClickBusterConst.Threshold;
    }
}

class CoordList {
    public coords: Coord[] = [];

    containsTouchedRegion(x: number, y: number, removeIfHit: boolean) {
        for (var i = 0; i < this.coords.length; i += 1) {
            if (this.coords[i].hit(x, y)) {
                if (removeIfHit) {
                    this.coords.splice(i, 1);
                }
                return true; // allowable region
            }
        }
        return false; // No allowable region; bust it.
    }

    push(x: number, y: number): void {
        this.coords.push(new Coord(x, y));
    }

    remove(x: number, y: number): void {
        for (var i = 0; i < this.coords.length; i += 1) {
            if (this.coords[i].x == x && this.coords[i].y == y) {
                this.coords.splice(i, 1);
                return;
            }
        }
    }
}

((b: IBobrilStatic) => {

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
    var now = b.now;
    var PREVENT_DURATION = 2500; // 2.5 seconds maximum from preventGhostClick call to click

    function getCoordinates(event: any): ICoords {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var e = (event.changedTouches && event.changedTouches[0]) ||
            (event.originalEvent && event.originalEvent.changedTouches &&
                event.originalEvent.changedTouches[0]) ||
            touches[0].originalEvent || touches[0];

        return {
            x: e.clientX,
            y: e.clientY
        };
    }

    var lastPreventedTime: number = 0;
    var touchCoordinates: CoordList = new CoordList();
    var lastLabelClickCoordinates: number[];

    function buster(event: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (now() - lastPreventedTime > PREVENT_DURATION) {
            return false; // Too old.
        }
        var touches = event.touches && event.touches.length ? <any>event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        // Work around desktop Webkit quirk where clicking a label will fire two clicks (on the label
        // and on the input element). Depending on the exact browser, this second click we don't want
        // to bust has either (0,0), negative coordinates, or coordinates equal to triggering label
        // click event
        if (x < 1 && y < 1) {
            return false; // offscreen
        }
        if (lastLabelClickCoordinates &&
            lastLabelClickCoordinates[0] === x && lastLabelClickCoordinates[1] === y) {
            return false; // input click triggered by label click
        }
        // reset label click coordinates on first subsequent click
        if (lastLabelClickCoordinates) {
            lastLabelClickCoordinates = null;
        }
        // remember label click coordinates to prevent click busting of trigger click event on input
        if ((<any>event.target).tagName.toLowerCase() === "label") {
            lastLabelClickCoordinates = [x, y];
        }

        if (!touchCoordinates.containsTouchedRegion(x, y, event.type == "click")) {
            return false;
        }

        // If we didn't find an allowable region, bust the click.
        preventDefault(event);

        // Blur focused form elements
        event.target && (<any>event.target).blur();
        return true;
    }

    // Global touchstart handler that creates an allowable region for a click event.
    // This allowable region can be removed by preventGhostClick if we want to bust it.
    function collectCoordinates(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        var touches = ev.touches && ev.touches.length ? <any>ev.touches : [ev];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        touchCoordinates.push(x, y);

        setTimeout(() => {
            // Remove the allowable region.
            touchCoordinates.remove(x, y);
        }, PREVENT_DURATION);

        return false;
    }

    var tapping: boolean = false;
    var tapElement: Node;
    var startTime: number;
    var touchStartX: number;
    var touchStartY: number;

    function handleTouchStart(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        tapping = true;
        tapElement = target;
        // Hack for Safari, which can target text nodes instead of containers.
        if (tapElement.nodeType == 3) {
            tapElement = tapElement.parentNode;
        }

        startTime = now();

        var touches: any = ev.touches && (ev.touches.length ? <any>ev.touches : [ev]);
        var e = touches[0].originalEvent || touches[0];
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        return false;
    }

    var TAP_DURATION = 750; // Shorter than 750ms is a tap, longer is a taphold or drag.
    var MOVE_TOLERANCE = 12; // 12px seems to work in most mobile browsers.

    function handleTouchEnd(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        var diff = now() - startTime;

        var touches: any = (ev.changedTouches && ev.changedTouches.length) ? ev.changedTouches : ((ev.touches && ev.touches.length) ? <any>ev.touches : [ev]);
        var e = touches[0].originalEvent || touches[0];
        var x = e.clientX;
        var y = e.clientY;
        var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));

        if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
            lastPreventedTime = now();
            // Blur the focused element (the button, probably) before firing the callback.
            // This doesn't work perfectly on Android Chrome, but seems to work elsewhere.
            // I couldn't get anything to work reliably on Android Chrome.
            if (tapElement) {
                (<any>tapElement).blur();
            }

            var disabled: any = node.attrs && node.attrs["disabled"];
            if (typeof disabled === "undefined" || disabled === false) {
                if (!emitClickEvent(ev, target, node, x, y))
                    touchCoordinates.remove(x, y); //if event was NOT consumed, we dont bust it(eg. onchange plugin needs it)
            }
        }

        resetState();

        return false;
    }

    function emitClickEvent(ev: TouchEvent, target: Node, node: IBobrilCacheNode, x: number, y: number): boolean {
        if (!node)
            return false;

        if (b.bubble(node, "onClick", { x: x, y: y })) {
            preventDefault(ev);
            return true;
        }
        return false;
    }

    function resetState() {
        tapping = false;
    }

    function tapCanceled(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        resetState();
        return false;
    }

    function buildParam(event: MouseEvent): IMouseEvent {
        var coords = getCoordinates(event);
        return {
            x: coords.x,
            y: coords.y
        }
    }

    function createHandler(handlerName: string) {
        return (ev: MouseEvent, target: Node, node: IBobrilCacheNode) => {
            var param: IMouseEvent = buildParam(ev);
            if (invokeMouseOwner(handlerName, param)) {
                return true;
            }

            if (!node)
                return false;

            if (b.bubble(node, handlerName, param)) {
                preventDefault(ev);
            }
            return false;
        };
    }


    function mouseEnterAndLeave(ev: MouseEvent, target: Node, node: IBobrilCacheNode): boolean {
        var param: IMouseEvent = buildParam(ev);
        var fromPath = b.vdomPath(ev.fromElement);
        var toPath = b.vdomPath(ev.toElement);

        var common = 0;
        while (common < fromPath.length && common < toPath.length && fromPath[common] === toPath[common])
            common++;

        var i = fromPath.length - 1;
        var n: IBobrilCacheNode;
        var c: IBobrilComponent;
        while (i >= common) {
            n = fromPath[i];
            if (n) {
                c = n.component;
                if (c && c.onMouseLeave)
                    c.onMouseLeave(n.ctx, param);
            }
            i--;
        }

        i = toPath.length - 1;
        while (i >= common) {
            n = toPath[i];
            if (n) {
                c = n.component;
                if (c && c.onMouseEnter)
                    c.onMouseEnter(n.ctx, param);
            }
            i--;
        }

        return false;
    };

    function hasPointerEventsNone(target: Node): boolean {
        var bNode = b.deref(target);
        return bNode && bNode.style && bNode.style.pointerEvents && bNode.style.pointerEvents == "none";
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
        for (var i = 0; i < mouseEvents.length; ++i) {
            addEvent(mouseEvents[i], 1, pointerThroughIE);
        }
    }

    addEvent("mousedown", 2, buster);
    addEvent("mouseup", 2, buster);
    addEvent("click", 2, buster);
    addEvent("touchstart", 3, collectCoordinates);

    addEvent("mouseover", 300, mouseEnterAndLeave);

    addEvent("click", 400, createHandler("onClick"));
    addEvent("dblclick", 400, createHandler("onDoubleClick"));
    addEvent("mousedown", 400, createHandler("onMouseDown"));
    addEvent("touchstart", 400, createHandler("onMouseDown"));
    addEvent("mouseup", 400, createHandler("onMouseUp"));
    addEvent("touchend", 400, createHandler("onMouseUp"));
    addEvent("mousemove", 400, createHandler("onMouseMove"));
    addEvent("touchmove", 400, createHandler("onMouseMove"));
    addEvent("mouseover", 400, createHandler("onMouseOver"));

    addEvent("touchstart", 500, handleTouchStart);
    addEvent("touchcancel", 500, tapCanceled);
    addEvent("touchend", 500, handleTouchEnd);
    addEvent("touchmove", 500, tapCanceled);

    b.registerMouseOwner = registerMouseOwner;
    b.isMouseOwner = isMouseOwner;
    b.isMouseOwnerEvent = isMouseOwnerEvent;
    b.releaseMouseOwner = releaseMouseOwner;
})(b);
