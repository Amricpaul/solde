import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * Groups several inputs into a single bordered box (iOS-style): fields stack with
 * no gap, separated only by a divider, and the whole box highlights on focus.
 *
 * Child inputs (anything with `data-slot="input"`, e.g. FloatingLabelInput) are
 * stripped of their own border / ring / rounding / background so the group owns
 * the chrome. Put one field per direct child — the divider is drawn between them.
 */
function FieldGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="field-group"
      className={cn(
        "divide-y divide-border overflow-hidden rounded-xl border border-input bg-transparent transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 dark:bg-input/30",
        "[&_[data-slot=input]]:rounded-none [&_[data-slot=input]]:border-0 [&_[data-slot=input]]:bg-transparent [&_[data-slot=input]]:focus-visible:ring-0 dark:[&_[data-slot=input]]:bg-transparent",
        className
      )}
      {...props}
    />
  )
}

export { FieldGroup }
