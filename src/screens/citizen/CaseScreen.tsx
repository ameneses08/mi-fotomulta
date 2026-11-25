import { CitizenLayout } from "@/components/layout/CitizenLayout";
import { useChallenge } from "@/store/selectors";
import { CaseView } from "./CaseView";
import { NotFoundScreen } from "./NotFoundScreen";

export function CaseScreen({ id }: { id: string }) {
  const challenge = useChallenge(id);
  if (!challenge) return <NotFoundScreen label="Case" />;
  return (
    <CitizenLayout back={{ to: "/citizen/cases", label: "My cases" }}>
      <CaseView caseId={id} />
    </CitizenLayout>
  );
}
