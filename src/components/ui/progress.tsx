'use client'

import { forwardRef } from 'react'
import * as ProgressPrimitive from '@radix-ui/react-progress'

import { cn } from '@/lib/utils'

const Progress = forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
    showLabel?: boolean
  }
>(({ className, value, showLabel = false, ...props }, ref) => {
  const progressValue = value || 0

  return (
    <div className="relative w-full">
      <div className="relative bg-gradient-to-r from-orange-400 to-yellow-800 rounded-full">
        <ProgressPrimitive.Root
          ref={ref}
          className={cn(
            'relative h-6 w-full overflow-hidden rounded-full',
            className,
          )}
          {...props}
          aria-label={`Progress: ${progressValue}%`}
        >
          <ProgressPrimitive.Indicator
            className="h-full transition-transform duration-500 ease-in-out bg-gradient-to-r from-orange-600 to-yellow-500 rounded-full"
            style={{ transform: `translateX(-${100 - progressValue}%)` }}
          />
        </ProgressPrimitive.Root>
      </div>

      {showLabel && (
        <span
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-semibold text-gray-800"
          aria-hidden="true"
        >
          {`${progressValue}%`}
        </span>
      )}
    </div>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
