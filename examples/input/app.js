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

    

    var TextInputComponent = (function () {
        function TextInputComponent() {
        }
        TextInputComponent.shouldChange = function (ctx, me, oldMe) {
            return me.attrs.value !== oldMe.attrs.value || me.data.onChange !== oldMe.data.onChange;
        };

        TextInputComponent.onChange = function (ctx, v) {
            ctx.data.onChange(v);
        };
        return TextInputComponent;
    })();

    function textInput(value, onChange) {
        return { tag: "input", attrs: { value: value }, data: { onChange: onChange }, component: TextInputComponent };
    }

    

    var CheckboxComponent = (function () {
        function CheckboxComponent() {
        }
        CheckboxComponent.onChange = function (ctx, v) {
            ctx.data.onChange(v);
        };
        return CheckboxComponent;
    })();

    function checkbox(value, onChange) {
        return { tag: "input", attrs: { type: "checkbox", value: value }, data: { onChange: onChange }, component: CheckboxComponent };
    }

    function radiobox(groupName, value, onChange) {
        return { tag: "input", attrs: { type: "radio", name: groupName, value: value }, data: { onChange: onChange }, component: CheckboxComponent };
    }

    b.init(function () {
        frame++;
        return [
            h("h1", "Input Bobril sample"),
            textInput(value, setValue),
            h("p", "Entered: ", value),
            h("label", checkbox(checked, setChecked), "Checkbox"),
            h("p", "Checked: ", checked ? "Yes" : "No"),
            h("label", radiobox("g1", radio1, setRadio1), "Radio 1"),
            h("label", radiobox("g1", radio2, setRadio2), "Radio 2"),
            h("p", "Radio1: ", radio1 ? "Yes" : "No", " Radio2: ", radio2 ? "Yes" : "No"),
            h("p", "Frame: " + frame)
        ];
    });
})(InputApp || (InputApp = {}));
//# sourceMappingURL=app.js.map
