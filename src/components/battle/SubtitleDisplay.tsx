import { Card } from '../ui/Card';

interface SubtitleDisplayProps {
  text?: string;
}

export function SubtitleDisplay({ text = '' }: SubtitleDisplayProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <Card className="bg-arena-card/95 backdrop-blur-sm">
          <div className="min-h-[80px] md:min-h-[100px] flex items-center px-4 py-3">
            <p className="text-base md:text-lg text-arena-text leading-relaxed">
              {text || '\u00A0'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
