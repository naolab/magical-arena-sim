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
        <button className="rounded-lg bg-arena-player px-8 py-4 text-lg font-bold text-white transition-all hover:opacity-80 hover:shadow-lg">
          バトル開始
        </button>
      </div>
    </main>
  );
}
