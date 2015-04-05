/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.swipe.d.ts"/>
(function (b) {
    var valid = false;
    var startX;
    var startY;
    var lastX;
    var lastY;
    var totalX;
    var totalY;
    function handlePointerDown(ev, target, node) {
        if (b.pointersDownCount() == 1) {
            valid = true;
            startX = ev.x;
            startY = ev.y;
            lastX = startX;
            lastY = startY;
            totalX = 0;
            totalY = 0;
        }
        else
            valid = false;
        return false;
    }
    function handlePointerMove(ev, target, node) {
        if (valid) {
            totalX += Math.abs(ev.x - lastX);
            totalY += Math.abs(ev.y - lastY);
            lastX = ev.x;
            lastY = ev.y;
        }
        return false;
    }
    function handlePointerUp(ev, target, node) {
        if (valid) {
            var deltaX = Math.abs(ev.x - startX);
            var deltaY = Math.abs(ev.y - startY);
            if (deltaX < 75)
                return false;
            if (deltaY / deltaX >= 0.3)
                return false;
            if (totalX > deltaX * 1.5)
                return false;
            if (totalY > deltaX * 0.7)
                return false;
            var method = "onSwipe" + (ev.x > startX ? "Right" : "Left");
            var param = { x: ev.x, y: ev.y };
            b.ignoreClick(ev.x, ev.y);
            b.bubble(node, method, param);
        }
        return false;
    }
    var addEvent = b.addEvent;
    addEvent("!PointerDown", 70, handlePointerDown);
    addEvent("!PointerMove", 70, handlePointerMove);
    addEvent("!PointerUp", 70, handlePointerUp);
})(b);
