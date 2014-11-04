interface Touch {
    identifier: number;
    target: EventTarget;
    screenX: number;
    screenY: number;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
}

interface TouchList extends Array<Touch> {
    length: number;
    item(index: number): Touch;
}

interface TouchEvent extends UIEvent {
    touches: TouchList;
    targetTouches: TouchList;
    changedTouches: TouchList;
    altKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
}

declare var TouchEvent: {
    prototype: TouchEvent;
    new (): TouchEvent;
}