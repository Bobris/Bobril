import * as b from "../index";

describe("addRoot", () => {
    it("should add component to document body", () => {
        const TestComponent = () => <div>Test Component</div>;
        b.init(() => <div />);
        b.syncUpdate();
        var rootId = b.addRoot(() => <TestComponent />);
        b.syncUpdate();
        expect(document.body.textContent).toContain("Test Component");
        b.removeRoot(rootId);
    });
});
