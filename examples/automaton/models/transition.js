var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var Transition = (function () {
            function Transition(from, to, midPoint) {
                this.from = from;
                this.to = to;
                this.midPoint = midPoint;
                if (from == null || to == null) {
                    return;
                }
                if (midPoint == null) {
                    this.midPoint = new Models.Point((from.point.x + to.point.x) / 2, (from.point.y + to.point.y) / 2);
                }
                this.textPosition = new Models.Point(-10, -10);
            }
            Transition.prototype.isLoop = function () {
                return this.from === this.to;
            };
            Transition.prototype.resetMidPoint = function () {
                if (this.isLoop()) {
                    return;
                }
                this.midPoint.setCoords((this.from.point.x + this.to.point.x) / 2, (this.from.point.y + this.to.point.y) / 2);
            };
            Transition.prototype.stateMoved = function (from, oldTo, newTo) {
                if (this.isLoop()) {
                    this.midPoint.setCoords(this.midPoint.x + 0.5 * (newTo.x - oldTo.x), this.midPoint.y + 0.5 * (newTo.y - oldTo.y));
                    return;
                }
                var fromTo = new Models.Vector(from, oldTo).getLength();
                var fromMid = new Models.Vector(from, this.midPoint).getLength();
                if (fromTo !== 0) {
                    var scale = fromMid / fromTo;
                    if (scale > 1) {
                        scale = Math.sqrt(scale);
                    }
                    var xdist = (newTo.x - oldTo.x) * scale;
                    var ydist = (newTo.y - oldTo.y) * scale;
                    this.midPoint.setCoords(this.midPoint.x + xdist, this.midPoint.y + ydist);
                }
            };
            Transition.prototype.moveMidPoint = function (point) {
                if (this.isLoop()) {
                    var vect = new Models.Vector(this.from.point, point);
                    var dist = vect.getLength();
                    if (dist < 60) {
                        var fromPoint = this.from.point;
                        this.midPoint = new Models.Point(fromPoint.x, fromPoint.y).addVector(vect, 60 / dist);
                    }
                    else {
                        this.midPoint = point;
                    }
                }
                else {
                    var fromTo = new Models.Vector(this.from.point, this.to.point).getLength();
                    var fromMid = new Models.Vector(this.from.point, point).getLength();
                    var midTo = new Models.Vector(point, this.to.point).getLength();
                    var scale = fromTo / (fromMid + midTo) / 2;
                    var minDistance = 30;
                    if (scale > 0.4995 || fromMid < minDistance || midTo < minDistance) {
                        this.resetMidPoint();
                    }
                    else {
                        this.midPoint = point;
                    }
                }
            };
            return Transition;
        }());
        Models.Transition = Transition;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
