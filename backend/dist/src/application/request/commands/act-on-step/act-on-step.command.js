"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActOnStepCommand = exports.StepActionKind = void 0;
var StepActionKind;
(function (StepActionKind) {
    StepActionKind["START"] = "START";
    StepActionKind["COMPLETE"] = "COMPLETE";
    StepActionKind["REJECT"] = "REJECT";
    StepActionKind["SKIP"] = "SKIP";
})(StepActionKind || (exports.StepActionKind = StepActionKind = {}));
class ActOnStepCommand {
    input;
    constructor(input) {
        this.input = input;
    }
}
exports.ActOnStepCommand = ActOnStepCommand;
//# sourceMappingURL=act-on-step.command.js.map