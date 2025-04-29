// components/WorldReveal.js

export default function WorldReveal({ world }) {
  if (!world) return null;

  return (
    <>
      <h1 style={{ fontSize: "2.5rem", color: "var(--clr-primary)" }}>
        {world.name}
      </h1>
      <p style={{ marginTop: "12px", fontStyle: "italic" }}>
        Your self-discovery journey unfolds here…
      </p>
    </>
  );
}
