// components/WorldReveal.js
export default function WorldReveal({ world }) {
  if (!world) return null;
  return (
    <div className={`world-reveal ${world.theme}`}>
      <h1>{world.name}</h1>
      <p>Your self-discovery journey unfolds here…</p>
    </div>
  );
}
