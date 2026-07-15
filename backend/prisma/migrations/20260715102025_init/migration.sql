-- CreateTable
CREATE TABLE "languages" (
    "code" VARCHAR(10) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "native_name" VARCHAR(100) NOT NULL,
    "is_enabled" BOOLEAN NOT NULL DEFAULT true,
    "is_default" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "languages_pkey" PRIMARY KEY ("code")
);
