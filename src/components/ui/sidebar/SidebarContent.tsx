
import * as React from "react"
import { cn } from "@/lib/utils"

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-sidebar="content"
    className={cn("flex w-full flex-col gap-4", className)}
    {...props}
  />
))
SidebarContent.displayName = "SidebarContent"
