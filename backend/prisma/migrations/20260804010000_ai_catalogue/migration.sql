-- Template identity for the AI service: a stable code the model can name a
-- template by, and the exact Arabic document the bi-encoder embeds.
ALTER TABLE "templates" ADD COLUMN "code" VARCHAR(50);
ALTER TABLE "templates" ADD COLUMN "classifier_document" TEXT;
CREATE UNIQUE INDEX "templates_code_key" ON "templates"("code");

-- The Arabic question the extractive QA model is asked for this field. It is a
-- model input the extractor was fine-tuned on, not display text.
ALTER TABLE "template_fields" ADD COLUMN "extraction_question" TEXT;

-- Extraction predictions are recorded per field, so accuracy can be measured
-- per field rather than as one meaningless average. NULL for classification.
ALTER TABLE "ml_predictions" ADD COLUMN "field_key" VARCHAR(100);
CREATE INDEX "ml_predictions_model_type_field_key_idx" ON "ml_predictions"("model_type", "field_key");
