-- CreateTable
CREATE TABLE "public"."GrandTirage" (
    "id" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "totalParticipants" INTEGER NOT NULL,
    "drawDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conductedBy" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "GrandTirage_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."GrandTirage" ADD CONSTRAINT "GrandTirage_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
