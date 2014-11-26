
module TodoApp {

    export class Task {
        constructor(public id: number, public name: string, public completed: boolean, public isInEditMode: boolean = false) {
        }

        public setStatus(completed: boolean): void {
            this.completed = completed;
        }

        public setEditMode(isEdit: boolean): void {
            this.isInEditMode = isEdit;
        }

        public setName(name: string): void {
            this.name = name;
        }
    }

    export class Tasks {
        private counter: number;
        public items: Task[];

        constructor() {
            this.items = [];
            this.counter = 0;
        }

        public getItemsCount(): number {
            return this.items.length;
        }

        public addTask(name: string): void
        {
            this.items.push(new Task(this.counter++, name, false));
        }

        public markTaskAsCompleted(id: number): void {
            this.setTaskStatus(id, true);
        }

        public markAllTasksAsCompleted(): void {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsCompleted(this.items[i].id);
            }
        }

        public markTaskAsActive(id: number): void {
            this.setTaskStatus(id, false);
        }

        public markAllTasksAsActive(): void {
            for (var i = 0; i < this.items.length; i++) {
                this.markTaskAsActive(this.items[i].id);
            }
        }

        public removeTask(id: number): void {
            this.removeTasksByPredicate((item: Task) => { return item.id === id; });
        }

        public getNumberOfCompletedTasks(): number {
            var res = 0;
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].completed) {
                    res++;
                }
            }
            return res;
        }

        public removeCompletedTasks(): void {
            this.removeTasksByPredicate((item: Task) => { return item.completed; });
        }

        public setTaskStatus(taskId: number, status: boolean): void {
            this.findTaskById(taskId).setStatus(status)
        }

        public setTaskEditMode(taskId: number, inEditMode: boolean): void {
            this.findTaskById(taskId).setEditMode(inEditMode);
        }

        public setTaskName(taskId: number, name: string): void {
            this.findTaskById(taskId).setName(name);
        }

        public isWholeListCompleted(): boolean {
            return this.items.every((currentValue, index, array) => {
                    return currentValue.completed;
                });
        }

        public isTaskCompleted(taskId: number): boolean {
            return this.findTaskById(taskId).completed;
        }

        public isInEditMode(taskId: number): boolean {
            return this.findTaskById(taskId).isInEditMode;
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