import { useState } from "react";
import { StaffLayout } from "@/components/layout/StaffLayout";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChallengeTable } from "./ChallengeTable";
import { RefundTable } from "./RefundTable";
import { SummaryCards } from "./SummaryCards";
import { useQueue } from "./useQueue";

export function QueueScreen() {
  const { challengeRows, refundRows, summary } = useQueue();
  const [grouped, setGrouped] = useState(false);

  return (
    <StaffLayout active="queue">
      <div className="eyebrow">Inspector workspace</div>
      <h1 className="page-title mt-3">Case queue</h1>
      <p className="page-subtitle">Sorted by deadline risk. Legal clocks count working days.</p>
      <SummaryCards summary={summary} />
      <Tabs defaultValue="challenges" className="mt-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <TabsList>
            <TabsTrigger value="challenges">Challenges ({challengeRows.length})</TabsTrigger>
            <TabsTrigger value="refunds">Refunds ({refundRows.length})</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-3">
            <Switch id="group-similar" checked={grouped} onCheckedChange={setGrouped} />
            <Label htmlFor="group-similar">Group similar</Label>
          </div>
        </div>
        <TabsContent value="challenges">
          <ChallengeTable rows={challengeRows} grouped={grouped} />
        </TabsContent>
        <TabsContent value="refunds">
          <RefundTable rows={refundRows} />
        </TabsContent>
      </Tabs>
    </StaffLayout>
  );
}
