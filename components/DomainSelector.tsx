/* DomainSelector – shows list of 5 super-power domains */
export interface Props {
  domains: string[];
  onSelect(domain: string): void;
}

export default function DomainSelector({ domains, onSelect }: Props) {
  return (
    <div className="grid gap-4 w-full max-w-md">
      {domains.map((d) => (
        <button
          key={d}
          onClick={() => onSelect(d)}
          className="btn-outline hover:bg-gold/10 min-h-[56px]"
        >
          {d}
        </button>
      ))}
    </div>
  );
}
