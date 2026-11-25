import { groupSimilar, type ChallengeRow } from "@/lib/queue";
import { ChallengeRowView } from "./ChallengeRowView";
import { GroupRow } from "./GroupRow";

interface ChallengeTableProps {
  rows: ChallengeRow[];
  grouped: boolean;
}

export function ChallengeTable({ rows, grouped }: ChallengeTableProps) {
  const items = grouped ? groupSimilar(rows) : rows.map((row) => ({ type: "row" as const, row }));
  return (
    <div className="table-wrap">
      <table className="queue-table">
        <caption className="sr-only">Challenges sorted by deadline risk</caption>
        <thead>
          <tr>
            <th scope="col">Case</th>
            <th scope="col">Citizen and reason</th>
            <th scope="col">Status</th>
            <th scope="col">Legal clock</th>
            <th scope="col">Flags</th>
            <th scope="col">
              <span className="sr-only">Action</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) =>
            item.type === "row" ? (
              <ChallengeRowView key={item.row.challenge.id} row={item.row} />
            ) : (
              <GroupRow key={item.group.representative} group={item.group} />
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}
