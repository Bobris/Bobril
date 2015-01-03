/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.scroll.d.ts"/>
(function (b, window) {
    var scroll = "scroll";
    var callbacks = [];
    function emitOnScroll() {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }
        return false;
    }
    b.addEvent(scroll, 100, emitOnScroll);
    function registerScrollable(el) {
        if (el.addEventListener) {
            el.addEventListener(scroll, emitOnScroll);
        }
        else {
            el.attachEvent("on" + scroll, emitOnScroll);
        }
    }
    function unregisterScrollable(el) {
        if (el.removeEventListener) {
            el.removeEventListener(scroll, emitOnScroll);
        }
        else {
            el.detachEvent("on" + scroll, emitOnScroll);
        }
    }
    function addOnScroll(callback) {
        callbacks.push(callback);
    }
    function removeOnScroll(callback) {
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                callbacks.splice(i, 1);
                return;
            }
        }
    }
    var isHtml = /^(?:html)$/i;
    var isScrollOrAuto = /^(?:auto)$|^(?:scroll)$/i;
    // inspired by https://github.com/litera/jquery-scrollintoview/blob/master/jquery.scrollintoview.js	
    function isScrollable(el) {
        var styles = (window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle);
        var res = [true, true];
        if (!isHtml.test(el.nodeName)) {
            res[0] = isScrollOrAuto.test(styles.overflowX);
            res[1] = isScrollOrAuto.test(styles.overflowY);
        }
        res[0] = res[0] && el.scrollWidth > el.clientWidth;
        res[1] = res[1] && el.scrollHeight > el.clientHeight;
        return res;
    }
    // returns standart X,Y order
    function getWindowScroll() {
        var top = window.pageYOffset;
        var left = window.pageXOffset;
        if (top === undefined) {
            var de = document.documentElement;
            top = de.scrollTop;
            left = de.scrollLeft;
        }
        return [left, top];
    }
    b.registerScrollable = registerScrollable;
    b.unregisterScrollable = unregisterScrollable;
    b.addOnScroll = addOnScroll;
    b.removeOnScroll = removeOnScroll;
    b.isScrollable = isScrollable;
    b.getWindowScroll = getWindowScroll;
})(b, window);
//# sourceMappingURL=bobril.scroll.js.map