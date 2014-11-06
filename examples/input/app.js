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

    b.init(function () {
        frame++;
        return [
            h("h1", "Input Bobril sample"),
            textInput(value, setValue),
            h("p", "Entered: ", value),
            h("p", "Frame: " + frame)
        ];
    });
})(InputApp || (InputApp = {}));
//# sourceMappingURL=app.js.map
