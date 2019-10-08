import * as b from "../index";

describe("useEvents", () => {
    it("events are called in correct order", () => {
        let called = "";

        function Two({ id }: { id: string }) {
            b.useEvents({
                onClick: param => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "Two1";
                    return b.EventResult.NotHandled;
                }
            });
            b.useEvents({
                onClick: param => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "Two2";
                    return b.EventResult.NotHandled;
                }
            });
            return <span id={id}>2</span>;
        }
        function One() {
            b.useEvents({
                onClick: param => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "One1";
                    return b.EventResult.NotHandled;
                }
            });
            b.useEvents({
                onClick: param => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "One2";
                    return b.EventResult.NotHandled;
                }
            });
            return (
                <>
                    <Two id="here" />
                    <Two id="nowhere" />
                </>
            );
        }
        b.init(() => <One />);
        b.syncUpdate();
        b.bubble(b.deref(document.getElementById("here")), "onClick", { x: 10, y: 20 });
        expect(called).toBe("Two1Two2One1One2");
    });
});
