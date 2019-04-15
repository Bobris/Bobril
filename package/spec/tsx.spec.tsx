import * as b from "../index";

describe("tsx", () => {
    it("creates div", () => {
        expect(<div />).toEqual({ tag: "div", children: [] });
    });
});
