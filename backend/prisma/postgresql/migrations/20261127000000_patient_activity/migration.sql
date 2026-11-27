-- CreateTable
CREATE TABLE "PatientActivity" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "patientName" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "summary" TEXT NOT NULL,
    "detail" JSONB,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PatientActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PatientActivity_type_createdAt_idx" ON "PatientActivity"("type", "createdAt");

-- CreateIndex
CREATE INDEX "PatientActivity_reference_idx" ON "PatientActivity"("reference");
