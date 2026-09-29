import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <span
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-card", className)}
      {...props}
    />
  )
}

export { Skeleton }
