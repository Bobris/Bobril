var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        class Point {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }
            addVector(vector, scale) {
                this.x += vector.x * scale;
                this.y += vector.y * scale;
                return this;
            }
            setCoords(x, y) {
                this.x = x;
                this.y = y;
            }
            equals(other) {
                return this.x === other.x && this.y === other.y;
            }
            toString() {
                return this.x + ',' + this.y;
            }
        }
        Models.Point = Point;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
