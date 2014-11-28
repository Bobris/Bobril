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

    export class TaskList implements IBobrilComponent {

        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
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
            ]
        }

        static createHeadingElement() {
            return {
                    tag: 'h3',
                    children: 'todos'
                };
        }

        static createSetAllCheckboxElement(model: ITaskListModel) {
            var attributes = { 'type': 'checkbox', 'class': 'set-all-tasks' };
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

        static createInputElement(model: ITaskListModel) {
            var inputAttributes = {
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
                    onKeyUp: (ctx: Object, event: IKeyDownUpEvent) => {
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
                    },
                    onChange: (ctx: Object, value: string) => {
                        model.currentNewTaskName = value;
                    }
                }
            };
        }

        static createHintElement(model: ITaskListModel) {
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
        }

        static createTaskElements(model: ITaskListModel) {
            var res = {
                tag: 'ul',
                attrs: { 'class': 'todo-list'},
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
                } else {
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
                            onDoubleClick: (ctx: IListItemCtx, event: IMouseEvent) => {
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
        }


        static createCheckboxElement(model: ITaskListModel, taskId: number) {
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

        static createDeleteButtonElement(model: ITaskListModel, taskId: number) {
            var attributes = { 'class': 'delete-button', 'href': 'javascript: void(0);' };
            if (model.tasks.isInEditMode(taskId)) {
                attributes['class'] += ' hidden';
            }
            return {
                tag: 'a',
                children: 'delete',
                attrs: attributes,
                component: {
                    onClick: (ctx: IDeleteButtonCtx, event: IMouseEvent) => {
                        model.tasks.removeTask(ctx.data.taskId);
                        b.invalidate();
                    }
                },
                data: {
                    'taskId': taskId
                }
            }
        }

        static createEditingInputElement(model: ITaskListModel, taskId: number, taskName: string) {
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

        static createFooterElements(model: ITaskListModel) {
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
        }

        static createItemsLeftInfo(model: ITaskListModel) {
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

        static createFilterButtons(model: ITaskListModel) {
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

        static createClearCompleted(model: ITaskListModel) {
            var numberOfCompletedTasks = model.tasks.getNumberOfCompletedTasks()
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
                    onClick: (ctx: Object, event: IMouseEvent) => {
                        model.tasks.removeCompletedTasks();
                        b.invalidate();
                    }
                }
            };
        }
    }
}