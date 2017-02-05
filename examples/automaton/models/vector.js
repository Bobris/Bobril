var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        class Vector {
            constructor(from, to) {
                this.x = to.x - from.x;
                this.y = to.y - from.y;
            }
            getLength() {
                return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            }
            getPerpendicular() {
                return new Vector(new Models.Point(0, 0), new Models.Point(-this.y, this.x));
            }
            toString() {
                return this.x + ',' + this.y;
            }
        }
        Models.Vector = Vector;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
