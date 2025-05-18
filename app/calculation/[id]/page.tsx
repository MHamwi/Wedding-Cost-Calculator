"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { WeddingCalculator } from "@/components/wedding-calculator-unified"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface CalculationPageProps {
  params: {
    id: string
  }
}

export default function CalculationPage({ params }: CalculationPageProps) {
  const { id } = params
  const router = useRouter()
  const [calculation, setCalculation] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load saved calculations from localStorage
    const savedCalculations = JSON.parse(localStorage.getItem("savedCalculations") || "[]")
    const foundCalculation = savedCalculations.find((calc: any) => calc.id === id)

    if (foundCalculation) {
      setCalculation(foundCalculation)
    } else {
      toast({
        title: "الحساب غير موجود",
        description: "لم يتم العثور على الحساب المطلوب",
        variant: "destructive",
      })
      router.push("/saved-calculations")
    }

    setLoading(false)
  }, [id, router])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>جاري تحميل الحساب...</p>
      </div>
    )
  }

  if (!calculation) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <p>لم يتم العثور على الحساب</p>
        <Button onClick={() => router.push("/saved-calculations")} className="mt-4">
          العودة للحسابات المحفوظة
        </Button>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">{calculation.name}</h1>
      <p className="text-center text-muted-foreground mb-8">آلة حاسبة تكاليف الزواج في سوريا</p>

      <div className="flex justify-end mb-4">
        <Button variant="outline" onClick={() => router.push("/saved-calculations")}>
          العودة للحسابات المحفوظة
        </Button>
      </div>

      {/* In a real implementation, we would pass the calculation data to the WeddingCalculator component */}
      <WeddingCalculator />
    </main>
  )
}
