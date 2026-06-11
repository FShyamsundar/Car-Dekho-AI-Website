import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const SelectionContext = createContext(null);

function useLocalStorageState(key, fallback) {
  const [value, setValue] = useState(() => {
    if (typeof window === "undefined") {
      return fallback;
    }

    try {
      const stored = window.localStorage.getItem(key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Ignore storage issues. The UI should stay usable.
    }
  }, [key, value]);

  return [value, setValue];
}

export function SelectionProvider({ children }) {
  const [shortlistIds, setShortlistIds] = useLocalStorageState("drivewise-shortlist", []);
  const [compareIds, setCompareIds] = useLocalStorageState("drivewise-compare", []);

  const toggleShortlist = useCallback((carId) => {
    setShortlistIds((current) =>
      current.includes(carId)
        ? current.filter((id) => id !== carId)
        : [...current, carId],
    );
  }, []);

  const toggleCompare = useCallback((carId) => {
    setCompareIds((current) => {
      if (current.includes(carId)) {
        return current.filter((id) => id !== carId);
      }

      const next = [...current, carId];
      return next.slice(-3);
    });
  }, []);

  const clearShortlist = useCallback(() => setShortlistIds([]), []);
  const clearCompare = useCallback(() => setCompareIds([]), []);

  const value = useMemo(
    () => ({
      shortlistIds,
      compareIds,
      shortlistCount: shortlistIds.length,
      compareCount: compareIds.length,
      toggleShortlist,
      toggleCompare,
      clearShortlist,
      clearCompare,
      isShortlisted: (carId) => shortlistIds.includes(carId),
      isCompared: (carId) => compareIds.includes(carId),
    }),
    [clearCompare, clearShortlist, compareIds, shortlistIds, toggleCompare, toggleShortlist],
  );

  return <SelectionContext.Provider value={value}>{children}</SelectionContext.Provider>;
}

export function useSelections() {
  const context = useContext(SelectionContext);

  if (!context) {
    throw new Error("useSelections must be used inside SelectionProvider");
  }

  return context;
}
