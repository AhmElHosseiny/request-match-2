"use client"

import { SearchCheck, Languages } from "lucide-react"
import { useLanguage } from "@/lib/i18n"

export function SiteHeader() {
  const { t, lang, setLang } = useLanguage()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[var(--color-border-soft)] bg-white/85 backdrop-blur-md">
      <div dir="ltr" className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-[var(--color-navy)] shadow-sm">
            <SearchCheck className="size-6 text-white" aria-hidden="true" />
          </div>
          <span className="text-lg font-extrabold text-[var(--color-navy)]">{t.brand}</span>
        </div>

        <div
          className="flex items-center gap-1 rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-light)] p-1"
          role="group"
          aria-label={t.languageLabel}
        >
          <Languages className="mx-1 size-4 text-slate-400" aria-hidden="true" />
          <button
            type="button"
            onClick={() => setLang("ar")}
            aria-pressed={lang === "ar"}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              lang === "ar"
                ? "bg-[var(--color-navy)] text-white shadow-sm"
                : "text-slate-500 hover:text-[var(--color-navy)]"
            }`}
          >
            AR
          </button>
          <button
            type="button"
            onClick={() => setLang("en")}
            aria-pressed={lang === "en"}
            className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
              lang === "en"
                ? "bg-[var(--color-navy)] text-white shadow-sm"
                : "text-slate-500 hover:text-[var(--color-navy)]"
            }`}
          >
            EN
          </button>
        </div>
      </div>
    </header>
  )
}
