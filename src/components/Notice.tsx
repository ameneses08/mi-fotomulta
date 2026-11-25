import { Info, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface NoticeProps {
  children: ReactNode;
  icon?: LucideIcon;
  variant?: "default" | "success";
  role?: "status" | "alert";
}

export function Notice({ children, icon: Icon = Info, variant = "default", role }: NoticeProps) {
  return (
    <div className={cn("notice", variant === "success" && "success-notice")} role={role}>
      <Icon size={18} aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}
