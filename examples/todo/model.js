var TodoApp;
(function (TodoApp) {
    var Task = (function () {
        function Task(id, name, completed) {
            this.id = id;
            this.name = name;
            this.completed = completed;
        }
        Task.prototype.setStatus = function (completed) {
            this.completed = completed;
        };
        Task.prototype.setName = function (name) {
            this.name = name;
        };
        return Task;
    }());
    TodoApp.Task = Task;
    var Tasks = (function () {
        function Tasks() {
            this.storageItemsKey = "todoApp.taskListItems";
            this.storageCounterKey = "todoApp.taskListCounter";
            this.filterAll = "all";
            this.filterActive = "active";
            this.filterCompleted = "completed";
            this.items = [];
            this.counter = 0;
        }
        Tasks.prototype.saveToStorage = function () {
            localStorage.setItem(this.storageItemsKey, JSON.stringify(this.items));
            localStorage.setItem(this.storageCounterKey, JSON.stringify(this.counter));
        };
        Tasks.prototype.restoreFromStorage = function () {
            var storageItems = JSON.parse(localStorage.getItem(this.storageItemsKey));
            if (storageItems) {
                for (var i = 0; i < storageItems.length; i++) {
                    var item = storageItems[i];
                    this.items.push(new Task(item.id, item.name, item.completed));
                }
            }
            var counter = JSON.parse(localStorage.getItem(this.storageCounterKey));
            if (typeof (counter) === "number") {
                this.counter = counter;
            }
        };
        Tasks.prototype.getFilteredItems = function (filter) {
            var _this = this;
            return this.items.filter(function (item, index, array) {
                return filter === _this.filterAll ||
                    filter === _this.filterActive && !item.completed ||
                    filter === _this.filterCompleted && item.completed;
            });
        };
        Tasks.prototype.getItemsCount = function () {
            return this.items.length;
        };
        Tasks.prototype.addTask = function (name) {
            this.items.push(new Task(++this.counter, name, false));
            this.saveToStorage();
        };
        Tasks.prototype.markTaskAsCompleted = function (id) {
            this.setTaskStatus(id, true);
            this.saveToStorage();
        };
        Tasks.prototype.markAllTasksAsCompleted = function () {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsCompleted(this.items[i].id);
            }
            this.saveToStorage();
        };
        Tasks.prototype.markTaskAsActive = function (id) {
            this.setTaskStatus(id, false);
            this.saveToStorage();
        };
        Tasks.prototype.markAllTasksAsActive = function () {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsActive(this.items[i].id);
            }
            this.saveToStorage();
        };
        Tasks.prototype.removeTask = function (id) {
            this.removeTasksByPredicate(function (item) { return item.id === id; });
            this.saveToStorage();
        };
        Tasks.prototype.getNumberOfCompletedTasks = function () {
            var res = 0;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].completed) {
                    res++;
                }
            }
            return res;
        };
        Tasks.prototype.removeCompletedTasks = function () {
            this.removeTasksByPredicate(function (item) { return item.completed; });
            this.saveToStorage();
        };
        Tasks.prototype.setTaskStatus = function (taskId, status) {
            this.findTaskById(taskId).setStatus(status);
            this.saveToStorage();
        };
        Tasks.prototype.setTaskName = function (taskId, name) {
            this.findTaskById(taskId).setName(name);
            this.saveToStorage();
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
        Tasks.prototype.removeTasksByPredicate = function (predicate) {
            for (var i = this.items.length - 1; i >= 0; i--) {
                if (predicate(this.items[i])) {
                    this.items.splice(i, 1);
                }
            }
        };
        return Tasks;
    }());
    TodoApp.Tasks = Tasks;
})(TodoApp || (TodoApp = {}));
