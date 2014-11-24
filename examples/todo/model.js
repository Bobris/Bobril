var MouseEnterLeaveApp;
(function (MouseEnterLeaveApp) {
    var Task = (function () {
        function Task(id, name, completed) {
            this.id = id;
            this.name = name;
            this.completed = completed;
        }
        return Task;
    })();
    MouseEnterLeaveApp.Task = Task;
    var Tasks = (function () {
        function Tasks() {
            this.items = [];
            this.counter = 0;
        }
        Tasks.prototype.addTask = function (name) {
            this.items.push(new Task(this.counter++, name, false));
        };
        Tasks.prototype.markTaskAsCompleted = function (id) {
            this.setTaskStatus(id, true);
        };
        Tasks.prototype.markTaskAsActive = function (id) {
            this.setTaskStatus(id, false);
        };
        Tasks.prototype.removeTask = function (id) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    this.items.splice(i, 1);
                    return;
                }
            }
        };
        Tasks.prototype.setTaskStatus = function (taskId, status) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === taskId) {
                    this.items[i].completed = status;
                    return;
                }
            }
        };
        return Tasks;
    })();
    MouseEnterLeaveApp.Tasks = Tasks;
})(MouseEnterLeaveApp || (MouseEnterLeaveApp = {}));
