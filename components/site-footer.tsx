"use client"

import { useLanguage } from "@/lib/i18n"

export function SiteFooter() {
  const { t } = useLanguage()

  return (
    <footer className="border-t border-[var(--color-border-soft)] py-6 text-center">
      <p className="text-xs text-slate-400">
        © {new Date().getFullYear()} <span dir="ltr">Request Match</span> · {t.rights}
      </p>
    </footer>
  )
}
