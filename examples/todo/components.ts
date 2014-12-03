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
        filter: string;
    }

    export interface IAppCtx {
        data: ITaskListModel;
        newTaskName: string;
    }

    export class App implements IBobrilComponent {
        static onNewTaskNameChange(ctx: IAppCtx, value: string) {
            ctx.newTaskName = value;
            b.invalidate();
        }

        static init(ctx: IAppCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
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
                        onNewTaskNameChange: (value: string) => this.onNewTaskNameChange(ctx, value)
                    }
                },
                {
                    component: TaskList, 
                    data: {
                        tasks: ctx.data.tasks,
                        // filter: ctx.data.filter
                    }
                },
                { 
                    component: Footer,
                    data: {
                        tasksCount: ctx.data.tasks.getItemsCount(),
                        completedTasksCount: ctx.data.tasks.getNumberOfCompletedTasks(),
                        removeCompletedTasks: () => {
                            ctx.data.tasks.removeCompletedTasks();
                        }
                    }
                }
            ];
        }
    }

    class Heading implements IBobrilComponent {
        static init(ctx: Object, me: IBobrilNode): void {
            me.tag = 'h3';
            me.children = 'todos';
        }
    }

    interface ITaskCreateData {
        tasks: Tasks;
        newTaskName: string;
        onNewTaskNameChange: (value: string) => void;
    }

    interface ITaskCreateCtx {
        data: ITaskCreateData;
    }

    class TaskCreate implements IBobrilComponent {
        static init(ctx: ITaskCreateCtx, me: IBobrilNode): void {
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
                    value: ctx.data.newTaskName
                },
                component: {
                    onKeyUp: (ctx: ITaskCreateCtx, event: IKeyDownUpEvent): boolean => {
                        if (event.which == 13) { // enter
                            ctx.data.onNewTaskNameChange(ctx.data.newTaskName.trim());
                            if (ctx.data.newTaskName) {
                                ctx.data.tasks.addTask(ctx.data.newTaskName);
                                b.invalidate();
                                ctx.data.onNewTaskNameChange('');
                            }
                            return true;
                        } else if (event.which == 27) { // escape
                            // cancel the task adding controls
                            ctx.data.onNewTaskNameChange('');
                            return true;
                        }
                        return false;
                    },

                    onChange: (ctx: ITaskCreateCtx, value: string) => {
                        ctx.data.onNewTaskNameChange(value);
                    },
                    postInitDom: (ctx: Object, me: IBobrilNode, element: HTMLElement) => {
                        element.focus();
                    },
                    postUpdateDom: (ctx: Object, me: IBobrilNode, element: HTMLElement) => {
                    }
                },
                data: ctx.data
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
                component: {
                    onChange: (ctx: { data: Tasks }, value: string) => {
                        if (value) {
                            ctx.data.markAllTasksAsCompleted();
                        } else {
                            ctx.data.markAllTasksAsActive();
                        }
                        b.invalidate();
                    }
                },
                data: ctx.data.tasks
            };
        }
    }

    interface ITaskListData {
        tasks: Tasks;
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
            var taskItems = ctx.data.tasks.getFilteredItems();
            var tasks = ctx.data.tasks;

            for (var i = 0; i < taskItems.length; i++) {
                var taskName = taskItems[i].name;
                var taskId = taskItems[i].id;

                var classes = 'task';
                if (taskItems[i].completed) classes += ' completed';
                var labelClasses: string = '';
                if (taskItems[i].isInEditMode) {
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
                        {
                            component: Checkbox,
                            data: {
                                taskId: taskId,
                                isTaskCompleted: tasks.isTaskCompleted(taskId),
                                performCheck: (taskId) => {
                                    tasks.markTaskAsCompleted(taskId);
                                    b.invalidate();
                                },
                                performUncheck: (taskId) => {
                                    tasks.markTaskAsActive(taskId);
                                    b.invalidate();
                                },
                            }
                        },
                        { tag: 'label', children: taskName, attrs: { className: labelClasses } },
                        {
                            component: DeleteButton,
                            data: {
                                taskId: taskId,
                                isInEditMode: tasks.isInEditMode(taskId),
                                performDelete: (taskId: number) => {
                                    tasks.removeTask(taskId);
                                    b.invalidate();
                                }
                            }
                        }
                        // ! tasks.isInEditMode(taskId) 
                        //     ? null
                        //     : { 
                        //         component: EditingInput, 
                        //         data: {
                        //             taskId: taskId,
                        //             oldValue: taskName,
                        //             newValue: '',
                        //             saveNewValue: (taskId, value) => {
                        //                 tasks.setTaskName(taskId, value);
                        //                 tasks.setTaskEditMode(taskId, false);
                        //                 b.invalidate();
                        //             },
                        //             cancelNewValue: (taskId) => {
                        //                 tasks.setTaskEditMode(taskId, false);
                        //                 b.invalidate();
                        //             }
                        //         }
                        //     }
                    ],
                    component: {
                        // onDoubleClick: (ctx: { data: { tasks: Tasks; taskId:number }}): boolean => {
                        //     ctx.data.tasks.setTaskEditMode(ctx.data.taskId, true);
                        //     b.invalidate();
                        //     return true;
                        // }
                    },
                    data: {
                        tasks: ctx.data.tasks,
                        taskId: taskId
                    }
                });
            }

            return res;
        }
    }

    interface ICheckboxData {
        taskId: number;
        isTaskCompleted: boolean;
        performCheck: (taskId: number) => void;
        performUncheck: (taskId: number) => void;
    }

    interface ICheckboxCtx {
        data: ICheckboxData;
    }

    export class Checkbox implements IBobrilComponent {
        static init(ctx: ICheckboxCtx, me: IBobrilNode) {
            var attributes: any = { 'type': 'checkbox', 'class': 'mark-as-completed' };
            if (ctx.data.isTaskCompleted) {
                attributes['checked'] = 'checked';
            }
            me.tag = 'input';
            me.attrs = attributes;
            me.data = ctx.data;
        }

        static onChange(ctx: ICheckboxCtx, value: string) {
            if (value) {
                ctx.data.performCheck(ctx.data.taskId);
            } else {
                ctx.data.performUncheck(ctx.data.taskId);
            }
        }
    }

    interface IDeleteButtonData {
        taskId: number;
        isInEditMode: boolean;
        performDelete: (taskId: number) => void;
    }

    interface IDeleteButtonCtx {
        data: IDeleteButtonData;
    }

    export class DeleteButton implements IBobrilComponent {
        static init(ctx: IDeleteButtonCtx, me: IBobrilNode) {
            if (ctx.data.isInEditMode) {
                return null;
            }
            
            me.tag = 'a';
            me.children = 'delete';
            me.attrs = { className: 'delete-button' };
            me.data = ctx.data;
        }

        static onClick(ctx: IDeleteButtonCtx, event: IMouseEvent) {
            ctx.data.performDelete(ctx.data.taskId);
            return true;
        }
    }

    interface IEditingInputData {
        taskId: number;
        oldValue: string;
        newValue: string;
        saveNewValue: (taskId: number, value: string) => void;
        cancelNewValue: (taskId: number) => void;
    }

    interface IEditingInputCtx {
        data: IEditingInputData
    }

    class EditingInput implements IBobrilComponent {
        static init(ctx: IEditingInputCtx, me: IBobrilNode) {
            me.tag = 'input';
            me.attrs = { type: 'text', className: 'task-edit', value: ctx.data.oldValue };
            me.component = {
                onKeyUp: (ctx: IEditingInputCtx, event: IKeyDownUpEvent): boolean => {
                    if (event.which == 13) { // enter
                        ctx.data.newValue = ctx.data.newValue.trim();
                        if (ctx.data.newValue) {
                            ctx.data.saveNewValue(ctx.data.taskId, ctx.data.newValue);

                            ctx.data.newValue = '';
                        }
                        return true;
                    } else if (event.which == 27) { // escape
                        ctx.data.cancelNewValue(ctx.data.taskId);
                        return true;
                    }
                    return false;
                },
                onChange: (ctx: IEditingInputCtx, value: string) => {
                    ctx.data.newValue = value;
                },
                data: ctx.data
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

    class Footer implements IBobrilComponent {
        static init(ctx: IFooterCtx, me: IBobrilNode): void {
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
        }

        static createItemsLeftInfo(ctx: IFooterCtx): IBobrilNode {
            var itemsLeftCount = ctx.data.tasksCount - ctx.data.completedTasksCount;
            var text = itemsLeftCount === 1
                ? itemsLeftCount + ' item left'
                : itemsLeftCount + ' items left';
            return {
                tag: 'div',
                attrs: { 'class': 'items-left-info' },
                children: text
            };
        }

        static createFilterButtons(): IBobrilNode {
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

        static createClearCompleted(ctx: IFooterCtx): IBobrilNode {
            var numberOfCompletedTasks = ctx.data.completedTasksCount;
            var text = 'Clear completed (' + numberOfCompletedTasks + ')';
            var attributes: any = { 'class': 'clear-completed-button' };
            if (numberOfCompletedTasks < 1) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'div',
                attrs: attributes,
                children: text,
                component: {
                    onClick: (ctx: IFooterCtx, event: IMouseEvent): boolean => {
                        ctx.data.removeCompletedTasks();
                        b.invalidate();
                        return true;
                    }
                },
                data: ctx.data
            };
        }
    }
}