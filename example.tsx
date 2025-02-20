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
    },
);

const fetchData = async () => {
    return new Promise<string>((resolve, reject) =>
        setTimeout(
            () => (Math.random() < 0.5 ? resolve("Data loaded!") : reject(new Error("Failed to load data"))),
            2000,
        ),
    );
};

function MyComponent({ lazyData }: { lazyData: Promise<string> }) {
    const data = b.use(lazyData);

    return <div>Data: {data}</div>; // Will suspend until the promise resolves
}

function SuspenseExample() {
    const lazyData = fetchData();
    return (
        <b.Suspense fallback={<div>Loading...</div>}>
            <MyComponent lazyData={lazyData} />
            <div>Inline: {() => b.use(lazyData)}</div>
        </b.Suspense>
    );
}

b.routes([
    b.route({ name: "counter", handler: () => Counter({ name: "Bobril" }) }),
    b.route({
        name: "suspense",
        handler: () => (
            <b.ErrorBoundary
                fallback={(err, reset) => (
                    <div>
                        Caught an error: {err.message} <button onClick={reset}>Try again</button>
                    </div>
                )}
            >
                <SuspenseExample />
            </b.ErrorBoundary>
        ),
    }),
    b.routeDefault({
        name: "page1",
        handler: () => (
            <div>
                <h1 style={() => b.useIsMouseOver() && { background: "teal" }}>Page 1</h1>
                <RoutePage />
            </div>
        ),
    }),
    b.route({
        name: "page2",
        url: "page2/:id",
        handler: (data: b.IRouteHandlerData) => (
            <div>
                <h1>Page 2 - {data.routeParams["id"]}</h1>
                <RoutePage />
            </div>
        ),
    }),
]);

function RoutePage() {
    return (
        <>
            <p>Back will be inApp {b.createBackTransition().inApp ? "True" : "False"}</p>
            <p>Active State {JSON.stringify(b.getActiveState())}</p>
            <ul>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createRedirectPush("page1", {}, { rnd: Math.random() }));
                            return true;
                        }}
                    >
                        Push to Page 1
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createRedirectPush("page2", { id: "" + Math.random() }));
                            return true;
                        }}
                    >
                        Push to Page 2
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createRedirectReplace("page1", {}, { rnd: Math.random() }));
                            return true;
                        }}
                    >
                        Replace to Page 1
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createRedirectReplace("page2"));
                            return true;
                        }}
                    >
                        Replace to Page 2
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createBackTransition());
                            return true;
                        }}
                    >
                        Back
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createRedirectPush("counter"));
                            return true;
                        }}
                    >
                        To Counter
                    </a>
                </li>
                <li>
                    <a
                        href="#"
                        onClick={() => {
                            b.runTransition(b.createRedirectPush("suspense"));
                            return true;
                        }}
                    >
                        To Suspense
                    </a>
                </li>
            </ul>
        </>
    );
}
