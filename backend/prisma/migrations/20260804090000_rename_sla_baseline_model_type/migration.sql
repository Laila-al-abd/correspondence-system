-- The SLA monitor is a rule: it counts remaining working hours against a
-- threshold. Its rows were stamped model_type = 'LSTM_REMAINING_TIME', which
-- named a sequence model that was never built -- so the table read
-- 'LSTM_REMAINING_TIME' next to model_version 'baseline-rule-v1', and the label
-- had to be explained away to anybody who looked. Relabelled to what actually
-- wrote them.
--
-- model_type is a VARCHAR, not a database enum, so this is a data update rather
-- than a type change. Existing rows are rewritten instead of being left behind
-- under a name the code no longer knows: the whole point is that the table can
-- be read without a footnote.
UPDATE "ml_predictions"
SET "model_type" = 'SLA_RISK_BASELINE'
WHERE "model_type" = 'LSTM_REMAINING_TIME';
