var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var Point = (function () {
            function Point(x, y) {
                this.x = x;
                this.y = y;
            }
            Point.prototype.addVector = function (vector, scale) {
                this.x += vector.x * scale;
                this.y += vector.y * scale;
                return this;
            };
            Point.prototype.setCoords = function (x, y) {
                this.x = x;
                this.y = y;
            };
            Point.prototype.equals = function (other) {
                return this.x === other.x && this.y === other.y;
            };
            Point.prototype.toString = function () {
                return this.x + ',' + this.y;
            };
            return Point;
        })();
        Models.Point = Point;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
