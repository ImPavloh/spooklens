import { forwardRef } from 'react'
import { Root, Fallback, Image } from '@radix-ui/react-avatar'
import { cn } from '@/lib/utils'

const Avatar = forwardRef<
  React.ElementRef<typeof Root>,
  React.ComponentPropsWithoutRef<typeof Root>
>(({ className, ...props }, ref) => (
  <Root
    ref={ref}
    className={cn(
      'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
      className,
    )}
    {...props}
  />
))
Avatar.displayName = Root.displayName

const AvatarImage = forwardRef<
  React.ElementRef<typeof Image>,
  React.ComponentPropsWithoutRef<typeof Image> & { alt: string }
>(({ className, alt, ...props }, ref) => (
  <Image
    ref={ref}
    className={cn('aspect-square h-full w-full', className)}
    alt={alt}
    {...props}
    draggable="false"
  />
))
AvatarImage.displayName = Image.displayName

const AvatarFallback = forwardRef<
  React.ElementRef<typeof Fallback>,
  React.ComponentPropsWithoutRef<typeof Fallback>
>(({ className, ...props }, ref) => (
  <Fallback
    ref={ref}
    className={cn(
      'flex h-full w-full items-center justify-center rounded-full bg-neutral-600 shadow-sm',
      className,
    )}
    {...props}
  />
))
AvatarFallback.displayName = Fallback.displayName

export { Avatar, AvatarImage, AvatarFallback }
