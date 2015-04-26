/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.swipe.d.ts"/>

((b: IBobrilStatic) => {
    var valid = false;
    var startX: number;
    var startY: number;
    var lastX: number;
    var lastY: number;
    var totalX: number;
    var totalY: number;

    function handlePointerDown(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (b.pointersDownCount() == 1) {
            valid = true;
            startX = ev.x;
            startY = ev.y;
            lastX = startX;
            lastY = startY;
            totalX = 0;
            totalY = 0;
        } else valid = false;
        return false;
    }

    function handlePointerMove(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (valid) {
            totalX += Math.abs(ev.x - lastX);
            totalY += Math.abs(ev.y - lastY);
            lastX = ev.x;
            lastY = ev.y;
        }
        return false;
    }

    function handlePointerUp(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (valid) {
            var deltaX = Math.abs(ev.x - startX);
            var deltaY = Math.abs(ev.y - startY);
            if (deltaX < 75) return false; // too small horizontal move
            if (deltaY / deltaX >= 0.3) return false; // too much vertial for horizontal move
            if (totalX > deltaX * 1.5) return false; // too much shaking hand
            if (totalY > deltaX * 0.7) return false; // too much shaking hand
            var method = "onSwipe" + (ev.x>startX ? "Right" : "Left");
            b.ignoreClick(ev.x, ev.y);
            b.bubble(node, method, ev);
        }
        return false;
    }

    var addEvent = b.addEvent;
    addEvent("!PointerDown", 70, handlePointerDown);
    addEvent("!PointerMove", 70, handlePointerMove);
    addEvent("!PointerUp", 70, handlePointerUp);
})(b);
