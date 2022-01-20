import * as b from "../index";

describe("useRef", () => {
    it("works in simple example", () => {
        let check = "";
        function Hi(data: { name: string }) {
            let r = b.useRef<b.IBobrilCacheNode>();
            b.useEffect(() => {
                check = (r.current.element as Element).innerHTML;
            });
            return <span ref={r}>{data.name}</span>;
        }
        let name = "Bobril";
        b.init(() => <Hi name={name} />);
        b.syncUpdate();
        expect(check).toBe("Bobril");
    });

    it("works with switching referenced components", () => {
        let check = "";
        function Hi(data: { name: string; wrap: boolean }) {
            let r = b.useRef<b.IBobrilCacheNode>();
            b.useEffect(() => {
                check = (r.current.element as Element).innerHTML;
            });
            if (data.wrap)
                return (
                    <div>
                        <span ref={r}>{data.name}</span>
                    </div>
                );
            return <span ref={r}>{data.name}</span>;
        }
        let input = ["Bobril" as string, false as boolean] as const;
        b.init(() => <Hi name={input[0]} wrap={input[1]} />);
        b.syncUpdate();
        expect(check).toBe(input[0]);
        input = ["Cecil", true] as const;
        b.invalidate();
        b.syncUpdate();
        expect(check).toBe(input[0]);
        input = ["Devil", false] as const;
        b.invalidate();
        b.syncUpdate();
        expect(check).toBe(input[0]);
    });
});
