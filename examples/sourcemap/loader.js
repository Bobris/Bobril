var R = (function (name, fn) {
    R.m[name.toLowerCase()] = { fn: fn, exports: undefined };
});
R.m = Object.create(null);
R.r = function (name, parent) {
    var p = R.map[name];
    if (p == null)
        p = name;
    if (p[0] === '.') {
        var parts = parent ? parent.split("/") : [];
        parts.push('..');
        parts = parts.concat(p.split("/"));
        var newParts = [];
        for (var i = 0, l = parts.length; i < l; i++) {
            var part = parts[i];
            if (!part || part === ".")
                continue;
            if (part === "..")
                newParts.pop();
            else
                newParts.push(part);
        }
        p = newParts.join("/");
    }
    var m = R.m[p.toLowerCase()];
    if (m == null)
        throw new Error("Module " + name + " in " + (parent || "/") + " not registered");
    if (m.exports !== undefined)
        return m.exports;
    m.exports = {};
    m.fn.call(window, function (name) { return R.r(name, p); }, m, m.exports);
    return m.exports;
};
