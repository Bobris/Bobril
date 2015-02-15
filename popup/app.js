/// <reference path="../../src/bobril.d.ts"/>
/// <reference path="../../src/bobril.onchange.d.ts"/>
/// <reference path="../../src/bobril.mouse.d.ts"/>
/// <reference path="../../src/bobril.onkey.d.ts"/>
/// <reference path="../../src/bobril.focus.d.ts"/>
/// <reference path="../../src/bobril.media.d.ts"/>
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
            padding: "3px",
            boxSizing: "border-box",
            background: "#fff",
            outline: "none",
            color: "#000",
            textAlign: "center",
            borderRadius: "3px",
            borderColor: "#000",
            borderStyle: "solid",
            borderWidth: "1px",
            minWidth: "60px",
            cursor: "pointer",
            userSelect: "none",
            position: "relative",
            left: "0px",
            top: "0px"
        };
        if (ctx.disabled) {
            style.background = "#ccc";
            style.color = "#877";
            return style;
        }
        if (ctx.focused) {
            style.borderWidth = "2px";
            style.padding = "2px";
        }
        if (ctx.hover) {
            style.background = "#e2e2f2";
        }
        if (ctx.down) {
            style.left = "1px";
            style.top = "1px";
        }
        return style;
    }
    var ButtonComp = {
        render: function (ctx, me) {
            ctx.disabled = ctx.data.action === null;
            ctx.down = ctx.hover && ctx.mousedown || ctx.keydown;
            me.style = ctx.cfg.buttonStyle(ctx);
            me.attrs.tabIndex = ctx.disabled ? undefined : 0;
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
            tag: "div",
            style: undefined,
            attrs: {},
            children: content,
            data: { action: action },
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
    })(PopupButtonStyle || (PopupButtonStyle = {}));
    function popup(title, width, buttons, hideAction, content) {
        function renderButtons(buttons, hideAction) {
            var res = [];
            for (var i = 0; i < buttons.length; i++) {
                if (i > 0)
                    res.push(" ");
                var bb = buttons[i];
                var action = function () { return true; };
                if (bb.action)
                    action = bb.action;
                if (bb.style === 1 /* Default */ || bb.style === 2 /* Cancel */) {
                    action = (function (act) { return function () {
                        if (act())
                            hideAction();
                        return true;
                    }; })(action);
                }
                res.push(button(bb.content, action));
            }
            return res;
        }
        return {
            tag: "div",
            style: {
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                height: "100%",
                background: "rgba(0,0,0,0.5)",
                display: "table"
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
                                style({
                                    padding: "2px",
                                    width: "1.5em",
                                    borderRadius: "3px",
                                    border: "#000 solid 1px",
                                    textAlign: "center",
                                    cursor: "pointer",
                                    userSelect: "none",
                                    fontWeight: "bold"
                                }, h("td", "×"))
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
                                children: renderButtons(buttons, hideAction)
                            })
                        ]
                    }
                }
            }
        };
    }
    var v1 = false, v2 = false, v3 = false;
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
                    }),
                    " ",
                    button(v1 ? "Enabled" : "Disabled", v1 ? undefined : null)
                ]),
                h("div", [v1 && "Clicked"]),
                d({}, [button("Show popup", function () {
                    v2 = true;
                    b.invalidate();
                }), v2 && popup("First popup", "200px", [{
                    content: "Ok",
                    style: 1 /* Default */,
                    action: function () {
                        v3 = true;
                        b.invalidate();
                        return true;
                    }
                }, { content: "Cancel", style: 2 /* Cancel */ }], function () {
                    v2 = false;
                    b.invalidate();
                }, [h("h2", "Some content"), h("p", "Lorem ipsum ...")]), v3 && popup("Info", "150px", [{ content: "Ok", style: 1 /* Default */ }], function () {
                    v3 = false;
                    b.invalidate();
                }, h("p", "Clicked Ok"))])
            ]
        };
    });
})(PopupApp || (PopupApp = {}));
//# sourceMappingURL=app.js.map