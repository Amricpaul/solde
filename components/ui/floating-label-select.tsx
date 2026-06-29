"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectTrigger, SelectValue } from "./select"

/**
 * Select with a floating label, matching FloatingLabelInput. The label sits
 * inside the trigger as a placeholder and rises/shrinks once a value is chosen
 * or the menu is open. Pass <SelectItem>s as children.
 */
function FloatingLabelSelect({
  label,
  value,
  defaultValue,
  onValueChange,
  placeholder,
  children,
  className,
  id,
}: {
  label: string
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  children: React.ReactNode
  className?: string
  id?: string
}) {
  const isControlled = value !== undefined
  const [internal, setInternal] = React.useState<string | undefined>(defaultValue)
  const [open, setOpen] = React.useState(false)

  const current = isControlled ? value : internal
  const floated = open || (!!current && current !== "")

  function handleChange(next: string | null) {
    const v = next ?? ""
    if (!isControlled) setInternal(v)
    onValueChange?.(v)
  }

  return (
    <Select
      {...(isControlled ? { value } : { defaultValue })}
      onValueChange={handleChange}
      onOpenChange={setOpen}
    >
      <SelectTrigger id={id} size="lg" className={cn("relative w-full pt-5 pb-1", className)}>
        <span
          className={cn(
            "pointer-events-none absolute left-4 z-10 text-muted-foreground transition-all duration-150 select-none",
            floated
              ? "top-2 text-xs font-medium"
              : "top-1/2 -translate-y-1/2 text-base",
          )}
        >
          {label}
        </span>
        <SelectValue placeholder={placeholder ?? ""} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  )
}

export { FloatingLabelSelect }
