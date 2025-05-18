import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { WeddingCalculator } from "@/components/wedding-calculator-unified"

interface CalculatorPageProps {
  params: {
    id: string
  }
}

export default async function CalculatorPage({ params }: CalculatorPageProps) {
  const { id } = params
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth")
  }

  // Fetch calculation to verify ownership
  const { data: calculation, error } = await supabase
    .from("calculations")
    .select("*")
    .eq("id", id)
    .eq("user_id", session.user.id)
    .single()

  if (error || !calculation) {
    redirect("/")
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-2">{calculation.name}</h1>
      <p className="text-center text-muted-foreground mb-8">آلة حاسبة تكاليف الزواج في سوريا</p>
      <WeddingCalculator calculationId={id} initialData={calculation} />
    </main>
  )
}
