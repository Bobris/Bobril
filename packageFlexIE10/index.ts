import * as b from "bobril";

if (b.ieVersion() === 10) {
    b.setStyleShim("display", (style: any, value: any, name: string) => {
        if (value === "flex") {
            value = "-ms-flexbox";
        } else if (value === "inline-flex") {
            value = "-ms-inline-flexbox";
        }
        style[name] = value;
    });
    b.setStyleShim("order", (style: any, value: any, oldName: string) => {
        style["msFlexOrder"] = value;
        style[oldName] = undefined;
    });
    const jcTable: { [name: string]: string } = {
        "flex-start": "start",
        "flex-end": "end",
        "center": "center",
        "space-between": "justify",
        "space-around": "distribute",
        "stretch": "stretch"
    };
    b.setStyleShim("justifyContent", (style: any, value: any, oldName: string) => {
        style["msFlexPack"] = jcTable[value];
        style[oldName] = undefined;
    });
    b.setStyleShim("alignContent", (style: any, value: any, oldName: string) => {
        style["msFlexLinePack"] = jcTable[value];
        style[oldName] = undefined;
    });
    const aiTable: { [name: string]: string } = {
        "flex-start": "start",
        "flex-end": "end",
        "center": "center",
        "baseline": "baseline",
        "stretch": "stretch",
        "auto": "auto"
    };
    b.setStyleShim("alignItems", (style: any, value: any, oldName: string) => {
        style["msFlexAlign"] = aiTable[value];
        style[oldName] = undefined;
    });
    b.setStyleShim("alignSelf", (style: any, value: any, oldName: string) => {
        style["msFlexItemAlign"] = aiTable[value];
        style[oldName] = undefined;
    });
}
