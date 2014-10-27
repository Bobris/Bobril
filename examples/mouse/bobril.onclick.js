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
            //clientX: ev.clientX || ev.pageX,
            //clientY: ev.clientY || ev.pageY,
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
        return false;
    }

    function handleMoveEnd(ev, target, node) {
        touchStarted = false;

        return false;
    }

    function handleMove() {
    }

    var addEvent = b.addEvent;
    addEvent("click", 600, emitOnClick);
    addEvent("touchstart", 600, handleMoveStart);

    //addEvent("mousedown", 600, handleMoveStart);
    addEvent("tocuhend", 600, handleMoveEnd);
    //addEvent("mouseup", 600, emitOnClick);
    //addEvent("touchend", 600, emitOnClick);
})(b);
//# sourceMappingURL=bobril.onclick.js.map
