export default function Loading() {
  return (
    <div
      className="flex min-h-[60vh] items-center justify-center"
      role="status"
      aria-label="Loading Axiora Store">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-primary/20" />
        <div className="absolute inset-0 rounded-full border-[3px] border-transparent border-t-primary animate-spin" />
      </div>
      <span className="sr-only">Loading Axiora Store…</span>
    </div>
  );
}
