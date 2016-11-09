/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>

module TodoApp {

    export interface ITaskListModel {
        tasks: Tasks;
        // have to be here because there is no way to pass view-model separately
        filter: string;
    }

    export interface IAppCtx {
        // model
        data: ITaskListModel;
        // view-model
        filter: string;
    }

    export var App: IBobrilComponent = {
        render(ctx: IAppCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            ctx.filter = ctx.data.filter;
            me.tag = "div";
            me.className = "main";
            me.children = [
                {
                    component: Heading
                },
                {
                    component: TaskCreate,
                    data: {
                        isWholeListCompleted: ctx.data.tasks.getItemsCount() > 0 && ctx.data.tasks.isWholeListCompleted(),
                        addNewTask(name: string) {
                            ctx.data.tasks.addTask(name);
                        },
                        markAllTasksAsCompleted() {
                            ctx.data.tasks.markAllTasksAsCompleted();
                        },
                        markAllTasksAsActive() {
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
                        removeCompletedTasks() {
                            ctx.data.tasks.removeCompletedTasks();
                        }
                    }
                }
            ];
        }
    }

    var Heading: IBobrilComponent = {
        init(ctx: Object, me: IBobrilNode): void {
            me.tag = "h3";
            me.children = "todos";
        }
    }

    interface ITaskCreateData {
        isWholeListCompleted: boolean;
        addNewTask: (name: string) => void;
        markAllTasksAsCompleted: () => void;
        markAllTasksAsActive: () => void;
    }

    interface ITaskCreateCtx {
        data: ITaskCreateData;
        newTaskName: string;
    }

    interface ISetAllCheckboxCtx {
        data: {
            markAllTasksAsCompleted: () => void;
            markAllTasksAsActive: () => void;
        }
    }

    function createInputElement(ctx: ITaskCreateCtx): IBobrilNode {
        return {
            tag: "input",
            className: "task-name",
            attrs: {
                placeholder: "What needs to be done?",
                value: ctx.newTaskName
            },
            component: {
                onKeyUp(ctx: ITaskCreateCtx, event: IKeyDownUpEvent): boolean {
                    var handler = new KeyDownUpHandler();
                    return handler.handleEcsEnter(
                        event,
                        () => {
                            // cancel the task adding controls (i.e. clear the input)
                            ctx.newTaskName = "";
                            b.invalidate();
                            return true;
                        },
                        () => {
                            ctx.newTaskName = ctx.newTaskName.trim();
                            if (ctx.newTaskName) {
                                ctx.data.addNewTask(ctx.newTaskName);
                                b.invalidate();
                                ctx.newTaskName = "";
                            }
                            return true;
                        });
                },
                onChange(ctx: ITaskCreateCtx, value: string): boolean {
                    ctx.newTaskName = value;
                    return true;
                },
                postInitDom(ctx: Object, me: IBobrilNode, element: HTMLElement) {
                    element.focus();
                }
            },
            data: ctx.data
        };
    }

    function createSetAllCheckboxElement(ctx: ITaskCreateCtx): IBobrilNode {
        return {
            tag: "input",
            className: "set-all-tasks",
            attrs: {
                type: "checkbox",
                value: ctx.data.isWholeListCompleted
            },
            component: {
                onChange(ctx: ISetAllCheckboxCtx, value: string) {
                    if (value) {
                        ctx.data.markAllTasksAsCompleted();
                    } else {
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
    }

    var TaskCreate: IBobrilComponent = {
        render(ctx: ITaskCreateCtx, me: IBobrilNode): void {
            ctx.newTaskName = ctx.newTaskName || "";
            me.tag = "div";
            me.className = "input-wrapper";
            me.children = [
                createInputElement(ctx),
                createSetAllCheckboxElement(ctx)
            ];
        }
    }

    interface ITaskListData {
        tasks: Tasks;
        filter: string;
    }

    interface ITaskListCtx {
        data: ITaskListData;
        editingTaskId: number;
    }

    function createTaskElements(ctx: ITaskListCtx): Array<IBobrilNode> {
        var res: Array<IBobrilNode> = [];
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
                    cancelNewValue() { ctx.editingTaskId = -1; },
                    saveNewValue(taskId: number, value: string) { tasks.setTaskName(taskId, value); ctx.editingTaskId = -1; },
                    markTaskAsCompleted(taskId: number) { tasks.markTaskAsCompleted(taskId); },
                    markTaskAsActive(taskId: number) { tasks.markTaskAsActive(taskId); },
                    setEditingMode(taskId: number) { ctx.editingTaskId = taskId; },
                    removeTask(taskId: number) { tasks.removeTask(taskId); }
                }
            });
        }
        return res;
    }

    var TaskList: IBobrilComponent = {
        init(ctx: ITaskListCtx, me: IBobrilNode): void {
            ctx.editingTaskId = -1;
        },
        render(ctx: ITaskListCtx, me: IBobrilNode): void {
            me.tag = "ul";
            me.className = "todo-list";
            me.children = createTaskElements(ctx);
        }
    }

    export interface ITaskItemData {
        id: number;
        name: string;
        completed: boolean;
        justEditing: boolean;
        cancelNewValue: () => void;
        saveNewValue: (taskId: number, value: string) => void;
        markTaskAsCompleted: (taskId: number) => void;
        markTaskAsActive: (taskId: number) => void;
        setEditingMode: (taskId: number) => void;
        removeTask: (taskId: number) => void;
    }

    export interface ITaskItemCtx {
        data: ITaskItemData;
    }

    export var TaskItem: IBobrilComponent = {
        render(ctx: ITaskItemCtx, me: IBobrilNode): void {
            var liClasses = "task";
            var labelClasses: string = "";
            if (ctx.data.completed) {
                liClasses += " completed";
            }
            if (ctx.data.justEditing) {
                labelClasses = "hidden";
            } else {
                liClasses += " readonly";
            }
            me.tag = "li";
            me.className = liClasses;
            me.children = [
                ctx.data.justEditing || {
                    component: Checkbox,
                    data: {
                        taskId: ctx.data.id,
                        isChecked: ctx.data.completed,
                        performCheck(taskId: number) {
                            ctx.data.markTaskAsCompleted(taskId);
                            b.invalidate();
                        },
                        performUncheck(taskId: number) {
                            ctx.data.markTaskAsActive(taskId);
                            b.invalidate();
                        }
                    }
                },
                { tag: "label", children: ctx.data.name, className: labelClasses },
                {
                    component: DeleteButton,
                    data: {
                        taskId: ctx.data.id,
                        invisible: ctx.data.justEditing,
                        performDelete(taskId: number) {
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
                        saveNewValue(taskId: number, value: string) {
                            ctx.data.saveNewValue(taskId, value);
                            b.invalidate();
                        },
                        cancelNewValue() {
                            ctx.data.cancelNewValue();
                            b.invalidate();
                        }
                    }
                },
                { tag: "div", className: "cleaner" }
            ];
        },

        onDoubleClick(ctx: ITaskItemCtx): boolean {
            ctx.data.setEditingMode(ctx.data.id);
            b.invalidate();
            return true;
        }
    }

    export interface ICheckboxData {
        taskId: number;
        isChecked: boolean;
        performCheck: (taskId: number) => void;
        performUncheck: (taskId: number) => void;
    }

    export interface ICheckboxCtx {
        data: ICheckboxData;
    }

    export var Checkbox: IBobrilComponent = {
        render(ctx: ICheckboxCtx, me: IBobrilNode): void {
            me.tag = "input";
            me.className = "mark-as-completed";
            me.attrs = { type: "checkbox", value: ctx.data.isChecked };
            me.data = ctx.data;
        },

        onChange(ctx: ICheckboxCtx, value: string) {
            if (value) {
                ctx.data.performCheck(ctx.data.taskId);
            } else {
                ctx.data.performUncheck(ctx.data.taskId);
            }
        }
    }

    export interface IDeleteButtonData {
        taskId: number;
        performDelete: (taskId: number) => void;
    }

    export interface IDeleteButtonCtx {
        data: IDeleteButtonData;
    }

    export var DeleteButton: IBobrilComponent = {
        render(ctx: IDeleteButtonCtx, me: IBobrilNode): void {
            me.tag = "a";
            me.children = "delete";
            me.className = "delete-button";
        },

        onClick(ctx: IDeleteButtonCtx) {
            ctx.data.performDelete(ctx.data.taskId);
            return true;
        }
    }

    export interface IEditingInputData {
        taskId: number;
        oldValue: string;
        saveNewValue: (taskId: number, value: string) => void;
        cancelNewValue: () => void;
    }

    export interface IEditingInputCtx {
        data: IEditingInputData;
        newValue: string;
    }

    export var EditingInput: IBobrilComponent = {
        render(ctx: IEditingInputCtx, me: IBobrilNode): void {
            ctx.newValue = ctx.newValue || "";
            me.tag = "input";
            me.className = "task-edit";
            me.attrs = { type: "text", value: ctx.data.oldValue };
            me.component = {
                onKeyUp(ctx: IEditingInputCtx, event: IKeyDownUpEvent): boolean {
                    var handler = new KeyDownUpHandler();
                    return handler.handleEcsEnter(
                        event,
                        () => {
                            ctx.data.cancelNewValue();
                            ctx.newValue = "";
                            b.invalidate();
                            return true;
                        },
                        () => {
                            ctx.newValue = ctx.newValue.trim();
                            if (ctx.newValue) {
                                ctx.data.saveNewValue(ctx.data.taskId, ctx.newValue);
                                ctx.newValue = "";
                                b.invalidate();
                            }
                            return true;
                        });
                },
                onChange(ctx: IEditingInputCtx, value: string) {
                    ctx.newValue = value;
                }
            }
        }
    }


    interface IFooterData {
        tasksCount: number;
        completedTasksCount: number;
        removeCompletedTasks: () => void;
    }


    interface IFooterCtx {
        data: IFooterData;
    }

    function createItemsLeftInfo(ctx: IFooterCtx): IBobrilNode {
        var itemsLeftCount = ctx.data.tasksCount - ctx.data.completedTasksCount;
        var text = itemsLeftCount === 1
            ? itemsLeftCount + " item left"
            : itemsLeftCount + " items left";
        return {
            tag: "div",
            className: "items-left-info",
            children: text
        };
    }

    function createFilterButtons(): IBobrilNode {
        return {
            tag: "div",
            className: "filter",
            children: [
                b.link({ tag: "a", children: "All" }, "all"),
                b.link({ tag: "a", children: "Active" }, "active"),
                b.link({ tag: "a", children: "Completed" }, "completed")
            ]
        };
    }

    function createClearCompleted(ctx: IFooterCtx): IBobrilNode {
        var numberOfCompletedTasks = ctx.data.completedTasksCount;
        var text = "Clear completed (" + numberOfCompletedTasks + ")";
        var className = "clear-completed-button";
        if (numberOfCompletedTasks < 1) {
            className += " hidden";
        }
        return {
            tag: "div",
            className: className,
            children: text,
            component: {
                onClick(ctx: IFooterCtx): boolean {
                    ctx.data.removeCompletedTasks();
                    b.invalidate();
                    return true;
                }
            },
            data: ctx.data
        };
    }

    var Footer: IBobrilComponent = {
        render(ctx: IFooterCtx, me: IBobrilNode): void {
            var itemsLeftInfo = createItemsLeftInfo(ctx);
            var filterButtons = createFilterButtons();
            var clearAllButton = createClearCompleted(ctx);

            me.tag = "div";
            me.className = "footer";
            me.children = [
                itemsLeftInfo,
                filterButtons,
                clearAllButton,
                {
                    tag: "div",
                    className: "cleaner"
                }
            ];
        }
    }

    export class KeyDownUpHandler {
        public handleEcsEnter(event: IKeyDownUpEvent, escapeHandler: () => boolean, enterHandler: () => boolean): boolean {
            if (event.which === 27) { // escape
                return escapeHandler();
            } else if (event.which === 13) { // enter
                return enterHandler();
            }
            return false;
        }
    }
}
