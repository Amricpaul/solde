import * as React from "react"

import { cn } from "@/lib/utils"
import { FloatingLabelInput } from "./floating-label-input"

/**
 * A form group: a floating-label input plus its (optional) error message, with
 * consistent vertical spacing. Passing `error` also flags the input invalid so
 * it picks up the destructive ring/border styling.
 */
function FormField({
  error,
  className,
  ...props
}: React.ComponentProps<typeof FloatingLabelInput> & { error?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <FloatingLabelInput aria-invalid={error ? true : undefined} {...props} />
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}

export { FormField }
