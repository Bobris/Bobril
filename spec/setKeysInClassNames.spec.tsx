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

    it("canBeUpdatedWhenEnabled", () => {
        b.setKeysInClassNames(true);
        let content = "bye";
        b.init(() => (
            <div key="hello" data-example={content}>
                {content}
            </div>
        ));
        b.syncUpdate();

        b.invalidate();
        content = "hi";
        b.syncUpdate();
        expect(document.querySelector(".hello")).toBeTruthy();
    });

    it("canBeCustomized", () => {
        b.setKeysInClassNames((c, n) => {
            var add: string | undefined = "";
            do {
                var k = c.key;
                if (k) add = " " + k + add;
                c = c.parent!;
            } while (c != undefined && c.element == undefined);
            if (!add.length) return [n.className, n.style, n.attrs];
            else {
                let newClassName: string | undefined;
                if (n.className) newClassName = n.className + add;
                else newClassName = add.slice(1);
                return [newClassName, n.style, { ...(n.attrs ?? {}), "data-guide-id": add.slice(1) }];
            }
        });
        let content = "bye";
        b.init(() => (
            <div key="hello" data-example={content}>
                {content}
            </div>
        ));
        b.syncUpdate();

        expect(document.querySelector(".hello")).toBeTruthy();
        expect(document.querySelector("[data-guide-id=hello]")).toBeTruthy();

        b.invalidate();
        content = "hi";
        b.syncUpdate();

        expect(document.querySelector(".hello")).toBeTruthy();
        expect(document.querySelector("[data-guide-id=hello]")).toBeTruthy();
    });
});
