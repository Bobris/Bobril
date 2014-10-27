/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.onclick.d.ts"/>
(function (b) {
    function getCoordinates(event) {
        var touches = event.touches && event.touches.length ? event.touches : [event];
        var e = (event.changedTouches && event.changedTouches[0]) || (event.originalEvent && event.originalEvent.changedTouches && event.originalEvent.changedTouches[0]) || touches[0].originalEvent || touches[0];

        return {
            x: e.clientX,
            y: e.clientY
        };
    }

    function buildParam(ev) {
        var coord = getCoordinates(ev);
        return {
            clientX: coord.x,
            clientY: coord.y
        };
    }

    function emitOnClick(ev, target, node) {
        if (!node)
            return false;
        var param = buildParam(ev);
        if (b.bubble(node, "onClick", param)) {
            ev.preventDefault();
            return true;
        }
        return false;
    }

    var startedX;
    var startedY;
    var currentX;
    var currentY;
    var touchStarted = false;

    function handleMoveStart(ev, target, node) {
        touchStarted = true;
        currentX = startedX = ev.pageX;
        currentY = startedY = ev.pageY;
        setTimeout(function () {
        }, 200);
        return false;
    }

    function handleMoveEnd(ev, target, node) {
        touchStarted = false;
        return false;
    }

    function handleMove(ev, target, node) {
        var coord = getCoordinates(ev);
        currentX = coord.x;
        currentY = coord.y;
        return false;
    }

    function handleTouchCancel(ev, target, node) {
        touchStarted = false;
        return false;
    }

    var addEvent = b.addEvent;
    addEvent("click", 600, emitOnClick);

    addEvent("touchstart", 600, handleMoveStart);
    addEvent("mousedown", 600, handleMoveStart);
    addEvent("tocuhend", 600, handleMoveEnd);
    addEvent("mouseup", 600, handleMoveEnd);
    addEvent("mousemove", 600, handleMove);
    addEvent("touchmove", 600, handleMove);
    addEvent("touchcancel", 600, handleTouchCancel);
})(b);
//# sourceMappingURL=bobril.onclick.js.map
