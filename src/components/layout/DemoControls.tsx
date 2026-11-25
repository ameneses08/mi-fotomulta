import { RotateCcw, Settings2, Undo2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAppStore } from "@/store/appStore";

/** Floating demo menu (staff and demo pages only). Not part of the service design. */
export function DemoControls() {
  const [open, setOpen] = useState(false);
  const resetDemo = useAppStore((s) => s.resetDemo);
  const revertLegalAct = useAppStore((s) => s.revertLegalAct);
  const canRevert = useAppStore((s) => s.actSnapshot !== null);

  const run = (action: () => void) => {
    action();
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="demo-controls-trigger">
          <Settings2 size={17} aria-hidden="true" />
          Demo controls
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72">
        <p className="text-sm font-semibold">Demo controls</p>
        <p className="mt-1 text-xs text-muted-foreground">For presenting the prototype only.</p>
        <div className="mt-4 grid gap-2">
          <Button variant="outline" onClick={() => run(resetDemo)}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset demo data
          </Button>
          <Button variant="outline" disabled={!canRevert} onClick={() => run(revertLegalAct)}>
            <Undo2 size={16} aria-hidden="true" />
            Revert legal act (demo only)
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
