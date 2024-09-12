import * as b from "../index";

describe("cloneElement", () => {
    it("clone div", () => {
        const orig = <div>text</div>;
        const cloned = b.cloneElement(orig);
        expect(cloned).not.toBe(orig);
        expect(cloned).toEqual(orig);
    });

    it("clone div with props", () => {
        const orig = <div style={{ color: "red" }}>text</div>;
        const cloned = b.cloneElement(orig, { style: { color: "blue" } });
        expect(cloned).not.toBe(orig);
        expect(cloned).not.toEqual(orig);
        expect(cloned).toEqual(<div style={{ color: "blue" }}>text</div>);
    });

    it("clone div with children", () => {
        const orig = <div role="button">text</div>;
        const cloned = b.cloneElement(orig, { children: "new text" });
        expect(cloned).not.toBe(orig);
        expect(cloned).not.toEqual(orig);
        expect(cloned).toEqual(<div role="button">new text</div>);
    });

    function Comp(props: { role: string; text: string }) {
        return <div role={props.role}>{props.text}</div>;
    }

    it("clone component", () => {
        const orig = <Comp key="key" role="button" text="text"></Comp>;
        const cloned = b.cloneElement(orig);
        expect(cloned).not.toBe(orig);
        expect(cloned).toEqual(orig);
    });

    it("clone component with props", () => {
        const orig = <Comp key="key" role="button" text="text"></Comp>;
        const cloned = b.cloneElement(orig, { key: "k", role: "link" });
        expect(cloned).not.toBe(orig);
        expect(cloned).not.toEqual(orig);
        expect(cloned).toEqual(<Comp key="k" role="link" text="text"></Comp>);
    });
});
