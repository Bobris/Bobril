import * as b from "../index";

describe("setKeysInClassNames", () => {
    afterEach(() => {
        b.setKeysInClassNames(undefined);
        b.init(() => undefined);
        b.syncUpdate();
    });

    it("canBeEnabledWithTrue", () => {
        b.setKeysInClassNames(true);
        b.init(() => <div key="hello">bye</div>);
        b.syncUpdate();

        expect(document.querySelector(".hello")).toBeTruthy();
    });

    it("canBeCustomized", () => {
        b.setKeysInClassNames((c, n) => {
            var add = "";
            do {
                var k = c.key;
                if (k) add = " " + k + add;
                c = c.parent!;
            } while (c != undefined && c.element == undefined);
            if (!add.length) return;
            if (n.className) n.className += add;
            else n.className = add.slice(1);
            n.attrs ??= {};
            n.attrs["data-guide-id"] = add.slice(1);
        });
        b.init(() => <div key="hello">bye</div>);
        b.syncUpdate();

        expect(document.querySelector(".hello")).toBeTruthy();
        expect(document.querySelector("[data-guide-id=hello]")).toBeTruthy();
    });
});
