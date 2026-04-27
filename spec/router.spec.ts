import * as b from "../index";

describe("router", () => {
    it("runs route onPreload in parallel with first canActivate and preserves serial canActivate processing", (done) => {
        let resolveRootCanActivate: (() => void) | undefined;
        let resolveBranchCanActivate: (() => void) | undefined;
        let resolveLeafCanActivate: (() => void) | undefined;
        let resolveRootPreload: (() => void) | undefined;
        let resolveBranchPreload: (() => void) | undefined;
        let resolveLeafPreload: (() => void) | undefined;
        const calls: string[] = [];

        b.routes([
            {
                name: "root",
                url: "/",
                handler: {
                    canActivate: () => {
                        calls.push("root canActivate");
                        return new Promise<boolean>((resolve) => {
                            resolveRootCanActivate = () => resolve(true);
                        });
                    },
                    render: () => undefined,
                },
                onPreload: () => {
                    calls.push("root onPreload");
                    return new Promise<void>((resolve) => {
                        resolveRootPreload = resolve;
                    });
                },
                children: [
                    {
                        name: "branch",
                        handler: {
                            canActivate: () => {
                                calls.push("branch canActivate");
                                return new Promise<boolean>((resolve) => {
                                    resolveBranchCanActivate = () => resolve(true);
                                });
                            },
                            render: () => undefined,
                        },
                        onPreload: () => {
                            calls.push("branch onPreload");
                            return new Promise<void>((resolve) => {
                                resolveBranchPreload = resolve;
                            });
                        },
                        children: [
                            {
                                name: "leaf",
                                handler: {
                                    canActivate: () => {
                                        calls.push("leaf canActivate");
                                        return new Promise<boolean>((resolve) => {
                                            resolveLeafCanActivate = () => resolve(true);
                                        });
                                    },
                                    render: () => undefined,
                                },
                                onPreload: () => {
                                    calls.push("leaf onPreload");
                                    return new Promise<void>((resolve) => {
                                        resolveLeafPreload = resolve;
                                    });
                                },
                            },
                        ],
                    },
                ],
            },
        ]);

        b.runTransition(b.createRedirectPush("leaf"));

        expect(calls).toEqual(["root onPreload", "branch onPreload", "leaf onPreload", "root canActivate"]);
        expect(resolveRootCanActivate).toBeDefined();
        expect(resolveBranchCanActivate).not.toBeDefined();
        expect(resolveLeafCanActivate).not.toBeDefined();
        expect(resolveRootPreload).toBeDefined();
        expect(resolveBranchPreload).toBeDefined();
        expect(resolveLeafPreload).toBeDefined();

        resolveRootCanActivate!();

        setTimeout(() => {
            expect(calls).toEqual([
                "root onPreload",
                "branch onPreload",
                "leaf onPreload",
                "root canActivate",
                "branch canActivate",
            ]);
            expect(resolveLeafCanActivate).not.toBeDefined();

            resolveBranchCanActivate!();

            setTimeout(() => {
                expect(calls).toEqual([
                    "root onPreload",
                    "branch onPreload",
                    "leaf onPreload",
                    "root canActivate",
                    "branch canActivate",
                    "leaf canActivate",
                ]);

                resolveRootPreload!();
                resolveBranchPreload!();
                resolveLeafPreload!();
                resolveLeafCanActivate!();

                setTimeout(() => {
                    expect(calls).toEqual([
                        "root onPreload",
                        "branch onPreload",
                        "leaf onPreload",
                        "root canActivate",
                        "branch canActivate",
                        "leaf canActivate",
                    ]);
                    done();
                }, 0);
            }, 0);
        }, 0);
    });
});
