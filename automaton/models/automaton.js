var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var Automaton = (function () {
            function Automaton() {
                this.states = new Array();
                this.transitions = new Array();
            }
            Automaton.prototype.addState = function (point) {
                var state = new Models.State(point);
                state.isStart = this.states.length === 0;
                state.name = this.getStateName();
                this.states.push(state);
                return state;
            };
            Automaton.prototype.removeState = function (state) {
                var index = this.states.indexOf(state);
                if (index < 0) {
                    return null;
                }
                for (var i = this.transitions.length - 1; i >= 0; i--) {
                    if (this.transitions[i].from === state || this.transitions[i].to === state) {
                        this.transitions.splice(i, 1);
                    }
                }
                this.states.splice(index, 1);
                return null;
            };
            Automaton.prototype.addTransition = function (start, end, midPoint) {
                if (this.transitions.some(function (e) { return e.from === start && e.to === end; })) {
                    return;
                }
                var transition = new Models.Transition(start, end, midPoint);
                this.transitions.push(transition);
                return transition;
            };
            Automaton.prototype.removeTransition = function (transition) {
                var index = this.transitions.indexOf(transition);
                if (index < 0) {
                    return;
                }
                this.transitions.splice(index, 1);
                return;
            };
            Automaton.prototype.getStateName = function () {
                var idx = 1;
                var exists = true;
                var name = null;
                while (exists) {
                    name = 'q' + idx;
                    exists = false;
                    for (var i = 0; i < this.states.length; i++) {
                        if (this.states[i].name === name) {
                            exists = true;
                            break;
                        }
                    }
                    idx++;
                }
                return name;
            };
            Automaton.prototype.moveState = function (state, toPoint) {
                for (var i = 0; i < this.transitions.length; i++) {
                    var transition = this.transitions[i];
                    if (transition.from === state) {
                        transition.stateMoved(transition.to.point, transition.from.point, toPoint);
                    }
                    if (transition.to === state) {
                        transition.stateMoved(transition.from.point, transition.to.point, toPoint);
                    }
                }
                state.point = toPoint;
            };
            return Automaton;
        }());
        Models.Automaton = Automaton;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
