import { useEffect, useRef, useState } from "react";

/** True for a short moment after `value` changes (not on first render). */
export function useHighlightOnChange(value: string, durationMs = 1800): boolean {
  const previous = useRef(value);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (previous.current === value) return;
    previous.current = value;
    setActive(true);
    const id = setTimeout(() => setActive(false), durationMs);
    return () => clearTimeout(id);
  }, [value, durationMs]);

  return active;
}
