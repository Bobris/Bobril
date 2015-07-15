/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.focus.d.ts"/>
/// <reference path="../../src/bobril.media.d.ts"/>
/// <reference path="../../src/bobril.promise.d.ts"/>

module PopupApp {
    function d(style: any, content: IBobrilChildren): IBobrilNode {
        return {
            tag: "div",
            style: style,
            children: content
        };
    }

    interface IButtonStyleCtx {
        disabled: boolean;
        hover: boolean;
        down: boolean;
        focused: boolean;
    }

    function defaultButtonStyle(ctx: IButtonStyleCtx): any {
        var style = {
            display: "inline-block",
            padding: 3,
            boxSizing: "border-box",
            background: "#fff",
            outline: "none",
            color: "#000",
            textAlign: "center",
            borderRadius: 3,
            borderColor: "#000",
            borderStyle: "solid",
            borderWidth: 1,
            minWidth: 60,
            cursor: "pointer",
            userSelect: "none",
            position: "relative",
            left: 0,
            top: 0
        };
        if (ctx.disabled) {
            style.background = "#ccc";
            style.color = "#877";
            return style;
        }
        if (ctx.focused) {
            style.borderWidth = 2;
            style.padding = 2;
        }
        if (ctx.hover) {
            style.background = "#e2e2f2";
        }
        if (ctx.down) {
            style.left = 1;
            style.top = 1;
        }
        return style;
    }

    var ButtonComp: IBobrilComponent = {
        render(ctx: any, me: IBobrilNode) {
            me.tag = "div";
            ctx.disabled = ctx.data.action === null;
            ctx.down = ctx.hover && ctx.mousedown || ctx.keydown;
            me.style = ctx.cfg.buttonStyle(ctx);
            me.attrs = { tabindex: ctx.disabled ? -1 : 0 };
            me.children = ctx.data.content;
        },
        onFocus(ctx: any): boolean {
            if (ctx.disabled) return false;
            ctx.focused = true;
            b.invalidate(ctx);
            return false;
        },
        onBlur(ctx: any): boolean {
            ctx.focused = false;
            b.invalidate(ctx);
            return false;
        },
        onMouseEnter(ctx: any): boolean {
            ctx.hover = true;
            b.invalidate(ctx);
            return false;
        },
        onMouseLeave(ctx: any): boolean {
            ctx.hover = false;
            b.invalidate(ctx);
            return false;
        },
        onMouseDown(ctx: any): boolean {
            if (ctx.disabled) return true;
            ctx.mousedown = true;
            b.registerMouseOwner(ctx);
            b.invalidate(ctx);
            return false;
        },
        onMouseUp(ctx: any): boolean {
            if (ctx.disabled) return true;
            ctx.mousedown = false;
            if (b.isMouseOwner(ctx)) {
                b.releaseMouseOwner();
                if (ctx.hover && ctx.data.action) {
                    ctx.data.action();
                    return true;
                }
            }
            return false;
        },
        onClick(): boolean {
            return true;
        },
        onKeyDown(ctx: any, param: IKeyDownUpEvent): boolean {
            if (ctx.disabled) return false;
            if (param.which == 32 || param.which == 13) {
                ctx.keydown = true;
                b.invalidate(ctx);
                return true;
            }
        },
        onKeyUp(ctx: any, param: IKeyDownUpEvent): boolean {
            if (ctx.disabled) return false;
            if (param.which == 32 || param.which == 13) {
                ctx.keydown = false;
                b.invalidate(ctx);
                if (ctx.data.action) {
                    ctx.data.action();
                }
                return true;
            }
        }
    };

    // pass action=null to paint disabled button
    function button(content: IBobrilChildren, action: () => void): IBobrilNode {
        return {
            data: { action: action, content: content },
            component: ButtonComp
        };
    }

    function h(name: string, content: IBobrilChildren): IBobrilNode {
        return { tag: name, children: content };
    }

    function style(style: any, content: IBobrilNode): IBobrilNode {
        content.style = style;
        return content;
    }

    function comp(component: IBobrilComponent, node: IBobrilNode): IBobrilNode {
        b.postEnhance(node, component);
        return node;
    }

    function layoutPair(left: any, right: any, leftWidth = "50%"): IBobrilNode {
        return d({ display: "table", width: "100%" }, [
            d({ display: "table-cell", verticalAlign: "top", width: leftWidth }, left),
            d({ display: "table-cell", verticalAlign: "top" }, right)
        ]);
    }

    function checkbox(value: boolean, onChange: (value: boolean) => void): IBobrilNode {
        return { tag: "input", attrs: { type: "checkbox", value: value }, component: { onChange: (ctx: any, v: boolean) => onChange(v) } };
    }

    enum PopupButtonStyle {
        Normal = 0,
        Default = 1,
        Cancel = 2,
        DefaultCancel = 3
    }

    interface IPopupButton {
        content: IBobrilChildren;
        style: PopupButtonStyle;
        action?: () => boolean | Promise<boolean>;
    }

    function innerpopup(cfg: any, title: IBobrilChildren, width: string, buttons: IPopupButton[], hideAction: () => void, content: IBobrilChildren): IBobrilNode {
        var buttonNodes: IBobrilChild[] = [];
        var defaultAction: () => boolean = () => false;
        var cancelAction: () => boolean = () => false;
        for (var i = 0; i < buttons.length; i++) {
            if (i > 0) buttonNodes.push(" ");
            var bb = buttons[i];
            var action: () => boolean | Promise<boolean> = () => true;
            if (bb.action) action = bb.action;
            action = ((act: () => boolean | Promise<boolean>) => () => {
                var res = act();
                if (typeof res === "boolean") {
                    if (res) hideAction();
                } else {
                    (<Promise<boolean>>res).then((v) => {
                        if (v) hideAction();
                    });
                }
                return true;
            })(action);
            if ((bb.style & PopupButtonStyle.Default) != 0) defaultAction = <() => boolean>action;
            if ((bb.style & PopupButtonStyle.Cancel) != 0) cancelAction = <() => boolean>action;
            buttonNodes.push(button(bb.content, <() => boolean>action));
        }
        return {
            tag: "div",
            data: { cfg: cfg },
            style: {
                position: "fixed",
                zIndex: "1",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "table"
            },
            component: {
                init(ctx: any) {
                    ctx.cfg = ctx.data.cfg;
                },
                render(ctx: any) {
                    ctx.cfg = ctx.data.cfg;
                },
                onKeyDown(ctx: any, param: IKeyDownUpEvent): boolean {
                    if (param.which == 13) {
                        return defaultAction();
                    }
                    if (param.which == 27) {
                        return cancelAction();
                    }
                    return false;
                },
                shouldStopBubble(): boolean {
                    return true;
                },
                postInitDom(ctx: any, me: IBobrilCacheNode) {
                    b.focus(me);
                }
            },
            children: {
                tag: "div",
                style: {
                    display: "table-cell",
                    verticalAlign: "middle"
                },
                children: {
                    tag: "div",
                    style: {
                        width: width,
                        margin: "0 auto",
                        background: "#fff",
                        borderRadius: "3px",
                        border: "#000 solid 1px"
                    },
                    children: {
                        tag: "table",
                        style: {
                            width: "100%",
                            borderCollapse: "separate",
                            borderSpacing: "2px"
                        },
                        children: [
                            h("tr", [
                                style({
                                    padding: "2px",
                                    width: "auto",
                                    borderRadius: "3px",
                                    border: "#000 solid 1px"
                                }, h("td", title)),
                                comp({
                                    onClick(): boolean {
                                        return cancelAction();
                                    }
                                }, style({
                                        padding: "2px",
                                        width: "1.5em",
                                        borderRadius: "3px",
                                        border: "#000 solid 1px",
                                        textAlign: "center",
                                        cursor: "pointer",
                                        userSelect: "none",
                                        fontWeight: "bold"
                                    }, h("td", "×"))
                                    )]),
                            h("tr", {
                                tag: "td",
                                attrs: { colSpan: 2 },
                                style: {
                                    padding: "2px",
                                    width: "auto",
                                    borderRadius: "3px",
                                    border: "#000 solid 1px"
                                },
                                children: content
                            }),
                            h("tr", {
                                tag: "td",
                                attrs: { colSpan: 2 },
                                style: {
                                    width: "auto",
                                    textAlign: "center"
                                },
                                children: buttonNodes
                            })
                        ]
                    }
                }
            }
        };
    }

    function popup(title: IBobrilChildren, width: string, buttons: IPopupButton[], hideAction: () => void, content: IBobrilChildren): IBobrilNode {
        return {
            tag: "span",
            data: { title: title, width: width, buttons: buttons, hideAction: hideAction, content: content },
            component: {
                init(ctx: any, me: IBobrilNode) {
                    ctx.rid = b.addRoot(() => {
                        var c = ctx.data;
                        return innerpopup(ctx.cfg, c.title, c.width, c.buttons, c.hideAction, c.content);
                    });
                },
                destroy(ctx: any) {
                    b.removeRoot(ctx.rid);
                }
            }
        }
    }

    function input(value: string, change: (v: string) => void): IBobrilNode {
        return {
            tag: "input",
            style: {
                width: "100%",
                boxSizing: "border-box"
            },
            attrs: {
                value: value
            },
            component: {
                onChange(ctx: any, v: string) {
                    change(v);
                }
            }
        };
    }

    var v1 = false, v2 = false, v3 = false, v4 = false, v5 = false, v6 = false;
    var v6resolver: (v: boolean) => void;
    var s1 = "", s2 = "";

    b.init(() => {
        return {
            tag: "div",
            cfg: {
                buttonStyle: defaultButtonStyle
            },
            component: {},
            children: [
                h("h1", "Popup sample"),
                h("div", [
                    button("Enabled", () => {
                        v1 = true;
                        b.invalidate();
                        setTimeout(() => {
                            v1 = false;
                            b.invalidate();
                        }, 1000);
                    }), " ",
                    button(v1 ? "Enabled" : "Disabled", v1 ? undefined : null)
                ]),
                h("div", [v1 && "Clicked"]),
                d({}, [button("Show popup", () => {
                    v2 = true;
                    b.invalidate();
                }),
                    v2 && popup("First popup", "300px", [{
                        content: "Ok", style: PopupButtonStyle.Default, action: () => {
                            v3 = true;
                            b.invalidate();
                            return true;
                        }
                    }, {
                            content: "Cancel", style: PopupButtonStyle.Cancel, action: () => {
                                if (v5) {
                                    v6 = true;
                                    b.invalidate();
                                    return new Promise<boolean>((resolve, reject) => {
                                        v6resolver = resolve;
                                    });
                                }
                                return true;
                            }
                        }], () => {
                            v2 = false;
                            b.invalidate();
                        }, [layoutPair(h("label", "First:"), input(s1, (v) => s1 = v), "40%"),
                            layoutPair(h("label", "Second:"), input(s2, (v) => s2 = v), "40%"),
                            h("div", h("label", [checkbox(v5, (v) => {
                                v5 = v;
                                b.invalidate();
                            }), "Annoying cancel"])),
                            button("Show nested popup", () => {
                                v4 = true;
                                b.invalidate();
                            }),
                            v4 && popup("Nested", "200px", [{ content: "Ok", style: PopupButtonStyle.DefaultCancel }],
                                () => {
                                    v4 = false;
                                    b.invalidate();
                                }, [
                                    h("p", "Hello from nested dialog. Cool, isn't it!")
                                ]),
                            "",
                            v6 && popup("Annoying", "150px", [{
                                content: "Yes", style: PopupButtonStyle.Default, action: () => {
                                    v6resolver(true);
                                    v6resolver = null;
                                    return true;
                                }
                            }, {
                                    content: "No", style: PopupButtonStyle.Cancel, action: () => {
                                        v6resolver(false);
                                        v6resolver = null;
                                        return true;
                                    }
                                }], () => {
                                    v6 = false;
                                    b.invalidate();
                                }, h("p", "Are you sure to lose all data?"))
                        ]),
                    "",
                    v3 && popup("Info", "150px", [{ content: "Ok", style: PopupButtonStyle.DefaultCancel }], () => {
                        v3 = false;
                        b.invalidate();
                    }, h("p", "Selected Ok"))
                ])
            ]
        };
    });
}
