import * as b from "./index";

interface ICounterData {
    name: string;
    children?: b.IBobrilChildren;
}

const Counter = b.component(
    class CounterComponent extends b.Component<ICounterData> {
        counter: number = 0;

        render(data: ICounterData): b.IBobrilChildren {
            return b.styledDiv([data.name, ": ", this.counter], { userSelect: "none" });
        }

        onClick(_event: b.IBobrilMouseEvent): b.EventResult {
            this.counter++;
            b.invalidate(this);
            return b.EventResult.HandledPreventDefault;
        }
    }
);

b.init(() => Counter({ name: "Bobril" }));
