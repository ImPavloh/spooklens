import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'purple' | 'orange'
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant = 'purple', ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border-2 px-3 py-2 text-sm text-white placeholder:text-orange-300 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50',
          variant === 'purple'
            ? 'border-purple-500 bg-gradient-to-b from-purple-950 to-black focus-visible:ring-2 focus-visible:ring-orange-300'
            : 'border-orange-500 bg-gradient-to-b from-orange-950 to-black focus-visible:ring-2 focus-visible:ring-orange-300',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }
