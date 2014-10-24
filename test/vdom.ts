/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>

function expectInsensitive(s1: string, s2: string) {
    s1 = s1.replace(/\s/g, '');
    expect(s1.toLowerCase()).toBe(s2.toLowerCase());
}

describe("updateElement", () => {
    it("set className", () => {
        var r = b.createNode({ tag: "div", attrs: { className: "a" } });
        expect(r.element.className).toBe("a");
    });
});

describe("createNode", () => {
    it("simple", () => {
        var r = b.createNode({ tag: "div", children: "hello" });
        expectInsensitive(r.element.outerHTML, "<div>hello</div>");
    });
    it("number", () => {
        var r = b.createNode({ tag: "div", children: 1 });
        expectInsensitive(r.element.outerHTML, "<div>1</div>");
    });
    it("boolean", () => {
        var r = b.createNode({ tag: "div", children: true });
        expectInsensitive(r.element.outerHTML, "<div>true</div>");
    });
    it("single child", () => {
        var r = b.createNode({ tag: "div", children: { tag: "span", children: "ok" } });
        expectInsensitive(r.element.outerHTML, "<div><span>ok</span></div>");
    });
    it("multiple children", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "h1", children: "header" }, { tag: "div", children: "ok" }] });
        expectInsensitive(r.element.outerHTML, "<div><h1>header</h1><div>ok</div></div>");
    });
    it("html child", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "/", content: "a<span>b</span>c" }] });
        expectInsensitive(r.element.outerHTML, "<div>a<span>b</span>c</div>");
    });
    it("html children", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "/", content: "a<span>b</span>c" }, { tag: "/", content: "d<i>e</i>" }] });
        expectInsensitive(r.element.outerHTML, "<div>a<span>b</span>cd<i>e</i></div>");
    });
});

describe("updateNode", () => {
    it("simple", () => {
        var r = b.createNode({ tag: "div", children: "hello" });
        r = b.updateNode({ tag: "div", children: "bye" }, r);
        expectInsensitive(r.element.outerHTML, "<div>bye</div>");
    });
    it("change single child from text to span", () => {
        var r = b.createNode({ tag: "div", children: "hello" });
        r = b.updateNode({ tag: "div", children: { tag: "span", children: "ok" } }, r);
        expectInsensitive(r.element.outerHTML, "<div><span>ok</span></div>");
    });
    it("change single child from span to text", () => {
        var r = b.createNode({ tag: "div", children: { tag: "span", children: "ko" } });
        r = b.updateNode({ tag: "div", children: "ok" }, r);
        expectInsensitive(r.element.outerHTML, "<div>ok</div>");
    });
    it("append text after text", () => {
        var r = b.createNode({ tag: "div", children: "A" });
        r = b.updateNode({ tag: "div", children: ["A", "B"] }, r);
        expectInsensitive(r.element.outerHTML, "<div>AB</div>");
    });
    it("preppend text before text", () => {
        var r = b.createNode({ tag: "div", children: "A" });
        r = b.updateNode({ tag: "div", children: ["B", "A"] }, r);
        expectInsensitive(r.element.outerHTML, "<div>BA</div>");
    });
    it("change html", () => {
        var r = b.createNode({ tag: "div", children: [{ tag: "/", content: "a<span>b</span>c" }] });
        r = b.updateNode({ tag: "div", children: [{ tag: "/", content: "d<i>e</i>f" }] }, r);
        expectInsensitive(r.element.outerHTML, "<div>d<i>e</i>f</div>");
    });

    function buildVdom(s: string): IBobrilNode {
        var items = s.split(",");
        var res: Array<IBobrilNode> = [];
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
        var vdomStart = buildVdom(start);
        var r = b.createNode(vdomStart);
        var c = r.element.childNodes;
        for (var i = 0; i < c.length; i++) {
            c[i].id = "" + i;
        }
        var vdomUpdate = buildVdom(update);
        r = b.updateNode(vdomUpdate, r);
        var a: Array<string> = [];
        for (i = 0; i < r.children.length; i++) {
            var ch = r.children[i];
            a.push((ch.key ? ch.key + ":" : "") + ch.element.innerHTML + (ch.element.id ? ":" + ch.element.id : ""));
        }
        expect(r.element.childNodes.length).toBe(r.children.length);
        for (i = 0; i < r.children.length; i++) {
            expect(r.element.childNodes[i]).toBe(r.children[i].element);
        }
        expect(a.join(",").toLowerCase()).toBe(result.toLowerCase());
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
    it("removeLastKeyAndNonKey1", () => {
        advancedTest("D,a:A,b:B,c:C", "a:E,b:F", "a:E:1,b:F:2");
    });
    it("removeLastKeyAndNonKey2", () => {
        advancedTest("a:A,D,b:B,c:C", "a:E,b:F", "a:E:0,b:F:2");
    });
    it("removeLastKeyAndNonKey3", () => {
        advancedTest("a:A,b:B,D,c:C", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAndNonKey4", () => {
        advancedTest("a:A,b:B,c:C,D", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAnd2NonKey1", () => {
        advancedTest("D1,D2,a:A,b:B,c:C", "a:E,b:F", "a:E:2,b:F:3");
    });
    it("removeLastKeyAnd2NonKey2", () => {
        advancedTest("a:A,D1,D2,b:B,c:C", "a:E,b:F", "a:E:0,b:F:3");
    });
    it("removeLastKeyAnd2NonKey3", () => {
        advancedTest("a:A,b:B,D1,D2,c:C", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAnd2NonKey4", () => {
        advancedTest("a:A,b:B,c:C,D1,D2", "a:E,b:F", "a:E:0,b:F:1");
    });
});