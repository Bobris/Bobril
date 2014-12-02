/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="model.ts"/>
/// <reference path="components.ts"/>

module TodoApp {

    var taskList = new TodoApp.Tasks();
    taskList.restoreFromStorage();

    b.routes([
        b.routeDefault({ 
            name: "all", 
            data: { tasks: taskList, filter: 'all' }, 
            handler: TodoApp.App }),
        b.route({ 
            name: "active", 
            data: { tasks: taskList, filter: 'active' }, 
            handler: TodoApp.App }),
        b.route({ 
            name: "completed", 
            data: { tasks: taskList, filter: 'completed' }, 
            handler: TodoApp.App })
    ]);

}