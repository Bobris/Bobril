import * as b from "../index";

describe("useEffect", () => {
    it("works with syncUpdate", () => {
        let called = 0;
        function Hi(data: { name: string }) {
            b.useEffect(() => {
                called++;
            }, [data.name]);
            return <span>{data.name}</span>;
        }
        let name = "Bobril";
        b.init(() => <Hi name={name} />);
        expect(called).toBe(0);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobril</span>");
        expect(called).toBe(1);
        b.invalidate();
        b.syncUpdate();
        expect(called).toBe(1);
        name = "Bobx";
        b.invalidate();
        b.syncUpdate();
        expect(called).toBe(2);
    });
});
