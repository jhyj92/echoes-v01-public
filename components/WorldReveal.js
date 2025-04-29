export default function WorldReveal({ world }){
  if(!world)return null;
  return(
    <>
      <h1 style={{fontSize:"2.5rem"}}>{world.name}</h1>
      <p>Your self-discovery journey unfolds here…</p>
    </>
  );
}
