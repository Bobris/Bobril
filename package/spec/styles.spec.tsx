import * as b from "../index";
import {createMediaQuery} from "../index";

describe("styles", () => {
    it("can declare merged style", () => {
        const userSelectNone = { userSelect: "none" };
        b.styleDef([userSelectNone, { fill: "red" }]);
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

    it("can apply mutiple styles", () => {
        const s1 = b.styleDef({ color: "red" });
        const s2 = b.styleDef({ backgroundColor: "blue" });
        b.init(() => <div style={[s1, s2]} />);
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

    describe("media query", () => {
        it("basic usage with string definition", () => {
            const style = b.styleDef({opacity: 0});
            b.mediaQueryDef("only screen (min-width: 1200px)", {
                [style]: {
                    opacity: 1
                }
            });
            b.syncUpdate();
            expect(document.head.innerHTML).toContain("only screen (min-width: 1200px)");
        });

        it("complex query with builder", () => {
            const style = b.styleDef({opacity: 0});
            b.mediaQueryDef(createMediaQuery()
                .rule("only", "screen")
                    .and({type: "max-width", value: 1200, unit: "px"})
                    .and({type: "min-width", value: 768, unit: "px"})
                .or()
                .rule()
                    .and({type: "aspect-ratio", width: 11, height: 5})
                .build(), {
                [style]: {
                    opacity: 1
                }
            });
            b.syncUpdate();
            expect(document.head.innerHTML).toContain("@media only screen and (max-width: 1200px) and (min-width:" +
                " 768px) , all and (aspect-ratio: 11/5)");
        });

        it("same media queries are grouped", () => {
            const style = b.styleDef({opacity: 0});
            const styleTwo = b.styleDef({opacity: 0});
            b.mediaQueryDef(createMediaQuery()
                .rule( "only", "screen")
                    .and({type: "max-width", value: 1200, unit: "px"})
                    .and({type: "min-width", value: 768, unit: "px"})
                .build(), {
                [style]: {
                    opacity: 1
                }
            });
            b.mediaQueryDef(createMediaQuery()
                .rule( "only", "screen")
                    .and({type: "max-width", value: 1200, unit: "px"})
                    .and({type: "min-width", value: 768, unit: "px"})
                .build(), {
                [styleTwo]: {
                    opacity: 1
                }
            });
            b.syncUpdate();
            expect(document.head.innerHTML).toContain("@media only screen and (max-width: 1200px) and (min-width:" +
                " 768px)");
            const reg = /@media\sonly\sscreen\sand\s\(max-width:\s1200px\)\sand\s\(min-width: 768px\)/;
            const result = reg.exec(document.head.innerHTML);
            expect(result && result.length).toBe(1);
        });
    });
});
