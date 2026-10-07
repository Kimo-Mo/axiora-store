import type { prisma } from "../../config/prisma.js";

type PrismaTransactionClient = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

/**
 * Format the customer-facing order number: `AX-YYYYNNNN` with a 4-digit
 * zero-padded sequence value (research.md D-1).
 */
export function formatOrderNumber(year: number, seq: number): string {
  return `AX-${year}${String(seq).padStart(4, "0")}`;
}

/**
 * Draw the next order number inside the caller's transaction.
 *
 * `nextval` is atomic at the database level, so concurrent order creation can
 * never derive the same number — the read-then-write race of `count() + 1`
 * does not exist here (research.md D-1).
 */
export async function nextOrderNumber(tx: PrismaTransactionClient): Promise<string> {
  const rows = await tx.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('"OrderNumberSeq"') AS nextval
  `;
  const nextval = rows[0]?.nextval;
  if (nextval === undefined) {
    throw new Error("OrderNumberSeq returned no value");
  }
  return formatOrderNumber(new Date().getFullYear(), Number(nextval));
}
