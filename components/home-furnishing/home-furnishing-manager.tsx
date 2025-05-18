"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2, Pencil } from "lucide-react"
import { formatCurrency, convertCurrency } from "@/lib/currency-utils"
import { useLanguage } from "@/contexts/language-context"
import { CurrencySelector } from "@/components/currency-selector"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

// Import default categories and items from separate file
import { DEFAULT_CATEGORIES, DEFAULT_ITEMS } from "./default-furnishing-data"

// Modelo de elemento
interface Item {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  isInstallment: boolean;
  monthlyInstallment: number;
  installmentMonths: number;
  currency: string;
}

// Modelo de categoría
interface Category {
  id: string;
  name: string;
}

interface HomeFurnishingManagerProps {
  currency: string;
  localCurrency: string;
  onLocalCurrencyChange: (currency: string) => void;
  dollarRate: number;
  onTotalChange: (total: number) => void;
  items: any[];
  setItems: (items: any[]) => void;
  defaultValue: number;
  budgetMode: string;
}

export function HomeFurnishingManager({
  currency,
  localCurrency,
  onLocalCurrencyChange,
  dollarRate,
  onTotalChange,
  items,
  setItems,
  defaultValue,
  budgetMode,
}: HomeFurnishingManagerProps) {
  const { t, language, direction } = useLanguage()
  const isRTL = direction === "rtl"

  const [categories, setCategories] = useState<Category[]>(
    DEFAULT_CATEGORIES[language as keyof typeof DEFAULT_CATEGORIES],
  )
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newItem, setNewItem] = useState<Item>({
    id: "",
    categoryId: "",
    name: "",
    price: 0,
    isInstallment: false,
    monthlyInstallment: 0,
    installmentMonths: 12,
    currency: currency,
  })
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({})
  const [categoryInstallmentTotals, setCategoryInstallmentTotals] = useState<Record<string, number>>({})
  const [hasInitializedItems, setHasInitializedItems] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)


  // Actualizar la moneda predeterminada cuando cambia la moneda principal
  useEffect(() => {
    if (!isInitialized) return

    setNewItem((prev) => ({ ...prev, currency }))
    // Note: We no longer automatically sync local currency with main currency
    // This allows the Home Furnishing section to maintain its own currency selection
  }, [currency, isInitialized])

  // تحديث الفئات عند تغيير اللغة
  useEffect(() => {
    setCategories(DEFAULT_CATEGORIES[language as keyof typeof DEFAULT_CATEGORIES])
  }, [language])

  // تهيئة العناصر الافتراضية عند تحميل المكون أو تغيير وضع الميزانية
  useEffect(() => {
    if (!isInitialized) return

    if (items.length === 0 && !hasInitializedItems) {
      // Simplificar para evitar bucles
      const defaultItems = DEFAULT_ITEMS[budgetMode as keyof typeof DEFAULT_ITEMS][language as "ar" | "en"]
        .slice(0, 3)
        .map((item) => ({
          ...item,
          id: `${item.id}-${Date.now()}`,
          currency: currency, // Usar la moneda الرئيسية
        }))
      setItems(defaultItems)
      setHasInitializedItems(true)
    }
  }, [budgetMode, language, items, setItems, hasInitializedItems, currency, isInitialized])

  // إعادة تهيئة العناصر عند تغيير وضع الميزانية
  useEffect(() => {
    if (!isInitialized || !hasInitializedItems) return

    if (budgetMode) {
      // Simplificar para evitar bucles
      const defaultItems = DEFAULT_ITEMS[budgetMode as keyof typeof DEFAULT_ITEMS][language as "ar" | "en"]
        .slice(0, 3)
        .map((item) => ({
          ...item,
          id: `${item.id}-${Date.now()}`,
          currency: currency, // Usar la moneda الرئيسية
        }))
      setItems(defaultItems)
    }
  }, [budgetMode, language, setItems, currency, hasInitializedItems, isInitialized])

  // حساب المجاميع عند تغيير العناصر
  useEffect(() => {
    if (!isInitialized) return

    // Step 1: Calculate all totals in SYP (base currency)
    const sypTotals: Record<string, number> = {}
    const sypInstallmentTotals: Record<string, number> = {}

    items.forEach((item) => {
      if (!sypTotals[item.categoryId]) {
        sypTotals[item.categoryId] = 0
        sypInstallmentTotals[item.categoryId] = 0
      }

      // All items are stored in SYP, so we use the price directly
      const sypPrice = item.price

      if (item.isInstallment) {
        const downPayment = sypPrice * 0.5 // 50% down payment
        sypTotals[item.categoryId] += downPayment
        sypInstallmentTotals[item.categoryId] += sypPrice - downPayment
      } else {
        sypTotals[item.categoryId] += sypPrice
      }
    })

    // Step 2: Calculate the total in SYP
    const grandTotalSYP = Object.values(sypTotals).reduce((sum, value) => sum + value, 0)
    const installmentTotalSYP = Object.values(sypInstallmentTotals).reduce((sum, value) => sum + value, 0)
    
    // Step 3: Convert to display currency if needed
    if (localCurrency === "USD") {
      // Convert category totals to USD for display
      const usdTotals: Record<string, number> = {}
      const usdInstallmentTotals: Record<string, number> = {}
      
      Object.entries(sypTotals).forEach(([categoryId, value]) => {
        usdTotals[categoryId] = Math.round(value / dollarRate)
      })
      
      Object.entries(sypInstallmentTotals).forEach(([categoryId, value]) => {
        usdInstallmentTotals[categoryId] = Math.round(value / dollarRate)
      })
      
      setCategoryTotals(usdTotals)
      setCategoryInstallmentTotals(usdInstallmentTotals)
    } else {
      // Use SYP values directly
      setCategoryTotals(sypTotals)
      setCategoryInstallmentTotals(sypInstallmentTotals)
    }

    // Step 4: Always pass the SYP value to the main calculator
    // The main calculator will handle the conversion based on its own currency setting
    onTotalChange(grandTotalSYP)
    
  }, [items, onTotalChange, dollarRate, localCurrency, isInitialized])

  // حساب القسط الشهري
  const calculateMonthlyInstallment = useCallback(
    (price: number, months: number, itemCurrency: string): number => {
      if (!months || months <= 0) return 0

      // تحويل السعر إلى الليرة السورية إذا كان بالدولار
      const convertedPrice = convertCurrency(price, itemCurrency, currency, dollarRate)

      // 50% من السعر كدفعة أولى، والباقي يقسم على عدد الأشهر
      const remainingAmount = convertedPrice * 0.5
      return Math.round(remainingAmount / months)
    },
    [currency, dollarRate],
  )

  // تحديث القسط الشهري عند تغيير السعر أو طريقة الدفع أو العملة
  useEffect(() => {
    if (!editingItem || !editingItem.isInstallment || !isInitialized) return

    const newMonthlyInstallment = calculateMonthlyInstallment(
      editingItem.price,
      editingItem.installmentMonths,
      editingItem.currency,
    )

    if (newMonthlyInstallment !== editingItem.monthlyInstallment) {
      setEditingItem((prev) => {
        if (!prev) return prev
        return {
          ...prev,
          monthlyInstallment: newMonthlyInstallment,
        }
      })
    }
  }, [
    editingItem?.price,
    editingItem?.isInstallment,
    editingItem?.installmentMonths,
    editingItem?.currency,
    calculateMonthlyInstallment,
    isInitialized,
  ])

  // إضافة فئة جديدة
  const addCategory = () => {
    if (!newCategoryName.trim()) {
      toast({
        title: t("furnishing.categoryRequired"),
        variant: "destructive",
      })
      return
    }

    const newCategory = {
      id: Date.now().toString(),
      name: newCategoryName,
    }

    setCategories([...categories, newCategory])
    setNewCategoryName("")
  }

  // إضافة عنصر جديد
  const addItem = () => {
    if (!newItem.categoryId) {
      toast({
        title: t("furnishing.selectCategoryRequired"),
        variant: "destructive",
      })
      return
    }

    if (!newItem.name.trim() || newItem.price <= 0) {
      toast({
        title: t("furnishing.itemDetailsRequired"),
        variant: "destructive",
      })
      return
    }

    const newItemWithId = {
      ...newItem,
      id: Date.now().toString(),
      monthlyInstallment: newItem.isInstallment
        ? calculateMonthlyInstallment(newItem.price, newItem.installmentMonths, newItem.currency)
        : 0,
    }

    setItems([newItemWithId, ...items])
    setNewItem({
      id: "",
      categoryId: newItem.categoryId,
      name: "",
      price: 0,
      isInstallment: false,
      monthlyInstallment: 0,
      installmentMonths: 12,
      currency: currency,
    })
  }

  // حذف عنصر
  const deleteItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId))
  }

  // تحرير عنصر
  const editItem = (item: Item) => {
    // إنشاء نسخة من العنصر مع حساب القسط الشهري
    const itemWithCalculatedInstallment = {
      ...item,
      monthlyInstallment: item.isInstallment
        ? calculateMonthlyInstallment(item.price, item.installmentMonths, item.currency)
        : 0,
    }
    setEditingItem(itemWithCalculatedInstallment)
    setIsEditDialogOpen(true)
  }

  // حفظ التغييرات على العنصر
  const saveItemChanges = () => {
    if (!editingItem) return

    if (!editingItem.name.trim() || editingItem.price <= 0) {
      toast({
        title: t("furnishing.itemDetailsRequired"),
        variant: "destructive",
      })
      return
    }

    setItems(items.map((item) => (item.id === editingItem.id ? editingItem : item)))
    setIsEditDialogOpen(false)
    setEditingItem(null)

    toast({
      title: t("furnishing.itemUpdated"),
      description: editingItem.name,
    })
  }

  // حساب المجموع الكلي
  const calculateTotal = () => {
    return Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)
  }

  // حساب المجموع الكلي للتقسيط
  const calculateInstallmentTotal = () => {
    return Object.values(categoryInstallmentTotals).reduce((sum, value) => sum + value, 0)
  }

  // الحصول على القيمة الفعلية
  const actualTotal = items.length > 0 ? calculateTotal() : (localCurrency === "USD" ? defaultValue / dollarRate : defaultValue)
  const installmentTotal = items.length > 0 ? calculateInstallmentTotal() : 0

  // Inicializar después de montar
  useEffect(() => {
    setIsInitialized(true)
  }, [])

  // الحصول على اسم الفئة من خلال المعرف
  const getCategoryName = (categoryId: string) => {
    const category = categories.find((cat) => cat.id === categoryId)
    return category?.name || ""
  }

  // تحويل السعر حسب العملة
  const getDisplayPrice = (price: number, itemCurrency: string) => {
    return formatCurrency(price, itemCurrency, dollarRate)
  }

  return (
    <div className="space-y-6">
      <div className="border p-4 rounded-md bg-muted/20">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold">{t("furnishing.total")}</h3>
            <div className="flex items-center gap-1">
              <button
                onClick={() => onLocalCurrencyChange("SYP")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${localCurrency === "SYP" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                SYP
              </button>
              <button
                onClick={() => onLocalCurrencyChange("USD")}
                className={`px-2 py-1 text-xs rounded-md transition-colors ${localCurrency === "USD" ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
              >
                USD
              </button>
            </div>
          </div>
          <p className="text-xl font-bold">{formatCurrency(actualTotal, localCurrency, dollarRate)}</p>
        </div>
        {installmentTotal > 0 && (
          <div className="flex justify-between items-center mt-2 text-sm text-muted-foreground">
            <span>{t("furnishing.installmentTotal")}</span>
            <span>{formatCurrency(installmentTotal, localCurrency, dollarRate)}</span>
          </div>
        )}
        <div className="mt-2 text-sm text-muted-foreground">
          <p>{t("furnishing.installmentNote")}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-end gap-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="category-name">{t("furnishing.addCategory")}</Label>
          <Input
            id="category-name"
            placeholder={t("furnishing.categoryPlaceholder")}
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </div>
        <Button onClick={addCategory} className="w-full sm:w-auto">
          <Plus className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 preserve-direction`} />
          {t("furnishing.add")}
        </Button>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
          <div>
            <Label htmlFor="item-category">{t("furnishing.category")}</Label>
            <select
              id="item-category"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={newItem.categoryId}
              onChange={(e) => setNewItem({ ...newItem, categoryId: e.target.value })}
            >
              <option value="">{t("furnishing.selectCategory")}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="item-name">{t("furnishing.itemName")}</Label>
            <Input
              id="item-name"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder={t("furnishing.itemPlaceholder")}
            />
          </div>
          <div>
            <Label htmlFor="item-price">{t("furnishing.price")}</Label>
            <Input
              id="item-price"
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="item-currency">{t("furnishing.currency")}</Label>
            <CurrencySelector
              value={newItem.currency}
              onChange={(value) => setNewItem({ ...newItem, currency: value })}
              id="item-currency"
            />
          </div>
          <div>
            <Button onClick={addItem} className="w-full">
              <Plus className={`${isRTL ? "ml-2" : "mr-2"} h-4 w-4 preserve-direction`} />
              {t("furnishing.add")}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            id="is-installment"
            checked={newItem.isInstallment}
            onCheckedChange={(checked) => {
              setNewItem({
                ...newItem,
                isInstallment: checked,
                monthlyInstallment: checked
                  ? calculateMonthlyInstallment(newItem.price, newItem.installmentMonths, newItem.currency)
                  : 0,
              })
            }}
          />
          <Label htmlFor="is-installment">{t("furnishing.installment")}</Label>
        </div>

        {newItem.isInstallment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="monthly-installment">{t("furnishing.monthlyInstallment")}</Label>
              <Input id="monthly-installment" type="number" value={newItem.monthlyInstallment} readOnly />
              <p className="text-xs text-muted-foreground">{t("furnishing.autoCalculated")}</p>
            </div>
            <div>
              <Label htmlFor="installment-months">{t("furnishing.installmentMonths")}</Label>
              <Input
                id="installment-months"
                type="number"
                value={newItem.installmentMonths}
                onChange={(e) => {
                  const months = Number(e.target.value)
                  setNewItem({
                    ...newItem,
                    installmentMonths: months,
                    monthlyInstallment: calculateMonthlyInstallment(newItem.price, months, newItem.currency),
                  })
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Diálogo de edición de elemento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{t("furnishing.editItem")}</DialogTitle>
            <DialogDescription>{t("furnishing.editItemDescription")}</DialogDescription>
          </DialogHeader>
          {editingItem && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-item-name">{t("furnishing.itemName")}</Label>
                <Input
                  id="edit-item-name"
                  value={editingItem.name}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-item-price">{t("furnishing.price")}</Label>
                <Input
                  id="edit-item-price"
                  type="number"
                  value={editingItem.price}
                  onChange={(e) => {
                    const newPrice = Number(e.target.value)
                    setEditingItem({
                      ...editingItem,
                      price: newPrice,
                      monthlyInstallment: editingItem.isInstallment
                        ? calculateMonthlyInstallment(newPrice, editingItem.installmentMonths, editingItem.currency)
                        : 0,
                    })
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-item-currency">{t("furnishing.currency")}</Label>
                <CurrencySelector
                  value={editingItem.currency}
                  onChange={(value) => {
                    setEditingItem({
                      ...editingItem,
                      currency: value,
                      monthlyInstallment: editingItem.isInstallment
                        ? calculateMonthlyInstallment(editingItem.price, editingItem.installmentMonths, value)
                        : 0,
                    })
                  }}
                  id="edit-item-currency"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="edit-is-installment"
                  checked={editingItem.isInstallment}
                  onCheckedChange={(checked) =>
                    setEditingItem({
                      ...editingItem,
                      isInstallment: checked,
                      monthlyInstallment: checked
                        ? calculateMonthlyInstallment(
                            editingItem.price,
                            editingItem.installmentMonths,
                            editingItem.currency,
                          )
                        : 0,
                    })
                  }
                />
                <Label htmlFor="edit-is-installment">{t("furnishing.installment")}</Label>
              </div>
              {editingItem.isInstallment && (
                <>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-monthly-installment">{t("furnishing.monthlyInstallment")}</Label>
                    <Input
                      id="edit-monthly-installment"
                      type="number"
                      value={editingItem.monthlyInstallment}
                      readOnly
                    />
                    <p className="text-xs text-muted-foreground">{t("furnishing.autoCalculated")}</p>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="edit-installment-months">{t("furnishing.installmentMonths")}</Label>
                    <Input
                      id="edit-installment-months"
                      type="number"
                      value={editingItem.installmentMonths}
                      onChange={(e) => {
                        const months = Number(e.target.value)
                        setEditingItem({
                          ...editingItem,
                          installmentMonths: months,
                          monthlyInstallment: calculateMonthlyInstallment(
                            editingItem.price,
                            months,
                            editingItem.currency,
                          ),
                        })
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={saveItemChanges}>{t("furnishing.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {categories.length === 0 ? (
        <p className="text-center py-4">{t("furnishing.noCategories")}</p>
      ) : (
        <Accordion type="multiple" className="w-full" defaultValue={categories.map((cat) => cat.id)}>
          {categories.map((category) => {
            const categoryItems = items.filter((item) => item.categoryId === category.id)
            const categoryTotal = categoryTotals[category.id] || 0
            const categoryInstallmentTotal = categoryInstallmentTotals[category.id] || 0

            return (
              <AccordionItem key={category.id} value={category.id}>
                <AccordionTrigger className="text-lg font-medium">
                  <div className="flex justify-between w-full ml-4">
                    <span>{category.name}</span>
                    <span className="text-muted-foreground">
                      {localCurrency === "USD" 
                        ? `$${new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                          }).format(categoryTotal)}`
                        : formatCurrency(categoryTotal, localCurrency, dollarRate)
                      }
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {categoryItems.length === 0 ? (
                    <p className="text-center py-4">{t("furnishing.noItems")}</p>
                  ) : (
                    <div className="border rounded-md">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>{t("furnishing.itemName")}</TableHead>
                            <TableHead>{t("furnishing.price")}</TableHead>
                            <TableHead>{t("furnishing.currency")}</TableHead>
                            <TableHead>{t("furnishing.paymentMethod")}</TableHead>
                            <TableHead>{t("furnishing.details")}</TableHead>
                            <TableHead className={isRTL ? "text-right" : "text-left"}>
                              {t("furnishing.actions")}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {categoryItems.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell className="font-medium">{item.name}</TableCell>
                              <TableCell>
                                {item.currency === "USD" 
                                  ? `$${new Intl.NumberFormat('en-US', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0
                                    }).format(item.price)}`
                                  : formatCurrency(item.price, item.currency, dollarRate)
                                }
                              </TableCell>
                              <TableCell>{item.currency}</TableCell>
                              <TableCell>
                                {item.isInstallment ? t("furnishing.installment") : t("furnishing.cash")}
                              </TableCell>
                              <TableCell>
                                {item.isInstallment
                                  ? `${item.currency === "USD" 
                                      ? `$${new Intl.NumberFormat('en-US', {
                                          minimumFractionDigits: 0,
                                          maximumFractionDigits: 0
                                        }).format(item.monthlyInstallment)}`
                                      : formatCurrency(item.monthlyInstallment, item.currency, dollarRate)
                                    } × ${
                                      item.installmentMonths
                                    } ${isRTL ? "شهر" : "months"}`
                                  : "-"}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => editItem(item)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Pencil className="h-4 w-4 preserve-direction" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => deleteItem(item.id)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Trash2 className="h-4 w-4 preserve-direction" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow>
                            <TableCell colSpan={5} className={isRTL ? "text-right" : "text-left"}>
                              <span className="font-bold">
                                {isRTL ? `إجمالي تكلفة ${category.name}` : `Total cost of ${category.name}`}
                              </span>
                            </TableCell>
                            <TableCell className="font-bold">
                              {localCurrency === "USD" 
                                ? `$${new Intl.NumberFormat('en-US', {
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0
                                  }).format(categoryTotal)}`
                                : formatCurrency(categoryTotal, localCurrency, dollarRate)
                              }
                            </TableCell>
                          </TableRow>
                          {categoryInstallmentTotal > 0 && (
                            <TableRow>
                              <TableCell colSpan={5} className={isRTL ? "text-right" : "text-left"}>
                                <span className="text-sm text-muted-foreground">
                                  {isRTL
                                    ? `إجمالي الأقساط المتبقية لـ ${category.name}`
                                    : `Total remaining installments for ${category.name}`}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {localCurrency === "USD" 
                                  ? `$${new Intl.NumberFormat('en-US', {
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0
                                    }).format(categoryInstallmentTotal)}`
                                  : formatCurrency(categoryInstallmentTotal, localCurrency, dollarRate)
                                }
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      )}
    </div>
  )
}
