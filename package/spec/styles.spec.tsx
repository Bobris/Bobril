import * as b from "../index";

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
            var a = b.keyframesDef({}, "keyframesHint");
            expect(a()).toBe("keyframesHint");
            expect(a("1s")).toBe("1s keyframesHint");
            expect("2s " + a).toBe("2s keyframesHint");
            expect(`3s ${a}`).toBe("3s keyframesHint");
            b.styleDef({ animationName: a });
            b.syncUpdate();
            expect(document.head.innerHTML).toContain("animation-name:keyframesHint");
            b.init(() => <div style={{ animationName: a }}>I must be animated</div>);
            b.syncUpdate();
            expect(document.body.innerHTML).toContain("animation-name: keyframesHint;");
        });
    });
});
