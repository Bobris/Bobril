import * as mobx from 'mobx';
import * as bobx from 'bobx';

function mobxObservableChange() {
    const counter = mobx.observable(0);

    for (let i = 0; i < 10000; i++) {
        counter.set(counter.get() + 1);
    }
    console.time("Mobx observable get+set 1M");
    for (let i = 0; i < 1000000; i++) {
        counter.set(counter.get() + 1);
    }
    console.timeEnd("Mobx observable get+set 1M");
    console.log(counter.get());
}

function bobxObservableChange() {
    const counter = bobx.observable(0);

    for (let i = 0; i < 10000; i++) {
        counter.set(counter.get() + 1);
    }
    console.time("Bobx observable get+set 1M");
    for (let i = 0; i < 1000000; i++) {
        counter.set(counter.get() + 1);
    }
    console.timeEnd("Bobx observable get+set 1M");
    console.log(counter.get());
}

function noneObservableChange() {
    let counter = 0;

    for (let i = 0; i < 10000; i++) {
        counter += 1;
    }
    console.time("None observable get+set 1M");
    for (let i = 0; i < 1000000; i++) {
        counter += 1;
    }
    console.timeEnd("None observable get+set 1M");
    console.log(counter);
}

class MobxCounter {
    constructor() {
        this.c = 0;
    }
    @mobx.observable c: number;
}

class BobxCounter {
    constructor() {
        this.c = 0;
    }
    @bobx.observable c: number;
}

class NoneCounter {
    constructor() {
        this.c = 0;
    }
    c: number;
}

function mobxClassObservableChange() {
    const counter = new MobxCounter();

    for (let i = 0; i < 10000; i++) {
        counter.c = counter.c + 1;
    }
    console.time("Mobx class observable get+set 1M");
    for (let i = 0; i < 1000000; i++) {
        counter.c = counter.c + 1;
    }
    console.timeEnd("Mobx class observable get+set 1M");
    console.log(counter.c);
}

function bobxClassObservableChange() {
    const counter = new BobxCounter();

    for (let i = 0; i < 10000; i++) {
        counter.c = counter.c + 1;
    }
    console.time("Bobx class observable get+set 1M");
    for (let i = 0; i < 1000000; i++) {
        counter.c = counter.c + 1;
    }
    console.timeEnd("Bobx class observable get+set 1M");
    console.log(counter.c);
}

function noneClassObservableChange() {
    const counter = new NoneCounter();

    for (let i = 0; i < 10000; i++) {
        counter.c = counter.c + 1;
    }
    console.time("None class observable get+set 1M");
    for (let i = 0; i < 1000000; i++) {
        counter.c = counter.c + 1;
    }
    console.timeEnd("None class observable get+set 1M");
    console.log(counter.c);
}

mobxObservableChange();
bobxObservableChange();
noneObservableChange();
mobxClassObservableChange();
bobxClassObservableChange();
noneClassObservableChange();
mobxObservableChange();
bobxObservableChange();
noneObservableChange();
mobxClassObservableChange();
bobxClassObservableChange();
noneClassObservableChange();
