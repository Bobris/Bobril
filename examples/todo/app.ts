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
            handler: TodoApp.App,
            data: { tasks: taskList, filter: "all" }}),
        b.route({ 
            name: "active", 
            handler: TodoApp.App,
            data: { tasks: taskList, filter: "active" }}),
        b.route({ 
            name: "completed", 
            handler: TodoApp.App,
            data: { tasks: taskList, filter: "completed" }})
    ]);

}