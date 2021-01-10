export type Thenable<T> = PromiseLike<T>;

export const asap = (() => {
    var callbacks: Array<() => void> = [];

    function executeCallbacks() {
        var cbList = callbacks;
        callbacks = [];
        for (var i = 0, len = cbList.length; i < len; i++) {
            cbList[i]!();
        }
    }

    // Mainly IE11, fastest async
    if ((<any>window).MutationObserver) {
        var hiddenDiv = document.createElement("div");
        new MutationObserver(executeCallbacks).observe(hiddenDiv, {
            attributes: true,
        });
        return (callback: () => void) => {
            if (!callbacks.length) {
                hiddenDiv.setAttribute("yes", "no");
            }
            callbacks.push(callback);
        };
        // All other browsers
    } else {
        var timeout: number | undefined;
        var timeoutFn: (cb: () => void, timeout: number) => number = (window as any).setImmediate || setTimeout;
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
