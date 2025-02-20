import * as b from "../index";

describe("ErrorBoundary", () => {
    it("shows content when there is no error", () => {
        b.init(() => (
            <b.ErrorBoundary fallback={<div>Error</div>}>
                <div>Content</div>
            </b.ErrorBoundary>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Content</div>");
    });

    it("shows fallback when there is error", () => {
        b.init(() => (
            <b.ErrorBoundary fallback={<div>Error</div>}>
                <div>
                    {() => {
                        throw new Error("Error");
                    }}
                </div>
            </b.ErrorBoundary>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Error</div>");
    });
});
