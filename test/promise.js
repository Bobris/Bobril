/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
/// <reference path="../src/bobril.promise.d.ts"/>
describe("asap", function () {
    it("itWillCallParam", function () {
        var done = false;
        b.asap(function () {
            return done = true;
        });
        waitsFor(function () {
            return done;
        });
    });

    it("itWillCallParam100times", function () {
        var done = 0;
        for (var i = 0; i < 100; i++) {
            b.asap(function () {
                return done++;
            });
        }
        waitsFor(function () {
            return done === 100;
        });
    });

    it("itWillCallParam100timesInSequence", function () {
        var done = 0;
        var repeat = function () {
            done++;
            if (done < 100)
                b.asap(repeat);
        };
        b.asap(repeat);
        waitsFor(function () {
            return done === 100;
        });
    });
});

describe("promise", function () {
    it("itwillcallThenResolve", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            resolve("OK");
        });
        var done = "";
        promise.then(function (v) {
            done = v;
        });
        waitsFor(function () {
            return done === "OK";
        });
    });

    it("itwillcallThenResolveAsync", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () {
                return resolve("OK");
            }, 0);
        });
        var done = "";
        promise.then(function (v) {
            done = v;
        });
        waitsFor(function () {
            return done === "OK";
        });
    });

    it("itwillcallThenRevoke", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            revoke("OK");
        });
        var done = "";
        promise.then(null, function (r) {
            done = r;
        });
        waitsFor(function () {
            return done === "OK";
        });
    });

    it("itwillcallThenRevokeAsync", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () {
                return revoke("OK");
            }, 0);
        });
        var done = "";
        promise.then(null, function (r) {
            done = r;
        });
        waitsFor(function () {
            return done === "OK";
        });
    });

    it("thenChainingSuccess", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () {
                return resolve("O");
            }, 0);
        });
        var done = "";
        promise.then(function (v) {
            return v + "K";
        }).then(function (v) {
            return done = v;
        });
        waitsFor(function () {
            return done === "OK";
        });
    });

    it("thenChainingFailure", function () {
        var promise = new b.Promise(function (resolve, revoke) {
            setTimeout(function () {
                return revoke("OK");
            }, 0);
        });
        var done = "";
        promise.then(function (v) {
            return v + "K";
        }).then(null, function (v) {
            return done = v;
        });
        waitsFor(function () {
            return done === "OK";
        });
    });
});
//# sourceMappingURL=promise.js.map
