/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="model.ts"/>
/// <reference path="utils.ts"/>
/// <reference path="components.ts"/>
var MouseEnterLeaveApp;
(function (MouseEnterLeaveApp) {
    b.init(function () {
        return {
            component: MouseEnterLeaveApp.TaskList
        };
    });
})(MouseEnterLeaveApp || (MouseEnterLeaveApp = {}));
