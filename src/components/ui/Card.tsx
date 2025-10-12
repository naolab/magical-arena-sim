import { ReactNode } from 'react';
import clsx from 'clsx';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className }: CardProps) {
  return (
    <div
      className={clsx(
        'rounded-lg border border-arena-subtext/20 bg-arena-bg/80 p-4 backdrop-blur',
        className
      )}
    >
      {children}
    </div>
  );
}
