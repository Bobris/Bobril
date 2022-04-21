import * as b from "../index";
import { spriteWithColor } from "../src/cssInJs";

describe("styles", () => {
    it("can declare merged style", () => {
        const userSelectNone = { userSelect: "none" };
        var name = b.styleDef([userSelectNone, { fill: "red" }], { '[aria-disabled="true"]': { opacity: 0.5 } });
        b.init(() => <div />);
        b.syncUpdate();
        expect(document.head.innerHTML).toContain("." + name + "[aria");
    });

    it("can declare keyframes", () => {
        let red2green = b.keyframesDef({ from: { color: "red" }, to: { color: "green" } });
        b.init(() => <div style={{ animation: red2green("2s") }}>Hello</div>);
        b.syncUpdate();
        expect(document.head.innerHTML).toContain("@keyframes ");
        expect(document.head.innerHTML).toContain("from {color:red}");
    });

    it("can apply variable style", () => {
        let a = 1;
        b.style(<div />, [a > 1 || { display: "flex" }, [{ alignSelf: "baseline" }]]);
    });

    it("!!!temporary allowed!!! 0 in styles", () => {
        let content: b.IBobrilChildren = 0;
        b.init(() => <div style={content && { color: "red" }}>I must not be red</div>);
        b.syncUpdate();
        expect(document.body.innerHTML).not.toContain("color: red");
    });

    it("correct check for content existence in styling", () => {
        let content: b.IBobrilChildren = 42;
        b.init(() => <div style={content !== undefined && { color: "red" }}>I must be red {content}</div>);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("color: red");
        expect(document.body.innerHTML).toContain("I must be red 42");
    });

    it("can apply multiple styles", () => {
        const s1 = b.styleDef({ color: "red" });
        const s2 = b.styleDef({ backgroundColor: "blue" });
        b.init(() => <div style={[s1, s2]} />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain(s1);
        expect(document.body.innerHTML).toContain(s2);
    });

    it("can remove inline style with dash", () => {
        let a = true;
        b.init(() => (
            <>
                <div style={a && { backgroundColor: "blue" }}></div>
                <div></div>
            </>
        ));
        b.syncUpdate();
        a = false;
        b.invalidate();
        b.syncUpdate();
        expect(getComputedStyle(document.getElementsByTagName("div").item(0)!).backgroundColor).toBe(
            getComputedStyle(document.getElementsByTagName("div").item(1)!).backgroundColor
        );
    });

    describe("keyframes", () => {
        it("can be used as function and string", () => {
            const name = b.keyframesDef({}, "keyframesHint");
            expect(name()).toBe("keyframesHint");
            expect(name("1s")).toBe("1s keyframesHint");
            expect("2s " + name).toBe("2s keyframesHint");
            expect(`3s ${name}`).toBe("3s keyframesHint");
            b.styleDef({ animationName: name });
            b.syncUpdate();
            expect(document.head.innerHTML).toContain("animation-name:keyframesHint");
            b.init(() => <div style={{ animationName: name }}>I must be animated</div>);
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("animation-name: keyframesHint;");
        });
    });

    describe("dynamic style", () => {
        afterEach(() => {
            b.init(() => undefined);
            b.syncUpdate();
        });

        it("basic", () => {
            b.init(() => (
                <div
                    style={() => {
                        return { color: "blue" };
                    }}
                ></div>
            ));
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("color: blue");
        });

        it("basic changes", () => {
            var c = "green";
            var ctx: b.IBobrilCtx | undefined;
            var r1 = 0;
            var r2 = 0;
            b.init(() => {
                r1++;
                return (
                    <div
                        style={() => {
                            r2++;
                            ctx = b.getCurrentCtx();
                            return { color: c };
                        }}
                    ></div>
                );
            });
            b.syncUpdate();
            expect([r1, r2]).toEqual([1, 1]);
            expect(document.body.innerHTML).toContain("color: green");
            c = "red";
            b.invalidate();
            b.syncUpdate();
            expect([r1, r2]).toEqual([2, 2]);
            expect(document.body.innerHTML).toContain("color: red");
            c = "blue";
            b.invalidate(ctx);
            b.syncUpdate();
            expect([r1, r2]).toEqual([2, 3]);
            expect(document.body.innerHTML).toContain("color: blue");
        });

        it("supports hooks", () => {
            var p: b.IProp<number>;
            b.init(() => {
                return (
                    <div
                        style={() => {
                            p = b.useState(0);
                            return { border: p() };
                        }}
                    ></div>
                );
            });
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("border: 0px");
            p!(1);
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("border: 1px");
        });

        it("supports events", () => {
            var ref = { current: undefined };
            b.init(() => {
                return (
                    <div
                        ref={ref}
                        style={() => {
                            var p = b.useState(0);
                            b.useEvents({
                                onClick: (ev) => p(ev.x),
                            });
                            return { border: p() };
                        }}
                    ></div>
                );
            });
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("border: 0px");
            b.bubble(ref.current, "onClick", {
                x: 1,
                y: 0,
                alt: false,
                button: 0,
                cancelable: true,
                count: 1,
                ctrl: false,
                meta: false,
                shift: false,
            });
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("border: 1px");
        });
    });

    describe("svg", () => {
        it("works without changing color", () => {
            var sampleSvg = b.svg(
                '20 20"><defs><style>.a{fill:url(#a);}.b{fill:gray;}</style><linearGradient id="a" x1="3" y1="10" x2="17" y2="10" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="gray" stop-opacity="0.8"/><stop offset="1" stop-color="gray" stop-opacity="0.2"/></linearGradient></defs><rect class="a" x="3" y="4" width="14" height="12"/><path class="b" d="M16.75,4a.245.245,0,0,1,.25.25v11.5a.245.245,0,0,1-.25.25H3.25A.245.245,0,0,1,3,15.75V4.25A.245.245,0,0,1,3.25,4ZM17,3H3A1.075,1.075,0,0,0,2,4V16a1.075,1.075,0,0,0,1,1H17a1.075,1.075,0,0,0,1-1V4A1.075,1.075,0,0,0,17,3Z"/>'
            );
            expect(b.isSvgSprite(sampleSvg)).toBe(true);
            b.init(() => <div style={sampleSvg}></div>);
            b.syncUpdate();
            expect(document.head.innerHTML).toContain(encodeURIComponent(".b{fill:gray;}"));
            expect(document.head.innerHTML).toContain(
                encodeURIComponent('width="20" height="20" viewBox="0 0 20 20"><defs>')
            );
        });

        it("works with spriteWithColor", () => {
            var sampleSvg = b.svg(
                '20 20"><defs><style>.a{fill:url(#a);}.b{fill:gray;}</style><linearGradient id="a" x1="3" y1="10" x2="17" y2="10" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="gray" stop-opacity="0.8"/><stop offset="1" stop-color="gray" stop-opacity="0.2"/></linearGradient></defs><rect class="a" x="3" y="4" width="14" height="12"/><path class="b" d="M16.75,4a.245.245,0,0,1,.25.25v11.5a.245.245,0,0,1-.25.25H3.25A.245.245,0,0,1,3,15.75V4.25A.245.245,0,0,1,3.25,4ZM17,3H3A1.075,1.075,0,0,0,2,4V16a1.075,1.075,0,0,0,1,1H17a1.075,1.075,0,0,0,1-1V4A1.075,1.075,0,0,0,17,3Z"/>'
            );
            b.init(() => <div style={spriteWithColor(sampleSvg, "blue")}></div>);
            b.syncUpdate();
            // second render is for update styles
            b.syncUpdate();
            expect(document.head.innerHTML).toContain(encodeURIComponent(".b{fill:blue;}"));
        });

        it("works with svgWithColor and allows resize", () => {
            var sampleSvg = b.svg(
                '20 20"><defs><style>.a{fill:url(#a);}.b{fill:gray;}</style><linearGradient id="a" x1="3" y1="10" x2="17" y2="10" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="gray" stop-opacity="0.8"/><stop offset="1" stop-color="gray" stop-opacity="0.2"/></linearGradient></defs><rect class="a" x="3" y="4" width="14" height="12"/><path class="b" d="M16.75,4a.245.245,0,0,1,.25.25v11.5a.245.245,0,0,1-.25.25H3.25A.245.245,0,0,1,3,15.75V4.25A.245.245,0,0,1,3.25,4ZM17,3H3A1.075,1.075,0,0,0,2,4V16a1.075,1.075,0,0,0,1,1H17a1.075,1.075,0,0,0,1-1V4A1.075,1.075,0,0,0,17,3Z"/>'
            );
            b.init(() => <div style={b.svgWithColor(sampleSvg, { gray: "red" }, 2)}></div>);
            b.syncUpdate();
            // second render is for update styles
            b.syncUpdate();
            expect(document.head.innerHTML).toContain(encodeURIComponent(".b{fill:red;}"));
            expect(document.head.innerHTML).toContain(
                encodeURIComponent('width="40" height="40" viewBox="0 0 20 20"><defs>')
            );
        });
    });

    describe("media query", () => {
        it("basic usage with string definition", () => {
            const style = b.styleDef({ opacity: 0 });
            b.mediaQueryDef("only screen (min-width: 1200px)", {
                [style]: {
                    opacity: 1,
                },
            });
            b.syncUpdate();
            expect(document.head.innerHTML).toContain("only screen (min-width: 1200px)");
        });

        it("complex query with builder", () => {
            const style = b.styleDef({ opacity: 0 });
            b.mediaQueryDef(
                b
                    .createMediaQuery()
                    .rule("only", "screen")
                    .and({ type: "max-width", value: 1200, unit: "px" })
                    .and({ type: "min-width", value: 768, unit: "px" })
                    .or()
                    .rule()
                    .and({ type: "aspect-ratio", width: 11, height: 5 })
                    .build(),
                {
                    [style]: {
                        opacity: 1,
                    },
                }
            );
            b.syncUpdate();
            expect(document.head.innerHTML).toContain(
                "@media only screen and (max-width: 1200px) and (min-width:" + " 768px) , all and (aspect-ratio: 11/5)"
            );
        });

        it("same media queries are grouped", () => {
            const style = b.styleDef({ opacity: 0 });
            const styleTwo = b.styleDef({ opacity: 0 });
            b.mediaQueryDef(
                b
                    .createMediaQuery()
                    .rule("only", "screen")
                    .and({ type: "max-width", value: 1200, unit: "px" })
                    .and({ type: "min-width", value: 768, unit: "px" })
                    .build(),
                {
                    [style]: {
                        opacity: 1,
                    },
                }
            );
            b.mediaQueryDef(
                b
                    .createMediaQuery()
                    .rule("only", "screen")
                    .and({ type: "max-width", value: 1200, unit: "px" })
                    .and({ type: "min-width", value: 768, unit: "px" })
                    .build(),
                {
                    [styleTwo]: {
                        opacity: 1,
                    },
                }
            );
            b.syncUpdate();
            expect(document.head.innerHTML).toContain(
                "@media only screen and (max-width: 1200px) and (min-width:" + " 768px)"
            );
            const reg = /@media\sonly\sscreen\sand\s\(max-width:\s1200px\)\sand\s\(min-width: 768px\)/;
            const result = reg.exec(document.head.innerHTML);
            expect(result && result.length).toBe(1);
        });
    });

    describe("setKeysInClassNames", () => {
        it("works", () => {
            b.setKeysInClassNames(true);
            b.init(() => (
                <div>
                    <b.Fragment key="key1">
                        <b.Fragment key="key2">
                            <p>Text</p>
                        </b.Fragment>
                    </b.Fragment>
                </div>
            ));
            b.syncUpdate();
            expect(document.getElementsByTagName("p").item(0)!.className).toBe("key1 key2");
            b.init(() => undefined);
            b.setKeysInClassNames(false);
        });
    });
});
