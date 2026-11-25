import { Link } from "@tanstack/react-router";
import { HERO_REFUND_ID } from "@/data/mockData";
import { UserMenu } from "./UserMenu";

const LINK_CLASS = "citizen-nav-link";

export function CitizenNav() {
  return (
    <div className="citizen-nav">
      <nav aria-label="Citizen navigation" className="citizen-nav-links">
        <Link
          to="/citizen"
          className={LINK_CLASS}
          activeOptions={{ exact: true }}
          activeProps={{ "aria-current": "page" }}
        >
          My fines
        </Link>
        <Link to="/citizen/cases" className={LINK_CLASS} activeProps={{ "aria-current": "page" }}>
          My cases
        </Link>
        <Link
          to="/citizen/refunds/$id"
          params={{ id: HERO_REFUND_ID }}
          className={LINK_CLASS}
          activeProps={{ "aria-current": "page" }}
        >
          Refunds
        </Link>
        <Link to="/citizen/help" className={LINK_CLASS} activeProps={{ "aria-current": "page" }}>
          Help
        </Link>
      </nav>
      <UserMenu />
    </div>
  );
}
