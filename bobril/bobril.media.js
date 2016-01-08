/// <reference path="bobril.d.ts"/>
/// <reference path="bobril.media.d.ts"/>
(function (b, window) {
    var media = null;
    var breaks = [
        [414, 800, 900],
        [736, 1280, 1440] //landscape widths
    ];
    function emitOnMediaChange() {
        media = null;
        b.invalidate();
        return false;
    }
    var events = ["resize", "orientationchange"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 10, emitOnMediaChange);
    function accDeviceBreaks(newBreaks) {
        if (newBreaks != null) {
            breaks = newBreaks;
            emitOnMediaChange();
        }
        return breaks;
    }
    var viewport = window.document.documentElement;
    var isAndroid = /Android/i.test(navigator.userAgent);
    var weirdPortrait; // Some android devices provide reverted orientation
    function getMedia() {
        if (media == null) {
            var w = viewport.clientWidth;
            var h = viewport.clientHeight;
            var o = window.orientation;
            var p = h >= w;
            if (o == null)
                o = (p ? 0 : 90);
            if (isAndroid) {
                // without this keyboard change screen rotation because h or w changes
                var op = Math.abs(o) % 180 === 90;
                if (weirdPortrait == null) {
                    weirdPortrait = op === p;
                }
                else {
                    p = op === weirdPortrait;
                }
            }
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
