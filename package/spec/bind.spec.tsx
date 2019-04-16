import * as b from "../index";

describe("bind", () => {
    it("individual method", () => {
        class C {
            v: number = 42;

            @b.bind
            m() {
                return this.v;
            }
        }

        const c = new C();
        const m = c.m;
        expect(m()).toBe(42);
    });

    it("all methods", () => {
        @b.bind
        class C {
            v: number;

            constructor(v: number) {
                this.v = v;
            }

            m1() {
                return this.v;
            }

            m2() {
                return this.v + 1;
            }

            get p() {
                return 1;
            }
            set p(v: number) {
                this.v = v;
            }
        }

        const c = new C(42);
        expect(c.v).toBe(42);
        expect(c.m1.call(undefined)).toBe(42);
        expect(c.p).toBe(1);
        c.p = 1;
        expect(c.m2.call(undefined)).toBe(2);
    });
});
