import { ButtonHTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        'rounded-lg font-bold transition-all hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-arena-player text-white': variant === 'primary',
          'bg-arena-neutral text-arena-bg': variant === 'secondary',
          'bg-arena-enemy text-white': variant === 'danger',
          'px-4 py-2 text-sm': size === 'sm',
          'px-6 py-3 text-base': size === 'md',
          'px-10 py-5 text-xl tracking-[0.3em] leading-none': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
