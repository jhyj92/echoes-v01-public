export default function TestCenter() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen w-full bg-black text-white px-4">
      <h1 className="text-5xl md:text-6xl font-serif mb-6">Echoes</h1>
      <p className="text-xl mb-8">Find the echo that reflects your true self.</p>
      <div className="flex space-x-4">
        <button className="btn-primary">Start Journey</button>
        <button className="btn-outline">View Codex</button>
      </div>
    </main>
  );
}
