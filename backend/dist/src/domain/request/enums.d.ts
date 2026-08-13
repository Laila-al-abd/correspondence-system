export declare enum ClassificationStatus {
    PENDING = "PENDING",
    CLASSIFIED = "CLASSIFIED",
    HITL = "HITL"
}
export declare enum ClassifiedBy {
    NLP = "NLP",
    HITL = "HITL"
}
export declare enum RequestStatus {
    DRAFT = "DRAFT",
    IN_PROGRESS = "IN_PROGRESS",
    ON_HOLD = "ON_HOLD",
    COMPLETED = "COMPLETED",
    REJECTED = "REJECTED",
    CANCELLED = "CANCELLED"
}
export declare enum StepInstanceStatus {
    PENDING = "PENDING",
    IN_PROGRESS = "IN_PROGRESS",
    WAITING = "WAITING",
    DONE = "DONE",
    SKIPPED = "SKIPPED",
    REJECTED = "REJECTED"
}
export declare enum Priority {
    LOW = "LOW",
    NORMAL = "NORMAL",
    HIGH = "HIGH",
    URGENT = "URGENT"
}
export declare enum PaymentStatus {
    REQUIRED = "REQUIRED",
    CONFIRMED = "CONFIRMED",
    WAIVED = "WAIVED"
}
export declare enum DocKind {
    UPLOADED = "UPLOADED",
    GENERATED = "GENERATED"
}
export declare enum SlaRisk {
    ON_TRACK = "ON_TRACK",
    AT_RISK = "AT_RISK",
    BREACHED = "BREACHED"
}
export declare const PRIORITY_RANK: Record<Priority, number>;
export declare const SLA_RISK_RANK: Record<SlaRisk, number>;
