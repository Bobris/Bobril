import * as b from "../index";

describe("Portal", () => {
    it("creates and destroys with body in div", () => {
        b.init(() => {
            return (
                <div>
                    before_
                    <b.Portal element={document.body}>portal</b.Portal>
                    after
                </div>
            );
        });
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>before_after</div>portal");
        b.init(() => undefined);
        b.syncUpdate();
        expect(document.body.innerHTML).not.toContain("portal");
    });

    it("creates and destroys with body in Fragment", () => {
        b.init(() => {
            return (
                <>
                    before_
                    <b.Portal element={document.body}>portal</b.Portal>
                    _after
                </>
            );
        });
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("before_portal_after");
        b.init(() => undefined);
        b.syncUpdate();
        expect(document.body.innerHTML).not.toContain("portal");
    });

    it("creates and destroys with offscreen div in div", () => {
        var el = document.createElement("div");
        b.init(() => {
            return (
                <div>
                    before_
                    <b.Portal element={el}>portal</b.Portal>
                    after
                </div>
            );
        });
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>before_after</div>");
        expect(document.body.innerHTML).not.toContain("portal");
        expect(el.innerHTML).toEqual("portal");
        b.init(() => undefined);
        b.syncUpdate();
        expect(document.body.innerHTML).not.toContain("portal");
        expect(el.innerHTML).toEqual("");
    });

    it("updates", () => {
        let el = document.createElement("div");
        let state: b.IProp<number>;
        let renderCalls = 0;
        function Counter() {
            state = b.useState(1);
            return <>{state()}</>;
        }
        b.init(() => {
            renderCalls++;
            return (
                <div>
                    <b.Portal element={el}>
                        <div>
                            <Counter />
                        </div>
                    </b.Portal>
                </div>
            );
        });
        b.syncUpdate();
        expect(el.innerHTML).toEqual("<div>1</div>");
        expect(renderCalls).toEqual(1);
        state!(2);
        b.syncUpdate();
        expect(el.innerHTML).toEqual("<div>2</div>");
        expect(renderCalls).toEqual(1);
        b.init(() => undefined);
        b.syncUpdate();
    });
});
