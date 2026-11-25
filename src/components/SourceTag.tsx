export type DataSource = "SIMIT" | "RUNT" | "ANSV";

export function SourceTag({ source }: { source: DataSource }) {
  return <span className="source-tag">From {source}</span>;
}
