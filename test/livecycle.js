/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
var TestComponent = (function () {
    function TestComponent() {
        this.actions = "";
    }
    TestComponent.prototype.init = function (ctx, me, oldMe) {
        if (oldMe)
            this.actions += "u:" + me.data.name + ";";
        else
            this.actions += "i:" + me.data.name + ";";
    };

    TestComponent.prototype.shouldChange = function (ctx, me, oldMe) {
        this.actions += "sc:" + me.data.name + ";";
        return me.data.change;
    };

    TestComponent.prototype.postInitDom = function (ctx, me, element) {
        this.actions += "pi:" + me.data.name + ";";
    };

    TestComponent.prototype.postUpdateDom = function (ctx, me, element) {
        this.actions += "pu:" + me.data.name + ";";
    };

    TestComponent.prototype.destroy = function (ctx, me, element) {
        this.actions += "d:" + me.data.name + ";";
    };
    return TestComponent;
})();

describe("livecycle", function () {
    it("createNodeCallsInitAndPostInit", function () {
        var c = new TestComponent();
        b.createNode({ tag: "div", component: c, data: { name: "1" } });
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;pi:1;");
    });

    it("createNodeCallsInitInRightOrder", function () {
        var c = new TestComponent();
        b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        });
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;i:2;pi:2;pi:1;");
    });

    it("updateNodeCallsShouldUpdateAndPostUpdate", function () {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } });
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;u:1;pu:1;");
    });

    it("shouldUpdateReturningFalseDoesNotPostUpdate", function () {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } });
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: false } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;");
    });

    it("updateNodeCallsUpdateInRightOrder", function () {
        var c = new TestComponent();
        var r = b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        });
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "div", component: c, data: { name: "1", change: true },
            children: {
                tag: "div", component: c, data: { name: "2", change: true }
            }
        }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;u:1;sc:2;u:2;pu:2;pu:1;");
    });

    it("destroyCalledInCaseOfBigChange", function () {
        var c = new TestComponent();
        var r = b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        });
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "h1", component: c, data: { name: "3", change: true },
            children: {
                tag: "div", component: c, data: { name: "4", change: true }
            }
        }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:3;u:3;i:3;i:4;d:2;d:1;pi:4;pi:3;");
    });

    it("initCallsFactory", function (done) {
        var c = new TestComponent();
        b.init(function () {
            setTimeout(function () {
                expect(c.actions).toBe("i:1;pi:1;");
                done();
            }, 0);
            return { tag: "div", component: c, data: { name: "1" } };
        });
    });

    it("invalidateInsideFactoryWorks", function (done) {
        var c = new TestComponent();
        var state = 0;
        b.init(function () {
            state++;
            if (state === 1) {
                b.invalidate();
                return [{ tag: "div", component: c, data: { name: "1" } }];
            } else {
                setTimeout(function () {
                    expect(c.actions).toBe("i:1;pi:1;d:1;");
                    done();
                }, 0);
                return [];
            }
        });
    });

    it("uptimeAndNowCouldBeCalled", function () {
        b.uptime();
        b.now();
    });
});
//# sourceMappingURL=livecycle.js.map
