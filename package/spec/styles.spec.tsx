import * as b from "../index";

describe("styles", () => {
    it("can declare merged style", () => {
        const userSelectNone = { userSelect: "none" };
        b.styleDef([userSelectNone, { fill: "red" }]);
    });

    it("can apply variable style", () => {
        let a = 1;
        b.style(<div />, [a > 1 || { display: "flex" }, [{ alignSelf: "baseline" }]]);
    });

    it("!!!temporary allowed!!! 0 in styles", () => {
        let content: b.IBobrilChildren = 0;
        b.init(() => <div style={ content && { color:"red" } }>I must not be red</div>);
        b.syncUpdate();
        expect(document.body.innerHTML).not.toContain("color: red");
    });

    it("correct check for content existence in styling", () => {
        let content: b.IBobrilChildren = 42;
        b.init(() => <div style={ content !== undefined && { color:"red" } }>I must be red {content}</div>);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("color: red");
        expect(document.body.innerHTML).toContain("I must be red 42");
    });
});
