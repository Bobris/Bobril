import * as b from "../index";

describe("children", () => {
    it("count", () => {
        expect(b.Children.count(null)).toBe(0);
        expect(b.Children.count(undefined)).toBe(0);
        expect(b.Children.count([])).toBe(0);
        expect(
            b.Children.count(
                <>
                    <div>A</div>
                    <div>B</div>
                </>,
            ),
        ).toBe(1);
        expect(
            b.Children.count(
                b.getChildrenOfElement(
                    <>
                        <div>A</div>
                        <div>B</div>
                    </>,
                ),
            ),
        ).toBe(2);
    });

    it("forEach", () => {
        const result: string[] = [];
        b.Children.forEach(
            b.getChildrenOfElement(
                <>
                    <div>A</div>
                    {false && <div>KO</div>}
                    <div>B</div>
                    {[<div>C</div>, <div>D</div>]}
                </>,
            ),
            (child, index) => {
                result.push(b.getChildrenOfElement(child as b.IBobrilNode)!.toString() + index);
            },
        );
        expect(result).toEqual(["A0", "B1", "C2", "D3"]);
    });

    it("map", () => {
        const result = b.Children.map(
            b.getChildrenOfElement(
                <>
                    <div>A</div>
                    {false && <div>KO</div>}
                    <div>B</div>
                    {[<div>C</div>, <div>D</div>]}
                </>,
            ),
            (child, index) => {
                return b.getChildrenOfElement(child as b.IBobrilNode)!.toString() + index;
            },
        );
        expect(result).toEqual(["A0", "B1", "C2", "D3"]);
    });

    it("only", () => {
        expect(() => b.Children.only(null)).toThrow();
        expect(() => b.Children.only(undefined)).toThrow();
        expect(() => b.Children.only([])).toThrow();
        expect(() => b.Children.only([<div>A</div>, <div>B</div>])).toThrow();
        expect(b.Children.only(<div>A</div>)).toEqual(<div>A</div>);
        expect(b.Children.only([false, <div>A</div>])).toEqual(<div>A</div>);
    });
});
