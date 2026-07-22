export enum ClassificationStatus { PENDING = "PENDING", CLASSIFIED = "CLASSIFIED", HITL = "HITL" }
export enum ClassifiedBy { NLP = "NLP", HITL = "HITL" }
export enum RequestStatus {
DRAFT = "DRAFT", IN_PROGRESS = "IN_PROGRESS", ON_HOLD = "ON_HOLD",
COMPLETED = "COMPLETED", REJECTED = "REJECTED", CANCELLED = 
"CANCELLED",
}
export enum StepInstanceStatus {
PENDING = "PENDING", IN_PROGRESS = "IN_PROGRESS", WAITING = 
"WAITING",
DONE = "DONE", SKIPPED = "SKIPPED", REJECTED = "REJECTED",
}
export enum Priority { LOW = "LOW", NORMAL = "NORMAL", HIGH = 
"HIGH", URGENT = "URGENT" }
export enum PaymentStatus { REQUIRED = "REQUIRED", CONFIRMED 
= "CONFIRMED", WAIVED = "WAIVED" }
export enum DocKind { UPLOADED = "UPLOADED", GENERATED = "GENERATED" }

export enum SlaRisk { ON_TRACK = "ON_TRACK", AT_RISK = "AT_RISK", BREACHED = "BREACHED" }

/** Higher number = more important. Business-importance axis, set by people. */
export const PRIORITY_RANK: Record<Priority, number> = {
[Priority.LOW]: 0,
[Priority.NORMAL]: 1,
[Priority.HIGH]: 2,
[Priority.URGENT]: 3,
}

/** Higher number = more time pressure. SLA-urgency axis, set by the LSTM monitor. */
export const SLA_RISK_RANK: Record<SlaRisk, number> = {
[SlaRisk.ON_TRACK]: 0,
[SlaRisk.AT_RISK]: 1,
[SlaRisk.BREACHED]: 2,
}