import { ReactNode } from 'react';
import clsx from 'clsx';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-block rounded px-2 py-1 text-xs font-bold',
        {
          'bg-arena-subtext/20 text-arena-text': variant === 'default',
          'bg-green-500/20 text-green-400': variant === 'success',
          'bg-arena-neutral/20 text-arena-neutral': variant === 'warning',
          'bg-arena-enemy/20 text-arena-enemy': variant === 'danger',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
