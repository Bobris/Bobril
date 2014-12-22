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
//# sourceMappingURL=promise.js.map
