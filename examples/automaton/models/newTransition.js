var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var NewTransition = (function (_super) {
            __extends(NewTransition, _super);
            function NewTransition() {
                _super.apply(this, arguments);
            }
            return NewTransition;
        })(Models.Transition);
        Models.NewTransition = NewTransition;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
