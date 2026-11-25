import type { ReactNode } from "react";
import { SourceTag, type DataSource } from "./SourceTag";

interface DataRowProps {
  label: string;
  value: ReactNode;
  source?: DataSource;
}

export function DataRow({ label, value, source }: DataRowProps) {
  return (
    <div className="data-row">
      <dt className="data-label">
        <span>{label}</span>
        {source && <SourceTag source={source} />}
      </dt>
      <dd className="data-value">{value}</dd>
    </div>
  );
}
