/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>
var TodoApp;
(function (TodoApp) {
    var App = (function () {
        function App() {
        }
        App.init = function (ctx, me, oldMe) {
            me.tag = 'div';
            me.attrs = { 'class': 'main' };
            me.data = ctx.data, me.children = [
                { component: Heading },
                { component: TaskCreate, data: ctx.data },
                { component: TaskList, data: ctx.data },
                { component: Footer, data: ctx.data }
            ];
        };
        return App;
    })();
    TodoApp.App = App;
    var Heading = (function () {
        function Heading() {
        }
        Heading.init = function (ctx, me, oldMe) {
            me.tag = 'h3';
            me.children = 'todos';
        };
        return Heading;
    })();
    var TaskCreate = (function () {
        function TaskCreate() {
        }
        TaskCreate.init = function (ctx, me, oldMe) {
            var model = oldMe ? oldMe.data : me.data;
            me.tag = 'div';
            me.attrs = { 'class': 'input-wrapper' }, me.children = [
                this.createInputElement(model),
                this.createSetAllCheckboxElement(model)
            ];
        };
        TaskCreate.createInputElement = function (model) {
            var inputAttributes = {
                'placeholder': 'What needs to be done?',
                'class': 'task-name',
                'autofocus': 'a'
            };
            if (model.currentNewTaskName) {
                inputAttributes['value'] = model.currentNewTaskName;
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
                            model.currentNewTaskName = model.currentNewTaskName.trim();
                            if (model.currentNewTaskName) {
                                model.tasks.addTask(model.currentNewTaskName);
                                model.currentNewTaskName = '';
                                b.invalidate();
                            }
                        }
                        else if (event.which == 27) {
                            // cancel the task adding controls
                            model.currentNewTaskName = '';
                            b.invalidate();
                        }
                        return false;
                    },
                    onChange: function (ctx, value) {
                        model.currentNewTaskName = value;
                    }
                }
            };
        };
        TaskCreate.createSetAllCheckboxElement = function (model) {
            var attributes = { 'type': 'checkbox', 'class': 'set-all-tasks' };
            if (model.tasks.getItemsCount() > 0 && model.tasks.isWholeListCompleted()) {
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
        return TaskCreate;
    })();
    var TaskList = (function () {
        function TaskList() {
        }
        TaskList.init = function (ctx, me, oldMe) {
            var model = oldMe ? oldMe.data : me.data;
            model.tasks.setFilter(me.data.filter);
            me.tag = 'ul';
            me.attrs = { 'class': 'todo-list' }, me.children = this.createTaskElements(model);
        };
        TaskList.createTaskElements = function (model) {
            var res = [];
            var tasks = model.tasks.getFilteredItems();
            for (var i = 0; i < tasks.length; i++) {
                var taskName = tasks[i].name;
                var taskId = tasks[i].id;
                var classes = 'task';
                if (model.tasks.isTaskCompleted(taskId)) {
                    classes += ' completed';
                }
                var labelClasses = '';
                if (model.tasks.isInEditMode(taskId)) {
                    labelClasses += 'hidden';
                }
                else {
                    classes += ' readonly';
                }
                res.push({
                    tag: 'li',
                    attrs: {
                        'class': classes
                    },
                    children: [
                        this.createCheckboxElement(model, taskId),
                        { tag: 'label', children: taskName, attrs: { 'class': labelClasses } },
                        this.createDeleteButtonElement(model, taskId),
                        this.createEditingInputElement(model, taskId, taskName)
                    ],
                    component: {
                        onDoubleClick: function (ctx, event) {
                            model.tasks.setTaskEditMode(ctx.data.taskId, true);
                            b.invalidate();
                            return false;
                        }
                    },
                    data: {
                        'taskId': taskId
                    }
                });
            }
            return res;
        };
        TaskList.createCheckboxElement = function (model, taskId) {
            var attributes = { 'type': 'checkbox', 'class': 'mark-as-completed' };
            if (model.tasks.isTaskCompleted(taskId)) {
                attributes['checked'] = 'checked';
            }
            if (model.tasks.isInEditMode(taskId)) {
                attributes['class'] += ' hidden';
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
            var attributes = { 'class': 'delete-button', 'href': 'javascript: void(0);' };
            if (model.tasks.isInEditMode(taskId)) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'a',
                children: 'delete',
                attrs: attributes,
                component: {
                    onClick: function (ctx, event) {
                        model.tasks.removeTask(ctx.data.taskId);
                        b.invalidate();
                        return false;
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        };
        TaskList.createEditingInputElement = function (model, taskId, taskName) {
            var isInEditMode = model.tasks.isInEditMode(taskId);
            var attributes = { 'type': 'text', 'class': 'task-edit', 'value': taskName };
            if (!isInEditMode) {
                attributes['class'] += ' hidden';
            }
            return [
                {
                    tag: 'input',
                    attrs: attributes,
                    component: {
                        onKeyUp: function (ctx, event) {
                            if (event.which == 13) {
                                model.currentEditTaskName = model.currentEditTaskName.trim();
                                if (model.currentEditTaskName) {
                                    model.tasks.setTaskName(taskId, model.currentEditTaskName);
                                    model.currentEditTaskName = '';
                                    model.tasks.setTaskEditMode(taskId, false);
                                    b.invalidate();
                                }
                            }
                            else if (event.which == 27) {
                                model.tasks.setTaskEditMode(taskId, false);
                                b.invalidate();
                            }
                        },
                        onChange: function (ctx, value) {
                            model.currentEditTaskName = value;
                        }
                    }
                },
                {
                    tag: 'div',
                    attrs: { 'class': 'cleaner' }
                }
            ];
        };
        return TaskList;
    })();
    var Footer = (function () {
        function Footer() {
        }
        Footer.init = function (ctx, me, oldMe) {
            var model = oldMe ? oldMe.data : me.data;
            model.tasks.setFilter(me.data.filter);
            var itemsLeftInfo = this.createItemsLeftInfo(model);
            var filterButtons = this.createFilterButtons(model);
            var clearAllButton = this.createClearCompleted(model);
            var attributes = { 'class': 'footer' };
            if (model.tasks.getItemsCount() < 1) {
                attributes['class'] += ' hidden';
            }
            me.tag = 'div';
            me.attrs = attributes;
            me.children = [
                itemsLeftInfo,
                filterButtons,
                clearAllButton,
                {
                    tag: 'div',
                    attrs: { 'class': 'cleaner' }
                }
            ];
        };
        Footer.createItemsLeftInfo = function (model) {
            var itemsLeftCount = model.tasks.getItemsCount() - model.tasks.getNumberOfCompletedTasks();
            var text = itemsLeftCount === 1 ? itemsLeftCount + ' item left' : itemsLeftCount + ' items left';
            return {
                tag: 'div',
                attrs: { 'class': 'items-left-info' },
                children: text
            };
        };
        Footer.createFilterButtons = function (model) {
            return {
                tag: 'div',
                attrs: { 'class': 'filter' },
                children: [
                    b.link({ tag: 'a', children: 'All' }, 'all'),
                    b.link({ tag: 'a', children: 'Active' }, 'active'),
                    b.link({ tag: 'a', children: 'Completed' }, 'completed')
                ]
            };
        };
        Footer.createClearCompleted = function (model) {
            var numberOfCompletedTasks = model.tasks.getNumberOfCompletedTasks();
            var text = 'Clear completed (' + model.tasks.getNumberOfCompletedTasks() + ')';
            var attributes = { 'class': 'clear-completed-button' };
            if (numberOfCompletedTasks < 1) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'div',
                attrs: attributes,
                children: text,
                component: {
                    onClick: function (ctx, event) {
                        model.tasks.removeCompletedTasks();
                        b.invalidate();
                        return false;
                    }
                }
            };
        };
        return Footer;
    })();
})(TodoApp || (TodoApp = {}));
