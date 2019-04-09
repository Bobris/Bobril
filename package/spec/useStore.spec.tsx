import * as b from "../index";
import { useStore } from "../index";

interface IData {
    factory: jasmine.Spy;
}

function TestComponent(data: IData): b.IBobrilNode {
    // @ts-ignore
    const store = useStore(data.factory);

    return <div>test</div>;
}

describe("useStore", () => {
    it("initialize store", () => {
        const storeFactory = jasmine.createSpy("storeSpy");
        storeFactory.and.returnValue({});
        b.createNode(<TestComponent factory={storeFactory} />, undefined, document.createElement("div"), null);
        expect(storeFactory).toHaveBeenCalledTimes(1);
    });

    it("do not reinitialize when updating", () => {
        const storeFactory = jasmine.createSpy("storeSpy");
        storeFactory.and.returnValue({});
        const div = document.createElement("div");
        const node = b.createNode(<TestComponent factory={storeFactory} />, undefined, div, null);

        b.updateNode(<TestComponent factory={storeFactory} />, node, div, null, 1e6);
        expect(storeFactory).toHaveBeenCalledTimes(1);
    });
});
