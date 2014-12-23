/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.promise.d.ts"/>

describe("asap", () => {
    it("itWillCallParam", () => {
        var done = false;
        b.asap(() => done = true);
        waitsFor(() => done);
    });

    it("itWillCallParam100times", () => {
        var done = 0;
        for (var i = 0; i < 100; i++) {
            b.asap(() => done++);
        }
        waitsFor(() => done===100);
    });

    it("itWillCallParam100timesInSequence", () => {
        var done = 0;
        var repeat = () => {
            done++;
            if (done < 100) b.asap(repeat);
        }
        b.asap(repeat);
        waitsFor(() => done === 100);
    });
});

describe("promise", () => {
    it("itwillcallThenResolve", () => {
        var promise = new b.Promise<string>((resolve, revoke) => {
            resolve("OK");
        });
        var done = "";
        promise.then((v) => {
            done = v;
        });
        waitsFor(() => done === "OK");
    });

    it("itwillcallThenResolveAsync", () => {
        var promise = new b.Promise<string>((resolve, revoke) => {
            setTimeout(()=>resolve("OK"),0);
        });
        var done = "";
        promise.then((v) => {
            done = v;
        });
        waitsFor(() => done === "OK");
    });

    it("itwillcallThenRevoke", () => {
        var promise = new b.Promise<string>((resolve, revoke) => {
            revoke("OK");
        });
        var done = "";
        promise.then(null, (r:string) => {
            done = r;
        });
        waitsFor(() => done === "OK");
    });

    it("itwillcallThenRevokeAsync", () => {
        var promise = new b.Promise<string>((resolve, revoke) => {
            setTimeout(() => revoke("OK"), 0);
        });
        var done = "";
        promise.then(null, (r: string) => {
            done = r;
        });
        waitsFor(() => done === "OK");
    });

    it("thenChainingSuccess", () => {
        var promise = new b.Promise<string>((resolve, revoke) => {
            setTimeout(() => resolve("O"), 0);
        });
        var done = "";
        promise.then((v) => {
            return v + "K";
        }).then((v) => done = v);
        waitsFor(() => done === "OK");
    });

    it("thenChainingFailure", () => {
        var promise = new b.Promise<string>((resolve, revoke) => {
            setTimeout(() => revoke("OK"), 0);
        });
        var done = "";
        promise.then((v:string) => {
            return v + "K";
        }).then(null,(v:string) => done = v);
        waitsFor(() => done === "OK");
    });

});
