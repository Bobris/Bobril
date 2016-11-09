var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var Vector = (function () {
            function Vector(from, to) {
                this.x = to.x - from.x;
                this.y = to.y - from.y;
            }
            Vector.prototype.getLength = function () {
                return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
            };
            Vector.prototype.getPerpendicular = function () {
                return new Vector(new Models.Point(0, 0), new Models.Point(-this.y, this.x));
            };
            Vector.prototype.toString = function () {
                return this.x + ',' + this.y;
            };
            return Vector;
        }());
        Models.Vector = Vector;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
