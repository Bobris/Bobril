/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>

class TestComponent implements IBobrilComponent {
    actions: string = "";
    contexts: { [name: string]: Object } = {};

    init(ctx: Object, me: IBobrilNode): void {
        this.actions += "i:" + me.data.name + ";";
    }

    render(ctx: Object, me: IBobrilNode, oldMe?: IBobrilNode): void {
        this.contexts[me.data.name] = ctx;
        if (oldMe)
            this.actions += "ru:" + me.data.name + ";";
        else
            this.actions += "ri:" + me.data.name + ";";
    }

    postRender(ctx: Object, me: IBobrilNode, oldMe?: IBobrilNode): void {
        if (oldMe)
            this.actions += "U:" + me.data.name + ";";
        else
            this.actions += "I:" + me.data.name + ";";
    }

    shouldChange(ctx: Object, me: IBobrilNode, oldMe: IBobrilNode): boolean {
        this.actions += "sc:" + me.data.name + ";";
        return me.data.change;
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
        b.createNode({ tag: "div", component: c, data: { name: "1" } }, null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });

    it("createNodeCallsInitInRightOrder", () => {
        var c = new TestComponent();
        b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        }, null);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;i:2;ri:2;I:2;I:1;pi:2;pi:1;");
    });

    it("updateNodeCallsShouldUpdateAndPostUpdate", () => {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;U:1;pu:1;");
    });

    it("updateStringToComponetShouldWork", () => {
        var c = new TestComponent();
        var r = b.createNode({ tag: "", children: "a" }, null);
        b.callPostCallbacks();
        b.updateNode({ tag: "div", component: c, data: { name: "1", change: true } }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
    });

    it("shouldUpdateReturningFalseDoesNotPostUpdate", () => {
        var c = new TestComponent();
        var r = b.createNode({ tag: "div", component: c, data: { name: "1" } }, null);
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
        }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "div", component: c, data: { name: "1", change: true },
            children: {
                tag: "div", component: c, data: { name: "2", change: true }
            }
        }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:1;ru:1;sc:2;ru:2;U:2;U:1;pu:2;pu:1;");
    });

    it("destroyCalledInCaseOfBigChange", () => {
        var c = new TestComponent();
        var r = b.createNode({
            tag: "div", component: c, data: { name: "1" },
            children: {
                tag: "div", component: c, data: { name: "2" }
            }
        }, null);
        b.callPostCallbacks();
        c.actions = "";
        b.updateNode({
            tag: "h1", component: c, data: { name: "3", change: true },
            children: {
                tag: "div", component: c, data: { name: "4", change: true }
            }
        }, r);
        b.callPostCallbacks();
        expect(c.actions).toBe("sc:3;ru:3;i:3;ri:3;i:4;ri:4;I:4;I:3;d:2;d:1;pi:4;pi:3;");
    });

    it("initCallsFactory", () => {
        var done = false;
        var c = new TestComponent();
        b.init(() => {
            setTimeout(() => {
                expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;");
                done = true;
            }, 0);
            return { tag: "div", component: c, data: { name: "1" } }
        });
        waitsFor(() => done);
    });

    it("invalidateInsideFactoryWorks", () => {
        var c = new TestComponent();
        var state = 0;
        var done = false;
        b.init(() => {
            state++;
            if (state === 1) {
                b.invalidate();
                return [{ tag: "div", component: c, data: { name: "1" } }];
            } else {
                setTimeout(() => {
                    expect(c.actions).toBe("i:1;ri:1;I:1;pi:1;d:1;");
                    done = true;
                }, 0);
                return <any>[];
            }
        });
        waitsFor(() => done);
    });

    it("smallInvalidateUpdatesOnlyChild", () => {
        var c = new TestComponent();
        var state = 0;
        var done = false;
        var vdom = [{
            tag: "div", component: c, data: { name: "1" }, children:
            {
                tag: "div", component: c, data: { name: "2", change: true }
            }
        }];
        b.init(() => {
            setTimeout(() => {
                c.actions = "";
                b.invalidate(c.contexts["2"]);
                setTimeout(() => {
                    expect(c.actions).toBe("sc:2;ru:2;U:2;pu:2;");
                    done = true;
                }, 100);
            }, 0);
            return vdom;
        });
        waitsFor(() => done);
    });

    it("canFindDomInVdom"), () => {
        var done = false;
        var uid = 0;
        function d(...params: any[]) {
            return { tag: "div", attrs: { id: "bobriltest" + (uid++) }, children: params };
        }

        b.init(() => {
            setTimeout(() => {
                for (var i = 0; i < uid; i++) {
                    var nn = document.getElementById("bobriltest" + i);
                    var vnn = b.deref(nn);
                    expect(vnn.attrs.id).toBe(nn.id);
                }
                done = true;
            }, 0);
            return [d(d(), d(), d(d(), d())), d(), d(d(d(d())))];
        });
        waitsFor(() => done);
    }

    it("afterFrameCallback", () => {
        var c = new TestComponent();
        var state = 0;
        var done = false;
        expect(b.setAfterFrame((root) => {
            expect(root[0].data.name).toBe("1");
            done = true;
            b.setAfterFrame(() => { });
        })).not.toBeNull();
        b.init(() => {
            return [{
                tag: "div", component: c, data: { name: "1" }
            }];
        });
        waitsFor(() => done);
    });

    it("uptimeAndNowCouldBeCalled", () => {
        b.uptime();
        b.now();
        b.frame();
    });
});