import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string, dollarRate: number, locale = "ar-SY"): string {
  let value = amount
  let symbol = locale === "ar-SY" ? "ل.س" : "SYP"

  if (currency === "USD") {
    value = amount / dollarRate
    symbol = "$"
  }

  // Ensure amount is a valid number
  if (isNaN(value) || !isFinite(value)) {
    value = 0
  }

  return (
    new Intl.NumberFormat(locale, {
      maximumFractionDigits: 0,
    }).format(value) +
    " " +
    symbol
  )
}
