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
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    this.items[i].completed = true;
                    return;
                }
            }
        };

        Tasks.prototype.removeTask = function (id) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    this.items.splice(i, 1);
                    return;
                }
            }
        };
        return Tasks;
    })();
    MouseEnterLeaveApp.Tasks = Tasks;
})(MouseEnterLeaveApp || (MouseEnterLeaveApp = {}));
