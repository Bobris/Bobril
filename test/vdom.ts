import Bobril = require("../src/bobril");
var B = Bobril.Bobril;

describe("updateElement", () => {
    it("set className", () => {
        var e = document.createElement("div");
        var r = B.updateElement(e, { className: "a" }, {}, false);
        expect(e.className).toBe("a");
        expect(r).toEqual({ className: "a" });
    });
});

describe("createNode", () => {
    it("simple", () => {
        var r = B.createNode({ tag: "div", children: "hello" }, false);
        expect(r.element.outerHTML).toBe("<div>hello</div>");
    });
    it("number", () => {
        var r = B.createNode({ tag: "div", children: 1 }, false);
        expect(r.element.outerHTML).toBe("<div>1</div>");
    });
    it("boolean", () => {
        var r = B.createNode({ tag: "div", children: true }, false);
        expect(r.element.outerHTML).toBe("<div>true</div>");
    });
    it("single child", () => {
        var r = B.createNode({ tag: "div", children: { tag: "span", children: "ok" } }, false);
        expect(r.element.outerHTML).toBe("<div><span>ok</span></div>");
    });
    it("multiple children", () => {
        var r = B.createNode({ tag: "div", children: [{ tag: "h1", children: "header" }, { tag: "div", children: "ok" }] }, false);
        expect(r.element.outerHTML).toBe("<div><h1>header</h1><div>ok</div></div>");
    });
});

describe("updateNode", () => {
    it("simple", () => {
        var r = B.createNode({ tag: "div", children: "hello" }, false);
        r = B.updateNode({ tag: "div", children: "bye" }, r, false);
        expect(r.element.outerHTML).toBe("<div>bye</div>");
    });
    it("change single child from text to span", () => {
        var r = B.createNode({ tag: "div", children: "hello" }, false);
        r = B.updateNode({ tag: "div", children: { tag: "span", children: "ok" } }, r, false);
        expect(r.element.outerHTML).toBe("<div><span>ok</span></div>");
    });
    it("change single child from span to text", () => {
        var r = B.createNode({ tag: "div", children: { tag: "span", children: "ko" } }, false);
        r = B.updateNode({ tag: "div", children: "ok" }, r, false);
        expect(r.element.outerHTML).toBe("<div>ok</div>");
    });
    it("append text after text", () => {
        var r = B.createNode({ tag: "div", children: "A" }, false);
        r = B.updateNode({ tag: "div", children: ["A", "B"] }, r, false);
        expect(r.element.outerHTML).toBe("<div>AB</div>");
    });
    it("preppend text before text", () => {
        var r = B.createNode({ tag: "div", children: "A" }, false);
        r = B.updateNode({ tag: "div", children: ["B", "A"] }, r, false);
        expect(r.element.outerHTML).toBe("<div>BA</div>");
    });

    function buildVdom(s: string): Bobril.IBobrilNode {
        var items = s.split(",");
        var res: Array<Bobril.IBobrilNode> = [];
        for (var i = 0; i < items.length; i++) {
            var item = items[i].split(":");
            if (item.length == 1) {
                res.push({ tag: "span", children: item[0] });
            } else {
                res.push({ tag: "span", key: item[0], children: item[1] });
            }
        }
        return { tag: "div", children: res };
    }

    function advancedTest(start: string, update: string, result: string) {
        var r = B.createNode(buildVdom(start), false);
        var c = r.element.childNodes;
        for (var i = 0; i < c.length; i++) {
            c[i].id = "" + i;
        }
        r = B.updateNode(buildVdom(update), r, false);
        var a = r.children.map((ch: Bobril.IBobrilCacheNode) => (ch.key ? ch.key + ":" : "") + ch.element.innerHTML + (ch.element.id ? ":" + ch.element.id : ""));
        expect(a.join(",")).toBe(result);
    }

    it("reorderKey", () => {
        advancedTest("a:A,b:B", "b:C,a:D", "b:C:1,a:D:0");
    });
    it("preppendKey", () => {
        advancedTest("a:A,b:B", "c:C,a:D,b:E", "c:C,a:D:0,b:E:1");
    });
    it("appendKey", () => {
        advancedTest("a:A,b:B", "a:C,b:D,c:E", "a:C:0,b:D:1,c:E");
    });
    it("removeFirstKey", () => {
        advancedTest("a:A,b:B,c:C", "b:D,c:E", "b:D:1,c:E:2");
    });
    it("removeMiddleKey", () => {
        advancedTest("a:A,b:B,c:C", "a:D,c:E", "a:D:0,c:E:2");
    });
    it("removeLastKey", () => {
        advancedTest("a:A,b:B,c:C", "a:D,b:E", "a:D:0,b:E:1");
    });
    it("nonKey", () => {
        advancedTest("A,B", "C,D", "C:0,D:1");
    });
    it("appendNonKey", () => {
        advancedTest("A,B", "C,D,E", "C:0,D:1,E");
    });
    it("removeNonKey", () => {
        advancedTest("A,B", "C", "C:0");
    });
});