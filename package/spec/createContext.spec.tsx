import * as b from "../index";

describe("createContext", () => {
    afterEach(() => {
        b.init(() => undefined);
        b.syncUpdate();
    });

    it("can be created", () => {
        expect(b.createContext(0)).toBeDefined();
        expect(b.createContext({ x: "y" }, "myContextId")).toBeDefined();
    });

    it("works with hooks", () => {
        const myContext = b.createContext(42);

        function Nested({ value }: { value: number }) {
            expect(b.useContext(myContext)).toBe(value);
            return <div />;
        }

        function Outer({ value, test }: { value?: number; test: number }) {
            if (value != undefined) b.provideContext(myContext, value);
            return <Nested value={test} />;
        }

        b.init(() => <Outer test={42} />);
        b.syncUpdate();
        b.init(() => <Outer value={1} test={1} />);
        b.syncUpdate();
    });

    it("works with class components as decorator", () => {
        const myContext = b.createContext(42);

        class Nested extends b.Component<{ value: number }> {
            @b.context(myContext)
            contextValue!: number;

            render({ value }: { value: number }): b.IBobrilChildren {
                expect(this.contextValue).toBe(value);
                return <div />;
            }
        }

        class Outer extends b.Component<{ value?: number; test: number }> {
            @b.context(myContext)
            contextValue!: number;

            render({ value, test }: { value?: number; test: number }): b.IBobrilChildren {
                if (value != undefined) this.contextValue = value;
                return <Nested value={test} />;
            }
        }

        b.init(() => <Outer test={42} />);
        b.syncUpdate();
        b.init(() => <Outer value={1} test={1} />);
        b.syncUpdate();
    });
});
