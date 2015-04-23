/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.media.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.dnd.d.ts"/>

((b: IBobrilStatic) => {
    var lastDndId = 0;
    var dnds: IDndCtx[] = [];
    var systemdnd: IDndCtx = null;
    var rootId: string = null;
    var preventDefault = b.preventDefault;

    var DndCtx = function(pointerId: number) {
        this.id = ++lastDndId;
        this.pointerid = pointerId;
        this.enanbledOperations = DndEnabledOps.MoveCopyLink;
        this.operation = DndOp.None;
        this.local = true;
        this.ended = false;
        this.targetCtx = null;
        this.dragView = null;
        this.startX = 0;
        this.startY = 0;
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

    var DndComp: IBobrilComponent = {
        render(ctx: IBobrilCtx, me: IBobrilNode) {
            var dnd: IDndCtx = ctx.data;
            me.tag = "div";
            me.style = { position: "absolute", left: dnd.x, top: dnd.y };
            me.children = (<any>dnd).dragView(dnd);
        }
    };

    var DndRootComp: IBobrilComponent = {
        render(ctx: IBobrilCtx, me: IBobrilNode) {
            var res: IBobrilNode[] = [];
            for (var i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if ((<any>dnd).dragView != null && (dnd.x != 0 || dnd.y != 0)) {
                    res.push({ key: "" + dnd.id, data: dnd, component: DndComp });
                }
            }
            me.tag = "div";
            me.style = { position: "fixed", pointerEvents: "none", left: 0, top: 0, right: 0, bottom: 0 };
            if (b.ieVersion() < 10) me.attrs = { unselectable: "on" };
            me.children = res;
        },
        onDrag(ctx: IBobrilCtx): boolean {
            b.invalidate(ctx);
            return false;
        }
    };

    function dndRootFactory(): IBobrilChildren {
        return { component: DndRootComp };
    }

    var dndProto = DndCtx.prototype;
    dndProto.setOperation = function(operation: DndOp): void {
        this.operation = operation;
    }

    dndProto.setDragNodeView = function(view: (dnd: IDndCtx) => IBobrilNode): void {
        this.dragView = view;
    }

    dndProto.addData = function(type: string, data: any): boolean {
        this.data[type] = data;
        return true;
    }

    dndProto.listData = function(): string[] {
        return Object.keys(this.data);
    }

    dndProto.hasData = function(type: string): boolean {
        return this.data[type] !== undefined;
    }

    dndProto.getData = function(type: string): any {
        return this.data[type];
    }

    dndProto.setEnabledOps = function(ops: DndEnabledOps): void {
        this.enabledOperations = ops;
    }

    dndProto.cancelDnd = function(): void {
        dndmoved(null, this);
        this.ended = true;
        b.broadcast("onDragEnd", this);
        this.destroy();
    }

    dndProto.destroy = function(): void {
        delete pointer2Dnd[this.pointerid];
        for (var i = 0; i < dnds.length; i++) {
            if (dnds[i] === this) {
                dnds.splice(i, 1);
                break;
            }
        }
        if (systemdnd === this) {
            systemdnd = null;
        }
        if (dnds.length === 0) {
            b.removeRoot(rootId);
            rootId = null;
        }
    }

    var pointer2Dnd = Object.create(null);

    function handlePointerDown(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        }
        pointer2Dnd[ev.id] = { lastX: ev.x, lastY: ev.y, totalX: 0, totalY: 0, startX: ev.x, startY: ev.y, sourceNode: node };
        return false;
    }

    function dndmoved(node: IBobrilCacheNode, dnd: IDndCtx) {
        (<any>dnd).targetCtx = b.bubble(node, "onDragOver", dnd);
        if ((<any>dnd).targetCtx == null) {
            dnd.operation = DndOp.None;
        }
        b.broadcast("onDrag", dnd);
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
            if (dnd.totalX + dnd.totalY > 10) {
                node = dnd.sourceNode;
                var startX = dnd.startX;
                var startY = dnd.startY;
                dnd = new (<any>DndCtx)(ev.id);
                dnd.startX = startX;
                dnd.startY = startY;
                dnd.x = ev.x;
                dnd.y = ev.y;
                var sourceCtx = b.bubble(node, "onDragStart", dnd);
                if (sourceCtx) {
                    var htmlNode = b.getDomNode(sourceCtx.me);
                    if (htmlNode == null) {
                        dnd.destroy();
                        return false;
                    }
                    var boundFn = (<Element>htmlNode).getBoundingClientRect;
                    if (boundFn) {
                        var rect = boundFn.call(htmlNode);
                        dnd.deltaX = rect.left - startX;
                        dnd.deltaY = rect.top - startY;
                    }
                    dndmoved(node, dnd);
                    return true;
                } else {
                    dnd.destroy();
                }
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
            if (t && b.bubble(t.me, "onDrop", dnd)) {
                dnd.ended = true;
                b.broadcast("onDragEnd", dnd);
                dndmoved(null, dnd);
                dnd.destroy();
            } else {
                dnd.cancelDnd();
            }
            return true;
        } else if (dnd) {
            delete pointer2Dnd[ev.id];
        }
        return false;
    }

    function handlePointerCancel(ev: IBobrilPointerEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = pointer2Dnd[ev.id];
        if (dnd && dnd.totalX == null) {
            dnd.cancelDnd();
        } else {
            delete pointer2Dnd[ev.id];
        }
        return false;
    }

    function updateFromNative(dnd: IDndCtx, ev: DragEvent) {
        dnd.shift = ev.shiftKey;
        dnd.ctrl = ev.ctrlKey;
        dnd.alt = ev.altKey;
        dnd.meta = ev.metaKey;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        var node = b.nodeOnPoint(dnd.x, dnd.y); // Needed to correctly emulate pointerEvents:none
        dndmoved(node, dnd);
    }

    var effectAllowedTable = ["none", "link", "copy", "copyLink", "move", "linkMove", "copyMove", "all"];

    function handleDragStart(ev: DragEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd: IDndCtx = systemdnd;
        if (dnd != null) {
            (<any>dnd).destroy();
        }
        var activePointerIds = Object.keys(pointer2Dnd);
        var startX = ev.clientX, startY = ev.clientY, poid = -1;
        for (var i = 0; i < activePointerIds.length; i++) {
            dnd = pointer2Dnd[activePointerIds[i]];
            if ((<any>dnd).totalX != null) {
                poid = +activePointerIds[i];
                startX = dnd.startX;
                startY = dnd.startY;
                delete pointer2Dnd[poid];
                break;
            }
        }
        dnd = new (<any>DndCtx)(poid);
        systemdnd = dnd;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        dnd.startX = startX;
        dnd.startY = startY;
        var sourceCtx = b.bubble(node, "onDragStart", dnd);
        if (sourceCtx) {
            var htmlNode = b.getDomNode(sourceCtx.me);
            if (htmlNode == null) {
                (<any>dnd).destroy();
                return false;
            }
            var boundFn = (<Element>htmlNode).getBoundingClientRect;
            if (boundFn) {
                var rect = boundFn.call(htmlNode);
                dnd.deltaX = rect.left - startX;
                dnd.deltaY = rect.top - startY;
            }
            var eff = effectAllowedTable[dnd.enabledOperations];
            var dt = ev.dataTransfer;
            dt.effectAllowed = eff;
            if ((<any>dt).setDragImage) {
                var div = document.createElement("div");
                div.style.pointerEvents = "none";
                (<any>dt).setDragImage(div, 0, 0);
            } else {
                // For IE10 and IE11 hack to hide default drag element
                var style = (<HTMLElement>htmlNode).style;
                var opacityBackup = style.opacity;
                var widthBackup = style.width;
                var heightBackup = style.height;
                var paddingBackup = style.padding;
                style.opacity = "0";
                style.width = "0";
                style.height = "0";
                style.padding = "0";
                window.setTimeout(() => {
                    style.opacity = opacityBackup;
                    style.width = widthBackup;
                    style.height = heightBackup;
                    style.padding = paddingBackup;
                }, 0);
            }
            var datas = (<any>dnd).data;
            var dataKeys = Object.keys(datas);
            for (var i = 0; i < dataKeys.length; i++) {
                try {
                    var k = dataKeys[i];
                    var d = datas[k];
                    if (typeof d !== "string")
                        d = JSON.stringify(d);
                    ev.dataTransfer.setData(k, d);
                }
                catch (e) {
                    if (DEBUG)
                        if (window.console) console.log("Cannot set dnd data to " + dataKeys[i]);
                }
            }
            updateFromNative(dnd, ev);
        } else {
            (<any>dnd).destroy();
        }
        return false;
    }

    function setDropEffect(ev: DragEvent, op: DndOp) {
        ev.dataTransfer.dropEffect = ["none", "link", "copy", "move"][op];
    }

    function handleDragOver(ev: DragEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = systemdnd;
        if (dnd == null) {
            dnd = new (<any>DndCtx)(-1);
            systemdnd = dnd;
            dnd.x = ev.clientX;
            dnd.y = ev.clientY;
            dnd.startX = dnd.x;
            dnd.startY = dnd.y;
            dnd.local = false;
            var dt = ev.dataTransfer;
            var eff = 0;
            for (; eff < 7; eff++) {
                if (effectAllowedTable[eff] === dt.effectAllowed) break;
            }
            dnd.enabledOperations = eff;
            if (dt.types) {
                for (var i = 0; i < dt.types.length; i++) {
                    (<any>dnd).data[dt.types[i]] = null;
                }
            } else {
                if (dt.getData("Text") !== undefined) (<any>dnd).data["Text"] = null;
            }
        }
        updateFromNative(dnd, ev);
        setDropEffect(ev, dnd.operation);
        if (dnd.operation != DndOp.None) {
            preventDefault(ev);
            return true;
        }
        return false;
    }

    function handleDrag(ev: DragEvent, target: Node, node: IBobrilCacheNode): boolean {
        var x = ev.clientX;
        var y = ev.clientY;
        var m = b.getMedia();
        if (systemdnd != null && (x === 0 && y === 0 || x < 0 || y < 0 || x >= m.width || y >= m.height)) {
            systemdnd.x = 0;
            systemdnd.y = 0;
            systemdnd.operation = DndOp.None;
            b.broadcast("onDrag", systemdnd);
        }
        return false;
    }

    function handleDragEnd(ev: DragEvent, target: Node, node: IBobrilCacheNode): boolean {
        if (systemdnd != null) {
            systemdnd.ended = true;
            b.broadcast("onDragEnd", systemdnd);
            (<any>systemdnd).cancelDnd();
        }
        return false;
    }

    function handleDrop(ev: DragEvent, target: Node, node: IBobrilCacheNode): boolean {
        var dnd = systemdnd;
        if (dnd == null)
            return false;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        if (!dnd.local) {
            var dataKeys = Object.keys((<any>dnd).data);
            var dt = ev.dataTransfer;
            for (let i = 0; i < dataKeys.length; i++) {
                var k = dataKeys[i];
                var d = dt.getData(k);
                if (typeof d !== "string") {
                    d = JSON.parse(d);
                }
                (<any>dnd).data[k] = d;
            }
        }
        updateFromNative(dnd, ev);
        var t: IBobrilCtx = (<any>dnd).targetCtx;
        if (t && b.bubble(t.me, "onDrop", dnd)) {
            setDropEffect(ev, dnd.operation);
            dnd.ended = true;
            b.broadcast("onDragEnd", dnd);
            (<any>dnd).destroy();
            preventDefault(ev);
        } else {
            (<any>dnd).cancelDnd();
        }
        return true;
    }

    function justPreventDefault(ev: any, target: Node, node: IBobrilCacheNode): boolean {
        preventDefault(ev);
        return true;
    }

    var addEvent = b.addEvent;
    addEvent("!PointerDown", 4, handlePointerDown);
    addEvent("!PointerMove", 4, handlePointerMove);
    addEvent("!PointerUp", 4, handlePointerUp);
    addEvent("!PointerCancel", 4, handlePointerCancel);

    addEvent("dragstart", 5, handleDragStart);
    addEvent("dragover", 5, handleDragOver);
    addEvent("dragend", 5, handleDragEnd);
    addEvent("drag", 5, handleDrag);
    addEvent("drop", 5, handleDrop);
    addEvent("dragenter", 5, justPreventDefault);
    addEvent("dragleave", 5, justPreventDefault);
    b.getDnds = () => dnds;
})(b);
