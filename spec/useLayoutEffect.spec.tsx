import * as b from "../index";

describe("useLayoutEffect", () => {
    it("works with syncUpdate", () => {
        let called = 0;
        let rendered = 0;
        function Hi(data: { name: string }) {
            rendered++;
            let state = b.useState(0);
            b.useLayoutEffect(() => {
                state(1);
                called++;
            });
            return <span>{data.name}</span>;
        }
        let name = "Bobril";
        b.init(() => <Hi name={name} />);
        expect(rendered).toBe(0);
        expect(called).toBe(0);
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<span>Bobril</span>");
        expect(rendered).toBe(2);
        expect(called).toBe(2);
    });
});
