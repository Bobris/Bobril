var TodoApp;
(function (TodoApp) {
    var Task = (function () {
        function Task(id, name, completed) {
            this.id = id;
            this.name = name;
            this.completed = completed;
        }
        return Task;
    })();
    TodoApp.Task = Task;
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
        Tasks.prototype.markAllTasksAsCompleted = function () {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsCompleted(this.items[i].id);
            }
        };
        Tasks.prototype.markTaskAsActive = function (id) {
            this.setTaskStatus(id, false);
        };
        Tasks.prototype.markAllTasksAsActive = function () {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsActive(this.items[i].id);
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
        Tasks.prototype.setTaskStatus = function (taskId, status) {
            this.findTaskById(taskId).completed = status;
        };
        Tasks.prototype.isWholeListCompleted = function () {
            return this.items.every(function (currentValue, index, array) {
                return currentValue.completed;
            });
        };
        Tasks.prototype.isTaskCompleted = function (taskId) {
            return this.findTaskById(taskId).completed;
        };
        Tasks.prototype.findTaskById = function (taskId) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === taskId) {
                    return this.items[i];
                }
            }
            return null;
        };
        return Tasks;
    })();
    TodoApp.Tasks = Tasks;
})(TodoApp || (TodoApp = {}));
