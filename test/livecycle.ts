/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>

class TestComponent implements IBobrilComponent {
    actions: string = "";

    init(ctx: Object, me: IBobrilNode): void {
        this.actions += "i:" + me.data.name + ";";
    }

    shouldChange(ctx: Object, me: IBobrilNode, oldMe: IBobrilNode): boolean {
        this.actions += "sc:" + me.data.name + ";";
        return me.data.change;
    }

    update(ctx: Object, me: IBobrilNode, oldMe: IBobrilNode): void {
        this.actions += "u:" + me.data.name + ";";
    }

    postInitDom(ctx: Object, me: IBobrilNode, element: HTMLElement): void {
        this.actions += "pi:" + me.data.name + ";";
    }

    postUpdateDom(ctx: Object, me: IBobrilNode, element: HTMLElement): void {
        this.actions += "pu:" + me.data.name + ";";
    }

    destroy(ctx: Object, me: IBobrilNode, element: HTMLElement): void {
        this.actions += "d:" + me.data.name + ";";
    }
}

describe("livecycle", () => {
    it("createNodeCallsInitAndPostInit", () => {
        var c = new TestComponent();
        b.createNode({ tag: "div", component: c, data: { name: "1" } });
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;pi:1;");
    });

    it("createNodeCallsInitInRightOrder", () => {
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

    it("updateNodeCallsShouldUpdateAndPostUpdate", () => {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } });
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;u:1;pu:1;");
    });

    it("shouldUpdateReturningFalseDoesNotPostUpdate", () => {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } });
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: false } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;");
    });

    it("updateNodeCallsUpdateInRightOrder", () => {
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

    it("destroyCalledInCaseOfBigChange", () => {
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

    it("initCallsFactory", done => {
        var c = new TestComponent();
        b.init(() => {
            setTimeout(() => {
                expect(c.actions).toBe("i:1;pi:1;");
                done();
            }, 0);
            return { tag: "div", component: c, data: { name: "1" } }
        });
    });

    it("invalidateInsideFactoryWorks", done => {
        var c = new TestComponent();
        var state = 0;
        b.init(() => {
            state++;
            if (state === 1) {
                b.invalidate();
                return [{ tag: "div", component: c, data: { name: "1" } }];
            } else {
                setTimeout(() => {
                    expect(c.actions).toBe("i:1;pi:1;d:1;");
                    done();
                }, 0);
                return [];
            }
        });
    });

    it("uptimeAndNowCouldBeCalled", () => {
        b.uptime();
        b.now();
    });
});