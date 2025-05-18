"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { CurrencyChip } from "@/components/currency-chip"
import { formatCurrency, convertCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/contexts/language-context"

interface CostSectionProps {
  title: string
  value: number
  onChange: (value: number) => void
  currency: string
  onCurrencyChange: (currency: string) => void
  mainCurrency: string
  dollarRate: number
  id: string
  convertedValue?: number
  description?: string
  disabled?: boolean
}

export function CostSection({
  title,
  value,
  onChange,
  currency,
  onCurrencyChange,
  mainCurrency,
  dollarRate,
  id,
  convertedValue,
  description,
  disabled = false
}: CostSectionProps) {
  const { language, t } = useLanguage()
  
  // Maintain local currency state to prevent chips from changing when summary toggle changes
  const [localCurrency, setLocalCurrency] = useState(currency)
  
  // Initialize local currency from props
  useEffect(() => {
    setLocalCurrency(currency)
  }, [currency])

  // Use converted value if provided, otherwise use the original value
  const displayValue = convertedValue !== undefined ? convertedValue : value;

  // Available currencies
  const currencies = ["SYP", "USD"] as const;
  
  // Handle currency change and convert the value
  const handleCurrencyChange = (newCurrency: string) => {
    if (disabled || newCurrency === localCurrency) return; // No change needed
    
    console.log(`Converting ${value} ${localCurrency} to ${newCurrency}`);
    
    // Convert the value to the new currency
    let newValue = value;
    if (localCurrency !== newCurrency) {
      if (localCurrency === 'USD' && newCurrency === 'SYP') {
        // Convert from USD to SYP
        newValue = Math.round(value * dollarRate);
      } else if (localCurrency === 'SYP' && newCurrency === 'USD') {
        // Convert from SYP to USD
        newValue = Math.round((value / dollarRate) * 100) / 100;
      }
      
      console.log(`Converted value: ${newValue} ${newCurrency}`);
      
      // Update the parent with the converted value
      // Only update if the value would change (not zero)
      if (value !== 0) {
        onChange(newValue);
      }
    }
    
    // Always update the local currency and notify parent about the currency change
    setLocalCurrency(newCurrency);
    onCurrencyChange(newCurrency);
  }
  
  // Update local currency when the prop changes
  useEffect(() => {
    if (currency !== localCurrency) {
      setLocalCurrency(currency);
    }
  }, [currency]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className={`text-md font-semibold ${disabled ? 'opacity-70' : ''}`}>
          {title}
          {disabled && <span className="text-xs text-muted-foreground ml-2">(Auto-calculated)</span>}
        </h3>
        <div className="flex gap-2">
          {currencies.map((curr) => {
            const isSelected = localCurrency === curr;
            return (
              <div 
                key={curr} 
                className={`relative ${isSelected ? 'z-10' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                title={disabled 
                  ? (language === 'ar' ? 'معطل' : 'Disabled')
                  : (language === 'ar' 
                      ? (isSelected ? 'العملة المحددة' : 'انقر للتحويل إلى ' + (curr === 'USD' ? 'دولار' : 'ليرة سورية'))
                      : (isSelected ? 'Selected currency' : 'Click to convert to ' + curr))}
                onClick={() => !disabled && handleCurrencyChange(curr)}
              >
                <CurrencyChip
                  currency={curr}
                  isSelected={isSelected}
                  disabled={disabled}
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
          id={id}
          type="number"
          value={displayValue}
          onChange={(e) => onChange(Number(e.target.value))}
          className="text-right"
          disabled={disabled}
        />
        <div className="flex flex-col space-y-1 mt-1">
          <p className="text-sm text-muted-foreground">
            {formatCurrency(value, localCurrency, dollarRate)}
            {description && <span className="ml-2">({description})</span>}
          </p>
          {localCurrency !== "USD" && (
            <p className="text-xs text-muted-foreground">
              = {formatCurrency(convertCurrency(value, localCurrency, "USD", dollarRate), "USD", dollarRate)}
            </p>
          )}
          {localCurrency !== "SYP" && (
            <p className="text-xs text-muted-foreground">
              = {formatCurrency(convertCurrency(value, localCurrency, "SYP", dollarRate), "SYP", dollarRate)}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
