import clsx from 'clsx';

interface GaugeProps {
  value: number;
  maxValue: number;
  color?: 'player' | 'enemy' | 'neutral' | 'anti-lv1' | 'anti-lv2' | 'anti-lv3';
  showText?: boolean;
  label?: string;
}

export function Gauge({ value, maxValue, color = 'player', showText = true, label }: GaugeProps) {
  const percentage = Math.max(0, Math.min(100, (value / maxValue) * 100));

  const colorClass = {
    player: 'bg-arena-player',
    enemy: 'bg-arena-enemy',
    neutral: 'bg-arena-neutral',
    'anti-lv1': 'bg-arena-anti-lv1',
    'anti-lv2': 'bg-arena-anti-lv2',
    'anti-lv3': 'bg-arena-anti-lv3',
  }[color];

  return (
    <div className="w-full">
      {label && <div className="mb-1 text-sm text-arena-subtext">{label}</div>}
      <div className="relative h-6 overflow-hidden rounded-full bg-arena-subtext/20">
        <div
          className={clsx('h-full transition-all duration-300', colorClass)}
          style={{ width: `${percentage}%` }}
        />
        {showText && (
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-arena-text">
            {value} / {maxValue}
          </div>
        )}
      </div>
    </div>
  );
}
