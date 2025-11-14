import React, { createContext, useContext, useState } from "react";

type SidebarContextType = {
  expandedItems: Set<string>;
  toggleExpanded: (name: string) => void;
  setExpanded: (names: string[]) => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider = ({ children }: { children: React.ReactNode }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleExpanded = (name: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(name)) newSet.delete(name);
      else newSet.add(name);
      return newSet;
    });
  };

  const setExpanded = (names: string[]) => {
    setExpandedItems(new Set(names));
  };

  return (
    <SidebarContext.Provider
      value={{ expandedItems, toggleExpanded, setExpanded }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used inside SidebarProvider");
  }
  return context;
};
