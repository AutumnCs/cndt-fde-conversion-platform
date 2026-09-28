CREATE TYPE "TransferStatus" AS ENUM ('PENDING_ACCEPTANCE', 'ACCEPTED', 'CANCELLED');

CREATE TABLE "TransferTicket" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "specialistId" TEXT NOT NULL,
    "status" "TransferStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "acceptedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "TransferTicket_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FollowUpRecord" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "customerFeedback" TEXT NOT NULL,
    "nextAction" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FollowUpRecord_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "TransferTicket_leadId_key" ON "TransferTicket"("leadId");
CREATE INDEX "TransferTicket_specialistId_status_idx" ON "TransferTicket"("specialistId", "status");
CREATE INDEX "TransferTicket_managerId_createdAt_idx" ON "TransferTicket"("managerId", "createdAt");
CREATE INDEX "FollowUpRecord_leadId_createdAt_idx" ON "FollowUpRecord"("leadId", "createdAt");

ALTER TABLE "TransferTicket" ADD CONSTRAINT "TransferTicket_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferTicket" ADD CONSTRAINT "TransferTicket_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "InternalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TransferTicket" ADD CONSTRAINT "TransferTicket_specialistId_fkey" FOREIGN KEY ("specialistId") REFERENCES "InternalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FollowUpRecord" ADD CONSTRAINT "FollowUpRecord_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "FollowUpRecord" ADD CONSTRAINT "FollowUpRecord_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "InternalUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
