"use strict";
var b = require("bobril");
if (b.ieVersion() === 10) {
    b.setStyleShim("display", function (style, value, name) {
        if (value === "flex") {
            value = "-ms-flexbox";
        }
        else if (value === "inline-flex") {
            value = "-ms-inline-flexbox";
        }
        style[name] = value;
    });
    b.setStyleShim("order", function (style, value, oldName) {
        style["msFlexOrder"] = value;
        style[oldName] = undefined;
    });
    var jcTable_1 = {
        "flex-start": "start",
        "flex-end": "end",
        "center": "center",
        "space-between": "justify",
        "space-around": "distribute",
        "stretch": "stretch"
    };
    b.setStyleShim("justifyContent", function (style, value, oldName) {
        style["msFlexPack"] = jcTable_1[value];
        style[oldName] = undefined;
    });
    b.setStyleShim("alignContent", function (style, value, oldName) {
        style["msFlexLinePack"] = jcTable_1[value];
        style[oldName] = undefined;
    });
    var aiTable_1 = {
        "flex-start": "start",
        "flex-end": "end",
        "center": "center",
        "baseline": "baseline",
        "stretch": "stretch",
        "auto": "auto"
    };
    b.setStyleShim("alignItems", function (style, value, oldName) {
        style["msFlexAlign"] = aiTable_1[value];
        style[oldName] = undefined;
    });
    b.setStyleShim("alignSelf", function (style, value, oldName) {
        style["msFlexItemAlign"] = aiTable_1[value];
        style[oldName] = undefined;
    });
}
