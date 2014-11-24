
module MouseEnterLeaveApp {

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

        markTaskAsCompleted(id: number) {
            for (var i = 0; i < this.items.length; i++) {
                if (this.items[i].id === id) {
                    this.items[i].completed = true;
                    return;
                }
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
    }
}