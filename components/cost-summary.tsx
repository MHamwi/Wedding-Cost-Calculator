"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { formatCurrency, convertCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/contexts/language-context"
import { Download, DollarSign } from "lucide-react"

interface CostSummaryProps {
  totalCost: number
  baseCurrency: string
  dollarRate: number
  onCurrencyChange: (currency: string) => void
  onExportPDF?: () => void
}

export function CostSummary({ totalCost, baseCurrency, dollarRate, onCurrencyChange, onExportPDF }: CostSummaryProps) {
  const { language, direction } = useLanguage()
  const locale = language === "ar" ? "ar-SY" : "en-US"
  const isRTL = direction === "rtl"
  
  // Track if we're showing USD, initialized from props
  const [showInUSD, setShowInUSD] = useState(baseCurrency === "USD")
  
  // Make sure the state stays in sync with props
  useEffect(() => {
    console.log('CostSummary: Base currency changed to', baseCurrency);
    setShowInUSD(baseCurrency === "USD");
  }, [baseCurrency])
  
  // For debugging
  console.log("Base currency:", baseCurrency)
  console.log("Dollar rate:", dollarRate)
  console.log("Total cost:", totalCost)
  console.log("Show in USD:", showInUSD)
  
  // Debug logs for currency conversion
  console.log('=== CostSummary Debug ===');
  console.log('Received totalCost:', totalCost);
  console.log('Base currency:', baseCurrency);
  console.log('Show in USD:', showInUSD);
  
  // The parent component already converts totalCost to the selected currency
  const displayCurrency = showInUSD ? "USD" : "SYP"
  const displayedCost = totalCost; // Use totalCost directly as it's already in the correct currency
  
  // Log the final display values
  console.log('Display currency:', displayCurrency);
  console.log('Displayed cost:', displayedCost);
  
  // Handle toggle change - this only changes the display currency
  const handleToggleChange = (checked: boolean) => {
    const newCurrency = checked ? "USD" : "SYP";
    console.log('Toggle changed to:', newCurrency);
    console.log('Current totalCost before toggle:', totalCost);
    console.log('Dollar rate:', dollarRate);
    
    // Update the local state
    setShowInUSD(checked);
    
    // Notify parent about the currency change
    // The parent will handle the actual conversion of all values
    onCurrencyChange(newCurrency);
    
    console.log('Toggle complete. New currency:', newCurrency);
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-center">
          {language === "ar" ? "ملخص التكاليف" : "Cost Summary"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <div className="text-center text-4xl font-bold">
            {displayCurrency === "USD" ? 
              `$${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(displayedCost)}` :
              formatCurrency(displayedCost, displayCurrency, dollarRate, locale)
            }
          </div>
          
          <div className="flex items-center justify-center gap-3 p-2 border rounded-lg bg-muted/20">
            <Label 
              htmlFor="currency-toggle" 
              className={`text-sm font-medium cursor-pointer transition-colors ${!showInUSD ? 'text-primary' : 'text-muted-foreground'}`}
            >
              {language === "ar" ? "ليرة سورية" : "SYP"}
            </Label>
            
            <Switch
              id="currency-toggle"
              checked={showInUSD}
              onCheckedChange={handleToggleChange}
              className="data-[state=checked]:bg-green-500"
            />
            
            <Label 
              htmlFor="currency-toggle" 
              className={`text-sm font-medium cursor-pointer flex items-center transition-colors ${showInUSD ? 'text-primary' : 'text-muted-foreground'}`}
            >
              <DollarSign className="h-3 w-3 mr-1" />
              {language === "ar" ? "دولار أمريكي" : "USD"}
            </Label>
          </div>
          
          {/* Show the equivalent amount in the other currency */}
          <div className="text-sm text-muted-foreground">
            {showInUSD ? (
              <span>= {formatCurrency(displayedCost * dollarRate, "SYP", dollarRate, locale)}</span>
            ) : (
              <span>= ${new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
              }).format(displayedCost / dollarRate)}</span>
            )}
            <div className="text-xs opacity-70 mt-1">
              (1 USD = {dollarRate.toLocaleString()} SYP)
              <div className="text-[10px] mt-0.5">
                {language === 'ar' ? 'انقر على العملة للتحويل' : 'Click currency to convert'}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      {onExportPDF && (
        <CardFooter className="flex justify-center">
          <Button variant="outline" onClick={onExportPDF} className="w-full">
            <Download className={`h-4 w-4 ${isRTL ? "ml-2" : "mr-2"}`} />
            {language === "ar" ? "تصدير كـPDF" : "Export as PDF"}
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
