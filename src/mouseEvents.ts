import {
    addEvent,
    bubble,
    callWithCurrentCtxWithEvents,
    deref,
    emitEvent,
    EventNames,
    IBobrilCacheNode,
    IBobrilComponent,
    IEventParam,
    ieVersion,
    now,
    preventDefault,
    CommonUseIsHook,
    buildUseIsHook,
} from "./core";

import { isBoolean } from "./isFunc";
import { newHashObj } from "./localHelpers";

declare module "./core" {
    interface IBubblingAndBroadcastEvents {
        /// called after click or tap
        onClick?(event: IBobrilMouseEvent): GenericEventResult;
        onDoubleClick?(event: IBobrilMouseEvent): GenericEventResult;
        onContextMenu?(event: IBobrilMouseEvent): GenericEventResult;
        onMouseDown?(event: IBobrilMouseEvent): GenericEventResult;
        onMouseUp?(event: IBobrilMouseEvent): GenericEventResult;
        onMouseOver?(event: IBobrilMouseEvent): GenericEventResult;

        onMouseMove?(event: IBobrilMouseEvent): GenericEventResult;
        onMouseWheel?(event: IBobrilMouseWheelEvent): GenericEventResult;
        onPointerDown?(event: IBobrilPointerEvent): GenericEventResult;
        onPointerMove?(event: IBobrilPointerEvent): GenericEventResult;
        onPointerUp?(event: IBobrilPointerEvent): GenericEventResult;
        onPointerCancel?(event: IBobrilPointerEvent): GenericEventResult;
    }
    interface IBobrilEvents {
        /// does not bubble, called only when mouse comes into that node, onPointerMove could be used instead if need bubbling
        onMouseEnter?(event: IBobrilMouseEvent): void;
        /// does not bubble, called only when mouse leaves from that node, onPointerMove could be used instead if need bubbling
        onMouseLeave?(event: IBobrilMouseEvent): void;
        /// does not bubble, called when mouse comes to some child of that node, onPointerMove could be used instead if need bubbling
        onMouseIn?(event: IBobrilMouseEvent): void;
        /// does not bubble, called when mouse leaves from some child of that node, onPointerMove could be used instead if need bubbling
        onMouseOut?(event: IBobrilMouseEvent): void;
    }
}

export interface IBobrilMouseEvent extends IEventParam {
    x: number;
    y: number;
    /// 1 - left (or touch), 2 - middle, 3 - right <- it does not make sense but that's W3C
    button: number;
    /// 1 - single click, 2 - double click, 3+ - multi click
    count: number;
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    cancelable: boolean;
}

export enum BobrilPointerType {
    Mouse = 0,
    Touch = 1,
    Pen = 2,
}

export interface IBobrilPointerEvent extends IBobrilMouseEvent {
    id: number;
    type: BobrilPointerType;
}

export interface IBobrilMouseWheelEvent extends IBobrilMouseEvent {
    dx: number;
    dy: number;
}

const MoveOverIsNotTap = 13;
const TapShouldBeShorterThanMs = 750;
const MaxBustDelay = 500;
const MaxBustDelayForIE = 800;
const BustDistance = 50;

let ownerCtx: any = null;
let invokingOwner: boolean;
const onClickText = "onClick";
const onDoubleClickText = "onDoubleClick";

// PureFuncs: isMouseOwner, isMouseOwnerEvent

export function isMouseOwner(ctx: any): boolean {
    return ownerCtx === ctx;
}

export function isMouseOwnerEvent(): boolean {
    return invokingOwner;
}

export function registerMouseOwner(ctx: any): void {
    ownerCtx = ctx;
}

export function releaseMouseOwner(): void {
    ownerCtx = null;
}

function invokeMouseOwner(handlerName: string, param: any): boolean {
    if (ownerCtx == undefined) {
        return false;
    }

    var c = ownerCtx.me.component;
    var handler = c[handlerName];
    if (!handler) {
        // no handler available
        return false;
    }
    invokingOwner = true;
    var stop = callWithCurrentCtxWithEvents(() => handler.call(c, ownerCtx, param), ownerCtx);
    invokingOwner = false;
    return stop;
}

function addEvent5(
    name: string,
    callback: (ev: any, target: Node | undefined, node: IBobrilCacheNode | undefined) => boolean
) {
    addEvent(name, 5, callback);
}

var pointersEventNames = ["PointerDown", "PointerMove", "PointerUp", "PointerCancel"] as const;
var i: number;

function type2Bobril(t: any): BobrilPointerType {
    if (t === "mouse" || t === 4) return BobrilPointerType.Mouse;
    if (t === "pen" || t === 3) return BobrilPointerType.Pen;
    return BobrilPointerType.Touch;
}

function buildHandlerPointer(name: string) {
    return function handlePointerDown(
        ev: PointerEvent,
        target: Node | undefined,
        node: IBobrilCacheNode | undefined
    ): boolean {
        target = ev.target as Node;
        node = deref(target);
        let button = ev.button + 1;
        let type = type2Bobril(ev.pointerType);
        let buttons = ev.buttons;
        if (button === 0 && type === BobrilPointerType.Mouse && buttons) {
            button = 1;
            while (!(buttons & 1)) {
                buttons = buttons >> 1;
                button++;
            }
        }
        var param: IBobrilPointerEvent = {
            target: node!,
            id: ev.pointerId,
            cancelable: normalizeCancelable(ev),
            type: type,
            x: ev.clientX,
            y: ev.clientY,
            button: button,
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail,
        };
        if (emitEvent("!" + name, param, target, node)) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

function buildHandlerTouch(name: string) {
    return function handlePointerDown(
        ev: TouchEvent,
        target: Node | undefined,
        node: IBobrilCacheNode | undefined
    ): boolean {
        var preventDef = false;
        for (var i = 0; i < ev.changedTouches.length; i++) {
            var t = ev.changedTouches[i]!;
            target = t.target as Node;
            node = deref(target);
            var param: IBobrilPointerEvent = {
                target: node!,
                id: t.identifier + 2,
                cancelable: normalizeCancelable(ev),
                type: BobrilPointerType.Touch,
                x: t.clientX,
                y: t.clientY,
                button: 1,
                shift: ev.shiftKey,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                meta: ev.metaKey || false,
                count: ev.detail,
            };
            if (emitEvent("!" + name, param, target, node)) preventDef = true;
        }
        if (preventDef) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

function buildHandlerMouse(name: string) {
    return function handlePointer(
        ev: MouseEvent,
        target: Node | undefined,
        node: IBobrilCacheNode | undefined
    ): boolean {
        target = ev.target as Node;
        node = deref(target);
        var param: IBobrilPointerEvent = {
            target: node!,
            id: 1,
            type: BobrilPointerType.Mouse,
            cancelable: normalizeCancelable(ev),
            x: ev.clientX,
            y: ev.clientY,
            button: decodeButton(ev),
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail,
        };
        if (emitEvent("!" + name, param, target, node)) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

function listenMouse() {
    addEvent5("mousedown", buildHandlerMouse(pointersEventNames[0] /*"PointerDown"*/));
    addEvent5("mousemove", buildHandlerMouse(pointersEventNames[1] /*"PointerMove"*/));
    addEvent5("mouseup", buildHandlerMouse(pointersEventNames[2] /*"PointerUp"*/));
}

if ((<any>window).ontouchstart !== undefined) {
    addEvent5("touchstart", buildHandlerTouch(pointersEventNames[0] /*"PointerDown"*/));
    addEvent5("touchmove", buildHandlerTouch(pointersEventNames[1] /*"PointerMove"*/));
    addEvent5("touchend", buildHandlerTouch(pointersEventNames[2] /*"PointerUp"*/));
    addEvent5("touchcancel", buildHandlerTouch(pointersEventNames[3] /*"PointerCancel"*/));
    listenMouse();
} else if (window.onpointerdown !== undefined) {
    for (i = 0; i < 4 /*pointersEventNames.length*/; i++) {
        var name = pointersEventNames[i]!;
        addEvent5(name.toLowerCase(), buildHandlerPointer(name));
    }
} else {
    listenMouse();
}

for (var j = 0; j < 4 /*pointersEventNames.length*/; j++) {
    ((name: string) => {
        var onName = "on" + name;
        addEvent(
            "!" + name,
            50,
            (ev: IBobrilPointerEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) => {
                return invokeMouseOwner(onName, ev) || bubble(node, onName as EventNames, ev) != undefined;
            }
        );
    })(pointersEventNames[j]!);
}

var pointersDown: { [id: number]: BobrilPointerType } = newHashObj();
var toBust: Array<number>[] = [];
var firstPointerDown = -1;
var firstPointerDownTime = 0;
var firstPointerDownX = 0;
var firstPointerDownY = 0;
var tapCanceled = false;
var lastMouseEv: IBobrilPointerEvent | undefined;

function diffLess(n1: number, n2: number, diff: number) {
    return Math.abs(n1 - n2) < diff;
}

var prevMousePath: (IBobrilCacheNode | null)[] = [];

export const pointerRevalidateEventName = "!PointerRevalidate";

export function revalidateMouseIn() {
    if (lastMouseEv) {
        emitEvent(pointerRevalidateEventName, lastMouseEv, undefined, lastMouseEv.target);
    }
}

addEvent(pointerRevalidateEventName, 3, mouseEnterAndLeave);

function vdomPathFromCacheNode(n: IBobrilCacheNode | undefined): IBobrilCacheNode[] {
    var res = [];
    while (n != undefined) {
        res.push(n);
        n = n.parent;
    }
    return res.reverse();
}

const mouseOverHookSet = new Set<CommonUseIsHook>();

export let useIsMouseOver = buildUseIsHook(mouseOverHookSet);

function mouseEnterAndLeave(ev: IBobrilPointerEvent) {
    lastMouseEv = ev;
    var node = ev.target;
    var toPath = vdomPathFromCacheNode(node);

    mouseOverHookSet.forEach((v) => v.update(toPath));

    bubble(node, "onMouseOver", ev);

    var common = 0;
    while (common < prevMousePath.length && common < toPath.length && prevMousePath[common] === toPath[common])
        common++;

    var n: IBobrilCacheNode | null;
    var c: IBobrilComponent;
    var i = prevMousePath.length;
    if (i > 0 && (i > common || i != toPath.length)) {
        n = prevMousePath[i - 1]!;
        if (n) {
            c = n.component;
            if (c && c.onMouseOut) c.onMouseOut(n.ctx!, ev);
        }
    }
    while (i > common) {
        i--;
        n = prevMousePath[i]!;
        if (n) {
            c = n.component;
            if (c && c.onMouseLeave) c.onMouseLeave(n.ctx!, ev);
        }
    }
    while (i < toPath.length) {
        n = toPath[i]!;
        if (n) {
            c = n.component;
            if (c && c.onMouseEnter) c.onMouseEnter(n.ctx!, ev);
        }
        i++;
    }
    prevMousePath = toPath;
    if (i > 0 && (i > common || i != prevMousePath.length)) {
        n = prevMousePath[i - 1]!;
        if (n) {
            c = n.component;
            if (c && c.onMouseIn) c.onMouseIn(n.ctx!, ev);
        }
    }
    return false;
}

function noPointersDown(): boolean {
    return Object.keys(pointersDown).length === 0;
}

function bustingPointerDown(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    if (firstPointerDown === -1 && noPointersDown()) {
        firstPointerDown = ev.id;
        firstPointerDownTime = now();
        firstPointerDownX = ev.x;
        firstPointerDownY = ev.y;
        tapCanceled = false;
        mouseEnterAndLeave(ev);
    }
    pointersDown[ev.id] = ev.type;
    if (firstPointerDown !== ev.id) {
        tapCanceled = true;
    }
    return false;
}

function bustingPointerMove(
    ev: IBobrilPointerEvent,
    target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    // Browser forgot to send mouse up? Let's fix it
    if (ev.type === BobrilPointerType.Mouse && ev.button === 0 && pointersDown[ev.id] != null) {
        ev.button = 1;
        emitEvent("!PointerUp", ev, target, node);
        ev.button = 0;
    }
    if (firstPointerDown === ev.id) {
        mouseEnterAndLeave(ev);
        if (
            !diffLess(firstPointerDownX, ev.x, MoveOverIsNotTap) ||
            !diffLess(firstPointerDownY, ev.y, MoveOverIsNotTap)
        )
            tapCanceled = true;
    } else if (noPointersDown()) {
        mouseEnterAndLeave(ev);
    }
    return false;
}

let clickingSpreeStart: number = 0;
let clickingSpreeCount: number = 0;

function shouldPreventClickingSpree(clickCount: number): boolean {
    if (clickingSpreeCount == 0) return false;
    let n = now();
    if (n < clickingSpreeStart + 1000 && clickCount >= clickingSpreeCount) {
        clickingSpreeStart = n;
        clickingSpreeCount = clickCount;
        return true;
    }
    clickingSpreeCount = 0;
    return false;
}

export function preventClickingSpree() {
    clickingSpreeCount = 2;
    clickingSpreeStart = now();
}

function bustingPointerUp(
    ev: IBobrilPointerEvent,
    target: Node | undefined,
    node: IBobrilCacheNode | undefined
): boolean {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        mouseEnterAndLeave(ev);
        firstPointerDown = -1;
        if (ev.type == BobrilPointerType.Touch && !tapCanceled) {
            if (now() - firstPointerDownTime < TapShouldBeShorterThanMs) {
                emitEvent("!PointerCancel", ev, target, node);
                shouldPreventClickingSpree(1);
                var handled = invokeMouseOwner(onClickText, ev) || bubble(node, onClickText, ev) != null;
                var delay = ieVersion() ? MaxBustDelayForIE : MaxBustDelay;
                toBust.push([ev.x, ev.y, now() + delay, handled ? 1 : 0]);
                return handled;
            }
        } else if (tapCanceled) {
            ignoreClick(ev.x, ev.y);
        }
    }
    return false;
}

function bustingPointerCancel(
    ev: IBobrilPointerEvent,
    _target: Node | undefined,
    _node: IBobrilCacheNode | undefined
): boolean {
    delete pointersDown[ev.id];
    if (firstPointerDown == ev.id) {
        firstPointerDown = -1;
    }
    return false;
}

function bustingClick(ev: MouseEvent, _target: Node | undefined, _node: IBobrilCacheNode | undefined): boolean {
    var n = now();
    for (var i = 0; i < toBust.length; i++) {
        var j = toBust[i]!;
        if (j[2]! < n) {
            toBust.splice(i, 1);
            i--;
            continue;
        }
        if (diffLess(j[0]!, ev.clientX, BustDistance) && diffLess(j[1]!, ev.clientY, BustDistance)) {
            toBust.splice(i, 1);
            if (j[3]) preventDefault(ev);
            return true;
        }
    }
    return false;
}

var bustingEventNames = ["!PointerDown", "!PointerMove", "!PointerUp", "!PointerCancel", "click"] as const;
var bustingEventHandlers = [
    bustingPointerDown,
    bustingPointerMove,
    bustingPointerUp,
    bustingPointerCancel,
    bustingClick,
];
for (var i = 0; i < 5 /*bustingEventNames.length*/; i++) {
    addEvent(bustingEventNames[i]!, 3, bustingEventHandlers[i]!);
}

function createHandlerMouse(handlerName: string) {
    return (ev: IBobrilPointerEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) => {
        if (firstPointerDown != ev.id && !noPointersDown()) return false;
        if (invokeMouseOwner(handlerName, ev) || bubble(node, handlerName as EventNames, ev)) {
            return true;
        }
        return false;
    };
}

var mouseHandlerNames = ["Down", "Move", "Up", "Up"];
for (var i = 0; i < 4; i++) {
    addEvent(bustingEventNames[i]!, 80, createHandlerMouse("onMouse" + mouseHandlerNames[i]));
}

function decodeButton(ev: MouseEvent): number {
    return ev.which || ev.button;
}

function normalizeCancelable(ev: Event): boolean {
    var c = ev.cancelable;
    return !isBoolean(c) || c;
}

function createHandler(handlerName: string, allButtons?: boolean) {
    return (ev: MouseEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) => {
        let button = decodeButton(ev) || 1;
        // Ignore non left mouse click/dblclick event, but not for contextmenu event
        if (!allButtons && button !== 1) return false;
        let param: IBobrilMouseEvent = {
            target: node!,
            x: ev.clientX,
            y: ev.clientY,
            button: button,
            cancelable: normalizeCancelable(ev),
            shift: ev.shiftKey,
            ctrl: ev.ctrlKey,
            alt: ev.altKey,
            meta: ev.metaKey || false,
            count: ev.detail || 1,
        };
        if (handlerName == onDoubleClickText) param.count = 2;
        if (
            shouldPreventClickingSpree(param.count) ||
            invokeMouseOwner(handlerName, param) ||
            bubble(node, handlerName as EventNames, param)
        ) {
            preventDefault(ev);
            return true;
        }
        return false;
    };
}

export function nodeOnPoint(x: number, y: number): IBobrilCacheNode | undefined {
    return deref(document.elementFromPoint(x, y) as HTMLElement);
}

// click must have higher priority over onchange detection
addEvent5("click", createHandler(onClickText));
addEvent5("dblclick", createHandler(onDoubleClickText));
addEvent5("contextmenu", createHandler("onContextMenu", true));

function handleMouseWheel(ev: any, _target: Node | undefined, node: IBobrilCacheNode | undefined): boolean {
    let button = ev.button + 1;
    let buttons = ev.buttons;
    if (button === 0 && buttons) {
        button = 1;
        while (!(buttons & 1)) {
            buttons = buttons >> 1;
            button++;
        }
    }
    let dx = ev.deltaX;
    let dy = ev.deltaY;
    var param: IBobrilMouseWheelEvent = {
        target: node!,
        dx,
        dy,
        x: ev.clientX,
        y: ev.clientY,
        cancelable: normalizeCancelable(ev),
        button: button,
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        meta: ev.metaKey || false,
        count: ev.detail,
    };
    if (invokeMouseOwner("onMouseWheel", param) || bubble(node, "onMouseWheel", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
addEvent5("wheel", handleMouseWheel);

export const pointersDownCount = () => Object.keys(pointersDown).length;
export const firstPointerDownId = () => firstPointerDown;
export const ignoreClick = (x: number, y: number) => {
    var delay = ieVersion() ? MaxBustDelayForIE : MaxBustDelay;
    toBust.push([x, y, now() + delay, 1]);
};

let lastInteractionWasKeyboard = false;
const inputTypesWithPermanentFocusVisible =
    /te(l|xt)|search|url|email|password|number|month|week|(date)?(time)?(-local)?/i;

function hasAlwaysFocusVisible(element: typeof document.activeElement): boolean {
    if (element == null) {
        return false;
    }

    if (
        element.tagName == "INPUT" &&
        inputTypesWithPermanentFocusVisible.test((element as HTMLInputElement).type) &&
        !(element as HTMLInputElement).readOnly
    ) {
        return true;
    }

    if (element.tagName == "TEXTAREA" && !(element as HTMLTextAreaElement).readOnly) {
        return true;
    }

    return (element as HTMLElement).isContentEditable;
}

addEvent(bustingEventNames[0], 2, () => {
    lastInteractionWasKeyboard = false;
    return false;
});

addEvent("keydown", 2, (ev) => {
    if (!ev.metaKey && !ev.altKey && !ev.ctrlKey) {
        lastInteractionWasKeyboard = true;
    }
    return false;
});

export function shouldBeFocusVisible() {
    return lastInteractionWasKeyboard || hasAlwaysFocusVisible(document.activeElement);
}
