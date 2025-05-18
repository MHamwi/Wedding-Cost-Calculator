"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "ar" | "en"
type Direction = "rtl" | "ltr"

interface LanguageContextType {
  language: Language
  direction: Direction
  setLanguage: (language: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Traducciones
const translations = {
  ar: {
    "app.title": "آلة حاسبة تكاليف الزواج في سوريا",
    "app.description": "أداة مساعدة للشباب المقبلين على الزواج للتخطيط المالي الذكي",
    "header.calculator": "حاسبة تكاليف الزواج",
    "header.savedCalculations": "الحسابات المحفوظة",
    "settings.general": "الإعدادات العامة",
    "settings.currency": "العملة",
    "settings.mainCurrency": "العملة الرئيسية",
    "settings.goldPrice": "سعر غرام الذهب (ل.س)",
    "settings.dollarRate": "سعر صرف الدولار (ل.س)",
    "settings.advanceRequired": "المتقدم مقبوض؟",
    "settings.rentHome": "استئجار منزل",
    "budget.mode": "اختيار وضع الميزانية",
    "budget.economic": "اقتصادي",
    "budget.medium": "متوسط",
    "budget.luxury": "فخم",
    "budget.economic.amount": "حوالي 98 مليون ل.س",
    "budget.medium.amount": "حوالي 202 مليون ل.س",
    "budget.luxury.amount": "حوالي 387 مليون ل.س",
    "costs.details": "تفاصيل التكاليف",
    "costs.goldSection": "الذهب والمهر",
    "costs.weddingSection": "تكاليف العرس",
    "costs.honeymoonSection": "شهر العسل",
    "costs.additionalSection": "مصاريف إضافية",
    "costs.rentSection": "الإيجار",
    "costs.goldAdvance": "المقدم (غرام ذهب)",
    "costs.goldDeferred": "المؤخر (غرام ذهب)",
    "costs.goldGrams": "غرام ذهب",
    "costs.homeFurnishing": "تجهيز المنزل",
    "costs.weddingCost": "تكاليف العرس",
    "costs.honeymoon": "شهر العسل",
    "costs.additionalExpenses": "مصاريف إضافية",
    "costs.rentMonthly": "الإيجار الشهري",
    "costs.rentMonths": "عدد الأشهر المدفوعة مقدمًا",
    "summary.title": "ملخص التكاليف",
    "summary.export": "تصدير كـ PDF",
    "summary.breakdown": "تفاصيل",
    "summary.chart": "رسم بياني",
    "save.button": "حفظ الحساب",
    "save.title": "حفظ الحساب",
    "save.description": "أدخل اسماً للحساب ليتم حفظه في متصفحك. يمكنك الوصول إلى الحسابات المحفوظة لاحقاً.",
    "save.name": "اسم الحساب",
    "save.placeholder": "مثال: حساب زواجي",
    "save.submit": "حفظ",
    "save.success": "تم حفظ الحساب بنجاح",
    "save.successDescription": "تم حفظ الحساب",
    "save.nameRequired": "يرجى إدخال اسم للحساب",
    "furnishing.title": "تفاصيل تجهيز المنزل",
    "furnishing.addCategory": "إضافة فئة جديدة",
    "furnishing.categoryPlaceholder": "مثال: الإلكترونيات",
    "furnishing.total": "إجمالي تجهيز المنزل",
    "furnishing.customTotal": "إجمالي تجهيز المنزل (مخصص)",
    "furnishing.defaultTotal": "إجمالي تجهيز المنزل (افتراضي)",
    "furnishing.usingDefault": "يتم استخدام القيمة الافتراضية حسب وضع الميزانية المختار. أضف عناصر لتخصيص القيمة.",
    "furnishing.category": "الفئة",
    "furnishing.selectCategory": "اختر الفئة",
    "furnishing.itemName": "اسم العنصر",
    "furnishing.itemPlaceholder": "مثال: ثلاجة",
    "furnishing.price": "السعر",
    "furnishing.add": "إضافة",
    "furnishing.installment": "تقسيط",
    "furnishing.monthlyInstallment": "القسط الشهري",
    "furnishing.installmentMonths": "عدد الأشهر",
    "furnishing.noCategories": "لا توجد فئات حتى الآن. أضف فئة للبدء.",
    "furnishing.noItems": "لا توجد عناصر في هذه الفئة حتى الآن.",
    "furnishing.paymentMethod": "طريقة الدفع",
    "furnishing.details": "التفاصيل",
    "furnishing.actions": "إجراءات",
    "furnishing.cash": "كاش",
    "furnishing.categoryRequired": "يرجى إدخال اسم للفئة",
    "furnishing.selectCategoryRequired": "يرجى اختيار فئة",
    "furnishing.itemDetailsRequired": "يرجى إدخال اسم وسعر صحيح للعنصر",
    "furnishing.editItem": "تعديل العنصر",
    "furnishing.editItemDescription": "قم بتعديل تفاصيل العنصر",
    "furnishing.save": "حفظ التغييرات",
    "furnishing.itemUpdated": "تم تحديث العنصر بنجاح",
    "furnishing.installmentTotal": "إجمالي الأقساط المتبقية",
    "furnishing.installmentNote": "ملاحظة: يتم احتساب 50% فقط من قيمة العناصر المقسطة في المجموع الكلي (كدفعة أولى).",
    "furnishing.currency": "العملة",
    "furnishing.selectCurrency": "اختر العملة",
    "furnishing.autoCalculated": "يتم حساب القسط الشهري تلقائيًا (50% من السعر ÷ عدد الأشهر)",
    "saved.title": "الحسابات المحفوظة",
    "saved.description": "جميع حسابات تكاليف الزواج التي قمت بحفظها",
    "saved.loading": "جاري تحميل الحسابات...",
    "saved.empty": "لا توجد حسابات محفوظة حتى الآن.",
    "saved.return": "العودة للحاسبة",
    "saved.open": "فتح الحساب",
    "saved.deleted": "تم حذف الحساب بنجاح",
    "saved.loaded": "تم تحميل الحساب",
    "saved.loadedDescription": "سيتم تنفيذ هذه الميزة قريباً",
    language: "English",
    "theme.light": "فاتح",
    "theme.dark": "داكن",
    "theme.system": "النظام",
  },
  en: {
    "app.title": "Syrian Wedding Cost Calculator",
    "app.description": "A tool to help young people plan financially for marriage",
    "header.calculator": "Wedding Cost Calculator",
    "header.savedCalculations": "Saved Calculations",
    "settings.general": "General Settings",
    "settings.currency": "Currency",
    "settings.mainCurrency": "Main Currency",
    "settings.goldPrice": "Gold Price (SYP/gram)",
    "settings.dollarRate": "Dollar Exchange Rate (SYP)",
    "settings.advanceRequired": "Include Advance Payment?",
    "settings.rentHome": "Rent Home",
    "budget.mode": "Select Budget Mode",
    "budget.economic": "Economic",
    "budget.medium": "Medium",
    "budget.luxury": "Luxury",
    "budget.economic.amount": "About 98 million SYP",
    "budget.medium.amount": "About 202 million SYP",
    "budget.luxury.amount": "About 387 million SYP",
    "costs.details": "Cost Details",
    "costs.goldSection": "Gold & Dowry",
    "costs.weddingSection": "Wedding Costs",
    "costs.honeymoonSection": "Honeymoon",
    "costs.additionalSection": "Additional Expenses",
    "costs.rentSection": "Rent",
    "costs.goldAdvance": "Gold Advance (grams)",
    "costs.goldDeferred": "Deferred Gold (grams)",
    "costs.goldGrams": "grams of gold",
    "costs.homeFurnishing": "Home Furnishing",
    "costs.weddingCost": "Wedding Costs",
    "costs.honeymoon": "Honeymoon",
    "costs.additionalExpenses": "Additional Expenses",
    "costs.rentMonthly": "Monthly Rent",
    "costs.rentMonths": "Months Paid in Advance",
    "summary.title": "Cost Summary",
    "summary.export": "Export as PDF",
    "summary.breakdown": "Breakdown",
    "summary.chart": "Chart",
    "save.button": "Save Calculation",
    "save.title": "Save Calculation",
    "save.description":
      "Enter a name for this calculation to save it in your browser. You can access saved calculations later.",
    "save.name": "Calculation Name",
    "save.placeholder": "Example: My Wedding",
    "save.submit": "Save",
    "save.success": "Calculation saved successfully",
    "save.successDescription": "Calculation saved",
    "save.nameRequired": "Please enter a calculation name",
    "furnishing.title": "Home Furnishing Details",
    "furnishing.addCategory": "Add New Category",
    "furnishing.categoryPlaceholder": "Example: Electronics",
    "furnishing.total": "Home Furnishing Total",
    "furnishing.customTotal": "Home Furnishing Total (Custom)",
    "furnishing.defaultTotal": "Home Furnishing Total (Default)",
    "furnishing.usingDefault": "Using default value based on selected budget mode. Add items to customize.",
    "furnishing.category": "Category",
    "furnishing.selectCategory": "Select Category",
    "furnishing.itemName": "Item Name",
    "furnishing.itemPlaceholder": "Example: Refrigerator",
    "furnishing.price": "Price",
    "furnishing.add": "Add",
    "furnishing.installment": "Installment",
    "furnishing.monthlyInstallment": "Monthly Installment",
    "furnishing.installmentMonths": "Number of Months",
    "furnishing.noCategories": "No categories yet. Add a category to start.",
    "furnishing.noItems": "No items in this category yet.",
    "furnishing.paymentMethod": "Payment Method",
    "furnishing.details": "Details",
    "furnishing.actions": "Actions",
    "furnishing.cash": "Cash",
    "furnishing.categoryRequired": "Please enter a category name",
    "furnishing.selectCategoryRequired": "Please select a category",
    "furnishing.itemDetailsRequired": "Please enter a valid item name and price",
    "furnishing.editItem": "Edit Item",
    "furnishing.editItemDescription": "Modify item details",
    "furnishing.save": "Save Changes",
    "furnishing.itemUpdated": "Item updated successfully",
    "furnishing.installmentTotal": "Total Remaining Installments",
    "furnishing.installmentNote":
      "Note: Only 50% of installment items' value is included in the total (as down payment).",
    "furnishing.currency": "Currency",
    "furnishing.selectCurrency": "Select Currency",
    "furnishing.autoCalculated": "Monthly installment is calculated automatically (50% of price ÷ number of months)",
    "saved.title": "Saved Calculations",
    "saved.description": "All your saved wedding cost calculations",
    "saved.loading": "Loading calculations...",
    "saved.empty": "No saved calculations yet.",
    "saved.return": "Return to Calculator",
    "saved.open": "Open Calculation",
    "saved.deleted": "Calculation deleted successfully",
    "saved.loaded": "Calculation loaded",
    "saved.loadedDescription": "This feature will be implemented soon",
    language: "العربية",
    "theme.light": "Light",
    "theme.dark": "Dark",
    "theme.system": "System",
  },
}

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>("ar")
  const [direction, setDirection] = useState<Direction>("rtl")

  // Función para traducir texto
  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage)
    const newDirection = newLanguage === "ar" ? "rtl" : "ltr"
    setDirection(newDirection)
    localStorage.setItem("preferredLanguage", newLanguage)

    // Actualizar propiedades del documento
    document.documentElement.lang = newLanguage
    document.documentElement.dir = newDirection

    // Forzar reflujo para aplicar cambios RTL/LTR inmediatamente
    document.body.style.display = "none"
    setTimeout(() => {
      document.body.style.display = ""
    }, 10)
  }

  // Inicializar idioma desde localStorage al montar
  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferredLanguage") as Language | null
    if (savedLanguage && (savedLanguage === "ar" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    } else {
      // Establecer propiedades iniciales del documento si no hay idioma guardado
      document.documentElement.lang = language
      document.documentElement.dir = direction
    }
  }, [])

  return <LanguageContext.Provider value={{ language, direction, setLanguage, t }}>{children}</LanguageContext.Provider>
}

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
