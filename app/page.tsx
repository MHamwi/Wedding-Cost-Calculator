"use client"

import { WeddingCalculator } from "@/components/wedding-calculator-unified"
import { useLanguage } from "@/contexts/language-context"

export default function Home() {
  const { t } = useLanguage()

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-4">{t("app.title")}</h1>
      <p className="text-center text-muted-foreground mb-8">{t("app.description")}</p>
      <WeddingCalculator />
    </main>
  )
}
