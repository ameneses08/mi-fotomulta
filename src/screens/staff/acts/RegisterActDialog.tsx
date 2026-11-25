import { PenLine } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCOP } from "@/lib/format";
import type { ActPreview } from "@/lib/revocation";
import { useAppStore } from "@/store/appStore";
import type { LegalAct } from "@/types";

export function RegisterActDialog({ act, preview }: { act: LegalAct; preview: ActPreview }) {
  const register = useAppStore((s) => s.registerLegalAct);
  const [open, setOpen] = useState(false);
  const [official, setOfficial] = useState("");
  const [error, setError] = useState("");

  const confirm = () => {
    const result = register(act.id, official);
    if (result) return setError(result);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PenLine size={18} aria-hidden="true" />
          Register act as in force
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Register act as in force</DialogTitle>
        <DialogDescription className="text-base">
          An authorised official signs once. The system applies it to each fine individually and
          notifies each citizen.
        </DialogDescription>
        <dl className="grid grid-cols-2 gap-4 rounded-xl border p-4">
          <div>
            <dt className="text-sm text-muted-foreground">Affected fines</dt>
            <dd className="text-2xl font-bold">{preview.affectedFines.length}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Total refund</dt>
            <dd className="text-2xl font-bold">{formatCOP(preview.totalRefund)}</dd>
          </div>
        </dl>
        <label className="form-field mt-0">
          Type your full name to sign
          <input
            value={official}
            onChange={(e) => setOfficial(e.target.value)}
            autoComplete="off"
          />
        </label>
        {error && (
          <p className="error-text mt-0" role="alert">
            {error}
          </p>
        )}
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={confirm} disabled={!official.trim()}>
            Sign and register
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
