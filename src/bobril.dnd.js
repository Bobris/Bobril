/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.dnd.d.ts"/>
(function (b) {
    var lastDndId = 0;
    var dnds = [];
    var rootId = null;
    var DndCtx = function (pointerId) {
        this.id = ++lastDndId;
        this.pointerid = pointerId;
        this.linkEnabled = true;
        this.copyEnabled = true;
        this.moveEnabled = true;
        this.operation = 0 /* None */;
        this.targetCtx = null;
        this.dragView = null;
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.shift = false;
        this.ctrl = false;
        this.alt = false;
        this.meta = false;
        this.data = Object.create(null);
        if (pointerId >= 0)
            pointer2Dnd[pointerId] = this;
        dnds.push(this);
        if (rootId == null) {
            rootId = b.addRoot(dndRootFactory);
        }
    };
    var DndComp = {
        render: function (ctx, me) {
            var dnd = ctx.data;
            me.tag = "div";
            me.style = { position: "absolute", left: dnd.x, top: dnd.y };
            me.children = dnd.dragView(dnd);
        }
    };
    var DndRootComp = {
        render: function (ctx, me) {
            var res = [];
            for (var i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if (dnd.dragView != null) {
                    res.push({ key: "" + dnd.id, data: dnd, component: DndComp });
                }
            }
            me.tag = "div";
            me.style = { position: "fixed", pointerEvents: "none", left: 0, top: 0, right: 0, bottom: 0 };
            me.children = res;
        },
        onDrag: function (ctx) {
            b.invalidate(ctx);
            return false;
        }
    };
    function dndRootFactory() {
        return { component: DndRootComp };
    }
    var dndProto = DndCtx.prototype;
    dndProto.setOperation = function (operation) {
        this.operation = operation;
    };
    dndProto.setDragNodeView = function (view) {
        this.dragView = view;
    };
    dndProto.addData = function (type, data) {
        this.data[type] = data;
        return true;
    };
    dndProto.hasData = function (type) {
        return this.data[type] !== undefined;
    };
    dndProto.getData = function (type) {
        return this.data[type];
    };
    dndProto.setOpEnabled = function (link, copy, move) {
        this.linkEnabled = link;
        this.copyEnabled = copy;
        this.moveEnabled = move;
    };
    dndProto.cancelDnd = function () {
        dndmoved(null, this);
        b.broadcast("onDragEnd", this);
        this.destroy();
    };
    dndProto.destroy = function () {
        delete pointer2Dnd[this.pointerid];
        for (var i = 0; i < dnds.length; i++) {
            if (dnds[i] === this) {
                dnds.splice(i, 1);
                break;
            }
        }
        if (dnds.length === 0) {
            b.removeRoot(rootId);
            rootId = null;
        }
    };
    var pointer2Dnd = Object.create(null);
    function handlePointerDown(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        }
        pointer2Dnd[ev.id] = { lastX: ev.x, lastY: ev.y, totalX: 0, totalY: 0, startX: ev.x, startY: ev.y, sourceNode: node };
        return false;
    }
    function dndmoved(node, dnd) {
        dnd.targetCtx = b.bubble(node, "onDragOver", dnd);
        if (dnd.targetCtx == null) {
            dnd.operation = 0 /* None */;
        }
        b.broadcast("onDrag", dnd);
    }
    function handlePointerMove(ev, target, node) {
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
                var startX = dnd.startX;
                var startY = dnd.startY;
                dnd = new DndCtx(ev.id);
                dnd.x = ev.x;
                dnd.y = ev.y;
                var sourceCtx = b.bubble(node, "onDragStart", dnd);
                if (sourceCtx) {
                    var htmlNode = b.getDomNode(sourceCtx.me);
                    if (htmlNode == null) {
                        dnd.destroy();
                        return false;
                    }
                    var boundFn = htmlNode.getBoundingClientRect;
                    if (boundFn) {
                        var rect = boundFn.call(htmlNode);
                        dnd.deltaX = rect.left - startX;
                        dnd.deltaY = rect.top - startY;
                    }
                    dndmoved(node, dnd);
                    return true;
                }
                else {
                    dnd.destroy();
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
                b.broadcast("onDragEnd", this);
                dndmoved(null, dnd);
                dnd.destroy();
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
