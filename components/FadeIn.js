// components/FadeIn.js

export default function FadeIn({ children, delay = 0 }) {
  return (
    <div style={{ animation: `fade 1s ease ${delay}s both` }}>
      {children}
    </div>
  );
}
