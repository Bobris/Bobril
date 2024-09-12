import * as b from "../index";

describe("getPropsOfElement", () => {
    it("from div", () => {
        const props = { style: { color: "red" }, children: "text" };
        const element = <div {...props} />;
        expect(b.getPropsOfElement(element)).toEqual(props);
    });

    it("from complex div", () => {
        const props = { style: { color: "red" }, key: "key", children: <span>ok</span> };
        const element = <div {...props} />;
        expect(b.getPropsOfElement(element)).toEqual(props);
    });

    function Comp(props: { role: string; text: string }) {
        return <div role={props.role}>{props.text}</div>;
    }

    it("from component", () => {
        const props = { key: "key", role: "button", text: "text" };
        const element = <Comp {...props} />;
        expect(b.getPropsOfElement(element)).toEqual(props);
    });

    it("isComponent", () => {
        const element = <Comp role="button" text="text" />;
        expect(b.isComponent(element, Comp)).toBeTruthy();
        expect(b.isComponent(element, "span")).toBeFalsy();
        expect(b.isComponent(<div>ok</div>, "div")).toBeTruthy();
    });
});
