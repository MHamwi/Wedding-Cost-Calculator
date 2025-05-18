"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Plus, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"

interface CategoryTableProps {
  categoryId: string
  categoryName: string
  currency: string
  dollarRate: number
  onTotalChange: (categoryId: string, total: number) => void
}

export function CategoryTable({ categoryId, categoryName, currency, dollarRate, onTotalChange }: CategoryTableProps) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({
    name: "",
    price: 0,
    is_installment: false,
    monthly_installment: 0,
    installment_months: 12,
  })

  useEffect(() => {
    fetchItems()
  }, [categoryId])

  useEffect(() => {
    // Calculate total and notify parent
    const total = items.reduce((sum, item) => sum + item.price, 0)
    onTotalChange(categoryId, total)
  }, [items, categoryId, onTotalChange])

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("home_furnishing_items")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      setItems(data || [])
    } catch (error: any) {
      toast({
        title: `خطأ في جلب عناصر ${categoryName}`,
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const addItem = async () => {
    if (!newItem.name.trim() || newItem.price <= 0) {
      toast({
        title: "يرجى إدخال اسم وسعر صحيح للعنصر",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("home_furnishing_items")
        .insert([
          {
            category_id: categoryId,
            name: newItem.name,
            price: newItem.price,
            is_installment: newItem.is_installment,
            monthly_installment: newItem.is_installment ? newItem.monthly_installment : null,
            installment_months: newItem.is_installment ? newItem.installment_months : null,
          },
        ])
        .select()

      if (error) {
        throw error
      }

      setItems([...(data || []), ...items])
      setNewItem({
        name: "",
        price: 0,
        is_installment: false,
        monthly_installment: 0,
        installment_months: 12,
      })
    } catch (error: any) {
      toast({
        title: "خطأ في إضافة العنصر",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const deleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("home_furnishing_items").delete().eq("id", id)

      if (error) {
        throw error
      }

      setItems(items.filter((item) => item.id !== id))
    } catch (error: any) {
      toast({
        title: "خطأ في حذف العنصر",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price, 0)
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2">
            <Label htmlFor={`item-name-${categoryId}`}>اسم العنصر</Label>
            <Input
              id={`item-name-${categoryId}`}
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="مثال: ثلاجة"
            />
          </div>
          <div>
            <Label htmlFor={`item-price-${categoryId}`}>السعر</Label>
            <Input
              id={`item-price-${categoryId}`}
              type="number"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <Switch
                id={`is-installment-${categoryId}`}
                checked={newItem.is_installment}
                onCheckedChange={(checked) => setNewItem({ ...newItem, is_installment: checked })}
              />
              <Label htmlFor={`is-installment-${categoryId}`}>تقسيط</Label>
            </div>
          </div>
          <div>
            <Button onClick={addItem} className="w-full">
              <Plus className="ml-2 h-4 w-4" />
              إضافة
            </Button>
          </div>
        </div>

        {newItem.is_installment && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor={`monthly-installment-${categoryId}`}>القسط الشهري</Label>
              <Input
                id={`monthly-installment-${categoryId}`}
                type="number"
                value={newItem.monthly_installment}
                onChange={(e) => setNewItem({ ...newItem, monthly_installment: Number(e.target.value) })}
              />
            </div>
            <div>
              <Label htmlFor={`installment-months-${categoryId}`}>عدد الأشهر</Label>
              <Input
                id={`installment-months-${categoryId}`}
                type="number"
                value={newItem.installment_months}
                onChange={(e) => setNewItem({ ...newItem, installment_months: Number(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-center py-4">جاري تحميل العناصر...</p>
      ) : items.length === 0 ? (
        <p className="text-center py-4">لا توجد عناصر حتى الآن. أضف عنصراً للبدء.</p>
      ) : (
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم العنصر</TableHead>
                <TableHead>السعر</TableHead>
                <TableHead>طريقة الدفع</TableHead>
                <TableHead>التفاصيل</TableHead>
                <TableHead className="text-left">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.price, currency, dollarRate)}</TableCell>
                  <TableCell>{item.is_installment ? "تقسيط" : "كاش"}</TableCell>
                  <TableCell>
                    {item.is_installment
                      ? `${formatCurrency(item.monthly_installment, currency, dollarRate)} × ${
                          item.installment_months
                        } شهر`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => deleteItem(item.id)} className="h-8 w-8 p-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={4} className="text-left font-bold">
                  المجموع
                </TableCell>
                <TableCell className="font-bold">{formatCurrency(calculateTotal(), currency, dollarRate)}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
