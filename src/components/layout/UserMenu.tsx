import { Link } from "@tanstack/react-router";
import { LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { maskDocument } from "@/lib/signIn";
import { useAppStore } from "@/store/appStore";

export function UserMenu() {
  const citizen = useAppStore((s) => s.citizen);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="min-h-11 shrink-0 gap-2 px-2">
          <span className="avatar" aria-hidden="true">
            <UserRound size={16} />
          </span>
          <span className="user-name">{citizen.firstName}</span>
          <span className="sr-only">Open account menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <span className="block">{citizen.name}</span>
          <span className="block text-xs font-normal text-muted-foreground">
            CC {maskDocument(citizen.document)} · plate {citizen.plate}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/">
            <LogOut size={16} aria-hidden="true" />
            Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
