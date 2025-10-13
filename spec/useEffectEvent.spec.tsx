import * as b from "../index";

describe("useEffectEvent", () => {
    it("should call the effect function when the event is triggered", () => {
        let called: [number, string][] = [];
        let eventHandler: ((param: number) => void) | undefined;
        function Hi(data: { name: string }) {
            eventHandler = b.useEffectEvent((param: number) => {
                called.push([param, data.name]);
            });
            return <span>{data.name}</span>;
        }
        let name = "Bobril";
        b.init(() => <Hi name={name} />);
        expect(called).toEqual([]);
        b.syncUpdate();
        eventHandler!(1);
        expect(called).toEqual([[1, "Bobril"]]);
        name = "Bobx";
        b.invalidate();
        b.syncUpdate();
        eventHandler!(2);
        expect(called).toEqual([
            [1, "Bobril"],
            [2, "Bobx"],
        ]);
    });
});
