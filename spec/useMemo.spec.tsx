import * as b from "../index";

describe("useMemo", () => {
    it("remembers", () => {
        let called = 0;
        function Hi(data: { name: string }) {
            const text = b.useMemo(() => {
                called++;
                return data.name + "!";
            }, [data.name]);
            return <span>{text}</span>;
        }
        let name = "Bobril";
        b.init(() => <Hi name={name} />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobril!</span>");
        expect(called).toBe(1);
        b.invalidate();
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobril!</span>");
        expect(called).toBe(1);
        name = "Bobx";
        b.invalidate();
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobx!</span>");
        expect(called).toBe(2);
    });
});
