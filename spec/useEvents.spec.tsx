import * as b from "../index";

describe("useEvents", () => {
    it("events are called in correct order", () => {
        let called = "";

        function Two({ id }: { id: string }) {
            b.useEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "Two1";
                    return b.EventResult.NotHandled;
                },
            });
            b.useEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "Two2";
                    return b.EventResult.NotHandled;
                },
            });
            b.useCaptureEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "CTwo1";
                    return b.EventResult.NotHandled;
                },
            });
            b.useCaptureEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "CTwo2";
                    return b.EventResult.NotHandled;
                },
            });
            return <span id={id}>2</span>;
        }
        function One() {
            b.useEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "One1";
                    return b.EventResult.NotHandled;
                },
            });
            b.useEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "One2";
                    return b.EventResult.NotHandled;
                },
            });
            b.useCaptureEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "COne1";
                    return b.EventResult.NotHandled;
                },
            });
            b.useCaptureEvents({
                onClick: (param) => {
                    expect(param.target.attrs!.id).toBe("here");
                    called += "COne2";
                    return b.EventResult.NotHandled;
                },
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
        b.bubble(b.deref(document.getElementById("here")), "onClick", {
            button: 0,
            count: 1,
            alt: false,
            cancelable: false,
            ctrl: false,
            meta: false,
            shift: false,
            x: 10,
            y: 20,
        });
        expect(called).toBe("COne1COne2CTwo1CTwo2CTwo1CTwo2Two1Two2One1One2");
    });
});
