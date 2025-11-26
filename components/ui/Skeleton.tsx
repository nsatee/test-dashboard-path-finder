import React from 'react';

type SkeletonProps = React.ComponentProps<'div'>;

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-md bg-[var(--color-muted)] ${className}`}
      {...props}
    />
  );
}