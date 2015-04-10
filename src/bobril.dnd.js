/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.dnd.d.ts"/>
(function (b) {
    var lastDndId = 0;
    var DndCtx = function () {
        this.id = ++lastDndId;
        this.pointerid = -1;
        this.linkEnabled = true;
        this.copyEnabled = true;
        this.moveEnabled = true;
        this.operation = 0 /* None */;
        this.sourceCtx = null;
        this.targetCtx = null;
        this.targetPath = [];
        this.x = 0;
        this.y = 0;
        this.shift = false;
        this.ctrl = false;
        this.alt = false;
        this.meta = false;
        this.data = Object.create(null);
    };
    DndCtx.prototype.setSource = function (ctx) {
        this.sourceCtx = ctx;
    };
    DndCtx.prototype.setTargetAndOperation = function (ctx, operation) {
        this.targetCtx = ctx;
        this.operation = operation;
    };
    DndCtx.prototype.addData = function (type, data) {
        this.data[type] = data;
        return true;
    };
    DndCtx.prototype.hasData = function (type) {
        return this.data[type] !== undefined;
    };
    DndCtx.prototype.getData = function (type) {
        return this.data[type];
    };
    DndCtx.prototype.setOpEnabled = function (link, copy, move) {
        this.linkEnabled = link;
        this.copyEnabled = copy;
        this.moveEnabled = move;
    };
    DndCtx.prototype.cancelDnd = function () {
        dndmoved(null, this);
        b.bubble(this.sourceCtx.me, "onDragEnd", this);
        delete pointer2Dnd[this.pointerid];
    };
    var pointer2Dnd = Object.create(null);
    function handlePointerDown(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        }
        pointer2Dnd[ev.id] = { lastX: ev.x, lastY: ev.y, totalX: 0, totalY: 0, sourceNode: node };
        return false;
    }
    function dndmoved(node, dnd) {
        dnd.targetCtx = null;
        if (node == null || !b.bubble(node, "onDragOver", dnd) || dnd.targetCtx == null) {
            dnd.operation = 0 /* None */;
        }
        b.bubble(dnd.sourceCtx.me, "onDrag", dnd);
        var prevPath = dnd.targetPath;
        var toPath = [];
        var t = dnd.targetCtx;
        var tnode = t ? t.me : null;
        while (tnode) {
            t = tnode.ctx;
            if (t)
                toPath.push(t);
            tnode = tnode.parent;
        }
        var common = 0;
        while (common < prevPath.length && common < toPath.length && prevPath[common] === toPath[common])
            common++;
        var i = prevPath.length;
        var n;
        var c;
        while (i > common) {
            i--;
            n = prevPath[i];
            c = n.me.component;
            if (c.onDragLeave)
                c.onDragLeave(n, dnd);
        }
        while (i < toPath.length) {
            n = toPath[i];
            c = n.me.component;
            if (c.onDragEnter)
                c.onDragEnter(n, dnd);
            i++;
        }
        dnd.targetPath = toPath;
    }
    function handlePointerMove(ev, target, node) {
        console.log(node, ev.x, ev.y);
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.x = ev.x;
            dnd.y = ev.y;
            dndmoved(node, dnd);
            return true;
        }
        else if (dnd && dnd.totalX != null) {
            dnd.totalX += Math.abs(ev.x - dnd.lastX);
            dnd.totalY += Math.abs(ev.y - dnd.lastY);
            dnd.lastX = ev.x;
            dnd.lastY = ev.y;
            if (dnd.totalX + dnd.totalY > 20) {
                node = dnd.sourceNode;
                dnd = new DndCtx();
                dnd.x = ev.x;
                dnd.y = ev.y;
                dnd.pointerId = ev.id;
                if (b.bubble(node, "onDragStart", dnd) && dnd.sourceCtx != null) {
                    pointer2Dnd[ev.id] = dnd;
                    dndmoved(node, dnd);
                    return true;
                }
                else {
                    delete pointer2Dnd[ev.id];
                }
            }
        }
        return false;
    }
    function handlePointerUp(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.x = ev.x;
            dnd.y = ev.y;
            dndmoved(node, dnd);
            var t = dnd.targetCtx;
            if (t && b.bubble(t.me, "onDrop", dnd)) {
                b.bubble(dnd.sourceCtx.me, "onDragEnd", this);
                dndmoved(null, dnd);
                delete pointer2Dnd[this.pointerid];
            }
            else {
                dnd.cancelDnd();
            }
            return true;
        }
        else if (dnd) {
            delete pointer2Dnd[ev.id];
        }
        return false;
    }
    function handlePointerCancel(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        }
        else {
            delete pointer2Dnd[ev.id];
        }
        return false;
    }
    var addEvent = b.addEvent;
    addEvent("!PointerDown", 4, handlePointerDown);
    addEvent("!PointerMove", 4, handlePointerMove);
    addEvent("!PointerUp", 4, handlePointerUp);
    addEvent("!PointerCancel", 4, handlePointerCancel);
})(b);
