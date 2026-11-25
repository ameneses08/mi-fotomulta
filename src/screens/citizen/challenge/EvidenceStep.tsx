import { FileText, Trash2, Upload } from "lucide-react";
import { AIPanel } from "@/components/AIPanel";
import { Button } from "@/components/ui/button";
import { aiScripts } from "@/data/aiScripts";
import { useAppStore } from "@/store/appStore";

export function EvidenceStep() {
  const evidence = useAppStore((s) => s.draft.evidence);
  const addEvidence = useAppStore((s) => s.addEvidence);
  const removeEvidence = useAppStore((s) => s.removeEvidence);

  return (
    <>
      <h2 className="text-xl font-semibold">Add supporting evidence</h2>
      <p className="page-subtitle">
        A copy of your ID or a statement signed by the driver helps the inspector.
      </p>
      <label className="upload-zone">
        <Upload size={26} aria-hidden="true" />
        <span>Choose documents</span>
        <span className="text-xs">Fake upload · files are not sent or read</span>
        <input
          type="file"
          multiple
          accept=".pdf,.png,.jpg,.jpeg"
          aria-label="Choose supporting documents"
          onChange={(e) => addEvidence(Array.from(e.target.files ?? []).map((f) => f.name))}
        />
      </label>
      <ul>
        {evidence.map((item) => (
          <li key={item.name} className="file-row">
            <FileText size={17} aria-hidden="true" />
            <span className="flex-1">
              {item.name} <span className="text-muted-foreground">· {item.kind}</span>
            </span>
            <Button variant="ghost" size="sm" onClick={() => removeEvidence(item.name)}>
              <Trash2 size={15} aria-hidden="true" />
              Remove
            </Button>
          </li>
        ))}
      </ul>
      <AIPanel title="Evidence check" audience="citizen">
        <p>{evidence.length ? aiScripts.evidence.checked : aiScripts.evidence.empty}</p>
      </AIPanel>
    </>
  );
}
