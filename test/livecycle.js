/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
var TestComponent = (function () {
    function TestComponent() {
        this.actions = "";
        this.contexts = {};
    }
    TestComponent.prototype.init = function (ctx, me) {
        this.actions += "i:" + me.data.name + ";";
    };
    TestComponent.prototype.render = function (ctx, me, oldMe) {
        this.contexts[me.data.name] = ctx;
        if (oldMe)
            this.actions += "ru:" + me.data.name + ";";
        else
            this.actions += "ri:" + me.data.name + ";";
    };
    TestComponent.prototype.postRender = function (ctx, me, oldMe) {
        if (oldMe)
            this.actions += "U:" + me.data.name + ";";
        else
            this.actions += "I:" + me.data.name + ";";
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
        b.createNode({ tag: "div", component: c, data: { name: "1" } }, null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });
    it("createNodeCallsInitInRightOrder", function () {
        var c = new TestComponent();
        b.createNode({
            tag: "div",
            component: c,
            data: { name: "1" },
            children: {
                tag: "div",
                component: c,
                data: { name: "2" }
            }
        }, null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;i:2;ri:2;I:2;I:1;pi:2;pi:1;");
    });
    it("updateNodeCallsShouldUpdateAndPostUpdate", function () {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;U:1;pu:1;");
    });
    it("updateStringToComponetShouldWork", function () {
        var c = new TestComponent();
        var r = b.createNode({ tag: "", children: "a" }, null);
        b.callPostCallbacks();
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });
    it("shouldUpdateReturningFalseDoesNotPostUpdate", function () {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: false } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;");
    });
    it("updateNodeCallsUpdateInRightOrder", function () {
        var c = new TestComponent();
        var r = b.createNode({
            tag: "div",
            component: c,
            data: { name: "1" },
            children: {
                tag: "div",
                component: c,
                data: { name: "2" }
            }
        }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "div",
            component: c,
            data: { name: "1", change: true },
            children: {
                tag: "div",
                component: c,
                data: { name: "2", change: true }
            }
        }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;sc:2;ru:2;U:2;U:1;pu:2;pu:1;");
    });
    it("destroyCalledInCaseOfBigChange", function () {
        var c = new TestComponent();
        var r = b.createNode({
            tag: "div",
            component: c,
            data: { name: "1" },
            children: {
                tag: "div",
                component: c,
                data: { name: "2" }
            }
        }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "h1",
            component: c,
            data: { name: "3", change: true },
            children: {
                tag: "div",
                component: c,
                data: { name: "4", change: true }
            }
        }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:3;ru:3;i:3;ri:3;i:4;ri:4;I:4;I:3;d:2;d:1;pi:4;pi:3;");
    });
    it("initCallsFactory", function () {
        var done = false;
        var c = new TestComponent();
        b.init(function () {
            setTimeout(function () {
                expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
                done = true;
            }, 0);
            return { tag: "div", component: c, data: { name: "1" } };
        });
        waitsFor(function () { return done; });
    });
    it("invalidateInsideFactoryWorks", function () {
        var c = new TestComponent();
        var state = 0;
        var done = false;
        b.init(function () {
            state++;
            if (state === 1) {
                b.invalidate();
                return [{ tag: "div", component: c, data: { name: "1" } }];
            }
            else {
                setTimeout(function () {
                    expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;d:1;");
                    done = true;
                }, 0);
                return [];
            }
        });
        waitsFor(function () { return done; });
    });
    it("smallInvalidateUpdatesOnlyChild", function () {
        var c = new TestComponent();
        var state = 0;
        var done = false;
        var vdom = [{
            tag: "div",
            component: c,
            data: { name: "1" },
            children: {
                tag: "div",
                component: c,
                data: { name: "2", change: true }
            }
        }];
        b.init(function () {
            setTimeout(function () {
                c.actions = "";
                b.invalidate(c.contexts["2"]);
                setTimeout(function () {
                    expect(c.actions).toBe("sc:2;ru:2;U:2;pu:2;");
                    done = true;
                }, 100);
            }, 0);
            return vdom;
        });
        waitsFor(function () { return done; });
    });
    it("canFindDomInVdom"), function () {
        var done = false;
        var uid = 0;
        function d() {
            var params = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                params[_i - 0] = arguments[_i];
            }
            return { tag: "div", attrs: { id: "bobriltest" + (uid++) }, children: params };
        }
        b.init(function () {
            setTimeout(function () {
                for (var i = 0; i < uid; i++) {
                    var nn = document.getElementById("bobriltest" + i);
                    var vnn = b.deref(nn);
                    expect(vnn.attrs.id).toBe(nn.id);
                }
                done = true;
            }, 0);
            return [d(d(), d(), d(d(), d())), d(), d(d(d(d())))];
        });
        waitsFor(function () { return done; });
    };
    it("afterFrameCallback", function () {
        var c = new TestComponent();
        var state = 0;
        var done = false;
        expect(b.setAfterFrame(function (root) {
            expect(root[0].data.name).toBe("1");
            done = true;
            b.setAfterFrame(function () {
            });
        })).not.toBeNull();
        b.init(function () {
            return [{
                tag: "div",
                component: c,
                data: { name: "1" }
            }];
        });
        waitsFor(function () { return done; });
    });
    it("uptimeAndNowCouldBeCalled", function () {
        b.uptime();
        b.now();
        b.frame();
    });
});
//# sourceMappingURL=livecycle.js.map