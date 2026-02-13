-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "party_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL,
    "payload_nonce" TEXT NOT NULL,
    "payload_ct" TEXT NOT NULL,
    "payload_tag" TEXT NOT NULL,
    "dek_wrap_nonce" TEXT NOT NULL,
    "dek_wrapped" TEXT NOT NULL,
    "dek_wrap_tag" TEXT NOT NULL,
    "alg" TEXT NOT NULL,
    "mk_version" INTEGER NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_party_id_idx" ON "transactions"("party_id");
