import {
    addEvent,
    addRoot,
    broadcast,
    bubble,
    getDomNode,
    IBobrilCacheNode,
    IBobrilChildren,
    IBobrilComponent,
    IBobrilCtx,
    IBobrilNode,
    invalidate,
    preventDefault,
    removeRoot,
} from "./core";
import { selectorStyleDef } from "./cssInJs";
import { isString } from "./isFunc";
import { newHashObj } from "./localHelpers";
import { getMedia } from "./media";
import { IBobrilPointerEvent, ignoreClick, nodeOnPoint, pointerRevalidateEventName } from "./mouseEvents";

declare var DEBUG: boolean;

declare module "./core" {
    interface IBubblingAndBroadcastEvents {
        // if drag should start, bubbled
        onDragStart?(dndCtx: IDndStartCtx): GenericEventResult;
        // broadcasted after drag started/moved/changed
        onDrag?(dndCtx: IDndCtx): boolean;
        // broadcasted after drag ended even if without any action
        onDragEnd?(dndCtx: IDndCtx): boolean;

        // Do you want to allow to drop here? bubbled
        onDragOver?(dndCtx: IDndOverCtx): GenericEventResult;
        // User want to drop dragged object here - do it - onDragOver before had to set you target
        onDrop?(dndCtx: IDndCtx): GenericEventResult;
    }
}

export enum DndOp {
    None = 0,
    Link = 1,
    Copy = 2,
    Move = 3,
}
type TDropEffect = "none" | "copy" | "link" | "move";
const dropEffectsAllowedTable: TDropEffect[] = ["none", "link", "copy", "move"];

export enum DndEnabledOps {
    None = 0,
    Link = 1,
    Copy = 2,
    LinkCopy = 3,
    Move = 4,
    MoveLink = 5,
    MoveCopy = 6,
    MoveCopyLink = 7,
}
type TEffectAllowed =
    | "all"
    | "link"
    | "none"
    | "move"
    | "copy"
    | "copyLink"
    | "linkMove"
    | "copyMove"
    | "uninitialized";
var effectAllowedTable: TEffectAllowed[] = ["none", "link", "copy", "copyLink", "move", "linkMove", "copyMove", "all"];

export interface IDndCtx {
    id: number;
    listData(): string[];
    hasData(type: string): boolean;
    getData(type: string): any;
    enabledOperations: DndEnabledOps;
    operation: DndOp;
    overNode: IBobrilCacheNode | undefined;
    // way to override mouse cursor, leave null to emulate dnd cursor
    cursor: string | null;
    // dnd is waiting for activation by moving at least distanceToStart pixels
    started: boolean;
    beforeDrag: boolean;
    system: boolean;
    local: boolean;
    ended: boolean;
    // default value is 10, but you can assign to this >=0 number in onDragStart
    distanceToStart: number;
    // drag started at this pointer position
    startX: number;
    startY: number;
    // distance moved - only increasing
    totalX: number;
    totalY: number;
    // previous mouse/touch pointer position
    lastX: number;
    lastY: number;
    // actual mouse/touch pointer position
    x: number;
    y: number;
    // delta of left top position of dragged object when drag started, usually negative
    deltaX: number;
    deltaY: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;

    // internal
    pointerid: number;
    data: any;
    targetCtx: any;
    dragView: ((dnd: IDndCtx) => IBobrilChildren) | undefined;
    destroy(): void;
}

export interface IDndStartCtx extends IDndCtx {
    addData(type: string, data: any): boolean;
    setEnabledOps(ops: DndEnabledOps): void;
    setDragNodeView(view: (dnd: IDndCtx) => IBobrilChildren): void;
}

export interface IDndOverCtx extends IDndCtx {
    setOperation(operation: DndOp): void;
}

var lastDndId = 0;
var dnds: IDndCtx[] = [];
var systemDnd: (IDndStartCtx & IDndOverCtx) | null = null;
var rootId: string | null = null;

var DndCtx = function (this: IDndCtx, pointerId: number) {
    this.id = ++lastDndId;
    this.pointerid = pointerId;
    this.enabledOperations = DndEnabledOps.MoveCopyLink;
    this.operation = DndOp.None;
    this.started = false;
    this.beforeDrag = true;
    this.local = true;
    this.system = false;
    this.ended = false;
    this.cursor = null;
    this.overNode = undefined;
    this.targetCtx = null;
    this.dragView = undefined;
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
    this.data = newHashObj();
    if (pointerId >= 0) pointer2Dnd[pointerId] = this;
    dnds.push(this);
} as unknown as { new (pointerId: number): IDndStartCtx & IDndOverCtx };

const draggingStyle = "b-dragging";

function lazyCreateRoot() {
    if (rootId == undefined) {
        var dd = document.documentElement;
        dd.classList.add(draggingStyle);
        rootId = addRoot(dndRootFactory);
    }
}

var DndComp: IBobrilComponent = {
    render(ctx: IBobrilCtx, me: IBobrilNode) {
        var dnd: IDndCtx = ctx.data;
        me.tag = "div";
        me.style = { position: "absolute", left: dnd.x, top: dnd.y };
        me.children = dnd.dragView!(dnd);
    },
};

function currentCursor() {
    let cursor = "no-drop";
    if (dnds.length !== 0) {
        let dnd = dnds[0]!;
        if (dnd.beforeDrag) return "";
        if (dnd.cursor != null) return dnd.cursor;
        if (dnd.system) return "";
        switch (dnd.operation) {
            case DndOp.Move:
                cursor = "move";
                break;
            case DndOp.Link:
                cursor = "alias";
                break;
            case DndOp.Copy:
                cursor = "copy";
                break;
        }
    }
    return cursor;
}

var DndRootComp: IBobrilComponent = {
    render(_ctx: IBobrilCtx, me: IBobrilNode) {
        var res: IBobrilNode[] = [];
        for (var i = 0; i < dnds.length; i++) {
            var dnd = dnds[i]!;
            if (dnd.beforeDrag) continue;
            if (dnd.dragView != null && (dnd.x != 0 || dnd.y != 0)) {
                res.push({ key: "" + dnd.id, data: dnd, component: DndComp });
            }
        }
        me.tag = "div";
        me.style = {
            position: "fixed",
            zIndex: 1000000000,
            pointerEvents: "none",
            userSelect: "none",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
        };
        let dds = document.documentElement.style;
        let cur = currentCursor();
        if (cur) {
            if (dds.cursor !== cur) dds.setProperty("cursor", cur, "important");
        } else {
            dds.setProperty("cursor", "");
        }
        me.children = res;
    },
    onDrag(ctx: IBobrilCtx): boolean {
        invalidate(ctx);
        return false;
    },
};

function dndRootFactory(): IBobrilChildren {
    return { component: DndRootComp };
}

var dndProto = DndCtx.prototype;
dndProto.setOperation = function (this: IDndCtx, operation: DndOp): void {
    this.operation = operation;
};

dndProto.setDragNodeView = function (this: IDndCtx, view: ((dnd: IDndCtx) => IBobrilChildren) | undefined): void {
    this.dragView = view;
};

dndProto.addData = function (this: IDndCtx, type: string, data: any): boolean {
    this.data[type] = data;
    return true;
};

dndProto.listData = function (this: IDndCtx): string[] {
    return Object.keys(this.data);
};

dndProto.hasData = function (this: IDndCtx, type: string): boolean {
    return this.data[type] !== undefined;
};

dndProto.getData = function (this: IDndCtx, type: string): any {
    return this.data[type];
};

dndProto.setEnabledOps = function (this: IDndCtx, ops: DndEnabledOps): void {
    this.enabledOperations = ops;
};

dndProto.cancelDnd = function (this: IDndOverCtx): void {
    dndMoved(undefined, this);
    this.destroy();
};

dndProto.destroy = function (this: IDndCtx): void {
    this.ended = true;
    if (this.started) broadcast("onDragEnd", this);
    delete pointer2Dnd[this.pointerid];
    for (var i = 0; i < dnds.length; i++) {
        if (dnds[i] === this) {
            dnds.splice(i, 1);
            break;
        }
    }
    if (systemDnd === this) {
        systemDnd = null;
    }
    if (dnds.length === 0 && rootId != null) {
        removeRoot(rootId);
        rootId = null;
        var dd = document.documentElement;
        dd.classList.remove(draggingStyle);
        dd.style.setProperty("cursor", "");
    }
};

var pointer2Dnd = newHashObj();

function handlePointerDown(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (dnd) {
        dnd.cancelDnd();
    }
    if (ev.button <= 1) {
        dnd = new (<any>DndCtx)(ev.id);
        dnd.startX = ev.x;
        dnd.startY = ev.y;
        dnd.lastX = ev.x;
        dnd.lastY = ev.y;
        dnd.overNode = node;
        updateDndFromPointerEvent(dnd, ev);
        var sourceCtx = bubble(node, "onDragStart", dnd);
        if (sourceCtx) {
            var htmlNode = getDomNode(sourceCtx.me);
            if (htmlNode == undefined) {
                dnd.destroy();
                return false;
            }
            dnd.started = true;
            var boundFn = (<Element>htmlNode).getBoundingClientRect;
            if (boundFn) {
                var rect = boundFn.call(htmlNode);
                dnd.deltaX = rect.left - ev.x;
                dnd.deltaY = rect.top - ev.y;
            }
            if (dnd.distanceToStart <= 0) {
                dnd.beforeDrag = false;
                dndMoved(node, dnd);
            }
            lazyCreateRoot();
        } else {
            dnd.destroy();
        }
    }
    return false;
}

function dndMoved(node: IBobrilCacheNode | undefined, dnd: IDndOverCtx) {
    dnd.overNode = node;
    dnd.targetCtx = bubble(node, "onDragOver", dnd);
    if (dnd.targetCtx == undefined) {
        dnd.operation = DndOp.None;
    }
    broadcast("onDrag", dnd);
}

function updateDndFromPointerEvent(dnd: IDndCtx, ev: IBobrilPointerEvent) {
    dnd.shift = ev.shift;
    dnd.ctrl = ev.ctrl;
    dnd.alt = ev.alt;
    dnd.meta = ev.meta;
    dnd.x = ev.x;
    dnd.y = ev.y;
}

function handlePointerMove(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
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
    dndMoved(node, dnd);
    dnd.lastX = ev.x;
    dnd.lastY = ev.y;
    return true;
}

function handlePointerUp(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
    if (!dnd.beforeDrag) {
        updateDndFromPointerEvent(dnd, ev);
        dndMoved(node, dnd);
        var t: IBobrilCtx = dnd.targetCtx;
        if (t && bubble(t.me, "onDrop", dnd)) {
            dnd.destroy();
        } else {
            dnd.cancelDnd();
        }
        ignoreClick(ev.x, ev.y);
        return true;
    }
    dnd.destroy();
    return false;
}

function handlePointerCancel(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    var dnd = pointer2Dnd[ev.id];
    if (!dnd) return false;
    if (dnd.system) return false;
    if (!dnd.beforeDrag) {
        dnd.cancelDnd();
    } else {
        dnd.destroy();
    }
    return false;
}

function updateFromNative(dnd: IDndOverCtx, ev: DragEvent) {
    dnd.shift = ev.shiftKey;
    dnd.ctrl = ev.ctrlKey;
    dnd.alt = ev.altKey;
    dnd.meta = ev.metaKey;
    dnd.x = ev.clientX;
    dnd.y = ev.clientY;
    dnd.totalX += Math.abs(dnd.x - dnd.lastX);
    dnd.totalY += Math.abs(dnd.y - dnd.lastY);
    var node = nodeOnPoint(dnd.x, dnd.y); // Needed to correctly emulate pointerEvents:none
    dndMoved(node, dnd);
    dnd.lastX = dnd.x;
    dnd.lastY = dnd.y;
}

function handleDragStart(ev: DragEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined): boolean {
    var dnd: (IDndStartCtx & IDndOverCtx) | null = systemDnd;
    if (dnd != null) {
        (<any>dnd).destroy();
    }
    var activePointerIds = Object.keys(pointer2Dnd);
    if (activePointerIds.length > 0) {
        dnd = pointer2Dnd[activePointerIds[0]!];
        dnd!.system = true;
        systemDnd = dnd;
    } else {
        var startX = ev.clientX,
            startY = ev.clientY;
        dnd = new DndCtx(-1);
        dnd.system = true;
        systemDnd = dnd;
        dnd.x = startX;
        dnd.y = startY;
        dnd.lastX = startX;
        dnd.lastY = startY;
        dnd.startX = startX;
        dnd.startY = startY;
        var sourceCtx = bubble(node, "onDragStart", dnd);
        if (sourceCtx) {
            var htmlNode = getDomNode(sourceCtx.me);
            if (htmlNode == undefined) {
                (<any>dnd).destroy();
                return false;
            }
            dnd.started = true;
            var boundFn = (<Element>htmlNode).getBoundingClientRect;
            if (boundFn) {
                var rect = boundFn.call(htmlNode);
                dnd.deltaX = rect.left - startX;
                dnd.deltaY = rect.top - startY;
            }
            lazyCreateRoot();
        } else {
            (<any>dnd).destroy();
            return false;
        }
    }
    dnd!.beforeDrag = false;
    var eff = effectAllowedTable[dnd!.enabledOperations]!;
    var dt = ev.dataTransfer!;
    dt.effectAllowed = eff;
    if ((<any>dt).setDragImage) {
        var div = document.createElement("div");
        div.style.pointerEvents = "none";
        (<any>dt).setDragImage(div, 0, 0);
    } else {
        // For IE10 and IE11 hack to hide default drag element
        var style = (<HTMLElement>ev.target).style;
        var opacityBackup = style.opacity;
        var widthBackup = style.width;
        var heightBackup = style.height;
        var paddingBackup = style.padding;
        style.opacity = "0";
        style.width = "0";
        style.height = "0";
        style.padding = "0";
        setTimeout(() => {
            style.opacity = opacityBackup;
            style.width = widthBackup;
            style.height = heightBackup;
            style.padding = paddingBackup;
        }, 0);
    }
    var data = dnd!.data;
    var dataKeys = Object.keys(data);
    for (var i = 0; i < dataKeys.length; i++) {
        try {
            var k = dataKeys[i]!;
            var d = data[k];
            if (!isString(d)) d = JSON.stringify(d);
            ev.dataTransfer!.setData(k, d);
        } catch (e) {
            if (DEBUG) if (window.console) console.log("Cannot set dnd data to " + dataKeys[i]);
        }
    }
    updateFromNative(dnd!, ev);
    return false;
}

function setDropEffect(ev: DragEvent, op: DndOp) {
    ev.dataTransfer!.dropEffect = dropEffectsAllowedTable[op]!;
}

function handleDragOver(ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var dnd = systemDnd;
    if (dnd == undefined) {
        dnd = new DndCtx(-1);
        dnd.system = true;
        systemDnd = dnd;
        dnd.x = ev.clientX;
        dnd.y = ev.clientY;
        dnd.startX = dnd.x;
        dnd.startY = dnd.y;
        dnd.local = false;
        var dt = ev.dataTransfer!;
        var eff = 0;
        var effectAllowed: string | undefined = undefined;
        try {
            effectAllowed = dt.effectAllowed;
        } catch (e) {}
        for (; eff < 7; eff++) {
            if (effectAllowedTable[eff] === effectAllowed) break;
        }
        dnd.enabledOperations = eff;
        var dtTypes = dt.types;
        if (dtTypes) {
            for (var i = 0; i < dtTypes.length; i++) {
                var tt = dtTypes[i]!;
                if (tt === "text/plain") tt = "Text";
                else if (tt === "text/uri-list") tt = "Url";
                (<any>dnd).data[tt] = null;
            }
        } else {
            if (dt.getData("Text") !== undefined) (<any>dnd).data["Text"] = null;
        }
    }
    updateFromNative(dnd, ev);
    setDropEffect(ev, dnd!.operation);
    if (dnd!.operation != DndOp.None) {
        preventDefault(ev);
        return true;
    }
    return false;
}

function handleDrag(ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var x = ev.clientX;
    var y = ev.clientY;
    var m = getMedia();
    if (systemDnd != null && ((x === 0 && y === 0) || x < 0 || y < 0 || x >= m.width || y >= m.height)) {
        systemDnd.x = 0;
        systemDnd.y = 0;
        systemDnd.operation = DndOp.None;
        broadcast("onDrag", systemDnd);
    }
    return true;
}

function handleDragEnd(_ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    if (systemDnd != null) {
        systemDnd.destroy();
    }
    return false;
}

function handleDrop(ev: DragEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var dnd = systemDnd;
    if (dnd == undefined) return false;
    dnd.x = ev.clientX;
    dnd.y = ev.clientY;
    if (!dnd.local) {
        var dataKeys = Object.keys(dnd.data);
        var dt = ev.dataTransfer!;
        for (let i = 0; i < dataKeys.length; i++) {
            var k = dataKeys[i]!;
            var d: any;
            if (k === "Files") {
                d = [].slice.call(dt.files, 0); // What a useless FileList type! Get rid of it.
            } else {
                d = dt.getData(k);
            }
            dnd.data[k] = d;
        }
    }
    updateFromNative(dnd, ev);
    var t: IBobrilCtx = dnd.targetCtx;
    if (t && bubble(t.me, "onDrop", dnd)) {
        setDropEffect(ev, dnd.operation);
        dnd.destroy();
        preventDefault(ev);
    } else {
        (<any>dnd).cancelDnd();
    }
    return true;
}

function justPreventDefault(ev: any, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    preventDefault(ev);
    return true;
}

function handleDndSelectStart(ev: any, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    if (dnds.length === 0) return false;
    preventDefault(ev);
    return true;
}

export function anyActiveDnd(): IDndCtx | undefined {
    for (let i = 0; i < dnds.length; i++) {
        let dnd = dnds[i]!;
        if (dnd.beforeDrag) continue;
        return dnd;
    }
    return undefined;
}

addEvent("!PointerDown", 4, handlePointerDown);
addEvent("!PointerMove", 4, handlePointerMove);
addEvent(pointerRevalidateEventName, 4, handlePointerMove);
addEvent("!PointerUp", 4, handlePointerUp);
addEvent("!PointerCancel", 4, handlePointerCancel);
addEvent("selectstart", 4, handleDndSelectStart);

addEvent("dragstart", 5, handleDragStart);
addEvent("dragover", 5, handleDragOver);
addEvent("dragend", 5, handleDragEnd);
addEvent("drag", 5, handleDrag);
addEvent("drop", 5, handleDrop);
addEvent("dragenter", 5, justPreventDefault);
addEvent("dragleave", 5, justPreventDefault);
export const getDnds = () => dnds;

selectorStyleDef("html." + draggingStyle + " *", { cursor: "inherit !important", userSelect: "none !important" });
