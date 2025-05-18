"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"

interface CurrencySelectorProps {
  value: string
  onChange: (value: string) => void
  id: string
}

export function CurrencySelector({ value, onChange, id }: CurrencySelectorProps) {
  const { direction } = useLanguage()
  const isRTL = direction === "rtl"

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="SYP">{isRTL ? "ليرة سورية (SYP)" : "Syrian Pound (SYP)"}</SelectItem>
        <SelectItem value="USD">{isRTL ? "دولار أمريكي (USD)" : "US Dollar (USD)"}</SelectItem>
      </SelectContent>
    </Select>
  )
}
