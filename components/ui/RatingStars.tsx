import { cn } from '@/lib/utils'

interface RatingStarsProps {
  rating: number
  maxRating?: number
  size?: 'sm' | 'md'
  showValue?: boolean
  className?: string
}

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  showValue = true,
  className,
}: RatingStarsProps) {
  return (
    <div className={cn('flex items-center gap-1', className)}>
      <div className="flex">
        {Array.from({ length: maxRating }).map((_, i) => (
          <span
            key={i}
            className={cn(
              size === 'sm' ? 'text-sm' : 'text-base',
              i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'
            )}
          >
            ★
          </span>
        ))}
      </div>
      {showValue && (
        <span className={cn('text-gray-600 font-medium', size === 'sm' ? 'text-xs' : 'text-sm')}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  )
}
