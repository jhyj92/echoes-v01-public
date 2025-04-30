export default function ReflectionLetter({ letter, onContinue }) {
  return (
    <div className="p-8 max-w-xl mx-auto prose prose-invert">
      <h2>Letter from the Hero</h2>
      <p className="whitespace-pre-wrap">{letter}</p>
      <button className="btn-primary mt-6" onClick={onContinue}>
        Continue Journey
      </button>
    </div>
  );
}
