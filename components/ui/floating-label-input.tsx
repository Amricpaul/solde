"use client"

import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * Input with a floating label: the label sits inside the field as a placeholder,
 * then shrinks and rises to the top when the field is focused or filled. Pure CSS
 * (peer + :placeholder-shown) — the forced `placeholder=" "` is what drives it.
 *
 * `endAdornment` renders an absolutely-positioned control on the right (e.g. a
 * password show/hide toggle).
 */
function FloatingLabelInput({
  id,
  label,
  className,
  type,
  endAdornment,
  ...props
}: React.ComponentProps<"input"> & { label: string; endAdornment?: React.ReactNode }) {
  const generatedId = React.useId()
  const inputId = id ?? generatedId

  return (
    <div className="relative">
      <InputPrimitive
        id={inputId}
        type={type}
        data-slot="input"
        className={cn(
          "peer h-14 w-full min-w-0 rounded-lg border border-input bg-transparent px-4 pt-6 pb-1 text-base transition-colors outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
          endAdornment && "pr-10",
          className
        )}
        {...props}
        // Required for the :placeholder-shown trick — kept after the spread so a
        // caller's placeholder can't accidentally disable the floating label.
        placeholder=" "
      />
      <label
        htmlFor={inputId}
        className={cn(
          "pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground/40 transition-all duration-150 select-none",
          // Floated state — focused, or holds a value (placeholder no longer shown).
          "peer-focus:top-1.5 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:font-medium peer-focus:text-foreground/60",
          "peer-not-placeholder-shown:top-2.5 peer-not-placeholder-shown:translate-y-0 peer-not-placeholder-shown:text-xs peer-not-placeholder-shown:font-medium"
        )}
      >
        {label}
      </label>
      {endAdornment ? (
        <div className="absolute inset-y-0 right-0 flex items-center pr-1">{endAdornment}</div>
      ) : null}
    </div>
  )
}

export { FloatingLabelInput }
