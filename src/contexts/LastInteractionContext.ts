// LastInteractionContext.tsx
import { LastInteraction } from '../components/ui/TopLevelUseClient';
import React, { createContext, useContext } from "react";

interface LastInteractionContextValue {
  getLastInteraction: () => LastInteraction | null;
}

const LastInteractionContext = createContext<LastInteractionContextValue | null>(null);

export const useLastInteraction = () => {
  const ctx = useContext(LastInteractionContext);
  if (!ctx) {
    throw new Error("useLastInteraction must be used within a LastInteractionProvider");
  }
  return ctx;
};

export default LastInteractionContext;
