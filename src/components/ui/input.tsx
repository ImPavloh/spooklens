import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'purple' | 'orange'
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = 'purple', ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border-2 px-3 py-2 text-sm text-white placeholder:text-orange-300 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
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

Input.displayName = 'Input'

export { Input }
