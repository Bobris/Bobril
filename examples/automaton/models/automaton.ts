module Automata.Models {
    export class Automaton {
        states: State[];
        transitions: Transition[];

        constructor() {
            this.states = new Array<State>();
            this.transitions = new Array<Transition>();
        }

        addState(point: Point): Models.State {
            var state = new State(point);
            state.isStart = this.states.length === 0;
            state.name = this.getStateName();
            this.states.push(state);
            return state;
        }

        removeState(state: State): void {
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
        }

        addTransition(start: State, end: State, midPoint?: Point): Models.Transition {
            if (this.transitions.some((e: Transition) => e.from === start && e.to === end)) {
                return;
            }
            var transition = new Transition(start, end, midPoint);
            this.transitions.push(transition);
            return transition;
        }

        removeTransition(transition: Transition): void {
            var index = this.transitions.indexOf(transition);
            if (index < 0) {
                return;
            }
            this.transitions.splice(index, 1);
            return;
        }

        getStateName(): string {
            var idx: number = 1;
            var exists: boolean = true;
            var name: string = null;
            while (exists) {
                name = 'q' + idx;
                exists = false;
                for (var i: number = 0; i < this.states.length; i++) {
                    if (this.states[i].name === name) {
                        exists = true;
                        break;
                    }
                }
                idx++;
            }
            return name;
        }

        moveState(state: State, toPoint: Point): void {
            for (var i: number = 0; i < this.transitions.length; i++) {
                var transition: Models.Transition = this.transitions[i];
                if (transition.from === state) {
                    transition.stateMoved(transition.to.point, transition.from.point, toPoint);
                }
                if (transition.to === state) {
                    transition.stateMoved(transition.from.point, transition.to.point, toPoint);
                }
            }
            state.point = toPoint;
        }
    }
}
