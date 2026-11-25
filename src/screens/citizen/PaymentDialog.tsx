import { CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatCOP } from "@/lib/format";
import { useAppStore } from "@/store/appStore";
import type { Fine } from "@/types";

export function PaymentDialog({ fine }: { fine: Fine }) {
  const payFine = useAppStore((s) => s.payFine);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          <CreditCard size={18} aria-hidden="true" />
          Pay this fine
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Simulate a payment</DialogTitle>
        <DialogDescription className="text-base">
          No money is charged. This only marks the fictional fine as paid for this session.
        </DialogDescription>
        <p className="text-2xl font-bold">{formatCOP(fine.amount)}</p>
        <Button onClick={() => payFine(fine.id)}>
          <CreditCard size={18} aria-hidden="true" />
          Confirm simulated payment
        </Button>
      </DialogContent>
    </Dialog>
  );
}
