import { asap } from "./asap";
import { isArray, isNumber } from "./isFunc";

if (Object.assign == undefined) {
    Object.assign = function assign(target: Object, ..._sources: Object[]): Object {
        if (target == undefined) throw new TypeError("Target in assign cannot be undefined or null");
        let totalArgs = arguments.length;
        for (let i = 1; i < totalArgs; i++) {
            let source = arguments[i];
            if (source == undefined) continue;
            let keys = Object.keys(source);
            let totalKeys = keys.length;
            for (let j = 0; j < totalKeys; j++) {
                let key = keys[j]!;
                (<any>target)[key] = (<any>source)[key];
            }
        }
        return target;
    };
}

if (!Object.is) {
    Object.is = function (x, y) {
        if (x === y) {
            return x !== 0 || 1 / x === 1 / y;
        } else {
            return x !== x && y !== y;
        }
    };
}

function polyfill(type: any, method: string, value: Function): void {
    var prototype = type.prototype;
    if (!prototype[method]) {
        Object.defineProperty(prototype, method, {
            value,
            configurable: true,
            writable: true,
        });
    }
}

if (new Set([0]).size === 0) {
    const BuiltinSet = Set;
    Set = function Set(iterable: any[] | null | undefined) {
        const set = new BuiltinSet();
        if (iterable) {
            iterable.forEach(set.add, set);
        }
        return set;
    } as any;
    (Set as any).prototype = BuiltinSet.prototype;
    Set.prototype.constructor = Set;
}

if (new Map([[0, 0]]).size === 0) {
    const BuiltinMap = Map;
    Map = function Map(iterable: any[] | null | undefined) {
        const map = new BuiltinMap();
        if (iterable) {
            iterable.forEach(function (this: Map<any, any>, v: [any, any]) {
                this.set(v[0], v[1]);
            }, map);
        }
        return map;
    } as any;
    (Map as any).prototype = BuiltinMap.prototype;
    Map.prototype.constructor = Map;
}

polyfill(Array, "find", function (this: any, pred: Function): any {
    var o = Object(this);
    var len = o.length >>> 0;
    var thisArg = arguments[1];
    for (var k = 0; k < len; k++) {
        var kValue = o[k];
        if (pred.call(thisArg, kValue, k, o)) {
            return kValue;
        }
    }
    return;
});

polyfill(Array, "findIndex", function (this: any, pred: Function): number {
    var o = Object(this);
    var len = o.length >>> 0;
    var thisArg = arguments[1];
    for (var k = 0; k < len; k++) {
        var kValue = o[k];
        if (pred.call(thisArg, kValue, k, o)) {
            return k;
        }
    }
    return -1;
});

polyfill(Array, "some", function (this: any, pred: Function): boolean {
    var o = Object(this);
    var len = o.length >>> 0;
    var thisArg = arguments[1];
    for (var i = 0; i < len; i++) {
        if (i in o && pred.call(thisArg, o[i], i, o)) {
            return true;
        }
    }
    return false;
});

polyfill(String, "includes", function (this: string, search: string, start: number): boolean {
    if (!isNumber(start)) start = 0;
    if (start + search.length > this.length) {
        return false;
    } else {
        return this.indexOf(search, start) !== -1;
    }
});

polyfill(String, "startsWith", function (this: any, search: string, pos?: number): boolean {
    return this.substr(!pos || pos < 0 ? 0 : +pos, search.length) === search;
});

polyfill(String, "endsWith", function (this: any, search: string, pos?: number): boolean {
    var s = this.toString();
    if (!isNumber(pos) || !isFinite(pos) || Math.floor(pos) !== pos || pos > s.length) {
        pos = s.length;
    }
    pos! -= search.length;
    var lastIndex = s.indexOf(search, pos);
    return lastIndex !== -1 && lastIndex === pos;
});

if (!(<any>window).Promise) {
    (function () {
        // Polyfill for Function.prototype.bind
        function bind(fn: (...args: any[]) => void, thisArg: any) {
            return function () {
                fn.apply(thisArg, arguments as any);
            };
        }

        function handle(this: any, deferred: Array<(v: any) => any>) {
            if (this.s /*tate*/ === null) {
                this.d /*eferreds*/
                    .push(deferred);
                return;
            }
            asap(() => {
                var cb = this.s /*tate*/ ? deferred[0] : deferred[1];
                if (cb == undefined) {
                    (this.s /*tate*/ ? deferred[2] : deferred[3])!(this.v /*alue*/);
                    return;
                }
                var ret: any;
                try {
                    ret = cb(this.v /*alue*/);
                } catch (e) {
                    deferred[3]!(e);
                    return;
                }
                deferred[2]!(ret);
            });
        }

        function finale(this: any) {
            for (var i = 0, len = this.d /*eferreds*/.length; i < len; i++) {
                handle.call(this, this.d /*eferreds*/[i]);
            }
            this.d /*eferreds*/ = null;
        }

        function reject(this: any, newValue: any) {
            this.s /*tate*/ = false;
            this.v /*alue*/ = newValue;
            finale.call(this);
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(
            fn: (fulfill: (v: any) => void, reject: (r: any) => void) => void,
            onFulfilled: (value: any) => void,
            onRejected: (reason: any) => void
        ) {
            var done = false;
            try {
                fn(
                    (value: any) => {
                        if (done) return;
                        done = true;
                        onFulfilled(value);
                    },
                    (reason: any) => {
                        if (done) return;
                        done = true;
                        onRejected(reason);
                    }
                );
            } catch (ex) {
                if (done) return;
                done = true;
                onRejected(ex);
            }
        }

        function resolve(this: any, newValue: any) {
            try {
                //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === this) throw new TypeError("Promise self resolve");
                if (Object(newValue) === newValue) {
                    var then = newValue.then;
                    if (typeof then === "function") {
                        doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
                        return;
                    }
                }
                this.s /*tate*/ = true;
                this.v /*alue*/ = newValue;
                finale.call(this);
            } catch (e) {
                reject.call(this, e);
            }
        }

        function Promise(
            this: any,
            fn: (onFulfilled: (value: any) => void, onRejected: (reason: any) => void) => void
        ) {
            this.s /*tate*/ = null;
            this.v /*alue*/ = null;
            this.d /*eferreds*/ = <Array<Array<() => void>>>[];

            doResolve(fn, bind(resolve, this), bind(reject, this));
        }

        Promise.prototype.then = function (this: any, onFulfilled: any, onRejected?: any) {
            var me = this;
            return new (<any>Promise)((resolve: any, reject: any) => {
                handle.call(me, [onFulfilled, onRejected, resolve, reject]);
            });
        };

        Promise.prototype["catch"] = function (this: any, onRejected?: any) {
            return this.then(undefined, onRejected);
        };

        (<any>Promise).all = function () {
            var args = (<any>[]).slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

            return new (<any>Promise)((resolve: (value: any) => void, reject: (reason: any) => void) => {
                if (args.length === 0) {
                    resolve(args);
                    return;
                }
                var remaining = args.length;
                function res(i: number, val: any) {
                    try {
                        if (val && (typeof val === "object" || typeof val === "function")) {
                            var then = val.then;
                            if (typeof then === "function") {
                                then.call(
                                    val,
                                    (val: any) => {
                                        res(i, val);
                                    },
                                    reject
                                );
                                return;
                            }
                        }
                        args[i] = val;
                        if (--remaining === 0) {
                            resolve(args);
                        }
                    } catch (ex) {
                        reject(ex);
                    }
                }
                for (var i = 0; i < args.length; i++) {
                    res(i, args[i]);
                }
            });
        };

        (<any>Promise).resolve = (value: any) => {
            if (value && typeof value === "object" && value.constructor === Promise) {
                return value;
            }

            return new (<any>Promise)((resolve: (value: any) => void) => {
                resolve(value);
            });
        };

        (<any>Promise).reject = (value: any) =>
            new (<any>Promise)((_resolve: any, reject: (reason: any) => void) => {
                reject(value);
            });

        (<any>Promise).race = (values: any[]) =>
            new (<any>Promise)((resolve: any, reject: any) => {
                for (var i = 0, len = values.length; i < len; i++) {
                    values[i].then(resolve, reject);
                }
            });

        (<any>window)["Promise"] = <any>Promise;
    })();
}
