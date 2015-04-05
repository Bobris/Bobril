var StringExt;
(function (StringExt) {
    function format(str) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return str.replace(/{(\d+)}/g, function (match, num) { return typeof args[num] !== 'undefined' ? args[num] : match; });
    }
    StringExt.format = format;
    ;
})(StringExt || (StringExt = {}));
