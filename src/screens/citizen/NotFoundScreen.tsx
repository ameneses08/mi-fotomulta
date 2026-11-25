import { CitizenLayout } from "@/components/layout/CitizenLayout";

export function NotFoundScreen({ label }: { label: string }) {
  return (
    <CitizenLayout>
      <h1 className="page-title">{label} not found</h1>
      <p className="page-subtitle">This record is not part of the fictional demo.</p>
    </CitizenLayout>
  );
}
