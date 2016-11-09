/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.scroll.d.ts"/>

((b: IBobrilStatic, window: Window) => {
    var callbacks: Array<(info: IBobrilScroll) => void> = [];

    function emitOnScroll(ev: Event, target: Node, node: IBobrilCacheNode) {
        let info: IBobrilScroll = {
            node
        };
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i](info);
        }
        return false;
    }

    // capturing event to hear everything
    b.addEvent("^scroll", 10, emitOnScroll);

    function addOnScroll(callback: (info?: IBobrilScroll) => void): void {
        callbacks.push(callback);
    }

    function removeOnScroll(callback: (info?: IBobrilScroll) => void): void {
        for (var i = 0; i < callbacks.length; i++) {
            if (callbacks[i] === callback) {
                callbacks.splice(i, 1);
                return;
            }
        }
	}

    const isHtml = /^(?:html)$/i;
    const isScrollOrAuto = /^(?:auto)$|^(?:scroll)$/i;
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
        var left = window.pageXOffset;
        var top = window.pageYOffset;
        return [left, top];
    }

    b.addOnScroll = addOnScroll;
    b.removeOnScroll = removeOnScroll;
    b.isScrollable = isScrollable;
    b.getWindowScroll = getWindowScroll;
})(b, window);
