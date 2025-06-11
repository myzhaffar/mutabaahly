import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { type ButtonProps } from "@/components/ui/button"

const GradientButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => {
    return (
      <Button
        className={cn(
          "bg-gradient-to-r from-emerald-500 to-teal-400 hover:opacity-90 text-white",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
GradientButton.displayName = "GradientButton"

export { GradientButton } 