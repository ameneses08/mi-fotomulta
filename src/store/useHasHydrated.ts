import { useEffect, useState } from "react";
import { useAppStore } from "./appStore";

/** True once the saved demo has been restored from sessionStorage (or there was nothing to restore). */
export function useHasHydrated(): boolean {
  const [hydrated, setHydrated] = useState(() => useAppStore.persist.hasHydrated());
  useEffect(() => {
    const unsubscribe = useAppStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useAppStore.persist.hasHydrated());
    return unsubscribe;
  }, []);
  return hydrated;
}
