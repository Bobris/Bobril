export const asap = (() => {
    var callbacks: Array<() => void> = [];

    function executeCallbacks() {
        var cbList = callbacks;
        callbacks = [];
        for (var i = 0, len = cbList.length; i < len; i++) {
            cbList[i]!();
        }
    }

    return (callback: () => void) => {
        callbacks.push(callback);
        if (callbacks.length === 1) {
            Promise.resolve().then(executeCallbacks);
        }
    };
})();
