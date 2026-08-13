"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEligibleTemplateView = toEligibleTemplateView;
function toEligibleTemplateView(template) {
    const s = template.snapshot();
    return {
        id: template.id.toString(),
        title: s.title,
        categoryId: s.categoryId,
        sensitivityLevelId: s.sensitivityLevelId,
    };
}
//# sourceMappingURL=eligible-template.view.js.map