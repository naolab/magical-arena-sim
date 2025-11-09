import { SVGProps } from 'react';

export function SparkIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2l1.5 4.5L18 8l-4.5 1.5L12 14l-1.5-4.5L6 8l4.5-1.5L12 2z" />
      <path d="M5 19l2-2" />
      <path d="M19 19l-2-2" />
    </svg>
  );
}

export function SkullIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2C7.6 2 4 5.6 4 10c0 2.4 1.2 4.5 3 5.9V19c0 .6.4 1 1 1h1v2h6v-2h1c.6 0 1-.4 1-1v-3.1c1.8-1.4 3-3.5 3-5.9 0-4.4-3.6-8-8-8z" />
      <path d="M9 13h6" />
      <circle cx="9" cy="10" r="1" />
      <circle cx="15" cy="10" r="1" />
    </svg>
  );
}

export function ShieldIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 3l8 3v6c0 5-4 9-8 9s-8-4-8-9V6l8-3z" />
      <path d="M9 11l3 3 3-3" />
    </svg>
  );
}

export function PoisonIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* 大きい水滴 */}
      <path d="M12 2C9 5 7 8 7 11c0 2.8 2.2 5 5 5s5-2.2 5-5c0-3-2-6-5-9z" opacity="0.9" />

      {/* 小さい気泡1 */}
      <circle cx="9" cy="18" r="1.5" opacity="0.7" />

      {/* 小さい気泡2 */}
      <circle cx="14" cy="19" r="1.2" opacity="0.7" />

      {/* 小さい気泡3 */}
      <circle cx="11" cy="21" r="1" opacity="0.6" />

      {/* 水滴の中のハイライト */}
      <ellipse cx="10" cy="8" rx="1.5" ry="2" fill="white" opacity="0.4" />
    </svg>
  );
}
