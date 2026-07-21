-- CreateTable
CREATE TABLE "template_field_options" (
    "id" BIGSERIAL NOT NULL,
    "template_field_id" BIGINT NOT NULL,
    "value" VARCHAR(100) NOT NULL,
    "label" JSONB NOT NULL,
    "ordinal" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "template_field_options_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "template_field_options_template_field_id_idx" ON "template_field_options"("template_field_id");

-- CreateIndex
CREATE UNIQUE INDEX "template_field_options_template_field_id_value_key" ON "template_field_options"("template_field_id", "value");

-- AddForeignKey
ALTER TABLE "template_field_options" ADD CONSTRAINT "template_field_options_template_field_id_fkey" FOREIGN KEY ("template_field_id") REFERENCES "template_fields"("id") ON DELETE CASCADE ON UPDATE CASCADE;
