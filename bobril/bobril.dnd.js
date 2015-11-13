/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.media.d.ts"/>
/// <reference path="bobril.mouse.d.ts"/>
/// <reference path="bobril.dnd.d.ts"/>
(function (b) {
    var lastDndId = 0;
    var dnds = [];
    var systemdnd = null;
    var rootId = null;
    var preventDefault = b.preventDefault;
    var bodyCursorBackup;
    var userSelectBackup;
    var shimedStyle = { userSelect: '' };
    b.shimStyle(shimedStyle);
    var shimedStyleKeys = Object.keys(shimedStyle);
    var userSelectPropName = shimedStyleKeys[shimedStyleKeys.length - 1]; // renamed is last
    var DndCtx = function (pointerId) {
        this.id = ++lastDndId;
        this.pointerid = pointerId;
        this.enabledOperations = 7 /* MoveCopyLink */;
        this.operation = 0 /* None */;
        this.started = false;
        this.beforeDrag = true;
        this.local = true;
        this.system = false;
        this.ended = false;
        this.cursor = null;
        this.overNode = null;
        this.targetCtx = null;
        this.dragView = null;
        this.startX = 0;
        this.startY = 0;
        this.distanceToStart = 10;
        this.x = 0;
        this.y = 0;
        this.deltaX = 0;
        this.deltaY = 0;
        this.totalX = 0;
        this.totalY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.shift = false;
        this.ctrl = false;
        this.alt = false;
        this.meta = false;
        this.data = Object.create(null);
        if (pointerId >= 0)
            pointer2Dnd[pointerId] = this;
        dnds.push(this);
    };
    function lazyCreateRoot() {
        if (rootId == null) {
            var dbs = document.body.style;
            bodyCursorBackup = dbs.cursor;
            userSelectBackup = dbs[userSelectPropName];
            dbs[userSelectPropName] = 'none';
            rootId = b.addRoot(dndRootFactory);
        }
    }
    var DndComp = {
        render: function (ctx, me) {
            var dnd = ctx.data;
            me.tag = "div";
            me.style = { position: "absolute", left: dnd.x, top: dnd.y };
            me.children = dnd.dragView(dnd);
        }
    };
    function currentCursor() {
        var cursor = "no-drop";
        if (dnds.length !== 0) {
            var dnd = dnds[0];
            if (dnd.beforeDrag)
                return "";
            if (dnd.cursor != null)
                return dnd.cursor;
            if (dnd.system)
                return "";
            switch (dnd.operation) {
                case 3 /* Move */:
                    cursor = 'move';
                    break;
                case 1 /* Link */:
                    cursor = 'alias';
                    break;
                case 2 /* Copy */:
                    cursor = 'copy';
                    break;
            }
        }
        return cursor;
    }
    var DndRootComp = {
        render: function (ctx, me) {
            var res = [];
            for (var i = 0; i < dnds.length; i++) {
                var dnd = dnds[i];
                if (dnd.beforeDrag)
                    continue;
                if (dnd.dragView != null && (dnd.x != 0 || dnd.y != 0)) {
                    res.push({ key: "" + dnd.id, data: dnd, component: DndComp });
                }
            }
            me.tag = "div";
            me.style = { position: "fixed", pointerEvents: "none", userSelect: "none", left: 0, top: 0, right: 0, bottom: 0 };
            var dbs = document.body.style;
            var cur = currentCursor();
            if (cur && dbs.cursor !== cur)
                dbs.cursor = cur;
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
    dndProto.listData = function () {
        return Object.keys(this.data);
    };
    dndProto.hasData = function (type) {
        return this.data[type] !== undefined;
    };
    dndProto.getData = function (type) {
        return this.data[type];
    };
    dndProto.setEnabledOps = function (ops) {
        this.enabledOperations = ops;
    };
    dndProto.cancelDnd = function () {
        dndmoved(null, this);
        this.destroy();
    };
    dndProto.destroy = function () {
        this.ended = true;
        if (this.started)
            b.broadcast("onDragEnd", this);
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
        if (dnds.length === 0 && rootId != null) {
            b.removeRoot(rootId);
            rootId = null;
            var dbs = document.body.style;
            dbs.cursor = bodyCursorBackup;
            dbs[userSelectPropName] = userSelectBackup;
        }
    };
    var pointer2Dnd = Object.create(null);
    function handlePointerDown(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (dnd) {
            dnd.cancelDnd();
        }
        if (ev.button <= 1) {
            dnd = new DndCtx(ev.id);
            dnd.startX = ev.x;
            dnd.startY = ev.y;
            dnd.lastX = ev.x;
            dnd.lastY = ev.y;
            dnd.overNode = node;
            updateDndFromPointerEvent(dnd, ev);
            var sourceCtx = b.bubble(node, "onDragStart", dnd);
            if (sourceCtx) {
                var htmlNode = b.getDomNode(sourceCtx.me);
                if (htmlNode == null) {
                    dnd.destroy();
                    return false;
                }
                dnd.started = true;
                var boundFn = htmlNode.getBoundingClientRect;
                if (boundFn) {
                    var rect = boundFn.call(htmlNode);
                    dnd.deltaX = rect.left - ev.x;
                    dnd.deltaY = rect.top - ev.y;
                }
                if (dnd.distanceToStart <= 0) {
                    dnd.beforeDrag = false;
                    dndmoved(node, dnd);
                }
                lazyCreateRoot();
            }
            else {
                dnd.destroy();
            }
        }
        return false;
    }
    function dndmoved(node, dnd) {
        dnd.overNode = node;
        dnd.targetCtx = b.bubble(node, "onDragOver", dnd);
        if (dnd.targetCtx == null) {
            dnd.operation = 0 /* None */;
        }
        b.broadcast("onDrag", dnd);
    }
    function updateDndFromPointerEvent(dnd, ev) {
        dnd.shift = ev.shift;
        dnd.ctrl = ev.ctrl;
        dnd.alt = ev.alt;
        dnd.meta = ev.meta;
        dnd.x = ev.x;
        dnd.y = ev.y;
    }
    function handlePointerMove(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (!dnd)
            return false;
        dnd.totalX += Math.abs(ev.x - dnd.lastX);
        dnd.totalY += Math.abs(ev.y - dnd.lastY);
        if (dnd.beforeDrag) {
            if (dnd.totalX + dnd.totalY <= dnd.distanceToStart) {
                dnd.lastX = ev.x;
                dnd.lastY = ev.y;
                return false;
            }
            dnd.beforeDrag = false;
        }
        updateDndFromPointerEvent(dnd, ev);
        dndmoved(node, dnd);
        dnd.lastX = ev.x;
        dnd.lastY = ev.y;
        return true;
    }
    function handlePointerUp(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (!dnd)
            return false;
        if (!dnd.beforeDrag) {
            updateDndFromPointerEvent(dnd, ev);
            dndmoved(node, dnd);
            var t = dnd.targetCtx;
            if (t && b.bubble(t.me, "onDrop", dnd)) {
                dnd.destroy();
            }
            else {
                dnd.cancelDnd();
            }
            b.ignoreClick(ev.x, ev.y);
            return true;
        }
        dnd.destroy();
        return false;
    }
    function handlePointerCancel(ev, target, node) {
        var dnd = pointer2Dnd[ev.id];
        if (!dnd)
            return false;
        if (!dnd.beforeDrag) {
            dnd.cancelDnd();
        }
        else {
            dnd.destroy();
        }
        return false;
    }
    function updateFromNative(dnd, ev) {
        dnd.shift = ev.shiftKey;
        dnd.ctrl = ev.ctrlKey;
        dnd.alt = ev.altKey;
        dnd.meta = ev.metaKey;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        dnd.totalX += Math.abs(dnd.x - dnd.lastX);
        dnd.totalY += Math.abs(dnd.y - dnd.lastY);
        var node = b.nodeOnPoint(dnd.x, dnd.y); // Needed to correctly emulate pointerEvents:none
        dndmoved(node, dnd);
        dnd.lastX = dnd.x;
        dnd.lastY = dnd.y;
    }
    var effectAllowedTable = ["none", "link", "copy", "copyLink", "move", "linkMove", "copyMove", "all"];
    function handleDragStart(ev, target, node) {
        var dnd = systemdnd;
        if (dnd != null) {
            dnd.destroy();
        }
        var activePointerIds = Object.keys(pointer2Dnd);
        if (activePointerIds.length > 0) {
            dnd = pointer2Dnd[activePointerIds[0]];
            dnd.system = true;
            systemdnd = dnd;
        }
        else {
            var startX = ev.clientX, startY = ev.clientY;
            dnd = new DndCtx(-1);
            dnd.system = true;
            systemdnd = dnd;
            dnd.x = startX;
            dnd.y = startY;
            dnd.lastX = startX;
            dnd.lastY = startY;
            dnd.startX = startX;
            dnd.startY = startY;
            var sourceCtx = b.bubble(node, "onDragStart", dnd);
            if (sourceCtx) {
                var htmlNode = b.getDomNode(sourceCtx.me);
                if (htmlNode == null) {
                    dnd.destroy();
                    return false;
                }
                dnd.started = true;
                var boundFn = htmlNode.getBoundingClientRect;
                if (boundFn) {
                    var rect = boundFn.call(htmlNode);
                    dnd.deltaX = rect.left - startX;
                    dnd.deltaY = rect.top - startY;
                }
                lazyCreateRoot();
            }
            else {
                dnd.destroy();
                return false;
            }
        }
        dnd.beforeDrag = false;
        var eff = effectAllowedTable[dnd.enabledOperations];
        var dt = ev.dataTransfer;
        dt.effectAllowed = eff;
        if (dt.setDragImage) {
            var div = document.createElement("div");
            div.style.pointerEvents = "none";
            dt.setDragImage(div, 0, 0);
        }
        else {
            // For IE10 and IE11 hack to hide default drag element
            var style = ev.target.style;
            var opacityBackup = style.opacity;
            var widthBackup = style.width;
            var heightBackup = style.height;
            var paddingBackup = style.padding;
            style.opacity = "0";
            style.width = "0";
            style.height = "0";
            style.padding = "0";
            window.setTimeout(function () {
                style.opacity = opacityBackup;
                style.width = widthBackup;
                style.height = heightBackup;
                style.padding = paddingBackup;
            }, 0);
        }
        var datas = dnd.data;
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
                    if (window.console)
                        console.log("Cannot set dnd data to " + dataKeys[i]);
            }
        }
        updateFromNative(dnd, ev);
        return false;
    }
    function setDropEffect(ev, op) {
        ev.dataTransfer.dropEffect = ["none", "link", "copy", "move"][op];
    }
    function handleDragOver(ev, target, node) {
        var dnd = systemdnd;
        if (dnd == null) {
            dnd = new DndCtx(-1);
            dnd.system = true;
            systemdnd = dnd;
            dnd.x = ev.clientX;
            dnd.y = ev.clientY;
            dnd.startX = dnd.x;
            dnd.startY = dnd.y;
            dnd.local = false;
            var dt = ev.dataTransfer;
            var eff = 0;
            try {
                var effectAllowed = dt.effectAllowed;
            }
            catch (e) { }
            for (; eff < 7; eff++) {
                if (effectAllowedTable[eff] === effectAllowed)
                    break;
            }
            dnd.enabledOperations = eff;
            var dttypes = dt.types;
            if (dttypes) {
                for (var i = 0; i < dttypes.length; i++) {
                    var tt = dttypes[i];
                    if (tt === "text/plain")
                        tt = "Text";
                    else if (tt === "text/uri-list")
                        tt = "Url";
                    dnd.data[tt] = null;
                }
            }
            else {
                if (dt.getData("Text") !== undefined)
                    dnd.data["Text"] = null;
            }
        }
        updateFromNative(dnd, ev);
        setDropEffect(ev, dnd.operation);
        if (dnd.operation != 0 /* None */) {
            preventDefault(ev);
            return true;
        }
        return false;
    }
    function handleDrag(ev, target, node) {
        var x = ev.clientX;
        var y = ev.clientY;
        var m = b.getMedia();
        if (systemdnd != null && (x === 0 && y === 0 || x < 0 || y < 0 || x >= m.width || y >= m.height)) {
            systemdnd.x = 0;
            systemdnd.y = 0;
            systemdnd.operation = 0 /* None */;
            b.broadcast("onDrag", systemdnd);
        }
        return false;
    }
    function handleDragEnd(ev, target, node) {
        if (systemdnd != null) {
            systemdnd.destroy();
        }
        return false;
    }
    function handleDrop(ev, target, node) {
        var dnd = systemdnd;
        if (dnd == null)
            return false;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        if (!dnd.local) {
            var dataKeys = Object.keys(dnd.data);
            var dt = ev.dataTransfer;
            for (var i = 0; i < dataKeys.length; i++) {
                var k = dataKeys[i];
                var d;
                if (k === "Files") {
                    d = [].slice.call(dt.files, 0); // What a useless FileList type! Get rid of it.
                }
                else {
                    d = dt.getData(k);
                }
                dnd.data[k] = d;
            }
        }
        updateFromNative(dnd, ev);
        var t = dnd.targetCtx;
        if (t && b.bubble(t.me, "onDrop", dnd)) {
            setDropEffect(ev, dnd.operation);
            dnd.destroy();
            preventDefault(ev);
        }
        else {
            dnd.cancelDnd();
        }
        return true;
    }
    function justPreventDefault(ev, target, node) {
        preventDefault(ev);
        return true;
    }
    function handleSelectStart(ev, target, node) {
        if (dnds.length === 0)
            return false;
        preventDefault(ev);
        return true;
    }
    function anyActiveDnd() {
        for (var i = 0; i < dnds.length; i++) {
            var dnd = dnds[i];
            if (dnd.beforeDrag)
                continue;
            return dnd;
        }
        return null;
    }
    var addEvent = b.addEvent;
    addEvent("!PointerDown", 4, handlePointerDown);
    addEvent("!PointerMove", 4, handlePointerMove);
    addEvent("!PointerUp", 4, handlePointerUp);
    addEvent("!PointerCancel", 4, handlePointerCancel);
    addEvent("selectstart", 4, handleSelectStart);
    addEvent("dragstart", 5, handleDragStart);
    addEvent("dragover", 5, handleDragOver);
    addEvent("dragend", 5, handleDragEnd);
    addEvent("drag", 5, handleDrag);
    addEvent("drop", 5, handleDrop);
    addEvent("dragenter", 5, justPreventDefault);
    addEvent("dragleave", 5, justPreventDefault);
    b.getDnds = function () { return dnds; };
    b.anyActiveDnd = anyActiveDnd;
})(b);
