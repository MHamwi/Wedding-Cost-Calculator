"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyChip } from "@/components/currency-chip"
import { formatCurrency, convertCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/contexts/language-context"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { HeartHandshake, DollarSign } from "lucide-react"

interface MahrInputProps {
  title: string
  value: number
  onChange: (value: number) => void
  goldPrice: number
  dollarRate: number
  id: string
}

export function MahrInput({
  title,
  value,
  onChange,
  goldPrice,
  dollarRate,
  id,
}: MahrInputProps) {
  const { language, direction } = useLanguage()
  const isArabic = language === "ar"
  const locale = language === "ar" ? "ar-SY" : "en-US"
  
  // Payment methods: Gold (grams), USD, or SYP
  const [paymentMethod, setPaymentMethod] = useState<"gold" | "usd" | "syp">("gold")
  
  // Local value for input based on selected payment method
  const [localValue, setLocalValue] = useState(value)
  
  // Update local value when input value changes (gold grams)
  useEffect(() => {
    if (paymentMethod === "gold") {
      setLocalValue(value)
    } else if (paymentMethod === "usd") {
      setLocalValue((value * goldPrice) / dollarRate)
    } else if (paymentMethod === "syp") {
      setLocalValue(value * goldPrice)
    }
  }, [value, goldPrice, dollarRate, paymentMethod])
  
  // Handle input change based on payment method
  const handleInputChange = (inputValue: number) => {
    let newGoldValue: number
    
    if (paymentMethod === "gold") {
      newGoldValue = inputValue
    } else if (paymentMethod === "usd") {
      newGoldValue = (inputValue * dollarRate) / goldPrice
    } else { // syp
      newGoldValue = inputValue / goldPrice
    }
    
    onChange(newGoldValue)
    setLocalValue(inputValue)
  }
  
  // Calculate equivalent values
  const goldValue = value
  const sypValue = value * goldPrice
  const usdValue = sypValue / dollarRate
  
  // Format values for display
  const formattedGoldValue = `${goldValue.toFixed(2)} ${isArabic ? "غرام" : "grams"}`
  const formattedSypValue = formatCurrency(sypValue, "SYP", dollarRate, locale)
  
  // Custom format for USD to avoid unnecessary decimal places and always use Arabic numerals
  const formattedUsdValue = `$${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(usdValue)}`

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-md font-semibold">{title}</h3>
      </div>
      
      <Tabs 
        defaultValue="gold" 
        value={paymentMethod} 
        onValueChange={(value) => setPaymentMethod(value as "gold" | "usd" | "syp")}
        className="w-full"
      >
        <TabsList className="grid grid-cols-3 mb-2">
          <TabsTrigger value="gold" className="flex items-center gap-1">
            <HeartHandshake className="h-3 w-3" />
            {isArabic ? "ذهب" : "Gold"}
          </TabsTrigger>
          <TabsTrigger value="usd" className="flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {isArabic ? "دولار" : "USD"}
          </TabsTrigger>
          <TabsTrigger value="syp" className="flex items-center gap-1">
            {isArabic ? "ل.س" : "SYP"}
          </TabsTrigger>
        </TabsList>
        
        <div className="pt-2">
          <Input 
            id={id} 
            type="number" 
            value={localValue} 
            onChange={(e) => handleInputChange(Number(e.target.value))}
            className="mb-2"
          />
          
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            {paymentMethod !== "gold" && (
              <p>= {formattedGoldValue}</p>
            )}
            {paymentMethod !== "syp" && (
              <p>= {formattedSypValue}</p>
            )}
            {paymentMethod !== "usd" && (
              <p>= {formattedUsdValue}</p>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  )
}
