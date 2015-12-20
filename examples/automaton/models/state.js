var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var State = (function () {
            function State(point, color) {
                if (color === void 0) { color = 'white'; }
                this.point = point;
                this.color = color;
            }
            State.prototype.setCoords = function (x, y) {
                this.point.setCoords(x, y);
            };
            return State;
        }());
        Models.State = State;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
