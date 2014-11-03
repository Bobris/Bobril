/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.mouse.d.ts"/>
/// <reference path="../src/lib.touch.d.ts"/>

((b: IBobrilStatic) => {
    var tapping: boolean = false;
    var tapElement: Node;
    var startTime: number;
    var touchStartX: number;
    var touchStartY: number;
        
    function handleTouchStart(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        tapping = true;
        tapElement = target;
        //tapElement = ev.target ? ev.target : ev.srcElement; // IE uses srcElement.
        // Hack for Safari, which can target text nodes instead of containers.
        if (tapElement.nodeType == 3) {
            tapElement = tapElement.parentNode;
        }

        startTime = Date.now();

        var touches: any = ev.touches && ev.touches.length ? ev.touches : [ev];
        var e = touches[0].originalEvent || touches[0];
        touchStartX = e.clientX;
        touchStartY = e.clientY;
        return false;
    }

    var TAP_DURATION = 750; // Shorter than 750ms is a tap, longer is a taphold or drag.
    var MOVE_TOLERANCE = 12; // 12px seems to work in most mobile browsers.

    function handleTouchEnd(ev: TouchEvent, target: Node, node: IBobrilCacheNode): boolean {
        var diff = Date.now() - startTime;
        
        var touches: any = (ev.changedTouches && ev.changedTouches.length) ? ev.changedTouches : ((ev.touches && ev.touches.length) ? <any>ev.touches : [ev]);
        var e = touches[0].originalEvent || touches[0];
        var x = e.clientX;
        var y = e.clientY;
        var dist = Math.sqrt(Math.pow(x - touchStartX, 2) + Math.pow(y - touchStartY, 2));

        var stop = false;
        if (tapping && diff < TAP_DURATION && dist < MOVE_TOLERANCE) {
            // Call preventGhostClick so the clickbuster will catch the corresponding click.
            preventGhostClick(x, y);


            // Blur the focused element (the button, probably) before firing the callback.
            // This doesn't work perfectly on Android Chrome, but seems to work elsewhere.
            // I couldn't get anything to work reliably on Android Chrome.
            if (tapElement) {
                (<any>tapElement).blur();
            }

            //if (typeof attr.disabled !== 'undefined' || attr.disabled === false) {
                //element.triggerHandler('click', [event]);
                 stop = emitClickEvent(ev, target, node, x, y);
            //}
        }

        resetState();

        return stop;
    }

    function emitClickEvent(ev: TouchEvent, target: Node, node: IBobrilCacheNode, x: number, y: number): boolean {
        if (!node)
            return false;

        if (b.bubble(node, "onClick", {x: x, y: y})) {
            ev.preventDefault();
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
        var coords = EventSanitizer.getCoordinates(event);
        return {
            x: coords.x,
            y: coords.y
        }
    }

    function createHandler(handlerName: string) {
        return function(ev: MouseEvent, target: Node, node: IBobrilCacheNode) {
            if (!node)
                return false;

            var param: IMouseEvent = buildParam(ev);
            if (b.bubble(node, handlerName, param)) {
                ev.preventDefault();
                return true;
            }
            return false;
        };
    }

    var addEvent = b.addEvent;
    addEvent("dblclick", 400, createHandler("onDoubleClick"));
    //addEvent("tap", 400, createHandler("onClick"));
    addEvent("mousedown", 400, createHandler("onMouseDown"));
    addEvent("mouseup", 400, createHandler("onMouseUp"));
    //addEvent("mousemove", 400, createHandler("onMouseMove"));
    //addEvent("mouseenter", 400, createHandler("onMouseEnter"));
    //addEvent("mouseleave", 400, createHandler("onMouseLeave"));
    addEvent("mouseover", 400, createHandler("onMouseOver"));

    addEvent("click", 500, createHandler("onClick"));
    addEvent("touchstart", 500, handleTouchStart);
    addEvent("touchcancel", 500, tapCanceled);
    addEvent("touchend", 500, handleTouchEnd) ;
    addEvent("touchmove", 500, tapCanceled);
})(b)