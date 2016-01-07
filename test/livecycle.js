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
        if (ctx.data.setme)
            b.assign(me, ctx.data.setme);
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
}());
describe("livecycle", function () {
    it("createNodeCallsInitAndPostInit", function () {
        var c = new TestComponent();
        b.createNode({ tag: "div", component: c, data: { name: "1" } }, null, document.createElement("div"), null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });
    it("createNodeCallsInitInRightOrder", function () {
        var c = new TestComponent();
        b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        }, null, document.createElement("div"), null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;i:2;ri:2;I:2;I:1;pi:2;pi:1;");
    });
    it("updateNodeCallsShouldUpdateAndPostUpdate", function () {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, null, scope, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;U:1;pu:1;");
    });
    it("updateStringToComponetShouldWork", function () {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({ children: "a" }, null, scope, null);
        b.callPostCallbacks();
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });
    it("shouldUpdateReturningFalseDoesNotPostUpdate", function () {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, null, scope, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: false } }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;");
    });
    it("updateNodeCallsUpdateInRightOrder", function () {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        }, null, scope, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "div", component: c, data: { name: "1", change: true },
            children: {
                tag: "div", component: c, data: { name: "2", change: true }
            }
        }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;sc:2;ru:2;U:2;U:1;pu:2;pu:1;");
    });
    it("destroyCalledInCaseOfBigChange", function () {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        }, null, scope, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "h1", component: c, data: { name: "3", change: true },
            children: {
                tag: "div", component: c, data: { name: "4", change: true }
            }
        }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:3;ru:3;i:3;ri:3;i:4;ri:4;I:4;I:3;d:2;d:1;pi:4;pi:3;");
    });
    it("initCallsFactory", function (done) {
        var c = new TestComponent();
        b.init(function () {
            setTimeout(function () {
                expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
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
            }
            else {
                setTimeout(function () {
                    expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;d:1;");
                    done();
                }, 0);
                return [];
            }
        });
    });
    it("smallInvalidateUpdatesOnlyChild", function (done) {
        var c = new TestComponent();
        var state = 0;
        var vdom = [{
                tag: "div", component: c, data: { name: "1" }, children: {
                    component: c, data: { name: "2", change: true, setme: { tag: "div" } }
                }
            }];
        b.init(function () {
            setTimeout(function () {
                c.actions = "";
                b.invalidate(c.contexts["2"]);
                b.setAfterFrame(function () {
                    expect(c.actions).toBe("sc:2;ru:2;U:2;pu:2;");
                    b.setAfterFrame(function () { });
                    done();
                });
            }, 0);
            return vdom;
        });
    });
    it("InvalidateUpdatesOnlyChildEventhoughParentIsNotChanged", function (done) {
        var c = new TestComponent();
        var state = 0;
        var vdom = [{
                tag: "div", component: c, data: { name: "1", change: false }, children: {
                    component: c, data: { name: "2", change: true, setme: { tag: "div" } }
                }
            }];
        var once = true;
        b.init(function () {
            if (once) {
                once = false;
                setTimeout(function () {
                    c.actions = "";
                    b.invalidate(c.contexts["2"]);
                    b.invalidate();
                    b.setAfterFrame(function () {
                        b.setAfterFrame(function () { });
                        expect(c.actions).toBe("sc:1;sc:2;ru:2;U:2;pu:2;");
                        done();
                    });
                }, 0);
            }
            return vdom;
        });
    });
    it("canFindDomInVdom", function (done) {
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
                done();
            }, 0);
            return [d(d(), d(), d(d(), d())), d(), d(d(d(d())))];
        });
    });
    it("afterFrameCallback", function (done) {
        var c = new TestComponent();
        var state = 0;
        expect(b.setAfterFrame(function (root) {
            expect(root[0].data.name).toBe("1");
            done();
            b.setAfterFrame(function () { });
        })).not.toBeNull();
        b.init(function () {
            return [{
                    tag: "div", component: c, data: { name: "1" }
                }];
        });
    });
    it("uptimeAndNowCouldBeCalled", function () {
        b.uptime();
        b.now();
        b.frame();
    });
});
