import Image from 'next/image'
import { cn } from '@/lib/utils'

interface AvatarProps {
  name: string
  avatarUrl?: string | null
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizes = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-16 h-16 text-xl',
  xl: 'w-24 h-24 text-3xl',
}

export function Avatar({ name, avatarUrl, size = 'md', className }: AvatarProps) {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center overflow-hidden bg-primary-100 text-primary-600 font-semibold flex-shrink-0',
        sizes[size],
        className
      )}
    >
      {avatarUrl ? (
        <Image src={avatarUrl} alt={name} width={96} height={96} className="object-cover w-full h-full" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}
