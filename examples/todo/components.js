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
        App.onNewTaskNameChange = function (ctx, value) {
            ctx.currentNewTaskName = value;
            b.invalidate();
        };

        App.init = function (ctx, me, oldMe) {
            var _this = this;
            if (!oldMe) {
                ctx.currentNewTaskName = "";
            }
            ctx.data.tasks.setFilter(ctx.data.filter);
            me.tag = 'div';
            me.attrs = { 'class': 'main' };
            me.children = [
                { component: Heading },
                {
                    component: TaskCreate, data: {
                        tasks: ctx.data.tasks,
                        currentNewTaskName: ctx.currentNewTaskName,
                        onCurrentNewTaskNameChange: function (value) {
                            return _this.onNewTaskNameChange(ctx, value);
                        }
                    }
                },
                {
                    component: TaskList, data: {
                        tasks: ctx.data.tasks
                    }
                },
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
            me.tag = 'div';
            me.attrs = { className: 'input-wrapper' }, me.children = [
                this.createInputElement(ctx),
                this.createSetAllCheckboxElement(ctx)
            ];
        };

        TaskCreate.createInputElement = function (ctx) {
            return {
                tag: 'input',
                attrs: {
                    placeholder: 'What needs to be done?',
                    className: 'task-name',
                    value: ctx.data.currentNewTaskName
                },
                data: ctx.data,
                component: {
                    onKeyUp: function (ctx, event) {
                        if (event.which == 13) {
                            ctx.data.onCurrentNewTaskNameChange(ctx.data.currentNewTaskName.trim());
                            if (ctx.data.currentNewTaskName) {
                                ctx.data.tasks.addTask(ctx.data.currentNewTaskName);
                                b.invalidate();
                                ctx.data.onCurrentNewTaskNameChange('');
                            }
                            return true;
                        } else if (event.which == 27) {
                            // cancel the task adding controls
                            ctx.data.onCurrentNewTaskNameChange('');
                            return true;
                        }
                        return false;
                    },
                    onChange: function (ctx, value) {
                        ctx.data.onCurrentNewTaskNameChange(value);
                    },
                    postInitDom: function (ctx, me, element) {
                        element.focus();
                    }
                }
            };
        };

        TaskCreate.createSetAllCheckboxElement = function (ctx) {
            return {
                tag: 'input',
                attrs: {
                    type: 'checkbox',
                    className: 'set-all-tasks',
                    value: ctx.data.tasks.getItemsCount() > 0 && ctx.data.tasks.isWholeListCompleted()
                },
                data: ctx.data.tasks,
                component: {
                    onChange: function (ctx, value) {
                        if (value) {
                            ctx.data.markAllTasksAsCompleted();
                        } else {
                            ctx.data.markAllTasksAsActive();
                        }
                        b.invalidate();
                    }
                }
            };
        };
        return TaskCreate;
    })();

    var TaskList = (function () {
        function TaskList() {
        }
        TaskList.init = function (ctx, me) {
            me.tag = 'ul';
            me.attrs = {
                className: 'todo-list'
            }, me.children = this.createTaskElements(ctx);
        };

        TaskList.createTaskElements = function (ctx) {
            var res = [];
            var tasks = ctx.data.tasks.getFilteredItems();
            for (var i = 0; i < tasks.length; i++) {
                var taskName = tasks[i].name;
                var taskId = tasks[i].id;
                var classes = 'task';
                if (tasks[i].completed)
                    classes += ' completed';
                var labelClasses = '';
                if (tasks[i].isInEditMode) {
                    labelClasses = 'hidden';
                } else {
                    classes += ' readonly';
                }

                res.push({
                    tag: 'li',
                    attrs: {
                        className: classes
                    },
                    children: [
                        this.createCheckboxElement(ctx, taskId),
                        { tag: 'label', children: taskName, attrs: { className: labelClasses } },
                        this.createDeleteButtonElement(ctx, taskId),
                        this.createEditingInputElement(ctx, taskId, taskName)
                    ],
                    component: {
                        onDoubleClick: function (ctx) {
                            ctx.data.tasks.setTaskEditMode(ctx.data.taskId, true);
                            b.invalidate();
                            return false;
                        }
                    },
                    data: {
                        tasks: ctx.data.tasks,
                        taskId: taskId
                    }
                });
            }
            return res;
        };

        TaskList.createCheckboxElement = function (ctx, taskId) {
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
                        } else {
                            model.tasks.markTaskAsActive(ctx.data.taskId);
                        }
                        b.invalidate();
                    }
                },
                data: ctx.data
            };
        };

        TaskList.createDeleteButtonElement = function (ctx, taskId) {
            var attributes = { 'class': 'delete-button' };
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
                        return true;
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        };

        TaskList.createEditingInputElement = function (ctx, taskId, taskName) {
            var isInEditMode = model.tasks.isInEditMode(taskId);
            var attributes = { 'type': 'text', 'class': 'task-edit', 'value': taskName };
            if (!isInEditMode) {
                attributes['class'] += ' hidden';
            }
            return [
                {
                    tag: 'input',
                    attrs: attributes,
                    data: ctx.data,
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
                            } else if (event.which == 27) {
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
                }];
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
//# sourceMappingURL=components.js.map
