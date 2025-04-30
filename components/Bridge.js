// components/Bridge.js
export default function Bridge({ text, delay=0 }) {
  return (
    <div style={{
      opacity:0.8,
      fontStyle:"italic",
      textAlign:"center",
      margin:"1rem 0",
      animation:`fade-in .5s ease ${delay}s both`
    }}>
      {text}
    </div>
  );
}
