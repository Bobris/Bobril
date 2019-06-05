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
});
