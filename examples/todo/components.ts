/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.router.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>

module TodoApp {

    interface IDeleteButtonCtx {
        data: any;
    }

    interface ICheckboxCtx {
        data: any;
    }

    interface IListItemCtx {
        data: any;
    }

    interface ITaskListCtx {
        data: ITaskListModel;
    }

    interface ITaskListModel {
        tasks: Tasks;
        currentNewTaskName: string;
        currentEditTaskName: string;
        filter: string;
    }

    export class App implements IBobrilComponent {
        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            me.tag = 'div';
            me.attrs = { 'class': 'main' };
            me.data = ctx.data,
            me.children = [
                { component: Heading },
                { component: TaskCreate, data: ctx.data },
                { component: TaskList, data: ctx.data },
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

    class TaskCreate implements IBobrilComponent {
        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var model = oldMe ? oldMe.data : me.data;
            me.tag = 'div';
            me.attrs = { 'class': 'input-wrapper' },
            me.children = [
                    this.createInputElement(model),
                    this.createSetAllCheckboxElement(model)
                ];
        }

        static createInputElement(model: ITaskListModel): IBobrilNode {
            var inputAttributes: any = {
                    'placeholder': 'What needs to be done?',
                    'class': 'task-name',
                    'autofocus': 'a'
                };
            if (model.currentNewTaskName) {
                inputAttributes['value'] = model.currentNewTaskName;
            } else {
                inputAttributes['value'] = '';
            }
            return {
                tag: 'input',
                attrs: inputAttributes,
                component: {
                    onKeyUp: (ctx: Object, event: IKeyDownUpEvent): boolean => {
                        if (event.which == 13) { // enter
                            model.currentNewTaskName = model.currentNewTaskName.trim();
                            if (model.currentNewTaskName) {
                                model.tasks.addTask(model.currentNewTaskName);
                                model.currentNewTaskName = '';
                                b.invalidate();
                            }
                        } else if (event.which == 27) { // escape
                            // cancel the task adding controls
                            model.currentNewTaskName = '';
                            b.invalidate();
                        }
                        return false;
                    },
                    onChange: (ctx: Object, value: string) => {
                        model.currentNewTaskName = value;
                    }
                }
            };
        }

        static createSetAllCheckboxElement(model: ITaskListModel): IBobrilNode {
            var attributes: any = { 'type': 'checkbox', 'class': 'set-all-tasks' };
            if (model.tasks.getItemsCount() > 0 && model.tasks.isWholeListCompleted()) {
                attributes['checked'] = 'checked';
            }
            return {
                tag: 'input',
                attrs: attributes,
                component: {
                    onChange: (ctx: ITaskListCtx, value: string) => {
                        if (value) {
                            model.tasks.markAllTasksAsCompleted();
                            b.invalidate();
                        } else {
                            model.tasks.markAllTasksAsActive();
                            b.invalidate();
                        }
                    }
                }
            };
        }

    }

    class TaskList implements IBobrilComponent {
        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var model = oldMe ? oldMe.data : me.data;
            model.tasks.setFilter(me.data.filter);

            me.tag = 'ul';
            me.attrs = { 'class': 'todo-list'},
            me.children = this.createTaskElements(model);
        }

        static createTaskElements(model: ITaskListModel): Array<IBobrilNode> {
            var res: Array<IBobrilNode> = [];
            var tasks = model.tasks.getFilteredItems();
            for (var i = 0; i < tasks.length; i++) {
                var taskName = tasks[i].name;
                var taskId = tasks[i].id;
                var classes = 'task';
                if (model.tasks.isTaskCompleted(taskId)) {
                    classes += ' completed';
                }
                var labelClasses: string = '';
                if (model.tasks.isInEditMode(taskId)) {
                    labelClasses += 'hidden';
                } else {
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
                            onDoubleClick: (ctx: IListItemCtx, event: IMouseEvent): boolean => {
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
        }

        static createCheckboxElement(model: ITaskListModel, taskId: number): IBobrilNode {
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
                data: {
                    'taskId': taskId
                }
            };
        }

        static createDeleteButtonElement(model: ITaskListModel, taskId: number): IBobrilNode {
            var attributes: any = { 'class': 'delete-button', 'href': 'javascript: void(0);' };
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
                        return false;
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        }

        static createEditingInputElement(model: ITaskListModel, taskId: number, taskName: string): IBobrilNode {
            var isInEditMode = model.tasks.isInEditMode(taskId);
            var attributes: any = { 'type': 'text', 'class': 'task-edit', 'value': taskName };
            if (!isInEditMode) {
                attributes['class'] += ' hidden';
            }
            return [
                { 
                    tag: 'input', 
                    attrs: attributes,
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
                attrs: { 'class': 'filter'},
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