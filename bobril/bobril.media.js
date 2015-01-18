/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.media.d.ts"/>
(function (b, window) {
    var media = null;
    var breaks = [
        [400, 800, 900],
        [640, 1280, 1440]
    ];
    function emitOnMediaChange() {
        media = null;
        b.invalidate();
        return false;
    }
    var events = ["resize", "orientationchange"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 100, emitOnMediaChange);
    function accDeviceBreaks(newBreaks) {
        if (newBreaks != null) {
            breaks = newBreaks;
            emitOnMediaChange();
        }
        return breaks;
    }
    var viewport = window.document.documentElement;
    function getMedia() {
        if (media == null) {
            var w = viewport.clientWidth;
            var h = viewport.clientHeight;
            var o = window.orientation;
            var p = h >= w;
            if (o == null)
                o = (p ? 0 : 90);
            var device = 0;
            while (w > breaks[+!p][device])
                device++;
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
//# sourceMappingURL=bobril.media.js.map