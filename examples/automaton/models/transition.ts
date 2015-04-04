module Automata.Models {
    export class Transition {
        input: string;
        textPosition: Point;

        constructor(public from: State, public to: State, public midPoint?: Point) {
            if (from == null || to == null) {
                return;
            }
            if (midPoint == null) {
                this.midPoint = new Point((from.point.x + to.point.x) / 2, (from.point.y + to.point.y) / 2);
            }
            this.textPosition = new Point(-10, -10);
        }

        isLoop(): boolean {
            return this.from === this.to;
        }

        resetMidPoint(): void {
            if (this.isLoop()) {
                return;
            }
            this.midPoint.setCoords((this.from.point.x + this.to.point.x) / 2, (this.from.point.y + this.to.point.y) / 2);
        }

        stateMoved(from: Models.Point, oldTo: Models.Point, newTo: Models.Point): void {
            if (this.isLoop()) {
                this.midPoint.setCoords(this.midPoint.x + 0.5 * (newTo.x - oldTo.x), this.midPoint.y + 0.5 * (newTo.y - oldTo.y));
                return;
            }

            var fromTo: number = new Models.Vector(from, oldTo).getLength();
            var fromMid: number = new Models.Vector(from, this.midPoint).getLength();
            if (fromTo !== 0) {
                var scale = fromMid / fromTo;
                if (scale > 1) {
                    scale = Math.sqrt(scale);
                }
                var xdist: number = (newTo.x - oldTo.x) * scale;
                var ydist: number = (newTo.y - oldTo.y) * scale;
                this.midPoint.setCoords(this.midPoint.x + xdist, this.midPoint.y + ydist);
            }
        }

        moveMidPoint(point: Models.Point): void {
            if (this.isLoop()) {
                var vect: Models.Vector = new Vector(this.from.point, point);
                var dist: number = vect.getLength();
                if (dist < 60) {
                    var fromPoint: Models.Point = this.from.point;
                    this.midPoint = new Point(fromPoint.x, fromPoint.y).addVector(vect, 60 / dist);
                } else {
                    this.midPoint = point;
                }
            } else {
                var fromTo: number = new Models.Vector(this.from.point, this.to.point).getLength();
                var fromMid: number = new Models.Vector(this.from.point, point).getLength();
                var midTo: number = new Models.Vector(point, this.to.point).getLength();
                var scale: number = fromTo / (fromMid + midTo) / 2;
                var minDistance: number = 30;
                if (scale > 0.4995 || fromMid < minDistance || midTo < minDistance) {
                    this.resetMidPoint();
                } else {
                    this.midPoint = point;
                }
            }
        }
    }
}
