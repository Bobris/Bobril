﻿import * as b from "../index";

class TestComponent implements b.IBobrilComponent {
    actions: string = "";
    contexts: { [name: string]: b.IBobrilCtx } = {};

    init(_ctx: Object, me: b.IBobrilNode): void {
        this.actions += "i:" + me.data.name + ";";
    }

    render(ctx: b.IBobrilCtx, me: b.IBobrilNode, oldMe?: b.IBobrilNode): void {
        if (ctx.data.setme) b.assign(me, ctx.data.setme);
        this.contexts[me.data.name] = ctx;
        if (oldMe) this.actions += "ru:" + me.data.name + ";";
        else this.actions += "ri:" + me.data.name + ";";
    }

    postRender(_ctx: Object, me: b.IBobrilNode, oldMe?: b.IBobrilNode): void {
        if (oldMe) this.actions += "U:" + me.data.name + ";";
        else this.actions += "I:" + me.data.name + ";";
    }

    shouldChange(_ctx: Object, me: b.IBobrilNode, _oldMe: b.IBobrilNode): boolean {
        this.actions += "sc:" + me.data.name + ";";
        return me.data.change;
    }

    postInitDom(_ctx: Object, me: b.IBobrilNode, _element: HTMLElement): void {
        this.actions += "pi:" + me.data.name + ";";
    }

    postUpdateDom(_ctx: Object, me: b.IBobrilNode, _element: HTMLElement): void {
        this.actions += "pu:" + me.data.name + ";";
    }

    destroy(_ctx: Object, me: b.IBobrilNode, _element: HTMLElement): void {
        this.actions += "d:" + me.data.name + ";";
    }
}

describe("livecycle", () => {
    afterEach(() => {
        b.init(() => undefined);
        b.syncUpdate();
    });

    it("createNodeCallsInitAndPostInit", () => {
        var c = new TestComponent();
        b.createNode({ tag: "div", component: c, data: { name: "1" } }, undefined, document.createElement("div"), null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });

    it("createNodeCallsInitInRightOrder", () => {
        var c = new TestComponent();
        b.createNode(
            {
                tag: "div",
                component: c,
                data: { name: "1" },
                children: {
                    tag: "div",
                    component: c,
                    data: { name: "2" },
                },
            },
            undefined,
            document.createElement("div"),
            null
        );
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;i:2;ri:2;I:2;I:1;pi:2;pi:1;");
    });

    it("updateNodeCallsShouldUpdateAndPostUpdate", () => {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, undefined, scope, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;U:1;pu:1;");
    });

    it("updateStringToComponetShouldWork", () => {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({ children: "a" }, undefined, scope, null);
        b.callPostCallbacks();
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });

    it("shouldUpdateReturningFalseDoesNotPostUpdate", () => {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, undefined, scope, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: false } }, r, scope, null, 1e6);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;");
    });

    it("updateNodeCallsUpdateInRightOrder", () => {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode(
            {
                tag: "div",
                component: c,
                data: { name: "1" },
                children: {
                    tag: "div",
                    component: c,
                    data: { name: "2" },
                },
            },
            undefined,
            scope,
            null
        );
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode(
            {
                tag: "div",
                component: c,
                data: { name: "1", change: true },
                children: {
                    tag: "div",
                    component: c,
                    data: { name: "2", change: true },
                },
            },
            r,
            scope,
            null,
            1e6
        );
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;sc:2;ru:2;U:2;U:1;pu:2;pu:1;");
    });

    it("destroyCalledInCaseOfBigChange", () => {
        var c = new TestComponent();
        var scope = document.createElement("div");
        var r = b.createNode(
            {
                tag: "div",
                component: c,
                data: { name: "1" },
                children: {
                    tag: "div",
                    component: c,
                    data: { name: "2" },
                },
            },
            undefined,
            scope,
            null
        );
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode(
            {
                tag: "h1",
                component: c,
                data: { name: "3", change: true },
                children: {
                    tag: "div",
                    component: c,
                    data: { name: "4", change: true },
                },
            },
            r,
            scope,
            null,
            1e6
        );
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:3;ru:3;i:3;ri:3;i:4;ri:4;I:4;I:3;d:2;d:1;pi:4;pi:3;");
    });

    it("initCallsFactory", (done) => {
        var c = new TestComponent();
        b.init(() => {
            setTimeout(() => {
                expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
                done();
            }, 0);
            return { tag: "div", component: c, data: { name: "1" } };
        });
    });

    it("invalidateInsideFactoryWorks", () => {
        var c = new TestComponent();
        var state = 0;
        b.init(() => {
            state++;
            if (state === 1) {
                b.invalidate();
                return [{ tag: "div", component: c, data: { name: "1" } }];
            } else {
                return [];
            }
        });
        b.syncUpdate();
        b.syncUpdate();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;d:1;");
    });

    it("smallInvalidateUpdatesOnlyChild", () => {
        var c = new TestComponent();
        var vdom = [
            {
                tag: "div",
                component: c,
                data: { name: "1", change: false },
                children: {
                    component: c,
                    data: { name: "2", change: true, setme: { tag: "div" } },
                },
            },
        ];
        b.init(() => {
            setTimeout(() => {}, 0);
            return vdom;
        });
        b.syncUpdate();
        c.actions = "";
        b.invalidate(c.contexts["2"]);
        b.syncUpdate();
        expect(c.actions).toBe("ru:2;U:2;pu:2;");
    });

    it("InvalidateUpdatesOnlyChildEventhoughParentIsNotChanged", () => {
        var c = new TestComponent();
        var vdom = [
            {
                tag: "div",
                component: c,
                data: { name: "1", change: false },
                children: {
                    component: c,
                    data: { name: "2", change: true, setme: { tag: "div" } },
                },
            },
        ];
        b.init(() => {
            return vdom;
        });
        b.syncUpdate();
        c.actions = "";
        b.invalidate(c.contexts["2"]);
        b.invalidate();
        b.syncUpdate();
        expect(c.actions).toBe("sc:1;ru:2;U:2;pu:2;");
    });

    it("canFindDomInVdom", () => {
        var uid = 0;
        function d(...params: any[]) {
            return { tag: "div", attrs: { id: "bobriltest" + uid++ }, children: params };
        }

        b.init(() => {
            return [d(d(), d(), d(d(), d())), d(), d(d(d(d())))];
        });
        b.syncUpdate();
        for (var i = 0; i < uid; i++) {
            var nn = document.getElementById("bobriltest" + i);
            var vnn = b.deref(nn);
            expect(vnn!.attrs!.id).toBe(nn!.id);
        }
    });

    it("uptimeAndNowCouldBeCalled", () => {
        b.uptime();
        b.now();
        b.frame();
    });
});
