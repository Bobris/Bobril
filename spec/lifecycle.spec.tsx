import * as b from "../index";

describe("lifecycle", () => {
    it("postRenderDom", () => {
        const calls = [0, 0, 0];
        class Sample extends b.Component {
            postInitDom() {
                calls[0]!++;
            }
            postUpdateDom() {
                calls[1]!++;
            }
            postRenderDom() {
                calls[2]!++;
            }
            render() {
                return <div>wow</div>;
            }
        }

        b.init(() => <Sample />);
        b.syncUpdate();
        expect(calls).toEqual([1, 0, 1]);
        b.invalidate();
        b.syncUpdate();
        expect(calls).toEqual([1, 1, 2]);
    });
});
