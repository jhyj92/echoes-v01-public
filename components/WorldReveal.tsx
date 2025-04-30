export default function WorldReveal({ world }: { world: string }) {
  const art = {
    "Dream-Sea": "/worlds/dreamsea.jpg",
    Emberwake: "/worlds/emberwake.jpg",
    Stormlight: "/worlds/stormlight.jpg",
    Whispergrove: "/worlds/whispergrove.jpg",
  }[world];

  return (
    <div className="relative text-center">
      <img src={art} alt="" className="absolute inset-0 w-full h-full object-cover -z-10" />
      <h1 className="text-5xl font-serif mt-40 drop-shadow-lg">{world} Realm</h1>
    </div>
  );
}
