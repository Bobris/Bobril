import * as b from "../index";

describe("useState", () => {
    afterEach(() => {
        b.init(() => undefined);
        b.syncUpdate();
    });

    it("spread", () => {
        function Hi() {
            let [value, setValue] = b.useState(0);
            b.useEffect(() => {
                setValue(value + 1);
            });
            return <span>{value}</span>;
        }
        b.init(() => <Hi />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>0</span>");
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>1</span>");
    });

    it("spread function", () => {
        function Hi() {
            let [value, setValue] = b.useState(0);
            b.useEffect(() => {
                setValue((value) => value + 1);
            });
            return <span>{value}</span>;
        }
        b.init(() => <Hi />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>0</span>");
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>1</span>");
    });

    it("prop", () => {
        function Hi() {
            let prop = b.useState(0);
            b.useEffect(() => {
                prop(prop() + 1);
            });
            return <span>{prop()}</span>;
        }
        b.init(() => <Hi />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>0</span>");
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>1</span>");
    });

    it("function | undefined", () => {
        let prop: b.IProp<(() => string) | undefined>;
        function Hi() {
            prop = b.useState<(() => string) | undefined>(undefined);
            return <span>{(prop() ?? (() => "undefined"))()}</span>;
        }
        b.init(() => <Hi />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>undefined</span>");
        prop!(() => "works");
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>works</span>");
        prop!();
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>works</span>");
        prop!(undefined);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>undefined</span>");
    });
});
