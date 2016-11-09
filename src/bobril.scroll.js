/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.scroll.d.ts"/>
(function (b, window) {
    var callbacks = [];
    function emitOnScroll(ev, target, node) {
        var info = {
            node: node
        };
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](info);
        }
        return false;
    }
    // capturing event to hear everything
    b.addEvent("^scroll", 10, emitOnScroll);
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
        var styles = window.getComputedStyle(el);
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
        var left = window.pageXOffset;
        var top = window.pageYOffset;
        return [left, top];
    }
    b.addOnScroll = addOnScroll;
    b.removeOnScroll = removeOnScroll;
    b.isScrollable = isScrollable;
    b.getWindowScroll = getWindowScroll;
})(b, window);
