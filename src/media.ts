import { addEvent, invalidate } from "./core";

export enum BobrilDeviceCategory {
    Mobile = 0,
    Tablet = 1,
    Desktop = 2,
    LargeDesktop = 3,
}

export interface IBobrilMedia {
    width: number;
    height: number;
    orientation: number;
    deviceCategory: BobrilDeviceCategory;
    portrait: boolean;
    dppx: number;
}

var media: IBobrilMedia | null = null;
var breaks = [
    [414, 800, 900], //portrait widths
    [736, 1280, 1440], //landscape widths
];

function emitOnMediaChange() {
    media = null;
    invalidate();
    return false;
}

var events = ["resize", "orientationchange"];
for (var i = 0; i < events.length; i++) addEvent(events[i]!, 10, emitOnMediaChange);

export function accDeviceBreaks(newBreaks?: number[][]): number[][] {
    if (newBreaks != null) {
        breaks = newBreaks;
        emitOnMediaChange();
    }
    return breaks;
}

var viewport = window.document.documentElement!;
var isAndroid = /Android/i.test(navigator.userAgent);
var weirdPortrait: boolean; // Some android devices provide reverted orientation

export function getMedia(): IBobrilMedia {
    if (media == undefined) {
        var w = viewport.clientWidth;
        var h = viewport.clientHeight;
        var o = window.orientation;
        var p = h >= w;
        if (o == undefined) o = p ? 0 : 90;
        else o = +o;
        if (isAndroid) {
            // without this keyboard change screen rotation because h or w changes
            let op = Math.abs(o) % 180 === 90;
            if (weirdPortrait == undefined) {
                weirdPortrait = op === p;
            } else {
                p = op === weirdPortrait;
            }
        }
        var device = 0;
        while (w > breaks[+!p]![device]!) device++;
        media = {
            width: w,
            height: h,
            orientation: o,
            deviceCategory: device,
            portrait: p,
            dppx: window.devicePixelRatio,
        };
    }
    return media;
}
