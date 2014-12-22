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
