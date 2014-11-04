/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.swipe.d.ts"/>

((b: IBobrilStatic) => {
    var preventDefault = b.preventDefault;

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

    function buildParam(ev: MouseEvent): ICoords {
        var coord = getCoordinates(ev);
        return {
            x: coord.x,
            y: coord.y,
        };
    }

    // The total distance in any direction before we make the call on swipe vs. scroll.
    var MOVE_BUFFER_RADIUS = 10;

    var startPos: ICoords;
    var lastPos: ICoords;
    var totalX = 0;
    var totalY = 0;

    var touchStarted: boolean = false;


    function handleMoveStartEvents(ev: MouseEvent, target: Node, node: IBobrilCacheNode) {
        startPos = getCoordinates(ev);
        touchStarted = true;
        totalX = 0;
        totalY = 0;
        lastPos = startPos;
        moveStart(ev, target, node, startPos);

        return false;
    }

    function handleMoveEndEvents(ev: MouseEvent, target: Node, node: IBobrilCacheNode) {
        if (!touchStarted) return false;
        touchStarted = false;
        return moveEnd(ev, target, node, getCoordinates(ev));
    }

    function handleMoveEvents(ev: MouseEvent, target: Node, node: IBobrilCacheNode) {
        if (!touchStarted) return false;
        // Android will send a touchcancel if it thinks we're starting to scroll.
        // So when the total distance (+ or - or both) exceeds 10px in either direction,
        // we either:
        // - On totalX > totalY, we send preventDefault() and treat this as a swipe.
        // - On totalY > totalX, we let the browser handle it as a scroll.

        if (!startPos) return false;
        var coords = getCoordinates(event);

        totalX += Math.abs(coords.x - lastPos.x);
        totalY += Math.abs(coords.y - lastPos.y);

        lastPos = coords;

        if (totalX < MOVE_BUFFER_RADIUS && totalY < MOVE_BUFFER_RADIUS) {
            return false;
        }

        // One of totalX or totalY has exceeded the buffer, so decide on swipe vs. scroll.
        if (totalY > totalX) {
            // Allow native scrolling to take over.
            touchStarted = false;
            moveCancelled(ev, target, node);
        } else {
            // Prevent the browser from scrolling.
            preventDefault(ev);
            //eventHandlers['move'] && eventHandlers['move'](coords, ev);
        }
        return false;
    }

    function handleTouchCancel(ev: MouseEvent, target: Node, node: IBobrilCacheNode) {
        touchStarted = false;
        moveCancelled(ev, target, node);
        return false;
    }

    // The maximum vertical delta for a swipe should be less than 75px.
    var MAX_VERTICAL_DISTANCE = 75;
    // Vertical distance should not be more than a fraction of the horizontal distance.
    var MAX_VERTICAL_RATIO = 0.3;
    // At least a 30px lateral motion is necessary for a swipe.
    var MIN_HORIZONTAL_DISTANCE = 30;

    var startCoords: ICoords;
    var valid: boolean;

    function analyzeSwipe(coords: ICoords): Swipe {
        // Check that it's within the coordinates.
        // Absolute vertical distance must be within tolerances.
        // Horizontal distance, we take the current X - the starting X.
        // This is negative for leftward swipes and positive for rightward swipes.
        // After multiplying by the direction (-1 for left, +1 for right), legal swipes
        // (ie. same direction as the directive wants) will have a positive delta and
        // illegal ones a negative delta.
        // Therefore this delta must be positive, and larger than the minimum.
        if (!startCoords) return Swipe.Invalid;
        var deltaY = Math.abs(coords.y - startCoords.y);
        var deltaX = coords.x - startCoords.x;
        var swipe = Swipe.Invalid;
        if (!valid) return Swipe.Invalid;// Short circuit for already-invalidated swipes. 

        if (deltaX < 0)
            swipe = Swipe.Left;
        else if (deltaX > 0)
            swipe = Swipe.Right;

        deltaX = Math.abs(deltaX);
        if (deltaX == 0 ||
            deltaY >= MAX_VERTICAL_DISTANCE ||
            deltaX <= MIN_HORIZONTAL_DISTANCE ||
            deltaY / deltaX >= MAX_VERTICAL_RATIO)
            return Swipe.Invalid;

        return swipe;
    }

    function moveCancelled(ev: MouseEvent, target: Node, node: IBobrilCacheNode) {
        valid = false;
    }

    function moveStart(ev: MouseEvent, target: Node, node: IBobrilCacheNode, coords: ICoords) {
        startCoords = coords;
        valid = true;
    }

    function moveEnd(ev: MouseEvent, target: Node, node: IBobrilCacheNode, coords: ICoords): boolean {
        var swipe = analyzeSwipe(coords);
        if (swipe == Swipe.Invalid) {
            return false;
        }

        if (!node)
            return false;

        var method = "onSwipe" + (swipe == Swipe.Right ? "Right" : "Left");
        var param: IMouseEvent = buildParam(ev);
        if (b.bubble(node, method, param)) {
            preventDefault(ev);
            return true;
        }
        return false;
    }

    var addEvent = b.addEvent;
    addEvent("touchstart", 600, handleMoveStartEvents);
    addEvent("mousedown", 600, handleMoveStartEvents);
    addEvent("touchend", 600, handleMoveEndEvents);
    addEvent("mouseup", 600, handleMoveEndEvents);
    addEvent("mousemove", 600, handleMoveEvents);
    addEvent("touchmove", 600, handleMoveEvents);
    addEvent("touchcancel", 600, handleTouchCancel);
})(b);
