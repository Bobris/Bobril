/// <reference path="../src/bobril.d.ts"/>
(function (b) {
    if (b.ieVersion() !== 8)
        return;
    var chain = b.setSetStyle(patchOpacity);
    function patchOpacity(el, node, newValue, oldValue) {
        var newOpacity = newValue.opacity;
        if (+newOpacity === newOpacity) {
            el.style.zoom = "1";
            if (newOpacity >= 1)
                el.style.filter = "";
            el.style.filter = "alpha(opacity=" + ((newOpacity * 100) | 0) + ")";
        }
        else {
            var oldOpacity = oldValue ? oldValue.opacity : "";
            if (+oldOpacity === oldOpacity) {
                el.style.filter = "";
            }
        }
        chain(el, node, newValue, oldValue);
    }
})(b);
//# sourceMappingURL=bobril.opacityIE8.js.map