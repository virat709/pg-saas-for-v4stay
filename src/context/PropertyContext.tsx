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
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // Load initial active property from local storage if available
    const saved = localStorage.getItem("activePropertyId");
    if (saved) {
      setActivePropertyIdState(saved);
    }
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
