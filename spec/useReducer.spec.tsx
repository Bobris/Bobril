import * as b from "../index";

describe("useReducer", () => {
    it("2 parameters case", () => {
        let testDispatch: (a: number) => void;
        function Hi() {
            const [state, dispatch] = b.useReducer((s: number, a: number) => {
                return s + a;
            }, 0);
            testDispatch = dispatch;
            return <span>{state}</span>;
        }
        b.init(() => <Hi />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>0</span>");
        testDispatch!(1);
        expect(b.invalidated()).toBe(true);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>1</span>");
    });

    it("3 parameters case", () => {
        let testDispatch: (a: number) => void;
        function Hi() {
            const [state, dispatch] = b.useReducer(
                (s: number, a: number) => {
                    return s * a;
                },
                "6",
                (s) => Number.parseInt(s),
            );
            testDispatch = dispatch;
            return <span>{state}</span>;
        }
        b.init(() => <Hi />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>6</span>");
        testDispatch!(7);
        expect(b.invalidated()).toBe(true);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>42</span>");
    });
});
