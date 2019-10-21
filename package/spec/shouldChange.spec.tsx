import * as b from "../index";

describe("shouldChange", () => {
    it("Component renders always", () => {
        let rendered = 0;
        class Hello extends b.Component<{ input: string }> {
            render(data: { input: string }) {
                rendered++;
                return <span>{data.input}</span>;
            }
        }
        let input = "1";
        b.init(() => <Hello input={input} />);
        b.syncUpdate();
        expect(rendered).toBe(1);
        expect(document.body.innerHTML).toContain("<span>1</span>");
        b.invalidate();
        b.syncUpdate();
        expect(rendered).toBe(2);
        expect(document.body.innerHTML).toContain("<span>1</span>");
        input = "2";
        b.invalidate();
        b.syncUpdate();
        expect(rendered).toBe(3);
        expect(document.body.innerHTML).toContain("<span>2</span>");
    });

    it("ShouldChange can forbid rerendering", () => {
        let rendered = 0;
        class Hello extends b.Component<{ input: string }> {
            shouldChange(_newData: { input: string }, _oldData: { input: string }) {
                return false;
            }
            render(data: { input: string }) {
                rendered++;
                return <span>{data.input}</span>;
            }
        }
        let input = "1";
        b.init(() => <Hello input={input} />);
        b.syncUpdate();
        expect(rendered).toBe(1);
        expect(document.body.innerHTML).toContain("<span>1</span>");
        b.invalidate();
        b.syncUpdate();
        expect(rendered).toBe(1);
        expect(document.body.innerHTML).toContain("<span>1</span>");
        input = "2";
        b.invalidate();
        b.syncUpdate();
        expect(rendered).toBe(1);
        expect(document.body.innerHTML).toContain("<span>1</span>");
    });

    it("PureComponent works", () => {
        let rendered = 0;
        class Hello extends b.PureComponent<{ input: string }> {
            render(data: { input: string }) {
                rendered++;
                return <span>{data.input}</span>;
            }
        }
        let input = "1";
        b.init(() => <Hello input={input} />);
        b.syncUpdate();
        expect(rendered).toBe(1);
        expect(document.body.innerHTML).toContain("<span>1</span>");
        b.invalidate();
        b.syncUpdate();
        expect(rendered).toBe(1);
        expect(document.body.innerHTML).toContain("<span>1</span>");
        input = "2";
        b.invalidate();
        b.syncUpdate();
        expect(rendered).toBe(2);
        expect(document.body.innerHTML).toContain("<span>2</span>");
    });
});
