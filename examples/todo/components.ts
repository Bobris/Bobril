/// <reference path="../../src/bobril.d.ts"/>
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

    interface ITaskListCtx {
        data: ITaskListModel;
    }

    interface ITaskListModel {
        tasks: Tasks;
        currentTaskName: string;
    }

    export class TaskList implements IBobrilComponent {

        static init(ctx: ITaskListCtx, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var model = oldMe ? oldMe.data : me.data;
            var heading = this.createHeadingElement();
            var checkbox = this.createSetAllCheckboxElement(model);
            var input = this.createInputElement(model);
            var hint = this.createHintElement(model);
            var todoList = this.createTaskElements(model);

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
                // hint,
                todoList
            ]
        }

        static createHeadingElement() {
            return {
                    tag: 'h3',
                    children: 'Todos'
                };
        }

        static createSetAllCheckboxElement(model: ITaskListModel) {
            var attributes = { 'type': 'checkbox', 'class': 'set-all-tasks' };
            if (model.tasks.items.length > 0 && model.tasks.isWholeListCompleted()) {
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
            if (model.currentTaskName) {
                inputAttributes['value'] = model.currentTaskName;
            } else {
                inputAttributes['value'] = '';
            }
            return {
                tag: 'input',
                attrs: inputAttributes,
                component: {
                    onKeyUp: (ctx: Object, event: IKeyDownUpEvent) => {
                        if (event.which == 13) { // enter
                            model.currentTaskName = model.currentTaskName.trim();
                            if (model.currentTaskName) {
                                model.tasks.addTask(model.currentTaskName);
                                model.currentTaskName = '';
                                b.invalidate();
                            }
                        } else if (event.which == 27) { // escape
                            // cancel the task adding controls
                            model.currentTaskName = '';
                            b.invalidate();
                        }
                    },
                    onChange: (ctx: Object, value: string) => {
                        model.currentTaskName = value;
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
            for (var i = 0; i < model.tasks.items.length; i++) {
                var taskName = model.tasks.items[i].name;
                var taskId = model.tasks.items[i].id;
                var classes = 'task';
                if (model.tasks.items[i].completed) {
                    classes += ' completed';
                }

                res.children.push({
                        tag: 'li',
                        attrs: {
                            'class': classes
                        },
                        children: [
                            this.createCheckboxElement(model, taskId),
                            { tag: 'label', children: taskName },
                            this.createDeleteButtonElement(model, taskId)
                        ]
                    });
            }
            return res;
        }

        static createCheckboxElement(model: ITaskListModel, taskId: number) {
            var attributes = { 'type': 'checkbox', 'class': 'mark-as-completed' };
            if (model.tasks.isTaskCompleted(taskId)) {
                attributes['checked'] = 'checked';
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
            return {
                tag: 'a',
                children: 'delete',
                attrs: {
                    'class': 'delete-button',
                    'href': 'javascript: void(0);'
                },
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
    }
}