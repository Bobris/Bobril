/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>

module MouseEnterLeaveApp {

    interface IDeleteButtonCtx {
        data: any;
    }

    export class TaskList implements IBobrilComponent {

        // model
        static tasks: Tasks = new Tasks();
        static currentTaskName: string;

        static init(ctx: Object, me: IBobrilNode, oldMe?: IBobrilCacheNode): void {
            var heading = this.createHeadingElement();
            var input = this.createInputElement();
            var hint = this.createHintElement();
            var componentChilden = this.createTaskElements();
            componentChilden.unshift(hint);
            componentChilden.unshift(input);
            componentChilden.unshift(heading);

            me.tag = 'div';
            me.attrs = { 'class': 'main' };
            me.children = componentChilden;
        }

        static createHeadingElement() {
            return [
                {
                    tag: 'h3',
                    children: 'Todos'
                }
            ];
        }

        static createInputElement() {
            var inputAttributes = {
                    'placeholder': 'What needs to be done',
                    'class': 'task-name'
                };
            if (this.currentTaskName) {
                inputAttributes['value'] = this.currentTaskName;
            } else {
                inputAttributes['value'] = '';
            }
            return {
                tag: 'input',
                attrs: inputAttributes,
                component: {
                    onKeyUp: (ctx: Object, event: IKeyDownUpEvent) => {
                        if (event.which == 13) { // enter
                            this.tasks.addTask(this.currentTaskName);
                            this.currentTaskName = '';
                            b.invalidate();
                        } else if (event.which == 27) { // escape
                            // cancel the task adding controls
                            this.currentTaskName = '';
                            b.invalidate();
                        }
                    },
                    onChange: (ctx: Object, value: string) => {
                        this.currentTaskName = value;
                    }
                }
            };
        }

        static createHintElement() {
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

        static createTaskElements() {
            var res = [];
            for (var i = 0; i < this.tasks.items.length; i++) {
                var taskName = this.tasks.items[i].name;
                var taskId = this.tasks.items[i].id;

                res.push({
                        tag: 'div',
                        attrs: {
                            'class': 'task'
                        },
                        children: [
                            this.createCheckboxElement(),
                            taskName,
                            this.createDeleteButtonElement(taskId)
                        ]
                    });
            }
            return res;
        }

        static createCheckboxElement() {
            return { 
                tag: 'input',
                attrs: { 'type': 'checkbox', 'class': 'mark-as-completed' },
                // NOTE: checkboxes not implemented yet in Bobril
                // component: {
                //     onChange: (ctx: Object, value: string) => {
                //         console.log('on change ' + value);
                //     }
                // }
            };
        }

        static createDeleteButtonElement(taskId: number) {
            return {
                tag: 'a',
                children: 'delete',
                attrs: {
                    'class': 'delete-button',
                    'href': 'javascript: void(0);'
                },
                component: {
                    onClick: (ctx: IDeleteButtonCtx, event: IMouseEvent) => {
                        this.tasks.removeTask(ctx.data.taskId);
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