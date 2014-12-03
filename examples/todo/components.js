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
            ctx.newTaskName = value;
            b.invalidate();
        };
        App.init = function (ctx, me, oldMe) {
            var _this = this;
            if (!oldMe) {
                ctx.newTaskName = '';
            }
            // TODO: to the view-model
            ctx.data.tasks.setFilter(ctx.data.filter);
            me.tag = 'div';
            me.attrs = { 'class': 'main' };
            me.children = [
                {
                    component: Heading
                },
                {
                    component: TaskCreate,
                    data: {
                        tasks: ctx.data.tasks,
                        newTaskName: ctx.newTaskName,
                        onNewTaskNameChange: function (value) { return _this.onNewTaskNameChange(ctx, value); }
                    }
                },
                {
                    component: TaskList,
                    data: {
                        tasks: ctx.data.tasks
                    }
                },
                {
                    component: Footer,
                    data: {
                        tasksCount: ctx.data.tasks.getItemsCount(),
                        completedTasksCount: ctx.data.tasks.getNumberOfCompletedTasks(),
                        removeCompletedTasks: function () {
                            ctx.data.tasks.removeCompletedTasks();
                        }
                    }
                }
            ];
        };
        return App;
    })();
    TodoApp.App = App;
    var Heading = (function () {
        function Heading() {
        }
        Heading.init = function (ctx, me) {
            me.tag = 'h3';
            me.children = 'todos';
        };
        return Heading;
    })();
    var TaskCreate = (function () {
        function TaskCreate() {
        }
        TaskCreate.init = function (ctx, me) {
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
                    value: ctx.data.newTaskName
                },
                component: {
                    onKeyUp: function (ctx, event) {
                        if (event.which == 13) {
                            ctx.data.onNewTaskNameChange(ctx.data.newTaskName.trim());
                            if (ctx.data.newTaskName) {
                                ctx.data.tasks.addTask(ctx.data.newTaskName);
                                b.invalidate();
                                ctx.data.onNewTaskNameChange('');
                            }
                            return true;
                        }
                        else if (event.which == 27) {
                            // cancel the task adding controls
                            ctx.data.onNewTaskNameChange('');
                            return true;
                        }
                        return false;
                    },
                    onChange: function (ctx, value) {
                        ctx.data.onNewTaskNameChange(value);
                    },
                    postInitDom: function (ctx, me, element) {
                        element.focus();
                    },
                    postUpdateDom: function (ctx, me, element) {
                    }
                },
                data: ctx.data
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
                component: {
                    onChange: function (ctx, value) {
                        if (value) {
                            ctx.data.markAllTasksAsCompleted();
                        }
                        else {
                            ctx.data.markAllTasksAsActive();
                        }
                        b.invalidate();
                    }
                },
                data: ctx.data.tasks
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
            var taskItems = ctx.data.tasks.getFilteredItems();
            var tasks = ctx.data.tasks;
            for (var i = 0; i < taskItems.length; i++) {
                var taskName = taskItems[i].name;
                var taskId = taskItems[i].id;
                var classes = 'task';
                if (taskItems[i].completed)
                    classes += ' completed';
                var labelClasses = '';
                if (taskItems[i].isInEditMode) {
                    labelClasses = 'hidden';
                }
                else {
                    classes += ' readonly';
                }
                res.push({
                    tag: 'li',
                    attrs: {
                        className: classes
                    },
                    children: [
                        {
                            component: Checkbox,
                            data: {
                                taskId: taskId,
                                isTaskCompleted: tasks.isTaskCompleted(taskId),
                                performCheck: function (taskId) {
                                    tasks.markTaskAsCompleted(taskId);
                                    b.invalidate();
                                },
                                performUncheck: function (taskId) {
                                    tasks.markTaskAsActive(taskId);
                                    b.invalidate();
                                }
                            }
                        },
                        { tag: 'label', children: taskName, attrs: { className: labelClasses } },
                        {
                            component: DeleteButton,
                            data: {
                                taskId: taskId,
                                isInEditMode: tasks.isInEditMode(taskId),
                                performDelete: function (taskId) {
                                    tasks.removeTask(taskId);
                                    b.invalidate();
                                }
                            }
                        }
                    ],
                    component: {},
                    data: {
                        tasks: ctx.data.tasks,
                        taskId: taskId
                    }
                });
            }
            return res;
        };
        return TaskList;
    })();
    var Checkbox = (function () {
        function Checkbox() {
        }
        Checkbox.init = function (ctx, me) {
            var attributes = { 'type': 'checkbox', 'class': 'mark-as-completed' };
            if (ctx.data.isTaskCompleted) {
                attributes['checked'] = 'checked';
            }
            me.tag = 'input';
            me.attrs = attributes;
            me.data = ctx.data;
        };
        Checkbox.onChange = function (ctx, value) {
            if (value) {
                ctx.data.performCheck(ctx.data.taskId);
            }
            else {
                ctx.data.performUncheck(ctx.data.taskId);
            }
        };
        return Checkbox;
    })();
    TodoApp.Checkbox = Checkbox;
    var DeleteButton = (function () {
        function DeleteButton() {
        }
        DeleteButton.init = function (ctx, me) {
            if (ctx.data.isInEditMode) {
                return null;
            }
            me.tag = 'a';
            me.children = 'delete';
            me.attrs = { className: 'delete-button' };
            me.data = ctx.data;
        };
        DeleteButton.onClick = function (ctx, event) {
            ctx.data.performDelete(ctx.data.taskId);
            return true;
        };
        return DeleteButton;
    })();
    TodoApp.DeleteButton = DeleteButton;
    var EditingInput = (function () {
        function EditingInput() {
        }
        EditingInput.init = function (ctx, me) {
            me.tag = 'input';
            me.attrs = { type: 'text', className: 'task-edit', value: ctx.data.oldValue };
            me.component = {
                onKeyUp: function (ctx, event) {
                    if (event.which == 13) {
                        ctx.data.newValue = ctx.data.newValue.trim();
                        if (ctx.data.newValue) {
                            ctx.data.saveNewValue(ctx.data.taskId, ctx.data.newValue);
                            ctx.data.newValue = '';
                        }
                        return true;
                    }
                    else if (event.which == 27) {
                        ctx.data.cancelNewValue(ctx.data.taskId);
                        return true;
                    }
                    return false;
                },
                onChange: function (ctx, value) {
                    ctx.data.newValue = value;
                },
                data: ctx.data
            };
        };
        return EditingInput;
    })();
    var Footer = (function () {
        function Footer() {
        }
        Footer.init = function (ctx, me) {
            var itemsLeftInfo = this.createItemsLeftInfo(ctx);
            var filterButtons = this.createFilterButtons();
            var clearAllButton = this.createClearCompleted(ctx);
            me.tag = 'div';
            me.attrs = { 'class': 'footer' };
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
        Footer.createItemsLeftInfo = function (ctx) {
            var itemsLeftCount = ctx.data.tasksCount - ctx.data.completedTasksCount;
            var text = itemsLeftCount === 1 ? itemsLeftCount + ' item left' : itemsLeftCount + ' items left';
            return {
                tag: 'div',
                attrs: { 'class': 'items-left-info' },
                children: text
            };
        };
        Footer.createFilterButtons = function () {
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
        Footer.createClearCompleted = function (ctx) {
            var numberOfCompletedTasks = ctx.data.completedTasksCount;
            var text = 'Clear completed (' + numberOfCompletedTasks + ')';
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
                        ctx.data.removeCompletedTasks();
                        b.invalidate();
                        return true;
                    }
                },
                data: ctx.data
            };
        };
        return Footer;
    })();
})(TodoApp || (TodoApp = {}));
