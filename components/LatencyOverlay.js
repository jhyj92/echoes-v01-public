// components/LatencyOverlay.js
export default function LatencyOverlay({ text }) {
  return (
    <div style={{
      position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", color:"#C8AE7D",
      fontSize:"1.4rem", padding:"1rem", textAlign:"center"
    }}>
      {text}
    </div>
  );
}
