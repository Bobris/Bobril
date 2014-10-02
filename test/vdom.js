/// <reference path="jasmine.d.ts"/>
/// <reference path="../src/bobril.d.ts"/>
function expectInsensitive(s1, s2) {
    s1 = s1.replace(/\s/g, '');
    expect(s1.toLowerCase()).toBe(s2.toLowerCase());
}

describe("updateElement", function () {
    it("set className", function () {
        var r = b.createNode({ tag: "div", attrs: { className: "a" } });
        expect(r.element.className).toBe("a");
    });
});

describe("createNode", function () {
    it("simple", function () {
        var r = b.createNode({ tag: "div", children: "hello" });
        expectInsensitive(r.element.outerHTML, "<div>hello</div>");
    });
    it("number", function () {
        var r = b.createNode({ tag: "div", children: 1 });
        expectInsensitive(r.element.outerHTML, "<div>1</div>");
    });
    it("boolean", function () {
        var r = b.createNode({ tag: "div", children: true });
        expectInsensitive(r.element.outerHTML, "<div>true</div>");
    });
    it("single child", function () {
        var r = b.createNode({ tag: "div", children: { tag: "span", children: "ok" } });
        expectInsensitive(r.element.outerHTML, "<div><span>ok</span></div>");
    });
    it("multiple children", function () {
        var r = b.createNode({ tag: "div", children: [{ tag: "h1", children: "header" }, { tag: "div", children: "ok" }] });
        expectInsensitive(r.element.outerHTML, "<div><h1>header</h1><div>ok</div></div>");
    });
});

describe("updateNode", function () {
    it("simple", function () {
        var r = b.createNode({ tag: "div", children: "hello" });
        r = b.updateNode({ tag: "div", children: "bye" }, r);
        expectInsensitive(r.element.outerHTML, "<div>bye</div>");
    });
    it("change single child from text to span", function () {
        var r = b.createNode({ tag: "div", children: "hello" });
        r = b.updateNode({ tag: "div", children: { tag: "span", children: "ok" } }, r);
        expectInsensitive(r.element.outerHTML, "<div><span>ok</span></div>");
    });
    it("change single child from span to text", function () {
        var r = b.createNode({ tag: "div", children: { tag: "span", children: "ko" } });
        r = b.updateNode({ tag: "div", children: "ok" }, r);
        expectInsensitive(r.element.outerHTML, "<div>ok</div>");
    });
    it("append text after text", function () {
        var r = b.createNode({ tag: "div", children: "A" });
        r = b.updateNode({ tag: "div", children: ["A", "B"] }, r);
        expectInsensitive(r.element.outerHTML, "<div>AB</div>");
    });
    it("preppend text before text", function () {
        var r = b.createNode({ tag: "div", children: "A" });
        r = b.updateNode({ tag: "div", children: ["B", "A"] }, r);
        expectInsensitive(r.element.outerHTML, "<div>BA</div>");
    });

    function buildVdom(s) {
        var items = s.split(",");
        var res = [];
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

    function advancedTest(start, update, result) {
        var vdomStart = buildVdom(start);
        var r = b.createNode(vdomStart);
        var c = r.element.childNodes;
        for (var i = 0; i < c.length; i++) {
            c[i].id = "" + i;
        }
        var vdomUpdate = buildVdom(update);
        r = b.updateNode(vdomUpdate, r);
        var a = [];
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

    it("reorderKey", function () {
        advancedTest("a:A,b:B", "b:C,a:D", "b:C:1,a:D:0");
    });
    it("preppendKey", function () {
        advancedTest("a:A,b:B", "c:C,a:D,b:E", "c:C,a:D:0,b:E:1");
    });
    it("appendKey", function () {
        advancedTest("a:A,b:B", "a:C,b:D,c:E", "a:C:0,b:D:1,c:E");
    });
    it("removeFirstKey", function () {
        advancedTest("a:A,b:B,c:C", "b:D,c:E", "b:D:1,c:E:2");
    });
    it("removeMiddleKey", function () {
        advancedTest("a:A,b:B,c:C", "a:D,c:E", "a:D:0,c:E:2");
    });
    it("removeLastKey", function () {
        advancedTest("a:A,b:B,c:C", "a:D,b:E", "a:D:0,b:E:1");
    });
    it("nonKey", function () {
        advancedTest("A,B", "C,D", "C:0,D:1");
    });
    it("appendNonKey", function () {
        advancedTest("A,B", "C,D,E", "C:0,D:1,E");
    });
    it("removeNonKey", function () {
        advancedTest("A,B", "C", "C:0");
    });
    it("removeLastKeyAndNonKey1", function () {
        advancedTest("D,a:A,b:B,c:C", "a:E,b:F", "a:E:1,b:F:2");
    });
    it("removeLastKeyAndNonKey2", function () {
        advancedTest("a:A,D,b:B,c:C", "a:E,b:F", "a:E:0,b:F:2");
    });
    it("removeLastKeyAndNonKey3", function () {
        advancedTest("a:A,b:B,D,c:C", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAndNonKey4", function () {
        advancedTest("a:A,b:B,c:C,D", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAnd2NonKey1", function () {
        advancedTest("D1,D2,a:A,b:B,c:C", "a:E,b:F", "a:E:2,b:F:3");
    });
    it("removeLastKeyAnd2NonKey2", function () {
        advancedTest("a:A,D1,D2,b:B,c:C", "a:E,b:F", "a:E:0,b:F:3");
    });
    it("removeLastKeyAnd2NonKey3", function () {
        advancedTest("a:A,b:B,D1,D2,c:C", "a:E,b:F", "a:E:0,b:F:1");
    });
    it("removeLastKeyAnd2NonKey4", function () {
        advancedTest("a:A,b:B,c:C,D1,D2", "a:E,b:F", "a:E:0,b:F:1");
    });
});
//# sourceMappingURL=vdom.js.map
