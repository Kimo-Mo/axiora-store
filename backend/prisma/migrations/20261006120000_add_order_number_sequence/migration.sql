-- Human-readable order numbers (AX-YYYYNNNN) are drawn from a PostgreSQL
-- sequence inside the order-creation transaction. A sequence is atomic by
-- design; deriving numbers from count(*) would reintroduce the read-then-write
-- race the constitution prohibits (research.md D-1).
CREATE SEQUENCE "OrderNumberSeq" START 1;
