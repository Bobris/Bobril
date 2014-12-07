/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.scroll.d.ts"/>

((b: IBobrilStatic, window: Window) => {
    var scroll = "scroll";
    var callbacks: Array<() => void> = [];

    function emitOnScroll() {
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i]();
        }
        return false;
    }

    b.addEvent(scroll, 100, emitOnScroll);

    function registerScrollable(el: Element): void {
        if (el.addEventListener) {
            el.addEventListener(scroll, emitOnScroll);
        } else {
            (<MSEventAttachmentTarget><any>el).attachEvent("on" + scroll, emitOnScroll);
        }
	}
	
    function unregisterScrollable(el: Element): void {
        if (el.removeEventListener) {
            el.removeEventListener(scroll, emitOnScroll);
        } else {
            (<MSEventAttachmentTarget><any>el).detachEvent("on" + scroll, emitOnScroll);
        }
    }

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
    function isScrollable(el: Element): { x: boolean; y: boolean } {
        var styles:any = (window.getComputedStyle ? window.getComputedStyle(el) : (<any>el).currentStyle);
        var res = { x: true, y: true };
        if (!isHtml.test(el.nodeName)) {
            res.x = isScrollOrAuto.test(styles.overflowX);
            res.y = isScrollOrAuto.test(styles.overflowY);
        }
        res.x = res.x && el.scrollWidth > el.clientWidth;
        res.y = res.y && el.scrollHeight > el.clientHeight;
        return res;
    }

    b.registerScrollable = registerScrollable;
    b.unregisterScrollable = unregisterScrollable;
    b.addOnScroll = addOnScroll;
    b.removeOnScroll = removeOnScroll;
    b.isScrollable = isScrollable;
})(b, window);
