/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.scroll.d.ts"/>

((b: IBobrilStatic, window: Window) => {
    var callbacks: Array<() => void> = [];

    function emitOnScroll() {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }
        return false;
    }

    // capturing event to hear everything
    b.addEvent("^scroll", 10, emitOnScroll);

    function addOnScroll(callback: () => void): void {
        callbacks.push(callback);
    }

    function removeOnScroll(callback: () => void): void {
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
    function isScrollable(el: Element): [boolean, boolean] {
        var styles:any = window.getComputedStyle(el);
        var res:[boolean, boolean] = [true, true];
        if (!isHtml.test(el.nodeName)) {
            res[0] = isScrollOrAuto.test(styles.overflowX);
            res[1] = isScrollOrAuto.test(styles.overflowY);
        }
        res[0] = res[0] && el.scrollWidth > el.clientWidth;
        res[1] = res[1] && el.scrollHeight > el.clientHeight;
        return res;
    }

    // returns standart X,Y order
    function getWindowScroll(): [number, number] {
        var top = window.pageYOffset;
        var left = window.pageXOffset;
        return [left, top];
    }

    b.addOnScroll = addOnScroll;
    b.removeOnScroll = removeOnScroll;
    b.isScrollable = isScrollable;
    b.getWindowScroll = getWindowScroll;
})(b, window);
