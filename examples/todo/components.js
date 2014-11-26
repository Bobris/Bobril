/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>
var TodoApp;
(function (TodoApp) {
    var TaskList = (function () {
        function TaskList() {
        }
        TaskList.init = function (ctx, me, oldMe) {
            var model = oldMe ? oldMe.data : me.data;
            var heading = this.createHeadingElement();
            var checkbox = this.createSetAllCheckboxElement(model);
            var input = this.createInputElement(model);
            var hint = this.createHintElement(model);
            var todoList = this.createTaskElements(model);
            me.tag = 'div';
            me.attrs = { 'class': 'main' };
            me.children = [
                heading,
                {
                    tag: 'div',
                    attrs: { 'class': 'input-wrapper' },
                    children: [
                        input,
                        checkbox
                    ]
                },
                todoList
            ];
        };
        TaskList.createHeadingElement = function () {
            return {
                tag: 'h3',
                children: 'Todos'
            };
        };
        TaskList.createSetAllCheckboxElement = function (model) {
            var attributes = { 'type': 'checkbox', 'class': 'set-all-tasks' };
            if (model.tasks.items.length > 0 && model.tasks.isWholeListCompleted()) {
                attributes['checked'] = 'checked';
            }
            return {
                tag: 'input',
                attrs: attributes,
                component: {
                    onChange: function (ctx, value) {
                        if (value) {
                            model.tasks.markAllTasksAsCompleted();
                            b.invalidate();
                        }
                        else {
                            model.tasks.markAllTasksAsActive();
                            b.invalidate();
                        }
                    }
                }
            };
        };
        TaskList.createInputElement = function (model) {
            var inputAttributes = {
                'placeholder': 'What needs to be done?',
                'class': 'task-name',
                'autofocus': 'a'
            };
            if (model.currentTaskName) {
                inputAttributes['value'] = model.currentTaskName;
            }
            else {
                inputAttributes['value'] = '';
            }
            return {
                tag: 'input',
                attrs: inputAttributes,
                component: {
                    onKeyUp: function (ctx, event) {
                        if (event.which == 13) {
                            model.currentTaskName = model.currentTaskName.trim();
                            if (model.currentTaskName) {
                                model.tasks.addTask(model.currentTaskName);
                                model.currentTaskName = '';
                                b.invalidate();
                            }
                        }
                        else if (event.which == 27) {
                            // cancel the task adding controls
                            model.currentTaskName = '';
                            b.invalidate();
                        }
                    },
                    onChange: function (ctx, value) {
                        model.currentTaskName = value;
                    }
                }
            };
        };
        TaskList.createHintElement = function (model) {
            return {
                tag: 'p',
                attrs: {
                    class: 'hint'
                },
                children: {
                    tag: 'small',
                    children: '(Esc for cancellation, Enter to save the task)'
                }
            };
        };
        TaskList.createTaskElements = function (model) {
            var res = {
                tag: 'ul',
                attrs: { 'class': 'todo-list' },
                children: []
            };
            for (var i = 0; i < model.tasks.items.length; i++) {
                var taskName = model.tasks.items[i].name;
                var taskId = model.tasks.items[i].id;
                var classes = 'task';
                if (model.tasks.items[i].completed) {
                    classes += ' completed';
                }
                res.children.push({
                    tag: 'li',
                    attrs: {
                        'class': classes
                    },
                    children: [
                        this.createCheckboxElement(model, taskId),
                        { tag: 'label', children: taskName },
                        this.createDeleteButtonElement(model, taskId)
                    ]
                });
            }
            return res;
        };
        TaskList.createCheckboxElement = function (model, taskId) {
            var attributes = { 'type': 'checkbox', 'class': 'mark-as-completed' };
            if (model.tasks.isTaskCompleted(taskId)) {
                attributes['checked'] = 'checked';
            }
            return {
                tag: 'input',
                attrs: attributes,
                component: {
                    onChange: function (ctx, value) {
                        if (value) {
                            model.tasks.markTaskAsCompleted(ctx.data.taskId);
                        }
                        else {
                            model.tasks.markTaskAsActive(ctx.data.taskId);
                        }
                        b.invalidate();
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        };
        TaskList.createDeleteButtonElement = function (model, taskId) {
            return {
                tag: 'a',
                children: 'delete',
                attrs: {
                    'class': 'delete-button',
                    'href': 'javascript: void(0);'
                },
                component: {
                    onClick: function (ctx, event) {
                        model.tasks.removeTask(ctx.data.taskId);
                        b.invalidate();
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        };
        return TaskList;
    })();
    TodoApp.TaskList = TaskList;
})(TodoApp || (TodoApp = {}));
