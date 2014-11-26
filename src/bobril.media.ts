/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.media.d.ts"/>

((b: IBobrilStatic, window:Window) => {
    var media: IBobrilMedia = null;
    var breaks = [600, 1024, 1200];

    function emitOnMediaChange(ev: Event, target: Node, node: IBobrilCacheNode) {
        media = null;
        b.invalidate();
        return false;
    }

    var events = ["resize", "deviceorientation"];
    for (var i = 0; i < events.length; i++)
        b.addEvent(events[i], 100, emitOnMediaChange);

    function accDeviceBreaks(newBreaks?: number[]): number[] {
        if (newBreaks!=null)
            breaks = newBreaks;
        return breaks;
    }

    var viewport = window.document.documentElement;

    function getMedia(): IBobrilMedia {
        if (media == null) {
            var w = window.innerWidth || viewport.clientWidth;
            var h = window.innerHeight || viewport.clientHeight;
            var o:any = (<any>window).orientation;
            var p:boolean;
            if (o != null) {
                p = (o != 90) && (o != -90);
            } else {
                p = h >= w;
                o = p ? 0 : 90;
            }
            var device = 0;
            if (p) {
                while (w > breaks[device]) device++;
            } else {
                if (h > breaks[0]) {
                    device++;
                    while (w > breaks[device]) device++;
                }
            }
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
})(b,window);
