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
        waitsFor(() => done === 100);
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

describe("Promise", () => {
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
            setTimeout(() => resolve("OK"), 0);
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
        promise.then(null, (r: string) => {
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
        promise.then((v: string) => {
            return v + "K";
        }).then(null, (v: string) => done = v);
        waitsFor(() => done === "OK");
    });
});

function delay(time: number, value: any) {
    return new b.Promise((resolve: (v: any) => void) => {
        setTimeout(() => resolve(value), time);
    });
}

describe("Promise.all", () => {
    it("zeroParams", () => {
        var done = false;
        b.Promise.all().then(p => {
            expect(p).toEqual(<any>[]);
            done = true;
        });
        waitsFor(() => done);
    });

    it("someNonPromiseParams", () => {
        var done = false;
        b.Promise.all(1, "A", true).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            done = true;
        });
        waitsFor(() => done);
    });

    it("someNonPromiseArrayParam", () => {
        var done = false;
        b.Promise.all([1, "A", true]).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            done = true;
        });
        waitsFor(() => done);
    });

    it("PromiseParam", () => {
        var done = false;
        b.Promise.all([1, b.Promise.resolve("A"), true]).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            done = true;
        });
        waitsFor(() => done);
    });

    it("TimerPromiseParams", () => {
        var done = false;
        var start = b.now();
        b.Promise.all(delay(100, 1), delay(300, "A"), delay(200, true)).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            expect(b.now() - start).toBeLessThan(400);
            done = true;
        });
        waitsFor(() => done);
    });

    it("TimerPromiseParamsOneFail", () => {
        var done = false;
        var start = b.now();
        b.Promise.all(delay(100, 1), b.Promise.reject("OK"), delay(200, true)).then(null,(err:any) => {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done = true;
        });
        waitsFor(() => done);
    });
});

describe("Promise.race", () => {
    it("TimerPromiseParamsFastestWin", () => {
        var done = false;
        var start = b.now();
        b.Promise.race([delay(100, 1), delay(300,"A"), delay(200, true)]).then((value: any) => {
            expect(value).toEqual(1);
            expect(b.now() - start).toBeLessThan(200);
            done = true;
        });
        waitsFor(() => done);
    });

    it("TimerPromiseParamsFastestWinEvenFailure", () => {
        var done = false;
        var start = b.now();
        b.Promise.race([delay(100, 1), b.Promise.reject("OK"), delay(200, true)]).then(null,(err: any) => {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done = true;
        });
        waitsFor(() => done);
    });

});
