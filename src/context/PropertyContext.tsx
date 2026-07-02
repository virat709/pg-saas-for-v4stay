"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
}

interface PropertyContextType {
  properties: Property[];
  activePropertyId: string;
  setActivePropertyId: (id: string) => void;
  isLoading: boolean;
  refreshProperties: () => Promise<void>;
}

const PropertyContext = createContext<PropertyContextType>({
  properties: [],
  activePropertyId: "all",
  setActivePropertyId: () => {},
  isLoading: true,
  refreshProperties: async () => {},
});

export function PropertyProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [activePropertyId, setActivePropertyIdState] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  const fetchProperties = async () => {
    try {
      const res = await fetch("/api/properties");
      if (res.ok) {
        const data = await res.json();
        setProperties(data);
        
        const saved = localStorage.getItem("activePropertyId");
        if (data.length === 1) {
          setActivePropertyIdState(data[0].id);
        } else if (data.length > 1 && saved && data.some((p: any) => p.id === saved)) {
          setActivePropertyIdState(saved);
        } else {
          setActivePropertyIdState("all");
        }
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  const setActivePropertyId = (id: string) => {
    setActivePropertyIdState(id);
    localStorage.setItem("activePropertyId", id);
  };

  return (
    <PropertyContext.Provider
      value={{
        properties,
        activePropertyId,
        setActivePropertyId,
        isLoading,
        refreshProperties: fetchProperties,
      }}
    >
      {children}
    </PropertyContext.Provider>
  );
}

export const useProperties = () => useContext(PropertyContext);
