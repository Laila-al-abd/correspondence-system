export enum CalendarPeriodType { EXAM = "EXAM", REGISTRATION 
= "REGISTRATION", HOLIDAY = "HOLIDAY", REGULAR = "REGULAR" }
export enum EventType {
STATUS_CHANGE = "STATUS_CHANGE", STEP_STARTED = "STEP_STARTED", STEP_COMPLETED = "STEP_COMPLETED",
ACTION_TAKEN = "ACTION_TAKEN", ASSIGNED = "ASSIGNED",
}
/**
 * What produced a stored prediction.
 *
 * SLA_RISK_BASELINE is written by SlaMonitorService, which is a rule -- a
 * countdown in working hours -- not a model. It is named for what it is. The
 * member used to be called LSTM_REMAINING_TIME, which promised a sequence model
 * that does not exist: anyone reading the table saw model_type LSTM next to
 * model_version 'baseline-rule-v1' and had to be told the label was aspirational.
 * A learned estimator would be a new member alongside this one, so the two could
 * be compared instead of confused.
 */
export enum ModelType { NLP_CLASSIFIER = "NLP_CLASSIFIER", NLP_EXTRACTOR = "NLP_EXTRACTOR", 
    SLA_RISK_BASELINE = "SLA_RISK_BASELINE" }