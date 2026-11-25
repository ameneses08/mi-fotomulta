import { useEffect } from "react";
import { useAppStore } from "./appStore";

/** Restores the demo from sessionStorage after mount, then resumes interrupted simulations. */
export function useDemoHydration(): void {
  useEffect(() => {
    void Promise.resolve(useAppStore.persist.rehydrate()).then(() =>
      useAppStore.getState().resumeSimulations(),
    );
  }, []);
}
