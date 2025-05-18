/**
 * Convierte un valor de una moneda a otra
 * @param value Valor a convertir
 * @param fromCurrency Moneda de origen
 * @param toCurrency Moneda de destino
 * @param dollarRate Tasa de cambio del dólar
 * @returns Valor convertido
 */
export function convertCurrency(value: number, fromCurrency: string, toCurrency: string, dollarRate: number): number {
  if (fromCurrency === toCurrency) return value

  if (fromCurrency === "USD" && toCurrency === "SYP") {
    return value * dollarRate
  } else if (fromCurrency === "SYP" && toCurrency === "USD") {
    return value / dollarRate
  }

  return value
}

/**
 * Formatea un valor monetario según la moneda y el idioma
 * @param amount Cantidad a formatear
 * @param currency Moneda (SYP o USD)
 * @param dollarRate Tasa de cambio del dólar (solo se usa si se necesita convertir)
 * @param locale Configuración regional para el formato
 * @returns Cadena formateada
 */
export function formatCurrency(amount: number, currency: string, dollarRate: number, locale = "ar-SY"): string {
  let value = amount
  let symbol = locale === "ar-SY" ? "ل.س" : "SYP"

  if (currency === "USD") {
    symbol = "$"
    // The value should already be in the correct currency from the parent component
    console.log(`Formatting USD value: ${value}`)
  } else {
    console.log(`Formatting SYP value: ${value}`)
  }

  // Ensure the value is a valid number
  if (isNaN(value) || !isFinite(value)) {
    value = 0
  }

  // Always use Arabic numerals (0-9) by using 'en-US' locale for number formatting
  // but keep the locale for other formatting aspects
  const formatted = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0, // No decimal places for any currency
  }).format(value)
  
  console.log(`Formatted ${value} as ${formatted} ${symbol}`)
  
  // For USD, place the $ symbol at the beginning
  if (currency === "USD") {
    return symbol + formatted
  }
  
  // For other currencies, place the symbol at the end
  return formatted + " " + symbol
}
