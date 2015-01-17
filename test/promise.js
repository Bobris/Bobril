/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.promise.d.ts"/>
describe("asap", function () {
    it("itWillCallParam", function () {
        var done = false;
        b.asap(function () { return done = true; });
        waitsFor(function () { return done; });
    });
    it("itWillCallParam100times", function () {
        var done = 0;
        for (var i = 0; i < 100; i++) {
            b.asap(function () { return done++; });
        }
        waitsFor(function () { return done === 100; });
    });
    it("itWillCallParam100timesInSequence", function () {
        var done = 0;
        var repeat = function () {
            done++;
            if (done < 100)
                b.asap(repeat);
        };
        b.asap(repeat);
        waitsFor(function () { return done === 100; });
    });
});
describe("Promise", function () {
    it("itwillcallThenResolve", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            resolve("OK");
        });
        var done = "";
        promise.then(function (v) {
            done = v;
        });
        waitsFor(function () { return done === "OK"; });
    });
    it("itwillcallThenResolveAsync", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () { return resolve("OK"); }, 0);
        });
        var done = "";
        promise.then(function (v) {
            done = v;
        });
        waitsFor(function () { return done === "OK"; });
    });
    it("itwillcallThenRevoke", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            revoke("OK");
        });
        var done = "";
        promise.then(null, function (r) {
            done = r;
        });
        waitsFor(function () { return done === "OK"; });
    });
    it("itwillcallThenRevokeAsync", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () { return revoke("OK"); }, 0);
        });
        var done = "";
        promise.then(null, function (r) {
            done = r;
        });
        waitsFor(function () { return done === "OK"; });
    });
    it("thenChainingSuccess", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () { return resolve("O"); }, 0);
        });
        var done = "";
        promise.then(function (v) {
            return v + "K";
        }).then(function (v) { return done = v; });
        waitsFor(function () { return done === "OK"; });
    });
    it("thenChainingFailure", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () { return revoke("OK"); }, 0);
        });
        var done = "";
        promise.then(function (v) {
            return v + "K";
        }).then(null, function (v) { return done = v; });
        waitsFor(function () { return done === "OK"; });
    });
});
function delay(time, value) {
    return new b.Promise(function (resolve) {
        setTimeout(function () { return resolve(value); }, time);
    });
}
describe("Promise.all", function () {
    it("zeroParams", function () {
        var done = false;
        b.Promise.all().then(function (p) {
            expect(p).toEqual([]);
            done = true;
        });
        waitsFor(function () { return done; });
    });
    it("someNonPromiseParams", function () {
        var done = false;
        b.Promise.all(1, "A", true).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            done = true;
        });
        waitsFor(function () { return done; });
    });
    it("someNonPromiseArrayParam", function () {
        var done = false;
        b.Promise.all([1, "A", true]).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            done = true;
        });
        waitsFor(function () { return done; });
    });
    it("PromiseParam", function () {
        var done = false;
        b.Promise.all([1, b.Promise.resolve("A"), true]).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            done = true;
        });
        waitsFor(function () { return done; });
    });
    it("TimerPromiseParams", function () {
        var done = false;
        var start = b.now();
        b.Promise.all(delay(100, 1), delay(300, "A"), delay(200, true)).then(function (p) {
            expect(p).toEqual([1, "A", true]);
            expect(b.now() - start).toBeLessThan(400);
            done = true;
        });
        waitsFor(function () { return done; });
    });
    it("TimerPromiseParamsOneFail", function () {
        var done = false;
        var start = b.now();
        b.Promise.all(delay(100, 1), b.Promise.reject("OK"), delay(200, true)).then(null, function (err) {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done = true;
        });
        waitsFor(function () { return done; });
    });
});
describe("Promise.race", function () {
    it("TimerPromiseParamsFastestWin", function () {
        var done = false;
        var start = b.now();
        b.Promise.race([delay(100, 1), delay(300, "A"), delay(200, true)]).then(function (value) {
            expect(value).toEqual(1);
            expect(b.now() - start).toBeLessThan(200);
            done = true;
        });
        waitsFor(function () { return done; });
    });
    it("TimerPromiseParamsFastestWinEvenFailure", function () {
        var done = false;
        var start = b.now();
        b.Promise.race([delay(100, 1), b.Promise.reject("OK"), delay(200, true)]).then(null, function (err) {
            expect(err).toEqual("OK");
            expect(b.now() - start).toBeLessThan(100);
            done = true;
        });
        waitsFor(function () { return done; });
    });
});
//# sourceMappingURL=promise.js.map