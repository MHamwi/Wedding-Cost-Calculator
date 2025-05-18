"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => {
  // Check document direction
  const [isRTL, setIsRTL] = React.useState(false)
  
  React.useEffect(() => {
    // Update direction on mount and when it changes
    const checkDirection = () => {
      const dir = document.documentElement.dir
      setIsRTL(dir === "rtl")
    }
    
    // Set initial direction
    checkDirection()
    
    // Listen for direction changes (if any)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "dir") {
          checkDirection()
        }
      })
    })
    
    observer.observe(document.documentElement, { attributes: true })
    
    return () => observer.disconnect()
  }, [])

  // Add custom CSS for RTL switches if not already added
  React.useEffect(() => {
    if (isRTL) {
      // Check if the style tag already exists
      const existingStyle = document.getElementById('rtl-switch-styles')
      if (!existingStyle) {
        const style = document.createElement('style')
        style.id = 'rtl-switch-styles'
        style.textContent = `
          [dir="rtl"] [data-state="checked"] > .switch-thumb {
            transform: translateX(-1.25rem) !important;
          }
          [dir="rtl"] [data-state="unchecked"] > .switch-thumb {
            transform: translateX(0) !important;
          }
        `
        document.head.appendChild(style)
      }
    }
  }, [isRTL])

  return (
    <SwitchPrimitives.Root
      className={cn(
        "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input",
        className
      )}
      {...props}
      ref={ref}
    >
      <SwitchPrimitives.Thumb
        className={cn(
          "switch-thumb pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform",
          !isRTL && "data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitives.Root>
  )
})
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
