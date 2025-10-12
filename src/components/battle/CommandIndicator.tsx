import { Card } from '../ui/Card';
import type { AudienceCommand } from '@/types';

interface CommandIndicatorProps {
  command: AudienceCommand;
}

export function CommandIndicator({ command }: CommandIndicatorProps) {
  return (
    <Card className="bg-arena-neutral/10 border-arena-neutral">
      <div className="text-center">
        <div className="mb-1 text-sm text-arena-subtext">観客の指示</div>
        <div className="text-2xl font-bold text-arena-neutral">{command.message}</div>
      </div>
    </Card>
  );
}
