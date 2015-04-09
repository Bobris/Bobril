/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.dnd.d.ts"/>

((b: IBobrilStatic) => {
    var lastDndId = 0;

    var DndCtx = function() {
        this.id = ++lastDndId;
        this.pointerid = -1;
        this.linkEnabled = true;
        this.copyEnabled = true;
        this.moveEnabled = true;
        this.operation = DndOp.None;
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

    DndCtx.prototype.setTargetAndOperation = function(ctx: IBobrilCtx, operation: DndOp): void {
        this.targetCtx = ctx;
        this.operation = operation;
    }

    DndCtx.prototype.addData = function(type: string, data: any): boolean {
        this.data[type] = data;
        return true;
    }

    DndCtx.prototype.hasData = function(type: string): boolean {
        return this.data[type] !== undefined;
    }

    DndCtx.prototype.getData = function(type: string): any {
        return this.data[type];
    }

    DndCtx.prototype.setOpEnabled = function(link: boolean, copy: boolean, move: boolean): void {
        this.linkEnabled = link;
        this.copyEnabled = copy;
        this.moveEnabled = move;
    }

    DndCtx.prototype.cancelDnd = function(): void {
        dndmoved(null, this);
        b.bubble(this.sourceCtx.me, "onDragEnd", this);
        delete pointer2Dnd[this.pointerid];
    }

    var pointer2Dnd = Object.create(null);

    function handlePointerDown(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        }
        pointer2Dnd[ev.id] = { lastX: ev.x, lastY: ev.y, totalX: 0, totalY: 0, sourceNode: node };
        return false;
    }

    function dndmoved(node: IBobrilCacheNode, dnd: IDndCtx) {
        (<any>dnd).targetCtx = null;
        if (node == null || !b.bubble(node, "onDragOver", dnd) || (<any>dnd).targetCtx == null) {
            dnd.operation = DndOp.None;
        }
        b.bubble((<any>dnd).sourceCtx.me, "onDrag", dnd);

        var prevPath: IBobrilCtx[] = (<any>dnd).targetPath;
        var toPath = <IBobrilCtx[]>[];
        var t: IBobrilCtx = (<any>dnd).targetCtx;
        var tnode: IBobrilCacheNode = t ? t.me : null;
        while (tnode) {
            t = tnode.ctx;
            if (t) toPath.push(t);
            tnode = tnode.parent;
        }
        var common = 0;
        while (common < prevPath.length && common < toPath.length && prevPath[common] === toPath[common])
            common++;

        var i = prevPath.length;
        var n: IBobrilCtx;
        var c: IBobrilComponent;
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
        (<any>dnd).targetPath = toPath;
    }

    function handlePointerMove(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.x = ev.x;
            dnd.y = ev.y;
            dndmoved(node, dnd);
            return true;
        } else if (dnd && dnd.totalX != null) {
            dnd.totalX += Math.abs(ev.x - dnd.lastX);
            dnd.totalY += Math.abs(ev.y - dnd.lastY);
            dnd.lastX = ev.x;
            dnd.lastY = ev.y;
            if (dnd.totalX + dnd.totalY > 20) {
                node = dnd.sourceNode;
                dnd = new (<any>DndCtx)();
                dnd.x = ev.x;
                dnd.y = ev.y;
                dnd.pointerId = ev.id;
                dnd.sourceCtx = node;
                if (b.bubble(node, "onDragStart", dnd) && dnd.sourceCtx != null) {
                    pointer2Dnd[ev.id] = dnd;
                    dndmoved(node, dnd);
                    return true;
                }
            } else {
                delete pointer2Dnd[ev.id];
            }
        }
        return false;
    }

    function handlePointerUp(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.x = ev.x;
            dnd.y = ev.y;
            dndmoved(node, dnd);
            var t: IBobrilCtx = dnd.targetCtx;
            if (target && b.bubble(t.me, "onDrop", dnd)) {
                b.bubble(this.sourceCtx.me, "onDragEnd", this);
                dndmoved(null, this);
                delete pointer2Dnd[this.pointerid];
            } else {
                dnd.cancelDnd();
            }
            return true;
        }
        return false;
    }

    function handlePointerCancel(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        }
        return false;
    }

    var addEvent = b.addEvent;
    addEvent("!PointerDown", 60, handlePointerDown);
    addEvent("!PointerMove", 60, handlePointerMove);
    addEvent("!PointerUp", 60, handlePointerUp);
    addEvent("!PointerCancel", 60, handlePointerCancel);
})(b);
