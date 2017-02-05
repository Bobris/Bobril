var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Automata;
(function (Automata) {
    var Models;
    (function (Models) {
        var NewTransition = (function (_super) {
            __extends(NewTransition, _super);
            function NewTransition() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            return NewTransition;
        }(Models.Transition));
        Models.NewTransition = NewTransition;
    })(Models = Automata.Models || (Automata.Models = {}));
})(Automata || (Automata = {}));
