import { addEvent, bubble, IBobrilCacheNode, IEventParam, preventDefault } from "./core";

export interface IKeyDownUpEvent extends IEventParam {
    shift: boolean;
    ctrl: boolean;
    alt: boolean;
    meta: boolean;
    which: number;
    key: string;
}

export interface IKeyPressEvent extends IEventParam {
    charCode: number;
}

declare module "./core" {
    interface IBubblingAndBroadcastEvents {
        onKeyDown?(event: IKeyDownUpEvent): GenericEventResult;
        onKeyUp?(event: IKeyDownUpEvent): GenericEventResult;
        onKeyPress?(event: IKeyPressEvent): GenericEventResult;
    }
}

const NormalizerKeyMap: Record<string, string> = {
    Up: "ArrowUp",
    Down: "ArrowDown",
    Left: "ArrowLeft",
    Right: "ArrowRight",
    Del: "Delete",
    Crsel: "CrSel",
    Exsel: "ExSel",
    Esc: "Escape",
    Apps: "ContextMenu",
    OS: "Meta",
    Win: "Meta",
    Scroll: "ScrollLock",
    Spacebar: " ",
    Nonconvert: "NonConvert",
    Decimal: ".",
    Separator: ",",
    Multiply: "*",
    Add: "+",
    Divide: "/",
    Subtract: "-",
    MediaNextTrack: "MediaTrackNext",
    MediaPreviousTrack: "MediaTrackPrevious",
    MediaFastForward: "FastFwd",
    Live: "TV",
    Zoom: "ZoomToggle",
    SelectMedia: "LaunchMediaPlayer",
    MediaSelect: "LaunchMediaPlayer",
    VolumeUp: "AudioVolumeUp",
    VolumeDown: "AudioVolumeDown",
    VolumeMute: "AudioVolumeMute",
};

function buildParam(ev: KeyboardEvent): IKeyDownUpEvent {
    return {
        target: undefined,
        shift: ev.shiftKey,
        ctrl: ev.ctrlKey,
        alt: ev.altKey,
        meta: ev.metaKey || false,
        which: ev.which || ev.keyCode,
        key: NormalizerKeyMap[ev.key] || ev.key,
    } as any;
}

function emitOnKeyDown(ev: KeyboardEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (!node) return false;
    var param: IKeyDownUpEvent = buildParam(ev);
    if (bubble(node, "onKeyDown", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}

function emitOnKeyUp(ev: KeyboardEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (!node) return false;
    var param: IKeyDownUpEvent = buildParam(ev);
    if (bubble(node, "onKeyUp", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}
function emitOnKeyPress(ev: KeyboardEvent, _target: Node | undefined, node: IBobrilCacheNode | undefined) {
    if (!node) return false;
    if (
        ev.which === 0 || // don't want special key presses
        ev.altKey // Ignore Alt+num in Firefox
    )
        return false;
    var param: IKeyPressEvent = { charCode: ev.which || ev.keyCode } as any;
    if (bubble(node, "onKeyPress", param)) {
        preventDefault(ev);
        return true;
    }
    return false;
}

addEvent("keydown", 50, emitOnKeyDown);
addEvent("keyup", 50, emitOnKeyUp);
addEvent("keypress", 50, emitOnKeyPress);
