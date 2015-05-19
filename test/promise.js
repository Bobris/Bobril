/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.promise.d.ts"/>
describe("asap", function () {
    it("itWillCallParam", function (done) {
        b.asap(function () { return done(); });
    });
    it("itWillCallParam100times", function (done) {
        var counter = 0;
        for (var i = 0; i < 100; i++) {
            b.asap(function () {
                counter++;
                if (counter == 100)
                    done();
            });
        }
    });
    it("itWillCallParam100timesInSequence", function (done) {
        var counter = 0;
        var repeat = function () {
            counter++;
            if (counter < 100)
                b.asap(repeat);
            else
                done();
        };
        b.asap(repeat);
    });
});
describe("Promise", function () {
    it("itwillcallThenResolve", function (done) {
        var promise = new Promise(function (resolve, revoke) {
            resolve("OK");
        });
        promise.then(function (v) {
            expect(v).toBe("OK");
            done();
        });
    });
    it("itwillcallThenResolveAsync", function (done) {
        var promise = new Promise(function (resolve, revoke) {
            setTimeout(function () { return resolve("OK"); }, 0);
        });
        promise.then(function (v) {
            expect(v).toBe("OK");
            done();
        });
    });
    it("itwillcallThenRevoke", function (done) {
        var promise = new Promise(function (resolve, revoke) {
            revoke("OK");
        });
        promise.then(null, function (r) {
            expect(r).toBe("OK");
            done();
        });
    });
    it("itwillcallThenRevokeAsync", function (done) {
        var promise = new Promise(function (resolve, revoke) {
            setTimeout(function () { return revoke("OK"); }, 0);
        });
        promise.then(null, function (r) {
            expect(r).toBe("OK");
            done();
        });
    });
    it("thenChainingSuccess", function (done) {
        var promise = new Promise(function (resolve, revoke) {
            setTimeout(function () { return resolve("O"); }, 0);
        });
        promise.then(function (v) {
            return v + "K";
        }).then(function (v) {
            expect(v).toBe("OK");
            done();
        });
    });
    it("thenChainingFailure", function (done) {
        var promise = new Promise(function (resolve, revoke) {
            setTimeout(function () { return revoke("OK"); }, 0);
        });
        promise.then(function (v) {
            return v + "K";
        }).then(null, function (v) {
            expect(v).toBe("OK");
            done();
        });
    });
});
function delay(time, value) {
    return new Promise(function (resolve) {
        setTimeout(function () { return resolve(value); }, time);
    });
}
describe("Promise.all", function () {
    it("someNonPromiseArrayParam", function (done) {
        Promise.all([1, "A", true]).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            done();
        });
    });
    it("PromiseParam", function (done) {
        Promise.all([1, Promise.resolve("A"), true]).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            done();
        });
    });
    it("TimerPromiseParams", function (done) {
        var start = b.now();
        Promise.all([delay(100, 1), delay(300, "A"), delay(200, true)]).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            expect(b.now() - start).toBeLessThan(400);
            done();
        });
    });
    it("TimerPromiseParamsOneFail", function (done) {
        var start = b.now();
        Promise.all([delay(100, 1), Promise.reject("OK"), delay(200, true)]).then(null, function (err) {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done();
        });
    });
});
describe("Promise.race", function () {
    it("TimerPromiseParamsFastestWin", function (done) {
        var start = b.now();
        Promise.race([delay(100, 1), delay(300, "A"), delay(200, true)]).then(function (value) {
            expect(value).toEqual(1);
            expect(b.now() - start).toBeLessThan(200);
            done();
        });
    });
    it("TimerPromiseParamsFastestWinEvenFailure", function (done) {
        var start = b.now();
        Promise.race([delay(100, 1), Promise.reject("OK"), delay(200, true)]).then(null, function (err) {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done();
        });
    });
});
