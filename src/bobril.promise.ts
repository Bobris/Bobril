/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.promise.d.ts"/>

((b: IBobrilStatic, window: Window, document: Document) => {
    var asap = (() => {
        var callbacks: Array<() => void> = [];

        function executeCallbacks() {
            var cbList = callbacks;
            callbacks = [];
            for (var i = 0, len = cbList.length; i < len; i++) {
                cbList[i]();
            }
        }

        var onreadystatechange = 'onreadystatechange';
        // Modern browsers, fastest async
        if ((<any>window).MutationObserver) {
            var hiddenDiv = document.createElement("div");
            (new MutationObserver(executeCallbacks)).observe(hiddenDiv, { attributes: true });
            return (callback: () => void) => {
                if (!callbacks.length) {
                    hiddenDiv.setAttribute('yes', 'no');
                }
                callbacks.push(callback);
            };
            // Browsers that support postMessage
        } else if (!window.setImmediate && window.postMessage && window.addEventListener) {
            var MESSAGE_PREFIX = "basap" + Math.random(), hasPostMessage = false;

            var onGlobalMessage = (event: any) => {
                if (event.source === window && event.data === MESSAGE_PREFIX) {
                    hasPostMessage = false;
                    executeCallbacks();
                }
            };

            window.addEventListener("message", onGlobalMessage, false);

            return (fn: () => void) => {
                callbacks.push(fn);

                if (!hasPostMessage) {
                    hasPostMessage = true;
                    window.postMessage(MESSAGE_PREFIX, "*");
                }
            };
            // IE browsers without postMessage
        } else if (!window.setImmediate && onreadystatechange in document.createElement('script')) {
            var scriptEl: any;
            return (callback: () => void) => {
                callbacks.push(callback);
                if (!scriptEl) {
                    scriptEl = document.createElement("script");
                    scriptEl[onreadystatechange] = () => {
                        scriptEl[onreadystatechange] = null;
                        scriptEl.parentNode.removeChild(scriptEl);
                        scriptEl = null;
                        executeCallbacks();
                    };
                    document.body.appendChild(scriptEl);
                }
            };
            // All other browsers
        } else {
            var timeout: number;
            var timeoutFn: (cb: () => void, timeout: number) => number = window.setImmediate || setTimeout;
            return (callback: () => void) => {
                callbacks.push(callback);
                if (!timeout) {
                    timeout = timeoutFn(() => {
                        timeout = undefined;
                        executeCallbacks();
                    }, 0);
                }
            };
        }
    })();

    b.asap = asap;

    if (!(<any>window).Promise) {
        // Polyfill for Function.prototype.bind
        function bind(fn: (args: any) => void, thisArg: any) {
            return function() {
                fn.apply(thisArg, arguments);
            }
        }

        var isArray = b.isArray;

        function handle(deferred: Array<(v: any) => any>) {
            if (this.s/*tate*/ === null) {
                this.d/*eferreds*/.push(deferred);
                return;
            }
            asap(() => {
                var cb = this.s/*tate*/ ? deferred[0] : deferred[1];
                if (cb == null) {
                    (this.s/*tate*/ ? deferred[2] : deferred[3])(this.v/*alue*/);
                    return;
                }
                var ret: any;
                try {
                    ret = cb(this.v/*alue*/);
                } catch (e) {
                    deferred[3](e);
                    return;
                }
                deferred[2](ret);
            });
        }

        function finale() {
            for (var i = 0, len = this.d/*eferreds*/.length; i < len; i++) {
                handle.call(this, this.d/*eferreds*/[i]);
            }
            this.d/*eferreds*/ = null;
        }

        function reject(newValue: any) {
            this.s/*tate*/ = false;
            this.v/*alue*/ = newValue;
            finale.call(this);
        }

        /**
         * Take a potentially misbehaving resolver function and make sure
         * onFulfilled and onRejected are only called once.
         *
         * Makes no guarantees about asynchrony.
         */
        function doResolve(fn: (fulfill: (v: any) => void, reject: (r: any) => void) => void, onFulfilled: (value: any) => void, onRejected: (reason: any) => void) {
            var done = false;
            try {
                fn((value: any) => {
                    if (done) return;
                    done = true;
                    onFulfilled(value);
                }, (reason: any) => {
                        if (done) return;
                        done = true;
                        onRejected(reason);
                    });
            } catch (ex) {
                if (done) return;
                done = true;
                onRejected(ex);
            }
        }

        function resolve(newValue: any) {
            try { //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
                if (newValue === this) throw new TypeError('Promise selfresolve');
                if (Object(newValue) === newValue) {
                    var then = newValue.then;
                    if (typeof then === 'function') {
                        doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
                        return;
                    }
                }
                this.s/*tate*/ = true;
                this.v/*alue*/ = newValue;
                finale.call(this);
            } catch (e) { reject.call(this, e); }
        }

        function Promise(fn: (onFulfilled: (value: any) => void, onRejected: (reason: any) => void) => void) {
            this.s/*tate*/ = null;
            this.v/*alue*/ = null;
            this.d/*eferreds*/ = <Array<Array<() => void>>>[];

            doResolve(fn, bind(resolve, this), bind(reject, this));
        }

        Promise.prototype.then = function(onFulfilled: any, onRejected?: any) {
            var me = this;
            return new (<any>Promise)((resolve: any, reject: any) => {
                handle.call(me, [onFulfilled, onRejected, resolve, reject]);
            });
        };

        Promise.prototype['catch'] = function(onRejected?: any) {
			return this.then(undefined, onRejected);
		};

        (<any>Promise).all = function() {
            var args = (<any>[]).slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);

            return new (<any>Promise)((resolve: (value: any) => void, reject: (reason: any) => void) => {
                if (args.length === 0) {
                    resolve(args);
                    return;
                }
                var remaining = args.length;
                function res(i: number, val: any) {
                    try {
                        if (val && (typeof val === 'object' || typeof val === 'function')) {
                            var then = val.then;
                            if (typeof then === 'function') {
                                then.call(val, (val: any) => { res(i, val) }, reject);
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
            if (value && typeof value === 'object' && value.constructor === Promise) {
                return value;
            }

            return new (<any>Promise)((resolve: (value: any) => void) => {
                resolve(value);
            });
        };

        (<any>Promise).reject = (value: any) => new (<any>Promise)((resolve: any, reject: (reason: any) => void) => {
            reject(value);
        });

        (<any>Promise).race = (values: any[]) => new (<any>Promise)((resolve: any, reject: any) => {
            for (var i = 0, len = values.length; i < len; i++) {
                values[i].then(resolve, reject);
            }
        });

        (<any>window).Promise = <any>Promise;
    }
})(b, window, document);
