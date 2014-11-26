/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="model.ts"/>
/// <reference path="components.ts"/>
var TodoApp;
(function (TodoApp) {
    b.init(function () {
        return {
            component: TodoApp.TaskList,
            data: {
                tasks: new TodoApp.Tasks(),
                currentTaskName: ''
            }
        };
    });
})(TodoApp || (TodoApp = {}));
