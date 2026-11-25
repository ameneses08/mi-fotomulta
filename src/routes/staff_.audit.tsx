import { createFileRoute } from "@tanstack/react-router";
import { pageHead } from "@/lib/pageHead";
import { AuditScreen } from "@/screens/staff/audit/AuditScreen";

export const Route = createFileRoute("/staff_/audit")({
  component: AuditScreen,
  head: () =>
    pageHead("Audit log", "Every action by the system, the AI assistant, inspectors and citizens."),
});
