import * as b from "../index";

describe("useCallback", () => {
    it("remembers", () => {
        let currentCallback: () => string;
        function Hi(data: { name: string }) {
            const text = b.useCallback(() => {
                return data.name + "!";
            }, [data.name]);
            currentCallback = text;
            return <span>{text()}</span>;
        }
        let name = "Bobril";
        b.init(() => <Hi name={name} />);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobril!</span>");
        let firstCallback = currentCallback!;
        b.invalidate();
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobril!</span>");
        expect(currentCallback!).toBe(firstCallback);
        name = "Bobx";
        b.invalidate();
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobx!</span>");
        expect(currentCallback!).not.toBe(firstCallback);
    });
});
