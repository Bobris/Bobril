/// <reference path="jasmine.d.ts"/>

describe("sandbox", () => {
    var root: HTMLDivElement;
    beforeEach(() => {
        root = document.createElement("div");
        root = <HTMLDivElement>document.body.appendChild(root);
    });
    afterEach(() => {
        document.body.removeChild(root);
    });
    it("works", () => {
        root.appendChild(document.createElement("div"));
        expect(root.innerHTML.toLowerCase()).toBe("<div></div>");
    });
})