/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.swipe.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="model.ts"/>
var MouseEnterLeaveApp;
(function (MouseEnterLeaveApp) {
    var TaskList = (function () {
        function TaskList() {
        }
        TaskList.init = function (ctx, me, oldMe) {
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
        };

        TaskList.createHeadingElement = function () {
            return [
                {
                    tag: 'h3',
                    children: 'Todos'
                }
            ];
        };

        TaskList.createInputElement = function () {
            var _this = this;
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
                    onKeyUp: function (ctx, event) {
                        if (event.which == 13) {
                            _this.tasks.addTask(_this.currentTaskName);
                            _this.currentTaskName = '';
                            b.invalidate();
                        } else if (event.which == 27) {
                            // cancel the task adding controls
                            _this.currentTaskName = '';
                            b.invalidate();
                        }
                    },
                    onChange: function (ctx, value) {
                        _this.currentTaskName = value;
                    }
                }
            };
        };

        TaskList.createHintElement = function () {
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

        TaskList.createTaskElements = function () {
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
        };

        TaskList.createCheckboxElement = function () {
            return {
                tag: 'input',
                attrs: { 'type': 'checkbox', 'class': 'mark-as-completed' }
            };
        };

        TaskList.createDeleteButtonElement = function (taskId) {
            var _this = this;
            return {
                tag: 'a',
                children: 'delete',
                attrs: {
                    'class': 'delete-button',
                    'href': 'javascript: void(0);'
                },
                component: {
                    onClick: function (ctx, event) {
                        _this.tasks.removeTask(ctx.data.taskId);
                        b.invalidate();
                    }
                },
                data: {
                    'taskId': taskId
                }
            };
        };
        TaskList.tasks = new MouseEnterLeaveApp.Tasks();
        return TaskList;
    })();
    MouseEnterLeaveApp.TaskList = TaskList;
})(MouseEnterLeaveApp || (MouseEnterLeaveApp = {}));
