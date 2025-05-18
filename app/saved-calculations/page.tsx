"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { Calculator, Trash2 } from "lucide-react"
import { formatCurrency } from "@/lib/utils"
import { useLanguage } from "@/contexts/language-context"

interface SavedCalculation {
  id: string
  name: string
  date: string
  totalCost: number
  currency: string
  dollarRate: number
}

export default function SavedCalculationsPage() {
  const { t, direction } = useLanguage()
  const [calculations, setCalculations] = useState<SavedCalculation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load saved calculations from localStorage
    const savedCalculations = JSON.parse(localStorage.getItem("savedCalculations") || "[]")
    setCalculations(savedCalculations)
    setLoading(false)
  }, [])

  const deleteCalculation = (id: string) => {
    // Filter out the calculation to delete
    const updatedCalculations = calculations.filter((calc) => calc.id !== id)

    // Update localStorage
    localStorage.setItem("savedCalculations", JSON.stringify(updatedCalculations))

    // Update state
    setCalculations(updatedCalculations)

    toast({
      title: t("saved.deleted"),
    })
  }

  const loadCalculation = (calculation: SavedCalculation) => {
    // In a real app, we would navigate to a page with this calculation loaded
    // For now, we'll just show a toast
    toast({
      title: `${t("saved.loaded")} "${calculation.name}"`,
      description: t("saved.loadedDescription"),
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">{t("saved.title")}</h1>
      <p className="text-center text-muted-foreground mb-8">{t("saved.description")}</p>

      {loading ? (
        <p className="text-center py-4">{t("saved.loading")}</p>
      ) : calculations.length === 0 ? (
        <div className="text-center py-8">
          <p className="mb-4">{t("saved.empty")}</p>
          <Link href="/">
            <Button>{t("saved.return")}</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {calculations.map((calculation) => (
            <Card key={calculation.id} className="overflow-hidden">
              <CardHeader className="p-4">
                <CardTitle className="text-lg">{calculation.name}</CardTitle>
                <CardDescription>
                  {new Date(calculation.date).toLocaleDateString(direction === "rtl" ? "ar-SY" : "en-US")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="font-bold">
                  {formatCurrency(calculation.totalCost, calculation.currency, calculation.dollarRate)}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Button variant="outline" size="sm" onClick={() => deleteCalculation(calculation.id)}>
                  <Trash2 className="h-4 w-4 preserve-direction" />
                </Button>
                <Button size="sm" onClick={() => loadCalculation(calculation)}>
                  <Calculator className={`${direction === "rtl" ? "ml-2" : "mr-2"} h-4 w-4 preserve-direction`} />
                  {t("saved.open")}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
