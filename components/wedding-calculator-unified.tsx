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
  const totalCostSYP =
    (advanceRequired ? goldAdvanceCost : 0) +
    homeFurnishingSYP +
    weddingCostSYP +
    honeymoonSYP +
    additionalExpensesSYP +
    rentTotalSYP +
    goldsmithingCost +
    clothingCostSYP
  
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

  // Export to PDF
  const exportToPDF = useCallback(async () => {
    try {
      // Add a small delay to ensure the UI is ready
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const printSection = document.querySelector(".print-section") as HTMLElement;
      
      if (!printSection) {
        console.error("Print section not found");
        toast({
          title: isArabic ? "خطأ" : "Error",
          description: isArabic 
            ? "تعذر العثور على قسم الطباعة" 
            : "Print section not found",
          variant: "destructive",
        });
        return;
      }

      // Scroll to the top before capturing
      window.scrollTo(0, 0);
      
      // Create a clone of the element to avoid affecting the original
      const element = printSection.cloneNode(true) as HTMLElement;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);

      try {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          logging: true, // Enable logging to help with debugging
          scrollX: 0,
          scrollY: 0,
          windowWidth: document.documentElement.offsetWidth,
          windowHeight: document.documentElement.offsetHeight,
        });

        // Remove the cloned element
        document.body.removeChild(element);

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        // Center the image on the page
        const y = (pageHeight - imgHeight) / 2;

        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
        pdf.save("wedding-calculator.pdf");

        toast({
          title: isArabic ? "تم التصدير بنجاح" : "Exported successfully",
          description: isArabic
            ? "تم تصدير الحساب كملف PDF بنجاح"
            : "Your calculation has been exported as PDF successfully",
        });
      } catch (error: unknown) {
        console.error("Error during HTML2Canvas:", error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Error(errorMessage); // Re-throw to be caught by the outer catch
      }
    } catch (error: unknown) {
      console.error("Error in exportToPDF:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast({
        title: isArabic ? "خطأ في التصدير" : "Export Error",
        description: isArabic
          ? `حدث خطأ أثناء تصدير الملف: ${errorMessage}`
          : `An error occurred while exporting: ${errorMessage}`,
        variant: "destructive",
      });
    }
  }, [isArabic])

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
          <Button variant="outline" onClick={exportToPDF} className="gap-2">
            <Download className="h-4 w-4" />
            {isArabic ? "تصدير PDF" : "Export PDF"}
          </Button>
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
                    onExportPDF={exportToPDF} 
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
