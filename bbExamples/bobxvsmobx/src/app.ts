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

function mobxArrayPush() {
    console.time("Mobx push 1000 empty objects into array");
    let a = mobx.observable([]);
    for (let i = 0; i < 1000; i++) {
        a.push({ b: i });
    }
    console.timeEnd("Mobx push 1000 empty objects into array");
}

function bobxArrayPush() {
    console.time("Bobx push 1000 empty objects into array");
    let a = bobx.observable([]);
    for (let i = 0; i < 1000; i++) {
        a.push({ b: i });
    }
    console.timeEnd("Bobx push 1000 empty objects into array");
}

function noneArrayPush() {
    console.time("None push 1000 empty objects into array");
    let a = [];
    for (let i = 0; i < 1000; i++) {
        a.push({ b: i });
    }
    console.timeEnd("None push 1000 empty objects into array");
}

function mobxComputed() {
    console.time("Mobx computed +1");
    class C {
        @mobx.observable a: number;
        @mobx.observable b: number;
        @mobx.computed get sum() { return this.a + this.b; }
    }
    let c = new C();
    c.a = 1;
    c.b = 2;
    let s = 0;
    for (let i = 0; i < 100000; i++) {
        c.a = i;
        s += c.sum;
    }
    console.timeEnd("Mobx computed +1");
    console.log(s);
}

function bobxComputed() {
    console.time("Bobx computed +1");
    class C {
        @bobx.observable a: number;
        @bobx.observable b: number;
        @bobx.computed get sum() { return this.a + this.b; }
    }
    let c = new C();
    c.a = 1;
    c.b = 2;
    let s = 0;
    for (let i = 0; i < 100000; i++) {
        c.a = i;
        s += c.sum;
    }
    console.timeEnd("Bobx computed +1");
    console.log(s);
}

function noneComputed() {
    console.time("None computed +1");
    class C {
        a: number;
        b: number;
        get sum() { return this.a + this.b; }
    }
    let c = new C();
    c.a = 1;
    c.b = 2;
    let s = 0;
    for (let i = 0; i < 100000; i++) {
        c.a = i;
        s += c.sum;
    }
    console.timeEnd("None computed +1");
    console.log(s);
}

function mobxComputedMemoize() {
    console.time("Mobx computed memoize +1");
    class C {
        @mobx.observable a: number;
        @mobx.observable b: number;
        @mobx.computed get sum() { return this.a + this.b; }
    }
    let c = new C();
    c.a = 1;
    c.b = 2;
    let s = 0;
    for (let i = 0; i < 100000; i++) {
        s += c.sum;
    }
    console.timeEnd("Mobx computed memoize +1");
    console.log(s);
}

function bobxComputedMemoize() {
    console.time("Bobx computed memoize +1");
    class C {
        @bobx.observable a: number;
        @bobx.observable b: number;
        @bobx.computed get sum() { return this.a + this.b; }
    }
    let c = new C();
    c.a = 1;
    c.b = 2;
    let s = 0;
    for (let i = 0; i < 100000; i++) {
        s += c.sum;
    }
    console.timeEnd("Bobx computed memoize +1");
    console.log(s);
}

function noneComputedMemoize() {
    console.time("None computed memoize +1");
    class C {
        a: number;
        b: number;
        get sum() { return this.a + this.b; }
    }
    let c = new C();
    c.a = 1;
    c.b = 2;
    let s = 0;
    for (let i = 0; i < 100000; i++) {
        s += c.sum;
    }
    console.timeEnd("None computed memoize +1");
    console.log(s);
}

noneComputed();
bobxComputed();
mobxComputed();
noneComputedMemoize();
bobxComputedMemoize();
mobxComputedMemoize();
noneArrayPush();
bobxArrayPush();
mobxArrayPush();
mobxObservableChange();
bobxObservableChange();
noneObservableChange();
mobxClassObservableChange();
bobxClassObservableChange();
noneClassObservableChange();
