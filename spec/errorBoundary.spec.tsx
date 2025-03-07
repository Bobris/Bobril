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

    it("shows fallback when there is error in nested component", () => {
        b.init(() => (
            <b.ErrorBoundary fallback={<div>Outer</div>}>
                <div>
                    <b.ErrorBoundary fallback={<div>Inner</div>}>
                        <div>
                            {() => {
                                throw new Error("Error");
                            }}
                        </div>
                    </b.ErrorBoundary>
                </div>
            </b.ErrorBoundary>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Inner</div>");
    });

    it("shows outer fallback when there is error in inner fallback", () => {
        b.init(() => (
            <b.ErrorBoundary fallback={<div>Outer</div>}>
                <div>
                    <b.ErrorBoundary
                        fallback={
                            <div>
                                {() => {
                                    throw new Error("Inner fallback error");
                                }}
                            </div>
                        }
                    >
                        <div>
                            {() => {
                                throw new Error("Error");
                            }}
                        </div>
                    </b.ErrorBoundary>
                </div>
            </b.ErrorBoundary>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Outer</div>");
    });

    it("throws error when there is error in fallback", () => {
        b.init(() => (
            <b.ErrorBoundary
                fallback={
                    <div>
                        {() => {
                            throw new Error("Error in fallback");
                        }}
                    </div>
                }
            >
                <div>
                    {() => {
                        throw new Error("Error");
                    }}
                </div>
            </b.ErrorBoundary>
        ));
        expect(() => b.syncUpdate()).toThrowError("Error in fallback");
    });
});
