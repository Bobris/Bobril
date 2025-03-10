// PureFuncs: isNumber, isString, isBoolean, isFunction, isObject, isPromiseLike, isArray

export function isNumber(val: any): val is number {
    return typeof val == "number";
}

export function isString(val: any): val is string {
    return typeof val == "string";
}

export function isBoolean(val: any): val is boolean {
    return typeof val == "boolean";
}

export function isFunction(val: any): val is Function {
    return typeof val == "function";
}

export function isObject(val: any): val is { [name: string]: any } {
    return typeof val === "object";
}

export function isPromiseLike(val: any): val is PromiseLike<any> {
    return val && isFunction(val.then);
}

export const isArray = Array.isArray;
