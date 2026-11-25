import { cn } from "@/lib/utils";

export type SignInRole = "citizen" | "staff";

const OPTIONS: { value: SignInRole; label: string }[] = [
  { value: "citizen", label: "Citizen" },
  { value: "staff", label: "SDM staff" },
];

interface RoleSwitchProps {
  value: SignInRole;
  onChange: (role: SignInRole) => void;
}

/** Segmented control built on native radios, so it is keyboard and screen-reader friendly. */
export function RoleSwitch({ value, onChange }: RoleSwitchProps) {
  return (
    <fieldset className="segmented">
      <legend className="sr-only">I am signing in as</legend>
      {OPTIONS.map((option) => (
        <label key={option.value} className={cn("segment", value === option.value && "active")}>
          <input
            type="radio"
            name="role"
            className="sr-only"
            checked={value === option.value}
            onChange={() => onChange(option.value)}
          />
          {option.label}
        </label>
      ))}
    </fieldset>
  );
}
