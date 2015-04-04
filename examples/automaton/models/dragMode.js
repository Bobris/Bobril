var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        (function (DragMode) {
            DragMode[DragMode["Move"] = 0] = "Move";
            DragMode[DragMode["NewEdge"] = 1] = "NewEdge";
        })(Models.DragMode || (Models.DragMode = {}));
        var DragMode = Models.DragMode;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
