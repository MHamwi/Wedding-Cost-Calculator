"use client"

import type React from "react"
import { formatCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/contexts/language-context"

interface CostItem {
  name: string
  value: number
  icon: React.ReactNode
}

interface CostBreakdownProps {
  costItems: CostItem[]
  currency: string
  dollarRate: number
  goldAdvance: number
  goldDeferred: number
  goldPrice: number
  advanceRequired: boolean
  rentHome: boolean
  rentMonthly: number
  rentMonths: number
}

export function CostBreakdown({
  costItems,
  currency,
  dollarRate,
  goldAdvance,
  goldDeferred,
  goldPrice,
  advanceRequired,
  rentHome,
  rentMonthly,
  rentMonths,
}: CostBreakdownProps) {
  // Debug logs
  console.log('=== CostBreakdown Debug ===');
  console.log('Received currency:', currency);
  console.log('Dollar rate:', dollarRate);
  console.log('Cost items:', costItems);
  const { language, direction } = useLanguage()
  const locale = language === "ar" ? "ar-SY" : "en-US"
  const isRTL = direction === "rtl"

  // Filter out zero-value items and log them
  const validCostItems = costItems.filter((item) => {
    const isValid = item.value > 0;
    if (!isValid) {
      console.log(`Filtered out zero-value item: ${item.name}`);
    }
    return isValid;
  });
  
  const totalCost = validCostItems.reduce((sum, item) => {
    const itemValue = Number(item.value);
    console.log(`Adding ${item.name}: ${itemValue} (${currency})`);
    return sum + itemValue;
  }, 0);
  
  console.log('Total calculated cost:', totalCost, currency);

  return (
    <div className="space-y-4">
      {validCostItems.map((item, index) => (
        <div key={index} className="flex justify-between items-center">
          <div className="flex items-center">
            <div className={isRTL ? "ml-2" : "mr-2"}>{item.icon}</div>
            <span>{item.name}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="font-medium">{formatCurrency(item.value, currency, dollarRate, locale)}</span>
            <span className="text-xs text-muted-foreground">
              {totalCost > 0 ? ((Number(item.value) / totalCost) * 100).toFixed(1) + '%' : '0%'}
            </span>
          </div>
        </div>
      ))}

      <div className="pt-4 border-t">
        <div className="flex justify-between font-bold">
          <span>{language === "ar" ? "الإجمالي" : "Total"}</span>
          <span>{formatCurrency(totalCost, currency, dollarRate, locale)}</span>
        </div>
      </div>

      {!advanceRequired && goldAdvance > 0 && (
        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>
            {language === "ar"
              ? `ملاحظة: المقدم (${goldAdvance} غرام ذهب = ${formatCurrency(
                  goldAdvance * goldPrice,
                  currency,
                  dollarRate,
                  locale,
                )}) غير مدرج في الإجمالي حسب الإعدادات.`
              : `Note: Advance (${goldAdvance} grams of gold = ${formatCurrency(
                  goldAdvance * goldPrice,
                  currency,
                  dollarRate,
                  locale,
                )}) is not included in the total as per settings.`}
          </p>
        </div>
      )}

      {goldDeferred > 0 && (
        <div className="pt-4 border-t text-sm text-muted-foreground">
          <p>
            {language === "ar"
              ? `المؤخر: ${goldDeferred} غرام ذهب = ${formatCurrency(
                  goldDeferred * goldPrice,
                  currency,
                  dollarRate,
                  locale,
                )}`
              : `Deferred: ${goldDeferred} grams of gold = ${formatCurrency(
                  goldDeferred * goldPrice,
                  currency,
                  dollarRate,
                  locale,
                )}`}
          </p>
        </div>
      )}
    </div>
  )
}
