"use client"

import { useState, useEffect } from "react"
import { HomeFurnishingManager } from "./home-furnishing-manager"
import { useLanguage } from "@/contexts/language-context"

// Import the default items and categories directly to ensure we load all items
import { DEFAULT_ITEMS, DEFAULT_CATEGORIES } from "./default-furnishing-data"

interface HomeFurnishingWrapperProps {
  currency: string
  dollarRate: number
  onTotalChange: (total: number) => void
  defaultValue: number
  budgetMode: string
}

export function HomeFurnishingWrapper({
  currency,
  dollarRate,
  onTotalChange,
  defaultValue,
  budgetMode,
}: HomeFurnishingWrapperProps) {
  const { language } = useLanguage()
  const [items, setItems] = useState<any[]>([])
  const [localCurrency, setLocalCurrency] = useState("SYP") // Default to SYP for Home Furnishing section
  const [key, setKey] = useState(Date.now()) // Used to force re-render on budget mode change

  // Initialize with all predefined items for the current budget mode
  useEffect(() => {
    // Get all default items for the current budget mode and language
    if (DEFAULT_ITEMS && DEFAULT_ITEMS[budgetMode as keyof typeof DEFAULT_ITEMS]) {
      const defaultItems = DEFAULT_ITEMS[budgetMode as keyof typeof DEFAULT_ITEMS][language as "ar" | "en"]
        .map((item: any) => ({
          ...item,
          id: `${item.id}-${Date.now()}`,
          // Always store items in SYP for consistency
          currency: "SYP",
        }))
      
      // Set all items at once
      setItems(defaultItems)
    }
  }, [budgetMode, language])

  return (
    <HomeFurnishingManager
      key={key} // Force complete re-initialization when budget mode changes
      currency={currency}
      localCurrency={localCurrency}
      onLocalCurrencyChange={setLocalCurrency}
      dollarRate={dollarRate}
      onTotalChange={onTotalChange}
      items={items}
      setItems={setItems}
      defaultValue={defaultValue}
      budgetMode={budgetMode}
    />
  )
}
