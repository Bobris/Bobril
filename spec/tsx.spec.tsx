import * as b from "../index";

describe("tsx", () => {
    it("creates div", () => {
        expect(<div />).toEqual({ tag: "div" });
    });

    it("creates div with attribute", () => {
        expect(<div data-x="x" />).toEqual({ tag: "div", attrs: { "data-x": "x" } });
    });

    it("creates div with class", () => {
        expect(<div className="class" />).toEqual({ tag: "div", className: "class" });
    });

    it("supports function components", () => {
        function Comp() {
            return <>Hello</>;
        }

        const i = <Comp />;
        expect(i.component!.id).toContain("Comp_");
    });

    it("supports function components with customized id", () => {
        function Comp() {
            return <>Hello</>;
        }

        Comp.id = "MyId";
        const i = <Comp />;
        expect(i.component!.id).toEqual("MyId");
    });

    it("supports class components", () => {
        class Comp extends b.Component {
            render() {
                return <>Hello</>;
            }
        }

        const i = <Comp />;
        expect(i.component!.id).toContain("Comp_");
    });

    it("supports class components with customized id", () => {
        class Comp extends b.Component {
            static id = "MyId";
            render() {
                return <>Hello</>;
            }
        }

        const i = <Comp />;
        expect(i.component!.id).toEqual("MyId");
    });

    it("supports class components inheritance", () => {
        class Base extends b.Component {
            render() {
                return <>Base</>;
            }
        }

        class Derived extends Base {
            render() {
                return <>{super.render()} in Derived</>;
            }
        }

        b.init(() => (
            <>
                <Base />
                <Derived />
            </>
        ));
        b.syncUpdate();
        expect(document.body.innerText).toContain("BaseBase in Derived");
    });

    it("supports passing children in properties", () => {
        function Comp({ children }: { children: string }) {
            return <>{children}</>;
        }

        let el = document.createElement("div");
        b.createNode(<Comp children="Hi" />, undefined, el, null);

        expect(el.innerHTML).toEqual("Hi");

        el = document.createElement("div");
        b.createNode(<Comp>Hi</Comp>, undefined, el, null);

        expect(el.innerHTML).toEqual("Hi");
    });

    it("supports float in style", () => {
        b.init(() => <div style={{ float: "right" }} />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("float: right");
    });

    it("supports styling with b.style with TS 3.5.1", () => {
        const red = "red";
        b.init(() => b.style(<div />, { fill: red, borderBottomStyle: "dashed" }));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("fill: red");
    });
});
