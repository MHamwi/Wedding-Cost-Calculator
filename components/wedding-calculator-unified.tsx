"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase/client"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CostBreakdown } from "@/components/cost-breakdown"
import { CostChart } from "@/components/cost-chart"
import { CostSummary } from "@/components/cost-summary"
import { CategoryManager } from "@/components/home-furnishing/category-manager"
import { HomeFurnishingWrapper } from "@/components/home-furnishing/home-furnishing-wrapper"
import { CurrencySelector } from "@/components/currency-selector"
import { CostSection } from "@/components/cost-section"
import { MahrInput } from "@/components/mahr-input"
import { GoldsmithingClothingSection } from "@/components/goldsmithing-clothing-section"
import { Calculator, Download, DollarSign, Home, Heart, HeartHandshake, Plane, Plus, Save, Gem } from "lucide-react"
import { formatCurrency, convertCurrency } from "@/lib/currency-utils"
import { toast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"
import html2canvas from "html2canvas"
import jsPDF from "jspdf"

// Budget presets
const BUDGET_PRESETS = {
  economic: {
    goldAdvance: 50,
    goldDeferred: 25,
    homeFurnishing: 30_000_000,
    weddingCost: 10_000_000,
    honeymoon: 2_000_000,
    additionalExpenses: 4_000_000,
    rentMonthly: 400_000,
    rentMonths: 6,
  },
  medium: {
    goldAdvance: 100,
    goldDeferred: 50,
    homeFurnishing: 61_000_000,
    weddingCost: 25_500_000,
    honeymoon: 4_000_000,
    additionalExpenses: 7_500_000,
    rentMonthly: 600_000,
    rentMonths: 6,
  },
  luxury: {
    goldAdvance: 150,
    goldDeferred: 75,
    homeFurnishing: 100_000_000,
    weddingCost: 50_000_000,
    honeymoon: 10_000_000,
    additionalExpenses: 15_000_000,
    rentMonthly: 800_000,
    rentMonths: 6,
  },
}

interface WeddingCalculatorProps {
  calculationId?: string
  initialData?: any
}

export function WeddingCalculator({ calculationId, initialData = {} }: WeddingCalculatorProps) {
  const router = useRouter()
  const { language, t, direction } = useLanguage()
  const isArabic = language === "ar"
  const isRTL = direction === "rtl"

  // General settings
  const [currency, setCurrency] = useState(initialData.currency || "SYP")
  const [goldPrice, setGoldPrice] = useState(initialData.gold_price || 1_000_000)
  const [dollarRate, setDollarRate] = useState(initialData.dollar_rate || 15_000)
  const [advanceRequired, setAdvanceRequired] = useState(initialData.advance_required !== false)
  const [rentHome, setRentHome] = useState(initialData.rent_home !== false)

  // Budget mode
  const [budgetMode, setBudgetMode] = useState(initialData.budget_mode || "medium")

  // Cost items with their respective currencies
  const [goldAdvance, setGoldAdvance] = useState(initialData.gold_advance || BUDGET_PRESETS.medium.goldAdvance)
  const [goldDeferred, setGoldDeferred] = useState(initialData.gold_deferred || BUDGET_PRESETS.medium.goldDeferred)
  const [homeFurnishing, setHomeFurnishing] = useState(
    initialData.home_furnishing || BUDGET_PRESETS.medium.homeFurnishing,
  )
  const [weddingCost, setWeddingCost] = useState(initialData.wedding_cost || BUDGET_PRESETS.medium.weddingCost)
  const [honeymoon, setHoneymoon] = useState(initialData.honeymoon || BUDGET_PRESETS.medium.honeymoon)
  const [additionalExpenses, setAdditionalExpenses] = useState(
    initialData.additional_expenses || BUDGET_PRESETS.medium.additionalExpenses,
  )
  const [rentMonthly, setRentMonthly] = useState(initialData.rent_monthly || BUDGET_PRESETS.medium.rentMonthly)
  const [rentMonths, setRentMonths] = useState(initialData.rent_months || BUDGET_PRESETS.medium.rentMonths)
  
  // Track currencies for each cost section
  const [weddingCostCurrency, setWeddingCostCurrency] = useState(initialData.wedding_cost_currency || "SYP");
  const [honeymoonCurrency, setHoneymoonCurrency] = useState(initialData.honeymoon_currency || "SYP");
  const [homeFurnishingCurrency, setHomeFurnishingCurrency] = useState(initialData.home_furnishing_currency || "SYP");
  const [additionalExpensesCurrency, setAdditionalExpensesCurrency] = useState(initialData.additional_expenses_currency || "SYP");
  const [rentCurrency, setRentCurrency] = useState(initialData.rent_currency || "SYP");

  // Goldsmithing and clothing section
  const [goldsmithingGrams, setGoldsmithingGrams] = useState(initialData.goldsmithing_grams || 0)
  const [clothingCost, setClothingCost] = useState(initialData.clothing_cost || 0)
  const [goldsmithingCurrency, setGoldsmithingCurrency] = useState(initialData.goldsmithing_currency || "SYP")

  // Save dialog state
  const [saveDialogOpen, setSaveDialogOpen] = useState(false)
  const [calculationName, setCalculationName] = useState(initialData.name || "")
  
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false)
  const [exportCurrency, setExportCurrency] = useState<'SYP' | 'USD'>('SYP')

  // Home furnishing items and total from manager
  const [homeFurnishingItems, setHomeFurnishingItems] = useState<any[]>([])
  const [homeFurnishingFromCategories, setHomeFurnishingFromCategories] = useState(0)

  // Apply budget preset
  useEffect(() => {
    const preset = BUDGET_PRESETS[budgetMode as keyof typeof BUDGET_PRESETS]
    setGoldAdvance(preset.goldAdvance)
    setGoldDeferred(preset.goldDeferred)
    setHomeFurnishing(preset.homeFurnishing)
    setWeddingCost(preset.weddingCost)
    setHoneymoon(preset.honeymoon)
    setAdditionalExpenses(preset.additionalExpenses)
    setRentMonthly(preset.rentMonthly)
    setRentMonths(preset.rentMonths)
    
    // Force reset home furnishing items to trigger reinitialization with new budget mode
    setHomeFurnishingItems([])
  }, [budgetMode])

  // Helper function to convert value to SYP based on currency
  const convertToSYP = (value: number, currency: string) => {
    return currency === 'USD' ? value * dollarRate : value;
  };

  // Calculate costs in SYP (base currency)
  const goldAdvanceCost = goldAdvance * goldPrice; // Always in SYP
  const goldDeferredCost = goldDeferred * goldPrice; // Always in SYP
  
  // Convert all costs to SYP for total calculation
  const weddingCostSYP = convertToSYP(weddingCost, weddingCostCurrency);
  const honeymoonSYP = convertToSYP(honeymoon, honeymoonCurrency);
  const homeFurnishingSYP = homeFurnishingFromCategories > 0 
    ? homeFurnishingFromCategories 
    : convertToSYP(homeFurnishing, homeFurnishingCurrency);
  const additionalExpensesSYP = convertToSYP(additionalExpenses, additionalExpensesCurrency);
  
  // Calculate rent total in the selected currency, then convert to SYP
  const rentTotal = rentHome ? rentMonthly * rentMonths : 0;
  const rentTotalSYP = convertToSYP(rentTotal, rentCurrency);
  
  // Calculate goldsmithing and clothing costs (only when goldAdvance is off)
  const goldsmithingCost = !advanceRequired ? goldsmithingGrams * goldPrice : 0; // Always in SYP
  const clothingCostSYP = !advanceRequired ? 
    convertToSYP(clothingCost, goldsmithingCurrency) : 0;
  
  // Calculate total cost in SYP (base currency for calculations)
  // Follow the same logic as the live app for calculating total cost
  const totalCostSYP =
    (advanceRequired ? goldAdvanceCost : 0) + // Include advance Mahr when toggle is ON (required)
    homeFurnishingSYP +
    weddingCostSYP +
    honeymoonSYP +
    additionalExpensesSYP +
    rentTotalSYP +
    goldsmithingCost +
    clothingCostSYP;
  
  // Debug logs
  console.log('=== DEBUG: Cost Breakdown ===');
  console.log('Gold Advance (SYP):', goldAdvanceCost);
  console.log('Home Furnishing (SYP):', homeFurnishingSYP);
  console.log('Wedding Cost:', weddingCost, weddingCostCurrency);
  console.log('Wedding Cost (SYP):', weddingCostSYP);
  console.log('Honeymoon (SYP):', honeymoonSYP);
  console.log('Additional Expenses (SYP):', additionalExpensesSYP);
  console.log('Rent Total (SYP):', rentTotalSYP);
  console.log('Goldsmithing (SYP):', goldsmithingCost);
  console.log('Clothing (SYP):', clothingCostSYP);
  console.log('Total Cost (SYP):', totalCostSYP);
  console.log('Dollar Rate:', dollarRate);
  console.log('Total Cost (Converted):', currency === 'USD' ? totalCostSYP / dollarRate : totalCostSYP);
    
  // Convert total cost based on selected currency
  // This is the value that will be passed to the CostSummary component
  const totalCost = currency === "USD" ? totalCostSYP / dollarRate : totalCostSYP
  
  // Debug the currency conversion
  console.log(`Currency: ${currency}, Total in SYP: ${totalCostSYP}, Converted total: ${totalCost}`)

  // Function to convert value based on selected currency
  // This is ONLY used for displaying values in the summary section
  const convertValue = (value: number) => {
    // If we're in USD mode, convert from SYP to USD
    if (currency === "USD") {
      const convertedValue = value / dollarRate
      console.log(`Converting ${value} SYP to ${convertedValue} USD`)
      return Math.round(convertedValue) // Round to nearest integer for consistent display
    }
    return value
  }

  // Prepare cost breakdown for chart and summary
  const costBreakdown = [
    {
      name: isArabic ? "المهر المقدم" : "Mahr (Advance)",
      value: convertValue(advanceRequired ? goldAdvanceCost : 0),
      icon: <HeartHandshake className="h-4 w-4" />,
    }
  ]
  
  // Debug log for cost items and converted values
  console.log('=== DEBUG: Cost Items ===', costBreakdown);
  console.log('=== DEBUG: Converted Values ===');
  console.log('Gold Advance:', convertValue(advanceRequired ? goldAdvanceCost : 0));
  console.log('Goldsmithing:', convertValue(goldsmithingCost));
  console.log('Clothing:', convertValue(clothingCostSYP));
  console.log('Home Furnishing:', convertValue(homeFurnishingSYP));
  console.log('Wedding Cost:', convertValue(weddingCostSYP));
  console.log('Honeymoon:', convertValue(honeymoonSYP));
  console.log('Additional Expenses:', convertValue(additionalExpensesSYP));
  
  // Add goldsmithing and clothing costs to the breakdown when goldAdvance is off
  if (!advanceRequired) {
    const totalGoldsmithingClothing = goldsmithingCost + clothingCostSYP;
    if (totalGoldsmithingClothing > 0) {
      costBreakdown.push({
        name: isArabic ? "المصاغ والملابس" : "Goldsmithing & Clothing",
        value: convertValue(totalGoldsmithingClothing),
        icon: <Gem className="h-4 w-4" />,
      });
    }
  }

  costBreakdown.push(
    {
      name: isArabic ? "تجهيز المنزل" : "Home Furnishing",
      value: convertValue(homeFurnishingSYP),
      icon: <Home className="h-4 w-4" />,
    },
    {
      name: isArabic ? "تكاليف الزفاف" : "Wedding Cost",
      value: convertValue(weddingCostSYP),
      icon: <DollarSign className="h-4 w-4" />,
    },
    {
      name: isArabic ? "شهر العسل" : "Honeymoon",
      value: convertValue(honeymoonSYP),
      icon: <Plane className="h-4 w-4" />,
    },
    {
      name: isArabic ? "مصاريف إضافية" : "Additional Expenses",
      value: convertValue(additionalExpensesSYP),
      icon: <Plus className="h-4 w-4" />,
    }
  )

  if (rentHome) {
    costBreakdown.push({
      name: isArabic ? "الإيجار" : "Rent",
      value: convertValue(rentTotalSYP),
      icon: <Home className="h-4 w-4" />,
    })
  }

  // Save functionality has been removed

  // Generate a comprehensive cost breakdown for PDF export
  const generateCostBreakdown = useCallback((targetCurrency: 'SYP' | 'USD' = 'SYP', displayTotal: number) => {
    const currentDirection = direction; // Capture the current direction value
    
    // Helper function to format currency with proper direction and conversion
    const formatCurrencyWithDirection = (value: number, currency: string, isRTL: boolean, showEquivalent = true) => {
      // Convert value to target currency if needed
      const displayValue = targetCurrency === 'USD' ? value / dollarRate : value;
      const displayCurrency = targetCurrency === 'USD' ? 'USD' : currency;
      
      // Format the main value
      const formatted = formatCurrency(displayValue, displayCurrency, dollarRate, isArabic ? 'ar-SY' : 'en-US');
      
      // Add equivalent in other currency as a small note
      if (showEquivalent && value > 0) {
        const otherValue = targetCurrency === 'USD' ? value : value / dollarRate;
        const otherCurrency = targetCurrency === 'USD' ? 'SYP' : 'USD';
        const otherFormatted = formatCurrency(otherValue, otherCurrency, dollarRate, isArabic ? 'ar-SY' : 'en-US');
        const note = isRTL 
          ? ` (${isArabic ? 'تعادل' : '≈'} ${otherFormatted} ${otherCurrency})`
          : ` (${isArabic ? '≈' : '≈'} ${otherFormatted})`;
        
        return isRTL 
          ? `${formatted} ${displayCurrency}${note}`
          : `${displayCurrency} ${formatted}${note}`;
      }
      
      return isRTL ? `${formatted} ${displayCurrency}` : `${displayCurrency} ${formatted}`;
    };

    // Helper function to create a table row with optional equivalent value
    const createRow = (label: string, value: number, currency: string, isBold = false, showEquivalent = true) => {
      const formattedValue = formatCurrencyWithDirection(value, currency, direction === 'rtl', showEquivalent);
      return `
        <tr style="${isBold ? 'font-weight: bold;' : ''}">
              <td style="text-align: ${direction === 'rtl' ? 'right' : 'left'}; padding: 8px; border-bottom: 1px solid #eee;">${label}</td>
              <td style="text-align: ${direction === 'rtl' ? 'left' : 'right'}; padding: 8px; border-bottom: 1px solid #eee; white-space: nowrap;">${formattedValue}</td>
        </tr>
      `;
    };

    // Calculate all costs in SYP for consistency, matching the live app's logic
    const goldAdvanceCostSYP = advanceRequired ? goldAdvance * goldPrice : 0;
    const goldDeferredCostSYP = advanceRequired ? goldDeferred * goldPrice : 0;
    const weddingCostSYP = convertToSYP(weddingCost, weddingCostCurrency);
    const honeymoonSYP = convertToSYP(honeymoon, honeymoonCurrency);
    const homeFurnishingSYP = homeFurnishingFromCategories > 0 
      ? homeFurnishingFromCategories 
      : convertToSYP(homeFurnishing, homeFurnishingCurrency);
    const additionalExpensesSYP = convertToSYP(additionalExpenses, additionalExpensesCurrency);
    const rentTotalSYP = rentHome ? convertToSYP(rentMonthly * rentMonths, rentCurrency) : 0;
    const goldsmithingCostSYP = !advanceRequired ? goldsmithingGrams * goldPrice : 0;
    const clothingCostSYP = !advanceRequired ? convertToSYP(clothingCost, goldsmithingCurrency) : 0;

    // Calculate subtotals
    const goldTotalSYP = goldsmithingCostSYP + (advanceRequired ? 0 : goldAdvanceCostSYP);
    const housingTotalSYP = homeFurnishingSYP + (rentHome ? rentTotalSYP : 0);
    const otherCostsSYP = weddingCostSYP + honeymoonSYP + additionalExpensesSYP + clothingCostSYP;
    const grandTotalSYP = (advanceRequired ? goldAdvanceCostSYP : 0) + goldTotalSYP + housingTotalSYP + otherCostsSYP;

    // Create the HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="${isRTL ? 'rtl' : 'ltr'}" lang="${isArabic ? 'ar' : 'en'}">
      <head>
        <meta charset="UTF-8">
        <title>${isArabic ? 'تقرير تكاليف الزواج' : 'Wedding Cost Report'}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; padding: 20px; }
          h1 { color: #2c3e50; text-align: center; margin-bottom: 30px; }
          h2 { color: #3498db; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-top: 30px; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background-color: #f2f2f2; text-align: ${isRTL ? 'right' : 'left'}; padding: 10px; }
          .total-row { font-weight: bold; background-color: #f8f9fa; }
          .section-total { font-size: 1.1em; margin-top: 10px; }
          .summary { margin-top: 30px; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
          .date { text-align: ${isRTL ? 'left' : 'right'}; color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>${isArabic ? 'تقرير تكاليف الزواج' : 'Wedding Cost Report'}</h1>
        <div class="date">${new Date().toLocaleDateString(isArabic ? 'ar-SY' : 'en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</div>

        <h2>${isArabic ? 'التكاليف الرئيسية' : 'Main Costs'}</h2>
        <table>
          <thead>
            <tr>
              <th style="text-align: ${isRTL ? 'right' : 'left'}">${isArabic ? 'البند' : 'Item'}</th>
              <th style="text-align: ${isRTL ? 'left' : 'right'}">${isArabic ? 'المبلغ' : 'Amount'}</th>
            </tr>
          </thead>
          <tbody>
            ${advanceRequired && goldAdvanceCostSYP > 0 ? createRow(isArabic ? 'المهر المقدم' : 'Advance Mahr', goldAdvanceCostSYP, 'SYP') : ''}
            ${goldDeferredCostSYP > 0 ? createRow(isArabic ? 'المهر المؤجل' : 'Deferred Mahr', goldDeferredCostSYP, 'SYP') : ''}
            ${!advanceRequired && goldAdvanceCostSYP > 0 ? createRow(isArabic ? 'المصوغات الذهبية' : 'Gold Items', goldAdvanceCostSYP, 'SYP') : ''}
            ${goldsmithingCostSYP > 0 ? createRow(isArabic ? 'مصوغات ذهبية' : 'Goldsmithing', goldsmithingCostSYP, 'SYP') : ''}
            ${goldTotalSYP > 0 ? createRow(isArabic ? 'إجمالي المصوغات' : 'Total Goldsmithing', goldTotalSYP, 'SYP', true) : ''}
            
            ${homeFurnishingSYP > 0 ? createRow(isArabic ? 'تأثيث المنزل' : 'Home Furnishing', homeFurnishingSYP, 'SYP') : ''}
            ${rentHome && rentTotalSYP > 0 ? createRow(isArabic ? 'إيجار المنزل' : 'Home Rent', rentTotalSYP, 'SYP') : ''}
            ${housingTotalSYP > 0 ? createRow(isArabic ? 'إجمالي السكن' : 'Total Housing', housingTotalSYP, 'SYP', true) : ''}
            
            ${weddingCostSYP > 0 ? createRow(isArabic ? 'حفل الزفاف' : 'Wedding Ceremony', weddingCostSYP, 'SYP') : ''}
            ${honeymoonSYP > 0 ? createRow(isArabic ? 'شهر العسل' : 'Honeymoon', honeymoonSYP, 'SYP') : ''}
            ${additionalExpensesSYP > 0 ? createRow(isArabic ? 'مصروفات إضافية' : 'Additional Expenses', additionalExpensesSYP, 'SYP') : ''}
            ${clothingCostSYP > 0 ? createRow(isArabic ? 'الملابس' : 'Clothing', clothingCostSYP, 'SYP') : ''}
            ${otherCostsSYP > 0 ? createRow(isArabic ? 'إجمالي المصاريف الأخرى' : 'Total Other Costs', otherCostsSYP, 'SYP', true) : ''}
            
            <tr class="total-row">
              <td style="text-align: ${currentDirection === 'rtl' ? 'right' : 'left'}; padding: 15px; font-size: 1.1em; border-top: 2px solid #000;">
                ${isArabic ? 'الإجمالي الكلي' : 'Grand Total'}
              </td>
              <td style="text-align: ${currentDirection === 'rtl' ? 'left' : 'right'}; padding: 15px; font-size: 1.1em; border-top: 2px solid #000;">
                ${formatCurrencyWithDirection(grandTotalSYP, 'SYP', currentDirection === 'rtl')}
              </td>
            </tr>
          </tbody>
        </table>

        <div class="summary">
          <h3>${isArabic ? 'ملخص' : 'Summary'}</h3>
          <p style="font-size: 1.1em; margin-bottom: 8px;">
            ${isArabic ? 'إجمالي تكاليف الزواج:' : 'Total Wedding Cost:'}
            <span style="font-weight: bold; margin-${isRTL ? 'right' : 'left'}: 8px;">
              ${formatCurrency(displayTotal, targetCurrency, dollarRate, isArabic ? 'ar-SY' : 'en-US')}
            </span>
          </p>
          <p style="font-size: 0.9em; color: #666; margin-top: 0;">
            ${targetCurrency === 'SYP' ? 
              (isArabic 
                ? `ما يعادل بالدولار الأمريكي: ${formatCurrency(displayTotal / dollarRate, 'USD', dollarRate, 'ar-SY')}` 
                : `Equivalent in USD: ${formatCurrency(displayTotal / dollarRate, 'USD', dollarRate, 'en-US')}`) : 
              (isArabic 
                ? `ما يعادل بالليرة السورية: ${formatCurrency(displayTotal * dollarRate, 'SYP', dollarRate, 'ar-SY')}` 
                : `Equivalent in SYP: ${formatCurrency(displayTotal * dollarRate, 'SYP', dollarRate, 'en-US')}`)}
          </p>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  }, [
    isArabic, isRTL, dollarRate, goldAdvance, goldDeferred, goldsmithingGrams, goldPrice,
    weddingCost, weddingCostCurrency, honeymoon, honeymoonCurrency, homeFurnishing,
    homeFurnishingCurrency, additionalExpenses, additionalExpensesCurrency, clothingCost,
    goldsmithingCurrency, rentHome, rentMonthly, rentMonths, advanceRequired, homeFurnishingFromCategories
  ]);

  // Handle export button click
  const handleExportClick = () => {
    setExportDialogOpen(true);
  };

  // Handle export confirmation
  const handleExportConfirm = useCallback(() => {
    console.log('Exporting in currency:', exportCurrency);
    console.log('Current dollar rate:', dollarRate);
    console.log('Total cost in SYP:', totalCostSYP);
    
    setExportDialogOpen(false);
    
    // Use a small timeout to ensure the dialog is closed before opening the print window
    setTimeout(() => {
      exportToPDF(exportCurrency);
    }, 100);
  }, [exportCurrency, dollarRate, totalCostSYP]);

  // PDF export function
  const exportToPDF = useCallback((targetCurrency: 'SYP' | 'USD' = 'SYP') => {
    // Convert total cost to target currency if needed
    const displayTotal = targetCurrency === 'USD' ? totalCostSYP / dollarRate : totalCostSYP;
    
    console.log('PDF Export - Target Currency:', targetCurrency);
    console.log('PDF Export - Display Total:', displayTotal);
    console.log('PDF Export - Dollar Rate:', dollarRate);
    console.log('PDF Export - Total in SYP:', totalCostSYP);
    try {
      // Generate the HTML content with the selected currency and converted amount
      const htmlContent = generateCostBreakdown(targetCurrency, displayTotal);
      
      // Create a new window with the HTML content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        throw new Error('Could not open print window');
      }
      
      // Write the HTML content to the new window
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Wait for the content to load before printing
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          
          // Show success message
          toast({
            title: isArabic ? "جاري فتح نافذة الطباعة" : "Opening print dialog",
            description: isArabic
              ? 'الرجاء اختيار "حفظ كملف PDF" في نافذة الطباعة'
              : 'Please select "Save as PDF" in the print dialog',
          });
        }, 500);
      };
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: isArabic ? "خطأ" : "Error",
        description: isArabic
          ? "حدث خطأ أثناء محاولة إنشاء ملف PDF"
          : "An error occurred while trying to generate PDF",
        variant: "destructive",
      });
    }
  }, [isArabic, generateCostBreakdown, exportCurrency, totalCostSYP, dollarRate]);

  return (
    <div className="space-y-8 print-section">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          <h2 className="text-2xl font-bold">
            {isArabic ? "حاسبة تكاليف الزواج" : "Wedding Cost Calculator"}
          </h2>
        </div>
        <div className="flex justify-end gap-2 mb-4">
          <Button 
            variant="default" 
            onClick={handleExportClick}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Download className="h-4 w-4" />
            {isArabic ? "تصدير التقرير" : "Export Report"}
          </Button>
          
          {/* Export Dialog */}
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{isArabic ? "اختر عملة التصدير" : "Select Export Currency"}</DialogTitle>
                <DialogDescription>
                  {isArabic 
                    ? "الرجاء اختيار العملة التي تريد تصدير التقرير بها"
                    : "Please select the currency for the export"}
                  </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="syp-export"
                    name="export-currency"
                    value="SYP"
                    checked={exportCurrency === 'SYP'}
                    onChange={() => setExportCurrency('SYP')}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="syp-export" className="text-base">
                    {isArabic ? "الليرة السورية (SYP)" : "Syrian Pound (SYP)"}
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="usd-export"
                    name="export-currency"
                    value="USD"
                    checked={exportCurrency === 'USD'}
                    onChange={() => setExportCurrency('USD')}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <Label htmlFor="usd-export" className="text-base">
                    {isArabic ? "الدولار الأمريكي (USD)" : "US Dollar (USD)"}
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setExportDialogOpen(false)}
                >
                  {isArabic ? "إلغاء" : "Cancel"}
                </Button>
                <Button 
                  type="button" 
                  onClick={handleExportConfirm}
                  className="bg-primary hover:bg-primary/90"
                >
                  {isArabic ? "تصدير" : "Export"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Main two-column layout with the summary section fixed on the left side */}
      <div className="flex flex-col lg:flex-row gap-8" dir={direction}>
        {/* Main content area - takes 2/3 of the space */}
        <div className="lg:w-2/3 space-y-6">
          <Card>
          <CardHeader>
            <CardTitle>{isArabic ? "الإعدادات العامة" : "General Settings"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="goldPrice">{isArabic ? "سعر غرام الذهب (ل.س)" : "Gold Price (SYP)"}</Label>
                <Input
                  id="goldPrice"
                  type="number"
                  value={goldPrice}
                  onChange={(e) => setGoldPrice(Number(e.target.value))}
                />
              </div>
              <div>
                <Label htmlFor="dollarRate">
                  {isArabic ? "سعر صرف الدولار (ل.س)" : "Dollar Exchange Rate (SYP)"}
                </Label>
                <Input
                  id="dollarRate"
                  type="number"
                  value={dollarRate}
                  onChange={(e) => setDollarRate(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="advanceRequired"
                  checked={advanceRequired}
                  onCheckedChange={setAdvanceRequired}
                />
                <Label htmlFor="advanceRequired">
                  {isArabic ? "المتقدم مقبوض؟" : "Mahr is Prepaid?"}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="rentHome"
                  checked={rentHome}
                  onCheckedChange={setRentHome}
                />
                <Label htmlFor="rentHome">
                  {isArabic ? "استئجار منزل؟" : "Rent a home?"}
                </Label>
              </div>
            </div>

            <div className="mt-4">
              <Label className="text-lg mb-3 block">{isArabic ? "اختيار وضع الميزانية" : "Budget Mode"}</Label>
              <RadioGroup value={budgetMode} onValueChange={setBudgetMode} className="hidden">
                {/* Hidden radio group to satisfy the RadioGroupItem requirement */}
                <RadioGroupItem value="economic" id="economic-hidden" />
                <RadioGroupItem value="medium" id="medium-hidden" />
                <RadioGroupItem value="luxury" id="luxury-hidden" />
              </RadioGroup>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${budgetMode === "economic" ? "border-primary bg-primary/10 shadow-md" : "border-muted hover:border-primary/50"}`}
                  onClick={() => setBudgetMode("economic")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{isArabic ? "اقتصادي" : "Economic"}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 ${budgetMode === "economic" ? "bg-primary border-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-muted-foreground text-sm">{isArabic ? "حوالي 90 مليون ل.س" : "Around 90 million SYP"}</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${budgetMode === "medium" ? "border-primary bg-primary/10 shadow-md" : "border-muted hover:border-primary/50"}`}
                  onClick={() => setBudgetMode("medium")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{isArabic ? "متوسط" : "Medium"}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 ${budgetMode === "medium" ? "bg-primary border-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-muted-foreground text-sm">{isArabic ? "حوالي 202 مليون ل.س" : "Around 202 million SYP"}</p>
                </div>
                
                <div 
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${budgetMode === "luxury" ? "border-primary bg-primary/10 shadow-md" : "border-muted hover:border-primary/50"}`}
                  onClick={() => setBudgetMode("luxury")}
                >
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-lg">{isArabic ? "فاخر" : "Luxury"}</h3>
                    <div className={`w-5 h-5 rounded-full border-2 ${budgetMode === "luxury" ? "bg-primary border-primary" : "border-muted"}`} />
                  </div>
                  <p className="text-muted-foreground text-sm">{isArabic ? "حوالي 387 مليون ل.س" : "Around 387 million SYP"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="costs">
            <AccordionTrigger className="text-lg font-medium">
              {isArabic ? "تفاصيل التكاليف" : "Cost Details"}
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <MahrInput
                    title={isArabic ? "المهر المقدم" : "Mahr Advance"}
                    value={goldAdvance}
                    onChange={setGoldAdvance}
                    goldPrice={goldPrice}
                    dollarRate={dollarRate}
                    id="goldAdvance"
                  />

                  <MahrInput
                    title={isArabic ? "المهر المؤخر" : "Mahr Deferred"}
                    value={goldDeferred}
                    onChange={setGoldDeferred}
                    goldPrice={goldPrice}
                    dollarRate={dollarRate}
                    id="goldDeferred"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                  <CostSection
                    title={isArabic ? "تكاليف الزفاف" : "Wedding Cost"}
                    value={weddingCost}
                    onChange={setWeddingCost}
                    currency={weddingCostCurrency}
                    onCurrencyChange={setWeddingCostCurrency}
                    mainCurrency={currency}
                    dollarRate={dollarRate}
                    id="weddingCost"
                  />
                </div>
                
                {/* Goldsmithing and Clothing section - only shown when goldAdvance is off */}
                {!advanceRequired && (
                  <div className="mt-6">
                    <h3 className="text-lg font-medium mb-4">
                      {isArabic ? "المصاغ والملابس" : "Goldsmithing & Clothing"}
                    </h3>
                    <GoldsmithingClothingSection
                      goldGrams={goldsmithingGrams}
                      clothingCost={clothingCost}
                      onGoldGramsChange={setGoldsmithingGrams}
                      onClothingCostChange={setClothingCost}
                      goldPrice={goldPrice}
                      currency={goldsmithingCurrency}
                      onCurrencyChange={setGoldsmithingCurrency}
                      dollarRate={dollarRate}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <CostSection
                    title={isArabic ? "شهر العسل" : "Honeymoon"}
                    value={honeymoon}
                    onChange={setHoneymoon}
                    currency={honeymoonCurrency}
                    onCurrencyChange={setHoneymoonCurrency}
                    mainCurrency={currency}
                    dollarRate={dollarRate}
                    id="honeymoon"
                  />

                  <CostSection
                    title={isArabic ? "مصاريف إضافية" : "Additional Expenses"}
                    value={additionalExpenses}
                    onChange={setAdditionalExpenses}
                    currency={additionalExpensesCurrency}
                    onCurrencyChange={setAdditionalExpensesCurrency}
                    mainCurrency={currency}
                    dollarRate={dollarRate}
                    id="additionalExpenses"
                  />
                </div>

                {rentHome && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-6">
                      <CostSection
                        title={isArabic ? "الإيجار" : "Rent"}
                        value={rentMonthly}
                        onChange={setRentMonthly}
                        currency={rentCurrency}
                        onCurrencyChange={setRentCurrency}
                        mainCurrency={currency}
                        dollarRate={dollarRate}
                        id="rent"
                        description={isArabic 
                          ? `المجموع: ${formatCurrency(rentMonthly * rentMonths, rentCurrency, dollarRate, 'ar-SY')} (${rentMonths} ${isArabic ? 'أشهر' : 'months'})`
                          : `Total: ${formatCurrency(rentMonthly * rentMonths, rentCurrency, dollarRate, 'en-US')} (${rentMonths} months)`}
                      />

                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="rentMonths">
                          {isArabic ? "عدد الأشهر المدفوعة مقدمًا" : "Number of Months Paid in Advance"}
                        </Label>
                        <Input
                          id="rentMonths"
                          type="number"
                          value={rentMonths}
                          onChange={(e) => setRentMonths(Number(e.target.value))}
                          min="1"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="home-furnishing">
            <AccordionTrigger className="text-lg font-medium">
              {isArabic ? "تفاصيل تجهيز المنزل" : "Home Furnishing Details"}
            </AccordionTrigger>
            <AccordionContent>
              {/* Use HomeFurnishingWrapper with predefined values for different budget modes */}
              <HomeFurnishingWrapper
                currency={currency}
                dollarRate={dollarRate}
                onTotalChange={setHomeFurnishingFromCategories}
                defaultValue={homeFurnishing}
                budgetMode={budgetMode}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        </div>
        
        {/* Summary section - takes 1/3 of the space and sticks to the appropriate side */}
        <div className="lg:w-1/3 space-y-6">
          <div className="lg:sticky lg:top-4">
            <Card className="shadow-md border-primary/10">
              <CardContent className="p-6">
                <div className="mb-6">
                  <CostSummary 
                    totalCost={totalCost} 
                    baseCurrency={currency} 
                    dollarRate={dollarRate} 
                    onCurrencyChange={(newCurrency) => setCurrency(newCurrency)}
                    
                  />
                </div>

                <Tabs defaultValue="breakdown">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="breakdown">{isArabic ? "تفاصيل" : "Breakdown"}</TabsTrigger>
                    <TabsTrigger value="chart">{isArabic ? "رسم بياني" : "Chart"}</TabsTrigger>
                  </TabsList>
                  <TabsContent value="breakdown">
                    <CostBreakdown
                      costItems={costBreakdown}
                      currency={currency}
                      dollarRate={dollarRate}
                      goldAdvance={goldAdvance}
                      goldDeferred={goldDeferred}
                      goldPrice={goldPrice}
                      advanceRequired={advanceRequired}
                      rentHome={rentHome}
                      rentMonthly={rentMonthly}
                      rentMonths={rentMonths}
                    />
                  </TabsContent>
                  <TabsContent value="chart">
                    <CostChart costItems={costBreakdown} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
