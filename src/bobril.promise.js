/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.promise.d.ts"/>
(function (b, window, document) {
    var asap = (function () {
        var callbacks = [];
        function executeCallbacks() {
            var cbList = callbacks;
            callbacks = [];
            for (var i = 0, len = cbList.length; i < len; i++) {
                cbList[i]();
            }
        }
        var onreadystatechange = 'onreadystatechange';
        // Modern browsers, fastest async
        if (window.MutationObserver) {
            var hiddenDiv = document.createElement("div");
            (new MutationObserver(executeCallbacks)).observe(hiddenDiv, { attributes: true });
            return function (callback) {
                if (!callbacks.length) {
                    hiddenDiv.setAttribute('yes', 'no');
                }
                callbacks.push(callback);
            };
        }
        else if (!window.setImmediate && window.postMessage && window.addEventListener) {
            var MESSAGE_PREFIX = "basap" + Math.random(), hasPostMessage = false;
            var onGlobalMessage = function (event) {
                if (event.source === window && event.data === MESSAGE_PREFIX) {
                    hasPostMessage = false;
                    executeCallbacks();
                }
            };
            window.addEventListener("message", onGlobalMessage, false);
            return function (fn) {
                callbacks.push(fn);
                if (!hasPostMessage) {
                    hasPostMessage = true;
                    window.postMessage(MESSAGE_PREFIX, "*");
                }
            };
        }
        else if (!window.setImmediate && onreadystatechange in document.createElement('script')) {
            var scriptEl;
            return function (callback) {
                callbacks.push(callback);
                if (!scriptEl) {
                    scriptEl = document.createElement("script");
                    scriptEl[onreadystatechange] = function () {
                        scriptEl[onreadystatechange] = null;
                        scriptEl.parentNode.removeChild(scriptEl);
                        scriptEl = null;
                        executeCallbacks();
                    };
                    document.body.appendChild(scriptEl);
                }
            };
        }
        else {
            var timeout;
            var timeoutFn = window.setImmediate || setTimeout;
            return function (callback) {
                callbacks.push(callback);
                if (!timeout) {
                    timeout = timeoutFn(function () {
                        timeout = undefined;
                        executeCallbacks();
                    }, 0);
                }
            };
        }
    })();
    // Polyfill for Function.prototype.bind
    function bind(fn, thisArg) {
        return function () {
            fn.apply(thisArg, arguments);
        };
    }
    var isArray = b.isArray;
    function handle(deferred) {
        var _this = this;
        if (this.s === null) {
            this.d.push(deferred);
            return;
        }
        asap(function () {
            var cb = _this.s ? deferred[0] : deferred[1];
            if (cb == null) {
                (_this.s ? deferred[2] : deferred[3])(_this.v);
                return;
            }
            var ret;
            try {
                ret = cb(_this.v);
            }
            catch (e) {
                deferred[3](e);
                return;
            }
            deferred[2](ret);
        });
    }
    function finale() {
        for (var i = 0, len = this.d.length; i < len; i++) {
            handle.call(this, this.d[i]);
        }
        this.d = null;
    }
    function reject(newValue) {
        this.s = false;
        this.v = newValue;
        finale.call(this);
    }
    /**
     * Take a potentially misbehaving resolver function and make sure
     * onFulfilled and onRejected are only called once.
     *
     * Makes no guarantees about asynchrony.
     */
    function doResolve(fn, onFulfilled, onRejected) {
        var done = false;
        try {
            fn(function (value) {
                if (done)
                    return;
                done = true;
                onFulfilled(value);
            }, function (reason) {
                if (done)
                    return;
                done = true;
                onRejected(reason);
            });
        }
        catch (ex) {
            if (done)
                return;
            done = true;
            onRejected(ex);
        }
    }
    function resolve(newValue) {
        try {
            if (newValue === this)
                throw new TypeError('Promise selfresolve');
            if (Object(newValue) === newValue) {
                var then = newValue.then;
                if (typeof then === 'function') {
                    doResolve(bind(then, newValue), bind(resolve, this), bind(reject, this));
                    return;
                }
            }
            this.s = true;
            this.v = newValue;
            finale.call(this);
        }
        catch (e) {
            reject.call(this, e);
        }
    }
    function Promise(fn) {
        this.s = null;
        this.v = null;
        this.d = [];
        doResolve(fn, bind(resolve, this), bind(reject, this));
    }
    Promise.prototype.then = function (onFulfilled, onRejected) {
        var me = this;
        return new Promise(function (resolve, reject) {
            handle.call(me, [onFulfilled, onRejected, resolve, reject]);
        });
    };
    Promise.all = function () {
        var args = [].slice.call(arguments.length === 1 && isArray(arguments[0]) ? arguments[0] : arguments);
        return new Promise(function (resolve, reject) {
            if (args.length === 0) {
                resolve(args);
                return;
            }
            var remaining = args.length;
            function res(i, val) {
                try {
                    if (val && (typeof val === 'object' || typeof val === 'function')) {
                        var then = val.then;
                        if (typeof then === 'function') {
                            then.call(val, function (val) {
                                res(i, val);
                            }, reject);
                            return;
                        }
                    }
                    args[i] = val;
                    if (--remaining === 0) {
                        resolve(args);
                    }
                }
                catch (ex) {
                    reject(ex);
                }
            }
            for (var i = 0; i < args.length; i++) {
                res(i, args[i]);
            }
        });
    };
    Promise.resolve = function (value) {
        if (value && typeof value === 'object' && value.constructor === Promise) {
            return value;
        }
        return new Promise(function (resolve) {
            resolve(value);
        });
    };
    Promise.reject = function (value) { return new Promise(function (resolve, reject) {
        reject(value);
    }); };
    Promise.race = function (values) { return new Promise(function (resolve, reject) {
        for (var i = 0, len = values.length; i < len; i++) {
            values[i].then(resolve, reject);
        }
    }); };
    b.asap = asap;
    b.Promise = Promise;
})(b, window, document);
//# sourceMappingURL=bobril.promise.js.map