"use client"

import * as React from "react"
import { useLanguage } from "@/contexts/language-context"

interface CurrencyChipProps {
  currency: string
  isSelected: boolean
  onClick?: () => void
  disabled?: boolean
}

const CURRENCY_LABELS = {
  SYP: { en: "SYP", ar: "ل.س" },
  USD: { en: "USD", ar: "دولار" },
}

export function CurrencyChip({ currency, isSelected, onClick, disabled = false }: CurrencyChipProps) {
  const { language } = useLanguage()
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
        ${isSelected 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted hover:bg-muted/80"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      aria-disabled={disabled}
    >
      {CURRENCY_LABELS[currency as keyof typeof CURRENCY_LABELS][language === "ar" ? "ar" : "en"]}
    </button>
  )
}
