import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-arena-bg p-24">
      <div className="text-center">
        <h1 className="mb-8 text-6xl font-bold text-arena-text">
          Magical Arena Sim
        </h1>
        <p className="mb-12 text-xl text-arena-subtext">
          バトルシステムシミュレータ
        </p>
        <Link href="/battle">
          <Button variant="primary" size="lg">
            バトル開始
          </Button>
        </Link>
      </div>
    </main>
  );
}
