/// <reference path="../../src/bobril.d.ts"/>
module InputApp {
    function p(...args: any[]) {
        return { tag: "p", children: args };
    }

    interface IEvent {
        toString(): string;
    }
    
    class KeyUpDown implements IEvent {
        KeyUpDown(
        toString(): string {
            
        }
    }
    
    b.init(() => {
        frame++;
        return [
            { tag: "h1", children: "OnKey demo" },
            { tag: "input", attrs: { value: value }, component: MyInput },
            p("Entered: " + value),
            p("Frame: ", frame)
        ];
    });
}
