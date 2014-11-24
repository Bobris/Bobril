/// <reference path="../../src/bobril.d.ts"/>
var InputApp;
(function (InputApp) {
    function h(tag) {
        var args = [];
        for (var _i = 0; _i < (arguments.length - 1); _i++) {
            args[_i] = arguments[_i + 1];
        }
        return { tag: tag, children: args };
    }

    function layoutPair(left, right, leftWidth) {
        if (typeof leftWidth === "undefined") { leftWidth = "50%"; }
        return {
            tag: "div",
            attrs: { style: { display: "table", width: "100%" } },
            children: [
                { tag: "div", attrs: { style: { display: "table-cell", "vertical-align": "top", width: leftWidth } }, children: left },
                { tag: "div", attrs: { style: { display: "table-cell", "vertical-align": "top" } }, children: right }
            ]
        };
    }

    var spacer = { tag: "div", attrs: { style: "height:1em" } };

    // Model
    var frame = 0;
    var value = "Change this";

    function setValue(v) {
        value = v;
        b.invalidate();
    }

    var checked = false;

    function setChecked(v) {
        checked = v;
        b.invalidate();
    }

    var radio1 = false;
    var radio2 = false;

    function setRadio1(v) {
        radio1 = v;
        b.invalidate();
    }

    function setRadio2(v) {
        radio2 = v;
        b.invalidate();
    }

    var option = "";

    function setOption(v) {
        option = v;
        b.invalidate();
    }

    var option2 = "";

    function setOption2(v) {
        option2 = v;
        b.invalidate();
    }

    var optionm = [];

    function setOptionm(v) {
        optionm = v;
        b.invalidate();
    }

    var valuearea = "Change this";

    function setValueArea(v) {
        valuearea = v;
        b.invalidate();
    }

    

    var OnChangeComponent = (function () {
        function OnChangeComponent() {
        }
        OnChangeComponent.onChange = function (ctx, v) {
            ctx.data.onChange(v);
        };
        return OnChangeComponent;
    })();

    function textInput(value, onChange) {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function checkbox(value, onChange) {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function radiobox(groupName, value, onChange) {
        return { tag: "input", attrs: { type: "radio", name: groupName, value: value }, data: { onChange: onChange }, component: OnChangeComponent };
    }

    function mapOptions(options) {
        return options.map(function (i) {
            return ({ tag: "option", attrs: { value: i[0] }, children: i[1] });
        });
    }

    function combobox(value, onChange, options) {
        return {
            tag: "select",
            attrs: { value: value },
            data: { onChange: onChange },
            component: OnChangeComponent,
            children: mapOptions(options)
        };
    }

    function listbox(value, onChange, options) {
        return {
            tag: "select",
            attrs: { value: value, size: "" + options.length },
            data: { onChange: onChange },
            component: OnChangeComponent,
            children: mapOptions(options)
        };
    }

    function listboxmulti(value, onChange, options) {
        return {
            tag: "select",
            attrs: { value: value, multiple: true, size: "" + options.length },
            data: { onChange: onChange },
            component: OnChangeComponent,
            children: mapOptions(options)
        };
    }

    function textarea(value, onChange, rows) {
        if (typeof rows === "undefined") { rows = 5; }
        return {
            tag: "textarea",
            attrs: { value: value, rows: rows, style: { width: "100%" } },
            data: { onChange: onChange },
            component: OnChangeComponent
        };
    }

    b.init(function () {
        frame++;
        return [
            h("h1", "Input Bobril sample"),
            layoutPair([
                textInput(value, setValue),
                h("p", "Entered: ", value),
                h("label", checkbox(checked, setChecked), "Checkbox"),
                h("p", "Checked: ", checked ? "Yes" : "No"),
                h("label", radiobox("g1", radio1, setRadio1), "Radio 1"),
                h("label", radiobox("g1", radio2, setRadio2), "Radio 2"),
                h("p", "Radio1: ", radio1 ? "Yes" : "No", " Radio2: ", radio2 ? "Yes" : "No"),
                h("p", "Frame: " + frame)
            ], [
                layoutPair([
                    combobox(option, setOption, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("div", "Combobox: ", option)
                ]),
                spacer,
                layoutPair([
                    listbox(option2, setOption2, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("div", "Listbox: ", option2)
                ]),
                spacer,
                layoutPair([
                    listboxmulti(optionm, setOptionm, [["A", "Angular"], ["B", "Bobril"], ["C", "Cecil"]])
                ], [
                    h("div", "Multiselect: ", optionm.join(", "))
                ]),
                spacer,
                textarea(valuearea, setValueArea),
                h("pre", valuearea)
            ])
        ];
    });
})(InputApp || (InputApp = {}));
//# sourceMappingURL=app.js.map
