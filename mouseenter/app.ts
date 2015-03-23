/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>

module MouseEnterLeaveApp {
    interface ITrackClickData {
        trackInner: boolean;
    }

    interface ITrackClickCtx {
        data: ITrackClickData;
        backColor: string;
    }

    var mouseEnter = "green";
    var mouseLeave = "red";


    var TrackInnerEvents: IBobrilComponent = {
        init(ctx: ITrackClickCtx, me: IBobrilNode) {
            ctx.backColor = "#B3C9DF";
        },

        render(ctx: ITrackClickCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.style = constructInnerStyle(ctx.backColor);
        },

        onMouseEnter(ctx: ITrackClickCtx): void {
            ctx.backColor = mouseEnter;
            b.invalidate();
        },

        onMouseLeave(ctx: ITrackClickCtx): void {
            ctx.backColor = mouseLeave;
            b.invalidate();
        }
    }

    var TrackEvents: IBobrilComponent = {
        init(ctx: ITrackClickCtx, me: IBobrilNode) {
            ctx.backColor = "#F0F0F0";
        },

        render(ctx: ITrackClickCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = "div";
            me.style = constructOuterStyle(ctx.backColor);
            me.children = {
                tag: "span",
                children: "Inner Span",
                style: constructInnerStyle("#B3C9DF")
            };

            if (ctx.data.trackInner)
                (<IBobrilNode>me.children).component = TrackInnerEvents;
        },

        onMouseEnter(ctx: ITrackClickCtx): void {
            ctx.backColor = mouseEnter;
            b.invalidate();
        },

        onMouseLeave(ctx: ITrackClickCtx): void {
            ctx.backColor = mouseLeave;
            b.invalidate();
        }
    }

    function constructOuterStyle(backColor: string) {
        return {
            backgroundColor: backColor,
            border: "1px solid #D0D0D0",
            cssFloat: "left",
            height: "225px",
            position: "relative",
            width: "225px",
            marginRight: "20px"
        }
    }

    function constructInnerStyle(backColor: string) {
        return {
            backgroundColor: backColor,
            border: "1px solid #6492BF",
            color: "#FFFFFF",
            height: "100px",
            left: "62px",
            lineHeight: "98px",
            position: "absolute",
            textAlign: "center",
            top: "62px",
            width: "100px"
        }
    }

    b.init(() => {
        return [
            {
                tag: "div",
                style: { height: "20px", width: "100px", backgroundColor: mouseEnter },
                children: "Mouse enter"
            },
            {
                tag: "div",
                style: { height: "20px", width: "100px", backgroundColor: mouseLeave },
                children: "Mouse leave"
            },
            {
                component: TrackEvents,
                data: {
                    trackInner: false
                }
            },
            {
                component: TrackEvents,
                data: {
                    trackInner: true
                }
            }
        ];
    });
}
