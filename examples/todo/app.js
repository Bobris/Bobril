/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="model.ts"/>
/// <reference path="components.ts"/>
var TodoApp;
(function (TodoApp) {
    var taskList = new TodoApp.Tasks();
    taskList.restoreFromStorage();
    b.routes([
        b.routeDefault({
            name: "all",
            data: { tasks: taskList, currentNewTaskName: '', currentEditTaskName: '', filter: 'all' },
            handler: TodoApp.TaskList
        }),
        b.route({
            name: "active",
            data: { tasks: taskList, currentNewTaskName: '', currentEditTaskName: '', filter: 'active' },
            handler: TodoApp.TaskList
        }),
        b.route({
            name: "completed",
            data: { tasks: taskList, currentNewTaskName: '', currentEditTaskName: '', filter: 'completed' },
            handler: TodoApp.TaskList
        })
    ]);
})(TodoApp || (TodoApp = {}));
