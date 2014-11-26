
module TodoApp {

    export class Task {
        constructor(public id: number, public name: string, public completed: boolean) {
        }
    }

    export class Tasks {
        items: Task[];
        counter: number;

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
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    this.items.splice(i, 1);
                    return;
                }
            }
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
    }
}