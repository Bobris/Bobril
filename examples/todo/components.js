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
        App.render = function (ctx, me, oldMe) {
            ctx.filter = ctx.data.filter;
            me.tag = "div";
            me.attrs = { className: "main" };
            me.children = [
                {
                    component: Heading
                },
                {
                    component: TaskCreate,
                    data: {
                        isWholeListCompleted: ctx.data.tasks.getItemsCount() > 0 && ctx.data.tasks.isWholeListCompleted(),
                        addNewTask: function (name) {
                            ctx.data.tasks.addTask(name);
                        },
                        markAllTasksAsCompleted: function () {
                            ctx.data.tasks.markAllTasksAsCompleted();
                        },
                        markAllTasksAsActive: function () {
                            ctx.data.tasks.markAllTasksAsActive();
                        }
                    }
                },
                {
                    component: TaskList,
                    data: {
                        tasks: ctx.data.tasks,
                        filter: ctx.filter
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
            me.tag = "h3";
            me.children = "todos";
        };
        return Heading;
    })();
    var TaskCreate = (function () {
        function TaskCreate() {
        }
        TaskCreate.render = function (ctx, me) {
            ctx.newTaskName = ctx.newTaskName || "";
            me.tag = "div";
            me.attrs = { className: "input-wrapper" }, me.children = [
                this.createInputElement(ctx),
                this.createSetAllCheckboxElement(ctx)
            ];
        };
        TaskCreate.createInputElement = function (ctx) {
            return {
                tag: "input",
                attrs: {
                    placeholder: "What needs to be done?",
                    className: "task-name",
                    value: ctx.newTaskName
                },
                component: {
                    onKeyUp: function (ctx, event) {
                        var handler = new KeyDownUpHandler();
                        return handler.handleEcsEnter(event, function () {
                            // cancel the task adding controls (i.e. clear the input)
                            ctx.newTaskName = "";
                            b.invalidate();
                            return true;
                        }, function () {
                            ctx.newTaskName = ctx.newTaskName.trim();
                            if (ctx.newTaskName) {
                                ctx.data.addNewTask(ctx.newTaskName);
                                b.invalidate();
                                ctx.newTaskName = "";
                            }
                            return true;
                        });
                    },
                    onChange: function (ctx, value) {
                        ctx.newTaskName = value;
                    },
                    postInitDom: function (ctx, me, element) {
                        element.focus();
                    }
                },
                data: ctx.data
            };
        };
        TaskCreate.createSetAllCheckboxElement = function (ctx) {
            return {
                tag: "input",
                attrs: {
                    type: "checkbox",
                    className: "set-all-tasks",
                    value: ctx.data.isWholeListCompleted
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
                data: {
                    markAllTasksAsCompleted: ctx.data.markAllTasksAsCompleted,
                    markAllTasksAsActive: ctx.data.markAllTasksAsActive
                }
            };
        };
        return TaskCreate;
    })();
    var TaskList = (function () {
        function TaskList() {
        }
        TaskList.init = function (ctx, me) {
            ctx.editingTaskId = -1;
        };
        TaskList.render = function (ctx, me) {
            me.tag = "ul";
            me.attrs = {
                className: "todo-list"
            }, me.children = this.createTaskElements(ctx);
        };
        TaskList.createTaskElements = function (ctx) {
            var res = [];
            var taskItems = ctx.data.tasks.getFilteredItems(ctx.data.filter);
            var tasks = ctx.data.tasks;
            for (var i = 0; i < taskItems.length; i++) {
                var task = taskItems[i];
                res.push({
                    component: TaskItem,
                    data: {
                        id: task.id,
                        name: task.name,
                        completed: task.completed,
                        justEditing: task.id === ctx.editingTaskId,
                        cancelNewValue: function () {
                            ctx.editingTaskId = -1;
                        },
                        saveNewValue: function (taskId, value) {
                            tasks.setTaskName(taskId, value);
                            ctx.editingTaskId = -1;
                        },
                        markTaskAsCompleted: function (taskId) {
                            tasks.markTaskAsCompleted(taskId);
                        },
                        markTaskAsActive: function (taskId) {
                            tasks.markTaskAsActive(taskId);
                        },
                        setEditingMode: function (taskId) {
                            ctx.editingTaskId = taskId;
                        },
                        removeTask: function (taskId) {
                            tasks.removeTask(taskId);
                        }
                    }
                });
            }
            return res;
        };
        return TaskList;
    })();
    var TaskItem = (function () {
        function TaskItem() {
        }
        TaskItem.render = function (ctx, me) {
            var liClasses = "task";
            var labelClasses = "";
            if (ctx.data.completed) {
                liClasses += " completed";
            }
            if (ctx.data.justEditing) {
                labelClasses = "hidden";
            }
            else {
                liClasses += " readonly";
            }
            me.tag = "li";
            me.attrs = { className: liClasses };
            me.children = [
                ctx.data.justEditing || {
                    component: Checkbox,
                    data: {
                        taskId: ctx.data.id,
                        isChecked: ctx.data.completed,
                        performCheck: function (taskId) {
                            ctx.data.markTaskAsCompleted(taskId);
                            b.invalidate();
                        },
                        performUncheck: function (taskId) {
                            ctx.data.markTaskAsActive(taskId);
                            b.invalidate();
                        }
                    }
                },
                { tag: "label", children: ctx.data.name, attrs: { className: labelClasses } },
                {
                    component: DeleteButton,
                    data: {
                        taskId: ctx.data.id,
                        invisible: ctx.data.justEditing,
                        performDelete: function (taskId) {
                            ctx.data.removeTask(taskId);
                            b.invalidate();
                        }
                    }
                },
                ctx.data.justEditing && {
                    component: EditingInput,
                    data: {
                        taskId: ctx.data.id,
                        oldValue: ctx.data.name,
                        saveNewValue: function (taskId, value) {
                            ctx.data.saveNewValue(taskId, value);
                            b.invalidate();
                        },
                        cancelNewValue: function () {
                            ctx.data.cancelNewValue();
                            b.invalidate();
                        }
                    }
                },
                { tag: "div", attrs: { className: "cleaner" } }
            ];
        };
        TaskItem.onDoubleClick = function (ctx) {
            ctx.data.setEditingMode(ctx.data.id);
            b.invalidate();
            return true;
        };
        return TaskItem;
    })();
    TodoApp.TaskItem = TaskItem;
    var Checkbox = (function () {
        function Checkbox() {
        }
        Checkbox.render = function (ctx, me) {
            var attributes = { type: "checkbox", className: "mark-as-completed", value: ctx.data.isChecked };
            me.tag = "input";
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
        DeleteButton.render = function (ctx, me) {
            me.tag = "a";
            me.children = "delete";
            me.attrs = { className: "delete-button" };
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
        EditingInput.render = function (ctx, me) {
            ctx.newValue = ctx.newValue || "";
            me.tag = "input";
            me.attrs = { type: "text", className: "task-edit", value: ctx.data.oldValue };
            me.component = {
                onKeyUp: function (ctx, event) {
                    var handler = new KeyDownUpHandler();
                    return handler.handleEcsEnter(event, function () {
                        ctx.data.cancelNewValue();
                        ctx.newValue = "";
                        b.invalidate();
                        return true;
                    }, function () {
                        ctx.newValue = ctx.newValue.trim();
                        if (ctx.newValue) {
                            ctx.data.saveNewValue(ctx.data.taskId, ctx.newValue);
                            ctx.newValue = "";
                            b.invalidate();
                        }
                        return true;
                    });
                },
                onChange: function (ctx, value) {
                    ctx.newValue = value;
                },
                data: ctx.data
            };
        };
        return EditingInput;
    })();
    TodoApp.EditingInput = EditingInput;
    var Footer = (function () {
        function Footer() {
        }
        Footer.render = function (ctx, me) {
            var itemsLeftInfo = this.createItemsLeftInfo(ctx);
            var filterButtons = this.createFilterButtons();
            var clearAllButton = this.createClearCompleted(ctx);
            me.tag = "div";
            me.attrs = { className: "footer" };
            me.children = [
                itemsLeftInfo,
                filterButtons,
                clearAllButton,
                {
                    tag: "div",
                    attrs: { className: "cleaner" }
                }
            ];
        };
        Footer.createItemsLeftInfo = function (ctx) {
            var itemsLeftCount = ctx.data.tasksCount - ctx.data.completedTasksCount;
            var text = itemsLeftCount === 1 ? itemsLeftCount + " item left" : itemsLeftCount + " items left";
            return {
                tag: "div",
                attrs: { className: "items-left-info" },
                children: text
            };
        };
        Footer.createFilterButtons = function () {
            return {
                tag: "div",
                attrs: { 'class': "filter" },
                children: [
                    b.link({ tag: "a", children: "All" }, "all"),
                    b.link({ tag: "a", children: "Active" }, "active"),
                    b.link({ tag: "a", children: "Completed" }, "completed")
                ]
            };
        };
        Footer.createClearCompleted = function (ctx) {
            var numberOfCompletedTasks = ctx.data.completedTasksCount;
            var text = "Clear completed (" + numberOfCompletedTasks + ")";
            var attributes = { className: "clear-completed-button" };
            if (numberOfCompletedTasks < 1) {
                attributes.className += " hidden";
            }
            return {
                tag: "div",
                attrs: attributes,
                children: text,
                component: {
                    onClick: function (ctx) {
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
    var KeyDownUpHandler = (function () {
        function KeyDownUpHandler() {
        }
        KeyDownUpHandler.prototype.handleEcsEnter = function (event, escapeHandler, enterHandler) {
            if (event.which === 27) {
                return escapeHandler();
            }
            else if (event.which === 13) {
                return enterHandler();
            }
            return false;
        };
        return KeyDownUpHandler;
    })();
    TodoApp.KeyDownUpHandler = KeyDownUpHandler;
})(TodoApp || (TodoApp = {}));
//# sourceMappingURL=components.js.map