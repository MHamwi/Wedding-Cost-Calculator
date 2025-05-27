"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { formatCurrency, convertCurrency } from "@/lib/currency-utils"
import { CurrencyChip } from "@/components/currency-chip"
import { useLanguage } from "@/contexts/language-context"

interface GoldsmithingClothingSectionProps {
  goldGrams: number
  clothingCost: number
  onGoldGramsChange: (value: number) => void
  onClothingCostChange: (value: number) => void
  goldPrice: number
  currency: string
  onCurrencyChange: (currency: string) => void
  dollarRate: number
}

export function GoldsmithingClothingSection({
  goldGrams,
  clothingCost,
  onGoldGramsChange,
  onClothingCostChange,
  goldPrice,
  currency,
  onCurrencyChange,
  dollarRate,
}: GoldsmithingClothingSectionProps) {
  const { language } = useLanguage()
  const isArabic = language === "ar"

  // Maintain separate currency states for clothing and total sections
  const [clothingCurrency, setClothingCurrency] = useState(currency)
  const [totalCurrency, setTotalCurrency] = useState(currency)
  
  // Track clothing cost in SYP (base currency)
  const [clothingCostSYP, setClothingCostSYP] = useState(
    currency === "SYP" ? clothingCost : Math.round(clothingCost * dollarRate)
  )
  
  // Calculate USD equivalent
  const clothingCostUSD = Math.round((clothingCostSYP / dollarRate) * 100) / 100
  
  // Initialize currencies from props
  useEffect(() => {
    setClothingCurrency(currency)
    setTotalCurrency(currency)
  }, [currency])
  
  // Update parent when local SYP cost changes
  useEffect(() => {
    onClothingCostChange(clothingCostSYP)
  }, [clothingCostSYP, onClothingCostChange])

  // Calculate the total cost of gold in SYP and USD
  const goldCostSYP = goldGrams * goldPrice
  const goldCostUSD = goldCostSYP / dollarRate
  
  // Get the current clothing cost in the selected currency for display
  const currentClothingCost = clothingCurrency === "USD" 
    ? clothingCostUSD 
    : clothingCostSYP
  
  // Calculate totals in both currencies
  const totalSYP = goldCostSYP + clothingCostSYP
  const totalUSD = goldCostUSD + clothingCostUSD
  
  // Calculate the total cost in the selected currency for display
  const displayTotalCost = totalCurrency === "USD" ? totalUSD : totalSYP
  
  // Format the total based on the selected currency
  const totalCostFormatted = formatCurrency(
    displayTotalCost,
    totalCurrency,
    dollarRate
  )

  // Available currencies
  const currencies = ["SYP", "USD"]
  
  // Handle clothing currency change
  const handleClothingCurrencyChange = (newCurrency: string) => {
    if (newCurrency === clothingCurrency) return; // No change needed
    
    // If switching to USD, we keep the SYP value but update the display currency
    // The actual value in SYP remains the same, we just show the USD equivalent
    setClothingCurrency(newCurrency);
    
    // If we're switching to SYP, we need to ensure the input shows the SYP value
    if (newCurrency === "SYP") {
      // Force update the input field to show SYP value
      // The actual value is already in SYP in the state
    }
  }
  
  // Handle total currency change (display only, doesn't affect calculations)
  const handleTotalCurrencyChange = (newCurrency: string) => {
    if (newCurrency === totalCurrency) return; // No change needed
    setTotalCurrency(newCurrency);
  }

  return (
    <Card>
      <CardContent className="space-y-6 pt-6">
        {/* Gold Amount Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold">
              {isArabic ? "كمية الذهب (غرام)" : "Gold Amount (Grams)"}
            </h3>
          </div>

          <div>
            <Input
              id="goldGrams"
              type="number"
              value={goldGrams}
              onChange={(e) => onGoldGramsChange(Number(e.target.value))}
            />
            <div className="flex flex-col space-y-1 mt-1">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(goldGrams * goldPrice, "SYP", dollarRate)}
              </p>
              <p className="text-xs text-muted-foreground">
                = {formatCurrency(goldGrams * goldPrice / dollarRate, "USD", dollarRate)}
              </p>
            </div>
          </div>
        </div>

        {/* Clothing Cost Section */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-md font-semibold">
              {isArabic ? "تكلفة الملابس" : "Clothing Cost"}
            </h3>
            <div className="flex gap-2">
              {currencies.map((curr) => {
                const isSelected = clothingCurrency === curr;
                return (
                  <div 
                    key={curr} 
                    className={`relative ${isSelected ? 'z-10' : ''}`}
                    title={isArabic 
                      ? (isSelected ? 'العملة المحددة' : 'انقر للتحويل إلى ' + (curr === 'USD' ? 'دولار' : 'ليرة سورية'))
                      : (isSelected ? 'Selected currency' : 'Click to convert to ' + curr)}
                    onClick={() => handleClothingCurrencyChange(curr)}
                  >
                    <CurrencyChip
                      currency={curr}
                      isSelected={isSelected}
                    />
                    {isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <Input
              id="clothingCost"
              type="number"
              value={currentClothingCost}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                if (clothingCurrency === "USD") {
                  // Convert USD to SYP and update SYP state
                  const newSYP = Math.round(newValue * dollarRate);
                  setClothingCostSYP(newSYP);
                } else {
                  // Directly update SYP state
                  setClothingCostSYP(newValue);
                }
              }}
            />
            <div className="flex flex-col space-y-1 mt-1">
              <p className="text-sm text-muted-foreground">
                {formatCurrency(currentClothingCost, clothingCurrency, dollarRate)}
              </p>
              {clothingCurrency === "SYP" ? (
                <p className="text-xs text-muted-foreground">
                  = {formatCurrency(clothingCostSYP / dollarRate, "USD", dollarRate)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  = {formatCurrency(clothingCostUSD * dollarRate, "SYP", dollarRate)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Total Section */}
        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium">{isArabic ? "المجموع" : "Total"}</span>
            <div className="flex gap-2">
              {currencies.map((curr) => {
                const isSelected = totalCurrency === curr;
                return (
                  <div 
                    key={curr} 
                    className={`relative ${isSelected ? 'z-10' : ''}`}
                    title={isArabic 
                      ? (isSelected ? 'العملة المحددة' : 'انقر للتحويل إلى ' + (curr === 'USD' ? 'دولار' : 'ليرة سورية'))
                      : (isSelected ? 'Selected currency' : 'Click to convert to ' + curr)}
                    onClick={() => handleTotalCurrencyChange(curr)}
                  >
                    <CurrencyChip
                      currency={curr}
                      isSelected={isSelected}
                    />
                    {isSelected && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
          
          <div className="flex justify-between items-center">
            <div className="flex flex-col">
              <p className="text-xs text-muted-foreground">
                {isArabic ? "ذهب" : "Gold"}: {formatCurrency(
                  totalCurrency === "USD" ? goldCostUSD : goldCostSYP,
                  totalCurrency,
                  dollarRate
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {isArabic ? "ملابس" : "Clothing"}: {formatCurrency(
                  totalCurrency === "USD" ? clothingCostUSD : clothingCostSYP,
                  totalCurrency,
                  dollarRate
                )}
              </p>
            </div>
            <span className="font-bold text-lg">
              {totalCostFormatted}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
