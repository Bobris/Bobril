/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>

describe("assign", () => {
    it("basics", () => {
        var target = { a: "A", b: "B" };
        var result = b.assign(target, { b: "b", c: "c" });
        expect(result).toBe(target);
        expect(result).toEqual({ a: "A", b: "b", c: "c" });
    });

    it("second parameter null", () => {
        var result = b.assign({}, null);
        expect(result).toEqual({});
    });

    it("second parameter undefined", () => {
        var result = b.assign({}, undefined);
        expect(result).toEqual({});
    });
});
