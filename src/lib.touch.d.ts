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
    //identifiedTouch(identifier: number): Touch;
}

interface TouchEvent extends UIEvent {
    touches: TouchList;
    targetTouches: TouchList;
    changedTouches: TouchList;
    altKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    //initTouchEvent(type: string, canBubble: boolean, cancelable: boolean, view: AbstractView, detail: number, ctrlKey: boolean, altKey: boolean, shiftKey: boolean, metaKey: boolean, touches: TouchList, targetTouches: TouchList, changedTouches: TouchList) : TouchEvent;
}

declare var TouchEvent: {
    prototype: TouchEvent;
    new (): TouchEvent;
}