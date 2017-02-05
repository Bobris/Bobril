/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.focus.d.ts"/>
/// <reference path="../../src/bobril.media.d.ts"/>
/// <reference path="../../src/bobril.promise.d.ts"/>
var PopupApp;
(function (PopupApp) {
    function d(style, content) {
        return {
            tag: "div",
            style: style,
            children: content
        };
    }
    function defaultButtonStyle(ctx) {
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
    var ButtonComp = {
        render: function (ctx, me) {
            me.tag = "div";
            ctx.disabled = ctx.data.action === null;
            ctx.down = ctx.hover && ctx.mousedown || ctx.keydown;
            me.style = ctx.cfg.buttonStyle(ctx);
            me.attrs = { tabindex: ctx.disabled ? -1 : 0 };
            me.children = ctx.data.content;
        },
        onFocus: function (ctx) {
            if (ctx.disabled)
                return false;
            ctx.focused = true;
            b.invalidate(ctx);
            return false;
        },
        onBlur: function (ctx) {
            ctx.focused = false;
            b.invalidate(ctx);
            return false;
        },
        onMouseEnter: function (ctx) {
            ctx.hover = true;
            b.invalidate(ctx);
            return false;
        },
        onMouseLeave: function (ctx) {
            ctx.hover = false;
            b.invalidate(ctx);
            return false;
        },
        onMouseDown: function (ctx) {
            if (ctx.disabled)
                return true;
            ctx.mousedown = true;
            b.registerMouseOwner(ctx);
            b.invalidate(ctx);
            return false;
        },
        onMouseUp: function (ctx) {
            if (ctx.disabled)
                return true;
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
        onClick: function () {
            return true;
        },
        onKeyDown: function (ctx, param) {
            if (ctx.disabled)
                return false;
            if (param.which == 32 || param.which == 13) {
                ctx.keydown = true;
                b.invalidate(ctx);
                return true;
            }
        },
        onKeyUp: function (ctx, param) {
            if (ctx.disabled)
                return false;
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
    function button(content, action) {
        return {
            data: { action: action, content: content },
            component: ButtonComp
        };
    }
    function h(name, content) {
        return { tag: name, children: content };
    }
    function style(style, content) {
        content.style = style;
        return content;
    }
    function comp(component, node) {
        b.postEnhance(node, component);
        return node;
    }
    function layoutPair(left, right, leftWidth) {
        if (leftWidth === void 0) { leftWidth = "50%"; }
        return d({ display: "table", width: "100%" }, [
            d({ display: "table-cell", verticalAlign: "top", width: leftWidth }, left),
            d({ display: "table-cell", verticalAlign: "top" }, right)
        ]);
    }
    function checkbox(value, onChange) {
        return { tag: "input", attrs: { type: "checkbox", value: value }, component: { onChange: function (ctx, v) { return onChange(v); } } };
    }
    var PopupButtonStyle;
    (function (PopupButtonStyle) {
        PopupButtonStyle[PopupButtonStyle["Normal"] = 0] = "Normal";
        PopupButtonStyle[PopupButtonStyle["Default"] = 1] = "Default";
        PopupButtonStyle[PopupButtonStyle["Cancel"] = 2] = "Cancel";
        PopupButtonStyle[PopupButtonStyle["DefaultCancel"] = 3] = "DefaultCancel";
    })(PopupButtonStyle || (PopupButtonStyle = {}));
    function innerpopup(cfg, title, width, buttons, hideAction, content) {
        var buttonNodes = [];
        var defaultAction = function () { return false; };
        var cancelAction = function () { return false; };
        for (var i = 0; i < buttons.length; i++) {
            if (i > 0)
                buttonNodes.push(" ");
            var bb = buttons[i];
            var action = function () { return true; };
            if (bb.action)
                action = bb.action;
            action = (function (act) { return function () {
                var res = act();
                if (typeof res === "boolean") {
                    if (res)
                        hideAction();
                }
                else {
                    res.then(function (v) {
                        if (v)
                            hideAction();
                    });
                }
                return true;
            }; })(action);
            if ((bb.style & PopupButtonStyle.Default) != 0)
                defaultAction = action;
            if ((bb.style & PopupButtonStyle.Cancel) != 0)
                cancelAction = action;
            buttonNodes.push(button(bb.content, action));
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
                init: function (ctx) {
                    ctx.cfg = ctx.data.cfg;
                },
                render: function (ctx) {
                    ctx.cfg = ctx.data.cfg;
                },
                onKeyDown: function (ctx, param) {
                    if (param.which == 13) {
                        return defaultAction();
                    }
                    if (param.which == 27) {
                        return cancelAction();
                    }
                    return false;
                },
                shouldStopBubble: function () {
                    return true;
                },
                postInitDom: function (ctx, me) {
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
                                    onClick: function () {
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
                                }, h("td", "×")))
                            ]),
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
    function popup(title, width, buttons, hideAction, content) {
        return {
            tag: "span",
            data: { title: title, width: width, buttons: buttons, hideAction: hideAction, content: content },
            component: {
                init: function (ctx, me) {
                    ctx.rid = b.addRoot(function () {
                        var c = ctx.data;
                        return innerpopup(ctx.cfg, c.title, c.width, c.buttons, c.hideAction, c.content);
                    });
                },
                destroy: function (ctx) {
                    b.removeRoot(ctx.rid);
                }
            }
        };
    }
    function input(value, change) {
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
                onChange: function (ctx, v) {
                    change(v);
                }
            }
        };
    }
    var v1 = false, v2 = false, v3 = false, v4 = false, v5 = false, v6 = false;
    var v6resolver;
    var s1 = "", s2 = "";
    b.init(function () {
        return {
            tag: "div",
            cfg: {
                buttonStyle: defaultButtonStyle
            },
            component: {},
            children: [
                h("h1", "Popup sample"),
                h("div", [
                    button("Enabled", function () {
                        v1 = true;
                        b.invalidate();
                        setTimeout(function () {
                            v1 = false;
                            b.invalidate();
                        }, 1000);
                    }), " ",
                    button(v1 ? "Enabled" : "Disabled", v1 ? undefined : null)
                ]),
                h("div", [v1 && "Clicked"]),
                d({}, [button("Show popup", function () {
                        v2 = true;
                        b.invalidate();
                    }),
                    v2 && popup("First popup", "300px", [{
                            content: "Ok", style: PopupButtonStyle.Default, action: function () {
                                v3 = true;
                                b.invalidate();
                                return true;
                            }
                        }, {
                            content: "Cancel", style: PopupButtonStyle.Cancel, action: function () {
                                if (v5) {
                                    v6 = true;
                                    b.invalidate();
                                    return new Promise(function (resolve, reject) {
                                        v6resolver = resolve;
                                    });
                                }
                                return true;
                            }
                        }], function () {
                        v2 = false;
                        b.invalidate();
                    }, [layoutPair(h("label", "First:"), input(s1, function (v) { return s1 = v; }), "40%"),
                        layoutPair(h("label", "Second:"), input(s2, function (v) { return s2 = v; }), "40%"),
                        h("div", h("label", [checkbox(v5, function (v) {
                                v5 = v;
                                b.invalidate();
                            }), "Annoying cancel"])),
                        button("Show nested popup", function () {
                            v4 = true;
                            b.invalidate();
                        }),
                        v4 && popup("Nested", "200px", [{ content: "Ok", style: PopupButtonStyle.DefaultCancel }], function () {
                            v4 = false;
                            b.invalidate();
                        }, [
                            h("p", "Hello from nested dialog. Cool, isn't it!")
                        ]),
                        "",
                        v6 && popup("Annoying", "150px", [{
                                content: "Yes", style: PopupButtonStyle.Default, action: function () {
                                    v6resolver(true);
                                    v6resolver = null;
                                    return true;
                                }
                            }, {
                                content: "No", style: PopupButtonStyle.Cancel, action: function () {
                                    v6resolver(false);
                                    v6resolver = null;
                                    return true;
                                }
                            }], function () {
                            v6 = false;
                            b.invalidate();
                        }, h("p", "Are you sure to lose all data?"))
                    ]),
                    "",
                    v3 && popup("Info", "150px", [{ content: "Ok", style: PopupButtonStyle.DefaultCancel }], function () {
                        v3 = false;
                        b.invalidate();
                    }, h("p", "Selected Ok"))
                ])
            ]
        };
    });
})(PopupApp || (PopupApp = {}));
