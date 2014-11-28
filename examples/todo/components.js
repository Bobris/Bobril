/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
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
            model.tasks.setFilter(me.data.filter);
            var heading = this.createHeadingElement();
            var checkbox = this.createSetAllCheckboxElement(model);
            var input = this.createInputElement(model);
            var todoList = this.createTaskElements(model);
            var footer = this.createFooterElements(model);
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
                todoList,
                footer
            ];
        };
        TaskList.createHeadingElement = function () {
            return {
                tag: 'h3',
                children: 'todos'
            };
        };
        TaskList.createSetAllCheckboxElement = function (model) {
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
        TaskList.createInputElement = function (model) {
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
                    },
                    onChange: function (ctx, value) {
                        model.currentNewTaskName = value;
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
                res.children.push({
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
        TaskList.createFooterElements = function (model) {
            var completedCount = model.tasks.getNumberOfCompletedTasks();
            var itemsLeftInfo = this.createItemsLeftInfo(model);
            var filterButtons = this.createFilterButtons(model);
            var clearAllButton = this.createClearCompleted(model);
            var attributes = { 'class': 'footer' };
            if (model.tasks.getItemsCount() < 1) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'div',
                attrs: attributes,
                children: [
                    itemsLeftInfo,
                    filterButtons,
                    clearAllButton,
                    {
                        tag: 'div',
                        attrs: { 'class': 'cleaner' }
                    }
                ]
            };
        };
        TaskList.createItemsLeftInfo = function (model) {
            var itemsLeftCount = model.tasks.getItemsCount() - model.tasks.getNumberOfCompletedTasks();
            var text = itemsLeftCount === 1 ? itemsLeftCount + ' item left' : itemsLeftCount + ' items left';
            return {
                tag: 'div',
                attrs: { 'class': 'items-left-info' },
                children: text
            };
        };
        TaskList.createFilterButtons = function (model) {
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
        TaskList.createClearCompleted = function (model) {
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
                    }
                }
            };
        };
        return TaskList;
    })();
    TodoApp.TaskList = TaskList;
})(TodoApp || (TodoApp = {}));
