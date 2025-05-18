"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { toast } from "@/components/ui/use-toast"
import { CategoryTable } from "./category-table"
import { Plus } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CategoryManagerProps {
  calculationId: string
  currency: string
  dollarRate: number
  onTotalChange: (total: number) => void
}

export function CategoryManager({ calculationId, currency, dollarRate, onTotalChange }: CategoryManagerProps) {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [categoryTotals, setCategoryTotals] = useState<Record<string, number>>({})

  useEffect(() => {
    fetchCategories()
  }, [calculationId])

  useEffect(() => {
    // Calculate total and notify parent
    const total = Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)
    onTotalChange(total)
  }, [categoryTotals, onTotalChange])

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("home_furnishing_categories")
        .select("*")
        .eq("calculation_id", calculationId)
        .order("created_at", { ascending: true })

      if (error) {
        throw error
      }

      setCategories(data || [])
    } catch (error: any) {
      toast({
        title: "خطأ في جلب الفئات",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        title: "يرجى إدخال اسم للفئة",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("home_furnishing_categories")
        .insert([
          {
            calculation_id: calculationId,
            name: newCategoryName,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      setCategories([...categories, ...(data || [])])
      setNewCategoryName("")
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة الفئة",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleCategoryTotalChange = (categoryId: string, total: number) => {
    setCategoryTotals((prev) => ({
      ...prev,
      [categoryId]: total,
    }))
  }

  const calculateTotal = () => {
    return Object.values(categoryTotals).reduce((sum, value) => sum + value, 0)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-4">
        <div className="grid w-full gap-1.5">
          <Label htmlFor="category-name">إضافة فئة جديدة</Label>
          <Input
            id="category-name"
            placeholder="مثال: الإلكترونيات"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
          />
        </div>
        <Button onClick={addCategory}>
          <Plus className="ml-2 h-4 w-4" />
          إضافة
        </Button>
      </div>

      <div className="border p-4 rounded-md bg-muted/20">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold">إجمالي تجهيز المنزل</h3>
          <p className="text-xl font-bold">{formatCurrency(calculateTotal(), currency, dollarRate)}</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center py-4">جاري تحميل الفئات...</p>
      ) : categories.length === 0 ? (
        <p className="text-center py-4">لا توجد فئات حتى الآن. أضف فئة للبدء.</p>
      ) : (
        <Accordion type="multiple" className="w-full">
          {categories.map((category) => (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="text-lg font-medium">
                <div className="flex justify-between w-full ml-4">
                  <span>{category.name}</span>
                  <span className="text-muted-foreground">
                    {formatCurrency(categoryTotals[category.id] || 0, currency, dollarRate)}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <CategoryTable
                  categoryId={category.id}
                  categoryName={category.name}
                  currency={currency}
                  dollarRate={dollarRate}
                  onTotalChange={handleCategoryTotalChange}
                />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  )
}
