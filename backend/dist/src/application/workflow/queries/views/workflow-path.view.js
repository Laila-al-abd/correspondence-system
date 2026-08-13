"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toWorkflowPathView = toWorkflowPathView;
function toWorkflowPathView(path) {
    const s = path.snapshot();
    return {
        id: path.id.toString(),
        templateId: s.templateId,
        name: s.name,
        description: s.description,
        isActive: s.isActive,
        steps: s.steps,
    };
}
//# sourceMappingURL=workflow-path.view.js.map