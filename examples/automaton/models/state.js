var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        class State {
            constructor(point, color = 'white') {
                this.point = point;
                this.color = color;
            }
            setCoords(x, y) {
                this.point.setCoords(x, y);
            }
        }
        Models.State = State;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
