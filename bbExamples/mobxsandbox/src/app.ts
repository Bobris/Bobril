import * as b from 'bobril';
import * as mobx from 'mobx';

const counter = mobx.observable(0);

const reaction = new mobx.Reaction("test", () => {
    b.invalidate();
})

setInterval(() => {
    counter.set(counter.get() + 1);
}, 2000);

b.init(() => {
    var res: b.IBobrilChildren;
    reaction.track(() => {
        res = counter.get();
    });
    return res;
});

