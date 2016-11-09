/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.promise.d.ts"/>

describe("asap", () => {
    it("itWillCallParam", (done) => {
        b.asap(() => done());
    });

    it("itWillCallParam100times", (done) => {
        var counter = 0;
        for (var i = 0; i < 100; i++) {
            b.asap(() => {
                counter++;
                if (counter == 100) done();
            });
        }
    });

    it("itWillCallParam100timesInSequence", (done) => {
        var counter = 0;
        var repeat = () => {
            counter++;
            if (counter < 100) b.asap(repeat); else done();
        }
        b.asap(repeat);
    });
});

describe("Promise", () => {
    it("itwillcallThenResolve", (done) => {
        var promise = new Promise<string>((resolve, revoke) => {
            resolve("OK");
        });
        promise.then((v) => {
            expect(v).toBe("OK");
            done();
        });
    });

    it("itwillcallThenResolveAsync", (done) => {
        var promise = new Promise<string>((resolve, revoke) => {
            setTimeout(() => resolve("OK"), 0);
        });
        promise.then((v) => {
            expect(v).toBe("OK");
            done();
        });
    });

    it("itwillcallThenRevoke", (done) => {
        var promise = new Promise<string>((resolve, revoke) => {
            revoke("OK");
        });
        promise.then(null, (r: string) => {
            expect(r).toBe("OK");
            done();
        });
    });

    it("itwillcallThenRevokeAsync", (done) => {
        var promise = new Promise<string>((resolve, revoke) => {
            setTimeout(() => revoke("OK"), 0);
        });
        promise.then(null, (r: string) => {
            expect(r).toBe("OK");
            done();
        });
    });

    it("thenChainingSuccess", (done) => {
        var promise = new Promise<string>((resolve, revoke) => {
            setTimeout(() => resolve("O"), 0);
        });
        promise.then((v) => {
            return v + "K";
        }).then((v) => {
            expect(v).toBe("OK");
            done();
        });
    });

    it("thenChainingFailure", (done) => {
        var promise = new Promise<string>((resolve, revoke) => {
            setTimeout(() => revoke("OK"), 0);
        });
        promise.then((v: string) => {
            return v + "K";
        }).then(null, (v: string) => {
            expect(v).toBe("OK");
            done();
        });
    });
});

function delay(time: number, value: any) {
    return new Promise((resolve: (v: any) => void) => {
        setTimeout(() => resolve(value), time);
    });
}

describe("Promise.all", () => {
    it("someNonPromiseArrayParam", (done) => {
        Promise.all([1, "A", true]).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            done();
        });
    });

    it("PromiseParam", (done) => {
        Promise.all<any>([1, Promise.resolve("A"), true]).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            done();
        });
    });

    it("TimerPromiseParams", (done) => {
        var start = b.now();
        Promise.all<any>([delay(100, 1), delay(300, "A"), delay(200, true)]).then(p => {
            expect(p).toEqual(<any>[1, "A", true]);
            expect(b.now() - start).toBeLessThan(400);
            done();
        });
    });

    it("TimerPromiseParamsOneFail", (done) => {
        var start = b.now();
        Promise.all<any>([delay(100, 1), Promise.reject("OK"), delay(200, true)]).then(null,  (err : any) => {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done();
        });
    });
});

describe("Promise.race", () => {
    it("TimerPromiseParamsFastestWin", (done) => {
        var start = b.now();
        Promise.race([delay(100, 1), delay(300,  "A"), delay(200, true)]).then((value: any) => {
            expect(value).toEqual(1);
            expect(b.now() - start).toBeLessThan(200);
            done();
        });
    });

    it("TimerPromiseParamsFastestWinEvenFailure", (done) => {
        var start = b.now();
        Promise.race([delay(100, 1), Promise.reject("OK"), delay(200, true)]).then(null,  (err: any) => {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done();
        });
    });
});
