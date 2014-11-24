/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="model.ts"/>
/// <reference path="utils.ts"/>
/// <reference path="components.ts"/>

module MouseEnterLeaveApp {

    b.init(() => {
            return {
                component: TaskList
            }
        });

}