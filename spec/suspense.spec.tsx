import * as b from "../index";

describe("Suspense", () => {
    it("shows fallback from start when expectedLoadTimeMs==0", async () => {
        let resolve: (value: string | PromiseLike<string>) => void;
        var promise = new Promise<string>((resolve2) => {
            resolve = resolve2;
        });
        b.init(() => (
            <b.Suspense fallback={<div>Loading...</div>} expectedLoadTimeMs={0}>
                <div>Data: {() => b.use(promise)}</div>
            </b.Suspense>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Loading...</div>");
        resolve!("Hello");
        await promise;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data: Hello</div>");
    });

    it("shows nothing from start when expectedLoadTimeMs is default", async () => {
        let resolve: (value: string | PromiseLike<string>) => void;
        var promise = new Promise<string>((resolve2) => {
            resolve = resolve2;
        });
        b.init(() => (
            <b.Suspense fallback={<div>Loading...</div>}>
                <div>Data: {() => b.use(promise)}</div>
            </b.Suspense>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).not.toContain("<div>Loading...</div>");
        resolve!("Hello");
        await promise;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data: Hello</div>");
    });

    it("nested Suspense have priority to show fallback", async () => {
        let resolve: (value: string | PromiseLike<string>) => void;
        var promise = new Promise<string>((resolve2) => {
            resolve = resolve2;
        });
        b.init(() => (
            <b.Suspense fallback={<div>Outer</div>} expectedLoadTimeMs={0}>
                <b.Suspense fallback={<div>Inner</div>} expectedLoadTimeMs={0}>
                    <div>Data: {() => b.use(promise)}</div>
                </b.Suspense>
            </b.Suspense>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Inner</div>");
        resolve!("Hello");
        await promise;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data: Hello</div>");
    });

    it("async in inner Suspense will trigger outer fallback", async () => {
        let resolve: (value: string | PromiseLike<string>) => void;
        var promise = new Promise<string>((resolve2) => {
            resolve = resolve2;
        });
        b.init(() => (
            <b.Suspense fallback={<div>Outer</div>} expectedLoadTimeMs={0}>
                <b.Suspense fallback={<div>Inner {() => b.use(promise)}</div>} expectedLoadTimeMs={0}>
                    <div>Data: {() => b.use(promise)}</div>
                </b.Suspense>
            </b.Suspense>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Outer</div>");
        resolve!("Hello");
        await promise;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data: Hello</div>");
    });

    it("async in same level Suspense will trigger both fallbacks", async () => {
        let resolve: (value: string | PromiseLike<string>) => void;
        var promise = new Promise<string>((resolve2) => {
            resolve = resolve2;
        });
        b.init(() => (
            <>
                <b.Suspense fallback={<div>One</div>} expectedLoadTimeMs={0}>
                    <div>Data1: {() => b.use(promise)}</div>
                </b.Suspense>
                <b.Suspense fallback={<div>Two</div>} expectedLoadTimeMs={0}>
                    <div>Data2: {() => b.use(promise)}</div>
                </b.Suspense>
            </>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>One</div><div>Two</div>");
        resolve!("Hello");
        await promise;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data1: Hello</div><div>Data2: Hello</div>");
    });

    it("async in same level Suspense with two Promises will show first content and then second", async () => {
        let resolve1: (value: string | PromiseLike<string>) => void;
        var promise1 = new Promise<string>((resolve) => {
            resolve1 = resolve;
        });
        let resolve2: (value: string | PromiseLike<string>) => void;
        var promise2 = new Promise<string>((resolve) => {
            resolve2 = resolve;
        });
        b.init(() => (
            <>
                <b.Suspense fallback={<div>One</div>} expectedLoadTimeMs={0}>
                    <div>Data1: {() => b.use(promise1)}</div>
                </b.Suspense>
                <b.Suspense fallback={<div>Two</div>} expectedLoadTimeMs={0}>
                    <div>Data2: {() => b.use(promise2)}</div>
                </b.Suspense>
            </>
        ));
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>One</div><div>Two</div>");
        resolve1!("Hello");
        await promise1;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data1: Hello</div><div>Two</div>");
        resolve2!("World");
        await promise2;
        b.syncUpdate();
        expect(document.body.innerHTML).toContain("<div>Data1: Hello</div><div>Data2: World</div>");
    });
});
