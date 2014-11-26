
module TodoApp {

    export class Task {
        constructor(public id: number, public name: string, public completed: boolean) {
        }
    }

    export class Tasks {
        private counter: number;
        items: Task[];

        constructor() {
            this.items = [];
            this.counter = 0;
        }

        addTask(name: string): void
        {
            this.items.push(new Task(this.counter++, name, false));
        }

        markTaskAsCompleted(id: number): void {
            this.setTaskStatus(id, true);
        }

        markAllTasksAsCompleted(): void {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsCompleted(this.items[i].id);
            }
        }

        markTaskAsActive(id: number): void {
            this.setTaskStatus(id, false);
        }

        markAllTasksAsActive(): void {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsActive(this.items[i].id);
            }
        }

        removeTask(id: number): void {
            this.removeTasksByPredicate((item: Task) => { return item.id === id; });
        }

        getNumberOfCompletedTasks(): number {
            var res = 0;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].completed) {
                    res++;
                }
            }
            return res;
        }

        removeCompletedTasks(): void {
            this.removeTasksByPredicate((item: Task) => { return item.completed; });
        }

        setTaskStatus(taskId: number, status: boolean): void {
            this.findTaskById(taskId).completed = status;
        }

        isWholeListCompleted(): boolean {
            return this.items.every((currentValue, index, array) => {
                    return currentValue.completed;
                });
        }

        isTaskCompleted(taskId: number): boolean {
            return this.findTaskById(taskId).completed;
        }

        private findTaskById(taskId: number): Task {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === taskId) {
                    return this.items[i];
                }
            }
            return null;
        }

        private removeTasksByPredicate(predicate: (Task) => boolean) {
            for (var i = this.items.length - 1; i >= 0; i--) {
                if (predicate(this.items[i])) {
                    this.items.splice(i, 1);
                }
            }
        }
    }
}