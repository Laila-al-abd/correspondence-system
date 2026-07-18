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