var Automata;
(function (Automata) {
    var automaton = new Automata.Models.Automaton();
    automaton.addState(new Automata.Models.Point(90, 65));
    automaton.addState(new Automata.Models.Point(230, 50));
    automaton.addState(new Automata.Models.Point(120, 300));
    automaton.addState(new Automata.Models.Point(180, 180));
    automaton.addState(new Automata.Models.Point(450, 90));
    automaton.addTransition(automaton.states[0], automaton.states[1]);
    automaton.addTransition(automaton.states[0], automaton.states[2]);
    automaton.addTransition(automaton.states[1], automaton.states[3]);
    automaton.addTransition(automaton.states[1], automaton.states[4], new Automata.Models.Point(350, 40));
    automaton.addTransition(automaton.states[2], automaton.states[4], new Automata.Models.Point(350, 230));
    automaton.addTransition(automaton.states[3], automaton.states[2]);
    automaton.addTransition(automaton.states[4], automaton.states[1], new Automata.Models.Point(330, 100));
    automaton.addTransition(automaton.states[4], automaton.states[4], new Automata.Models.Point(510, 150));
    b.init(function () { return [
        {
            tag: 'h2',
            children: 'Automaton (Bobril Demo)'
        },
        Automata.Components.Canvas.Get({
            content: Automata.Components.Graph.Get({ automaton: automaton })
        }),
        Automata.Components.Help.Get()
    ]; });
})(Automata || (Automata = {}));
