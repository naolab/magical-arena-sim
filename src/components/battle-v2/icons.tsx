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

export function AttackDownIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* Minus sign to represent reduced damage */}
      <path d="M6 7h12" />

      {/* Down arrow */}
      <path d="M12 10v8" />
      <path d="M9 15l3 3 3-3" />

      {/* Cross mark for damage negation */}
      <path d="M7 5l4 4" />
      <path d="M11 5L7 9" />
      <path d="M17 5l-4 4" />
      <path d="M13 5l4 4" />
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

export function CurseIcon(props: SVGProps<SVGSVGElement>) {
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
      {/* 頭蓋骨の上部 */}
      <ellipse cx="12" cy="9" rx="6" ry="7" opacity="0.9" />

      {/* 目のくぼみ（左） */}
      <ellipse cx="9.5" cy="9" rx="1.5" ry="2" fill="black" opacity="1" />

      {/* 目のくぼみ（右） */}
      <ellipse cx="14.5" cy="9" rx="1.5" ry="2" fill="black" opacity="1" />

      {/* 鼻の穴 */}
      <path d="M11 12l1-1.5 1 1.5z" fill="black" opacity="0.8" />

      {/* 歯（上） */}
      <rect x="9" y="15" width="1.5" height="2" fill="black" opacity="0.7" />
      <rect x="11.25" y="15" width="1.5" height="2" fill="black" opacity="0.7" />
      <rect x="13.5" y="15" width="1.5" height="2" fill="black" opacity="0.7" />

      {/* 不吉なオーラ（ぼんやりした円） */}
      <circle cx="12" cy="10" r="8.5" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.3" />
    </svg>
  );
}

export function RegenIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* 水滴ベース */}
      <path
        d="M12 2C8.5 6 6.5 9.5 6.5 13c0 4 2.8 7 5.5 7s5.5-3 5.5-7c0-3.5-2-7-5.5-11z"
        fill="currentColor"
        fillOpacity="0.18"
      />

      {/* 内側のハイライト */}
      <path
        d="M10 7c-1.2 1.6-2 3.1-2 4.8 0 2.6 1.7 4.7 4 4.7"
        strokeWidth="1.2"
        strokeOpacity="0.6"
      />

      {/* 回復十字 */}
      <path d="M12 10v4" />
      <path d="M10.5 12h3" />
    </svg>
  );
}
