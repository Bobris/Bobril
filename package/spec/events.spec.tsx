import * as b from "../index";

describe("events", ()=> {
    afterEach(() => {
        b.init(() => undefined);
        b.syncUpdate();
    });

    it("works with classic components", () => {
        interface ICompData {
            value?: number;
        }

        interface ICompCtx extends b.IBobrilCtx<ICompData>
        {
            local: number;
        }

        const Comp = b.createVirtualComponent<ICompData>({
            render(ctx: ICompCtx, me: b.IBobrilNode) {
                ctx.local = ctx.data.value || 0;
                me.tag = "span";
            },

            onFocusOut(ctx: ICompCtx): b.GenericEventResult {
                ctx.local++;
                return true;
            }
        });

        b.init(() => Comp({ value: 42 }));
        b.syncUpdate();
    });

    describe("portal", () => {
        let callStack;
        let callback: jasmine.Spy;
        let cacheNode: b.IBobrilCacheNode;
        beforeEach(() => {
            callStack = [];
            callback = jasmine.createSpy("spy");
            callback.and.callFake((arg: string) => callStack.push(arg));

            interface IProps {
                callback: (id: string) => void;
            }

            function PortalWrapper(props: IProps) {
                const [el, setEl] = b.useState<Element|null>(null);
                const component = <Portal callback={props.callback}/>
                b.useEvents({
                    onClick(): b.GenericEventResult {
                        props.callback("parent");
                        return false;
                    }
                });
                b.useEffect(() => {
                    setEl(document.getElementById("portal"));
                },[]);

                return (
                    <div>
                        {el && <b.Portal element={el}>
                            {component}
                        </b.Portal>}
                    </div>
                )
            }

            function Portal(props: IProps) {
                return (
                    <div id="inner-portal"
                        onClick={() => {
                        props.callback("inner");
                        return false
                    }} ref={ref => cacheNode = ref!}>
                        Portal
                    </div>
                )
            }

            b.init(() => {
                return (
                    <div>
                        <PortalWrapper callback={callback}/>
                        <div id="portal" onClick={() => callback("portal")}/>
                    </div>
                )
            });
            // first render
            b.syncUpdate();
            // second render for portal
            b.syncUpdate();
        });

        it("portal event bubbling - VDOM", () => {
            b.bubble(cacheNode, "onClick");
            expect(callback).toHaveBeenCalledTimes(2);
            const calls = callback.calls.all();
            expect(calls[0].args).toEqual(["inner"]);
            expect(calls[1].args).toEqual(["parent"]);
        });

        it("portal event bubbling - DOM", () => {
            const domEl = document.getElementById("inner-portal")!;
            domEl.click();
            expect(callback).toHaveBeenCalledTimes(2);
            const calls = callback.calls.all();
            expect(calls[0].args).toEqual(["inner"]);
            expect(calls[1].args).toEqual(["parent"]);
        });
    });
});
