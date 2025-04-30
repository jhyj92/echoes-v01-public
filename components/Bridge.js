// components/Bridge.js
export default function Bridge({ text = "", delay = 0 }) {
  return (
    <p
      className="fade-in text-center italic opacity-80"
      style={{ "--delay": `${delay}s` }}
    >
      {text}
    </p>
  );
}
