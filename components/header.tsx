"use client"

import Link from "next/link"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Moon, Sun, Languages } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const { language, setLanguage, direction, t } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xl font-bold">
            {language === "ar" ? "حاسبة تكاليف الزواج" : "Wedding Cost Calculator"}
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8"></div>
            <div className="w-8 h-8"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          {t("header.calculator")}
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/saved-calculations" className="text-sm font-medium">
            {t("header.savedCalculations")}
          </Link>

          {/* Language Switcher */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLanguage(language === "ar" ? "en" : "ar")}
            title={t("language")}
            className="transition-transform"
          >
            <Languages className="h-5 w-5 preserve-direction" />
          </Button>

          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 preserve-direction" />
                <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 preserve-direction" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={direction === "rtl" ? "start" : "end"}>
              <DropdownMenuItem onClick={() => setTheme("light")}>{t("theme.light")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>{t("theme.dark")}</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>{t("theme.system")}</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
