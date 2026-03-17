"use client"

import React, { useRef } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

interface VirtualListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  estimateSize?: number
  className?: string
  containerClassName?: string
}

export function VirtualList<T>({
  items,
  renderItem,
  estimateSize = 80,
  className,
  containerClassName,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null)

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  })

  return (
    <div
      ref={parentRef}
      className={cn("h-[600px] overflow-auto rounded-xl border border-slate-100", className)}
    >
      <div
        className={cn("relative w-full", containerClassName)}
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            className="absolute top-0 left-0 w-full"
            style={{
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground italic">
            No items to display
          </div>
        )}
      </div>
    </div>
  )
}
