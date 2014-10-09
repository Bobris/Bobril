/// <reference path="../../src/bobril.d.ts"/>
function p() {
    var args = [];
    for (var _i = 0; _i < (arguments.length - 0); _i++) {
        args[_i] = arguments[_i + 0];
    }
    return { tag: "p", children: args };
}

var frame = 0;
var value = "Change this";

var MyInput = (function () {
    function MyInput() {
    }
    MyInput.onChange = function (ctx, v) {
        value = v;
        b.invalidate();
    };
    return MyInput;
})();

b.init(function () {
    frame++;
    return [
        { tag: "h1", children: "Input Bobril sample" },
        { tag: "input", attrs: { value: value }, component: MyInput },
        p("Entered: " + value),
        p("Frame: ", frame)
    ];
});
//# sourceMappingURL=app.js.map
