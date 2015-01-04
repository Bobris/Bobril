/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.media.d.ts"/>

((b: IBobrilStatic, window: Window) => {
    var media: IBobrilMedia = null;
    var breaks = [
                    [400, 800, 900], //portrait widths
                    [640, 1280, 1440] //landscape widths
                 ];

    function emitOnMediaChange() {
        media = null;
        b.invalidate();
        return false;
    }

    var events = ["resize", "orientationchange"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 100, emitOnMediaChange);

    function accDeviceBreaks(newBreaks?: number[][]): number[][] {
        if (newBreaks != null) {
            breaks = newBreaks;
            emitOnMediaChange();
        }
        return breaks;
    }

    var viewport = window.document.documentElement;

    function getMedia(): IBobrilMedia {
        if (media == null) {
            var w = viewport.clientWidth;
            var h = viewport.clientHeight;
            var o: any = (<any>window).orientation;
            var p = h >= w;
            if (o == null) o = (p ? 0 : 90);
            var device = 0;
            while (w > breaks[+!p][device]) device++;
            media = {
                width: w,
                height: h,
                orientation: o,
                deviceCategory: device,
                portrait: p
            };
        }
        return media;
    }

    b.getMedia = getMedia;
    b.accDeviceBreaks = accDeviceBreaks;
})(b, window);
