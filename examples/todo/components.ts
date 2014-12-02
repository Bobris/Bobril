/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>

module TodoApp {

    export interface IDeleteButtonCtx {
        data: any;
    }

    export interface ICheckboxCtx {
        data: any;
    }

    export interface IListItemCtx {
        data: any;
    }

    export interface IAppCtx {
        data: ITaskListModel;
        currentNewTaskName: string;
    }

    export interface ITaskListModel {
        tasks: Tasks;
        filter: string;
    }

    export class App implements IBobrilComponent {
        static onNewTaskNameChange(ctx: IAppCtx, value: string) {
            ctx.currentNewTaskName = value;
            b.invalidate();
        }

        static init(ctx: IAppCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
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
                    onCurrentNewTaskNameChange: (value: string) => this.onNewTaskNameChange(ctx, value)
                }
                },
                {
                    component: TaskList, data: {
                    tasks: ctx.data.tasks
                }
                },
                { component: Footer, data: ctx.data }
            ];
        }
    }

    class Heading implements IBobrilComponent {
        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = 'h3';
            me.children = 'todos';
        }
    }

    interface ITaskCreateData {
        tasks: Tasks;
        currentNewTaskName: string;
        onCurrentNewTaskNameChange: (value: string) => void;
    }

    interface ITaskCreateCtx {
        data: ITaskCreateData;
    }

    class TaskCreate implements IBobrilComponent {
        static init(ctx: ITaskCreateCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = 'div';
            me.attrs = { className: 'input-wrapper' },
            me.children = [
                this.createInputElement(ctx),
                this.createSetAllCheckboxElement(ctx)
            ];
        }

        static createInputElement(ctx: ITaskCreateCtx): IBobrilNode {
            return {
                tag: 'input',
                attrs: {
                    placeholder: 'What needs to be done?',
                    className: 'task-name',
                    value: ctx.data.currentNewTaskName
                },
                data: ctx.data,
                component: {
                    onKeyUp: (ctx: ITaskCreateCtx, event: IKeyDownUpEvent): boolean => {
                        if (event.which == 13) { // enter
                            ctx.data.onCurrentNewTaskNameChange(ctx.data.currentNewTaskName.trim());
                            if (ctx.data.currentNewTaskName) {
                                ctx.data.tasks.addTask(ctx.data.currentNewTaskName);
                                b.invalidate();
                                ctx.data.onCurrentNewTaskNameChange('');
                            }
                            return true;
                        } else if (event.which == 27) { // escape
                            // cancel the task adding controls
                            ctx.data.onCurrentNewTaskNameChange('');
                            return true;
                        }
                        return false;
                    },

                    onChange: (ctx: ITaskCreateCtx, value: string) => {
                        ctx.data.onCurrentNewTaskNameChange(value);
                    },

                    postInitDom: (ctx: Object, me: IBobrilNode, element: HTMLElement) => {
                        element.focus();
                    }
                }
            };
        }

        static createSetAllCheckboxElement(ctx: ITaskCreateCtx): IBobrilNode {
            return {
                tag: 'input',
                attrs: {
                    type: 'checkbox',
                    className: 'set-all-tasks',
                    value: ctx.data.tasks.getItemsCount() > 0 && ctx.data.tasks.isWholeListCompleted()
                },
                data: ctx.data.tasks,
                component: {
                    onChange: (ctx: { data: Tasks }, value: string) => {
                        if (value) {
                            ctx.data.markAllTasksAsCompleted();
                        } else {
                            ctx.data.markAllTasksAsActive();
                        }
                        b.invalidate();
                    }
                }
            };
        }

    }

    interface ITaskListData {
        tasks: Tasks;
        filter: string;
    }

    interface ITaskListCtx {
        data: ITaskListData;
    }

    class TaskList implements IBobrilComponent {
        static init(ctx: ITaskListCtx, me: IBobrilNode): void {
            me.tag = 'ul';
            me.attrs = {
                className: 'todo-list'
            },
            me.children = this.createTaskElements(ctx);
        }

        static createTaskElements(ctx: ITaskListCtx): Array<IBobrilNode> {
            var res: Array<IBobrilNode> = [];
            var tasks = ctx.data.tasks.getFilteredItems();
            for (var i = 0; i < tasks.length; i++) {
                var taskName = tasks[i].name;
                var taskId = tasks[i].id;
                var classes = 'task';
                if (tasks[i].completed) classes += ' completed';
                var labelClasses: string = '';
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
                        onDoubleClick: (ctx: { data: { tasks: Tasks; taskId:number }}): boolean => {
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
        }

        static createCheckboxElement(ctx: ITaskListCtx, taskId: number): IBobrilNode {
            var attributes: any = { 'type': 'checkbox', 'class': 'mark-as-completed' };
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
                    onChange: (ctx: ICheckboxCtx, value: string) => {
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
        }

        static createDeleteButtonElement(ctx: ITaskListCtx, taskId: number): IBobrilNode {
            var attributes: any = { 'class': 'delete-button' };
            if (model.tasks.isInEditMode(taskId)) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'a',
                children: 'delete',
                attrs: attributes,
                component: {
                    onClick: (ctx: IDeleteButtonCtx, event: IMouseEvent): boolean => {
                        model.tasks.removeTask(ctx.data.taskId);
                        b.invalidate();
                        return true;
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        }

        static createEditingInputElement(ctx: ITaskListCtx, taskId: number, taskName: string): IBobrilNode {
            var isInEditMode = model.tasks.isInEditMode(taskId);
            var attributes: any = { 'type': 'text', 'class': 'task-edit', 'value': taskName };
            if (!isInEditMode) {
                attributes['class'] += ' hidden';
            }
            return [
                {
                    tag: 'input',
                    attrs: attributes,
                    data: ctx.data,
                    component: {
                        onKeyUp: (ctx: Object, event: IKeyDownUpEvent) => {
                            if (event.which == 13) { // enter
                                model.currentEditTaskName = model.currentEditTaskName.trim();
                                if (model.currentEditTaskName) {
                                    model.tasks.setTaskName(taskId, model.currentEditTaskName);
                                    model.currentEditTaskName = '';
                                    model.tasks.setTaskEditMode(taskId, false);
                                    b.invalidate();
                                }
                            } else if (event.which == 27) { // escape
                                model.tasks.setTaskEditMode(taskId, false);
                                b.invalidate();
                            }
                        },
                        onChange: (ctx: ITaskListCtx, value: string) => {
                            model.currentEditTaskName = value;
                        }
                    }
                },
                {
                    tag: 'div',
                    attrs: { 'class': 'cleaner' }
                }];
        }
    }

    class Footer implements IBobrilComponent {
        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var model = oldMe ? oldMe.data : me.data;
            model.tasks.setFilter(me.data.filter);

            var itemsLeftInfo = this.createItemsLeftInfo(model);
            var filterButtons = this.createFilterButtons(model);
            var clearAllButton = this.createClearCompleted(model);

            var attributes: IBobrilAttributes = { 'class': 'footer' };
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
        }

        static createItemsLeftInfo(model: ITaskListModel): IBobrilNode {
            var itemsLeftCount = model.tasks.getItemsCount() - model.tasks.getNumberOfCompletedTasks();
            var text = itemsLeftCount === 1
                ? itemsLeftCount + ' item left'
                : itemsLeftCount + ' items left';
            return {
                tag: 'div',
                attrs: { 'class': 'items-left-info' },
                children: text
            };
        }

        static createFilterButtons(model: ITaskListModel): IBobrilNode {
            return {
                tag: 'div',
                attrs: { 'class': 'filter' },
                children: [
                    b.link({ tag: 'a', children: 'All' }, 'all'),
                    b.link({ tag: 'a', children: 'Active' }, 'active'),
                    b.link({ tag: 'a', children: 'Completed' }, 'completed')
                ]
            };
        }

        static createClearCompleted(model: ITaskListModel): IBobrilNode {
            var numberOfCompletedTasks = model.tasks.getNumberOfCompletedTasks()
            var text = 'Clear completed (' + model.tasks.getNumberOfCompletedTasks() + ')';
            var attributes: any = { 'class': 'clear-completed-button' };
            if (numberOfCompletedTasks < 1) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'div',
                attrs: attributes,
                children: text,
                component: {
                    onClick: (ctx: Object, event: IMouseEvent): boolean => {
                        model.tasks.removeCompletedTasks();
                        b.invalidate();
                        return false;
                    }
                }
            };
        }
    }
}