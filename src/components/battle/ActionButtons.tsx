import { Button } from '../ui/Button';
import type { ActionType } from '@/types';

interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  disabled?: boolean;
}

export function ActionButtons({ onAction, disabled }: ActionButtonsProps) {
  return (
    <div className="flex gap-4">
      <Button
        onClick={() => onAction('attack')}
        disabled={disabled}
        variant="danger"
        size="lg"
        className="flex-1"
      >
        ATTACK
      </Button>
      <Button
        onClick={() => onAction('appeal')}
        disabled={disabled}
        variant="secondary"
        size="lg"
        className="flex-1"
      >
        APPEAL
      </Button>
      <Button
        onClick={() => onAction('guard')}
        disabled={disabled}
        variant="primary"
        size="lg"
        className="flex-1"
      >
        GUARD
      </Button>
    </div>
  );
}
