-- AlterTable: add actor attribution to order status history (SYSTEM default preserves existing rows)
ALTER TABLE "OrderStatusHistory" ADD COLUMN "actor" TEXT NOT NULL DEFAULT 'SYSTEM';

-- Backfill: rows written by customer cancellation carry actor CUSTOMER.
-- All other historical notes ("Order placed", "Payment confirmed", "Payment failed",
-- "Payment window expired") were written by server-side paths and correctly remain SYSTEM.
UPDATE "OrderStatusHistory" SET "actor" = 'CUSTOMER' WHERE "note" = 'Cancelled by customer';
