/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.mouse.d.ts"/>
/// <reference path="../src/lib.touch.d.ts"/>

((b: IBobrilStatic) => {
    var preventDefault = b.preventDefault;
    var now = b.now;
    var CLICKBUSTER_THRESHOLD = 25; // 25 pixels in any dimension is the limit for busting clicks.
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

    // Checks if the coordinates are close enough to be within the region.
    function hit(x1: number, y1: number, x2: number, y2: number) {
        return Math.abs(x1 - x2) < CLICKBUSTER_THRESHOLD && Math.abs(y1 - y2) < CLICKBUSTER_THRESHOLD;
    }

    // Checks a list of allowable regions against a click location.
    // Returns true if the click should be allowed.
    // Splices out the allowable region from the list after it has been used.
    function checkAllowableRegions(coords: number[], x: number, y: number) {
        for (var i = 0; i < coords.length; i += 2) {
            if (hit(coords[i], coords[i + 1], x, y)) {
                coords.splice(i, i + 2);
                return true; // allowable region
            }
        }
        return false; // No allowable region; bust it.
    }

    var lastPreventedTime: number;
    var touchCoordinates: number[] = [];
    var lastLabelClickCoordinates: number[];
    var bustingAllowed = false;

    function clickBuster(event: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (!bustingAllowed)
            return false;

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

        // Look for an allowable region containing this click.
        // If we find one, that means it was created by touchstart and not removed by
        // preventGhostClick, so we don't bust it.
        if (checkAllowableRegions(touchCoordinates, x, y)) {
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
    function touchStartBuster(event: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (!bustingAllowed)
            return false;

        var touches = event.touches && event.touches.length ? <any>event.touches : [event];
        var x = touches[0].clientX;
        var y = touches[0].clientY;
        touchCoordinates.push(x, y);

        setTimeout(() => {
            // Remove the allowable region.
            for (var i = 0; i < touchCoordinates.length; i += 2) {
                if (touchCoordinates[i] == x && touchCoordinates[i + 1] == y) {
                    touchCoordinates.splice(i, i + 2);
                    return;
                }
            }
        }, PREVENT_DURATION);

        return false;
    }

    // On the first call, attaches some event handlers. Then whenever it gets called, it creates a
    // zone around the touchstart where clicks will get busted.
    function preventGhostClickAndAllowBusting(x: number, y: number) {
        bustingAllowed = true;
        lastPreventedTime = now();
        checkAllowableRegions(touchCoordinates, x, y);
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

        var touches: any = ev.touches && ev.touches.length ? ev.touches : [ev];
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

        var stop = false;
        if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
            // Call preventGhostClick so the clickbuster will catch the corresponding click.
            preventGhostClickAndAllowBusting(x, y);

            // Blur the focused element (the button, probably) before firing the callback.
            // This doesn't work perfectly on Android Chrome, but seems to work elsewhere.
            // I couldn't get anything to work reliably on Android Chrome.
            if (tapElement) {
                (<any>tapElement).blur();
            }

            var disabled: any = node.attrs && node.attrs["disabled"];
            if (typeof disabled === "undefined" || disabled === false) {
                stop = emitClickEvent(ev, target, node, x, y);
            }
        }

        resetState();

        return stop;
    }

    function emitClickEvent(ev: TouchEvent, target: Node, node: IBobrilCacheNode, x: number, y: number): boolean {
        if (!node)
            return false;

        if (b.bubble(node, "onClick", {x: x, y: y})) {
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

    function buildParam(event: MouseEvent) : IMouseEvent {
        var coords = getCoordinates(event);
        return {
            x: coords.x,
            y: coords.y
        }
    }

    function createHandler(handlerName: string) {
        return (ev: MouseEvent, target: Node, node: IBobrilCacheNode) => {
            if (!node)
                return false;
            var param: IMouseEvent = buildParam(ev);
            if (b.bubble(node, handlerName, param)) {
                preventDefault(ev);
                return true;
            }
            return false;
        };
    }

    function isValidMouseLeave(ev: MouseEvent): boolean {
        var from = ev.fromElement;
        var to = ev.toElement;
        while (to) {
            to = (<any>to).parentElement;
            if (to == from) {
                return false;
            }
        }
        return true;
    }

    function createNoBubblingHandler(handlerName: string, validator?: (ev: IMouseEvent) => boolean) {
        return (ev: MouseEvent, target: Node, node: IBobrilCacheNode) => {
            if (!node)
                return false;

            var param: IMouseEvent = buildParam(ev);
            var c = node.component;
            
            if (c) {
                if (validator && !validator(ev))
                    return false;

                var m = (<any>c)[handlerName];
                if (m) {
                    m.call(c, node.ctx, param);
                }
            }

            return false;
        };
    }
    
    var addEvent = b.addEvent;
    addEvent("click", 1, clickBuster);
    addEvent("touchstart", 1, touchStartBuster);

    addEvent("mouseover", 300, createNoBubblingHandler("onMouseEnter")); // bubbling mouseover and out are same basically same as nonbubling mouseenter and leave
    addEvent("mouseout", 300, createNoBubblingHandler("onMouseLeave", isValidMouseLeave));

    addEvent("click", 400, createHandler("onClick"));
    addEvent("dblclick", 400, createHandler("onDoubleClick"));
    addEvent("mousedown", 400, createHandler("onMouseDown"));
    addEvent("mouseup", 400, createHandler("onMouseUp"));
    addEvent("mousemove", 400, createHandler("onMouseMove"));
    addEvent("mouseover", 400, createHandler("onMouseOver"));

    addEvent("touchstart", 500, handleTouchStart);
    addEvent("touchcancel", 500, tapCanceled);
    addEvent("touchend", 500, handleTouchEnd);
    addEvent("touchmove", 500, tapCanceled);
})(b)
