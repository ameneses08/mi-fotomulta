export function FlagList({ flags }: { flags: readonly string[] }) {
  if (!flags.length) return <span className="text-sm text-muted-foreground">None</span>;
  return (
    <ul className="flex flex-wrap gap-1" aria-label="Rule flags">
      {flags.map((flag) => (
        <li key={flag} className="flag-chip">
          {flag}
        </li>
      ))}
    </ul>
  );
}
