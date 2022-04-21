// PureFuncs: noop, newHashObj, is, hOP, assert

declare var DEBUG: boolean;

export function noop(): undefined {
    return undefined;
}

export function newHashObj(): { [name: string]: any } {
    return Object.create(null);
}

export const is = Object.is;

export const hOP = Object.prototype.hasOwnProperty;

export function assert(shouldBeTrue: boolean, messageIfFalse?: string) {
    if (DEBUG && !shouldBeTrue) throw Error(messageIfFalse || "assertion failed");
}

export function newMap<K, V>(): Map<K, V> {
    return new Map();
}

export function createTextNode(content: string): Text {
    return document.createTextNode(content);
}
