import * as b from "../index";

describe("tsx", () => {
    it("creates div", () => {
        expect(<div />).toEqual({ tag: "div", children: [] });
    });

    it("supports function components", () => {
        function Comp() {
            return <>Hello</>;
        }

        const i = <Comp />;
        expect(i.component!.id).toEqual("Comp");
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
        expect(i.component!.id).toEqual("Comp");
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
});
