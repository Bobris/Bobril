var TodoApp;
(function (TodoApp) {
    class Task {
        constructor(id, name, completed) {
            this.id = id;
            this.name = name;
            this.completed = completed;
        }
        setStatus(completed) {
            this.completed = completed;
        }
        setName(name) {
            this.name = name;
        }
    }
    TodoApp.Task = Task;
    class Tasks {
        constructor() {
            this.storageItemsKey = "todoApp.taskListItems";
            this.storageCounterKey = "todoApp.taskListCounter";
            this.filterAll = "all";
            this.filterActive = "active";
            this.filterCompleted = "completed";
            this.items = [];
            this.counter = 0;
        }
        saveToStorage() {
            localStorage.setItem(this.storageItemsKey, JSON.stringify(this.items));
            localStorage.setItem(this.storageCounterKey, JSON.stringify(this.counter));
        }
        restoreFromStorage() {
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
        }
        getFilteredItems(filter) {
            return this.items.filter((item, index, array) => {
                return filter === this.filterAll ||
                    filter === this.filterActive && !item.completed ||
                    filter === this.filterCompleted && item.completed;
            });
        }
        getItemsCount() {
            return this.items.length;
        }
        addTask(name) {
            this.items.push(new Task(++this.counter, name, false));
            this.saveToStorage();
        }
        markTaskAsCompleted(id) {
            this.setTaskStatus(id, true);
            this.saveToStorage();
        }
        markAllTasksAsCompleted() {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsCompleted(this.items[i].id);
            }
            this.saveToStorage();
        }
        markTaskAsActive(id) {
            this.setTaskStatus(id, false);
            this.saveToStorage();
        }
        markAllTasksAsActive() {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsActive(this.items[i].id);
            }
            this.saveToStorage();
        }
        removeTask(id) {
            this.removeTasksByPredicate((item) => { return item.id === id; });
            this.saveToStorage();
        }
        getNumberOfCompletedTasks() {
            var res = 0;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].completed) {
                    res++;
                }
            }
            return res;
        }
        removeCompletedTasks() {
            this.removeTasksByPredicate((item) => { return item.completed; });
            this.saveToStorage();
        }
        setTaskStatus(taskId, status) {
            this.findTaskById(taskId).setStatus(status);
            this.saveToStorage();
        }
        setTaskName(taskId, name) {
            this.findTaskById(taskId).setName(name);
            this.saveToStorage();
        }
        isWholeListCompleted() {
            return this.items.every((currentValue, index, array) => {
                return currentValue.completed;
            });
        }
        isTaskCompleted(taskId) {
            return this.findTaskById(taskId).completed;
        }
        findTaskById(taskId) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === taskId) {
                    return this.items[i];
                }
            }
            return null;
        }
        removeTasksByPredicate(predicate) {
            for (var i = this.items.length - 1; i >= 0; i--) {
                if (predicate(this.items[i])) {
                    this.items.splice(i, 1);
                }
            }
        }
    }
    TodoApp.Tasks = Tasks;
})(TodoApp || (TodoApp = {}));
