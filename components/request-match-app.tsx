"use client"

import { useState } from "react"
import { Home, SearchCheck, ArrowRight } from "lucide-react"
import { SellForm } from "@/components/sell-form"
import { BuySearch } from "@/components/buy-search"
import { useLanguage } from "@/lib/i18n"

type Mode = null | "sell" | "buy"

export function RequestMatchApp() {
  const { t, dir } = useLanguage()
  const [mode, setMode] = useState<Mode>(null)
  const arrowFlip = dir === "rtl" ? "-scale-x-100" : ""

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("sell")}
          aria-pressed={mode === "sell"}
          className={`group flex items-center gap-4 rounded-2xl p-5 text-start transition-all ${
            mode === "sell"
              ? "bg-[var(--color-navy)] text-white shadow-lg shadow-[var(--color-navy)]/25"
              : "bg-[var(--color-navy)] text-white shadow-lg shadow-[var(--color-navy)]/20 hover:bg-[var(--color-navy-hover)]"
          }`}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
            <Home className="size-6" aria-hidden="true" />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-base font-bold">{t.sellTitle}</span>
            <span className="text-xs text-white/70">{t.sellSubtitle}</span>
          </span>
          <ArrowRight className={`size-5 ${arrowFlip} opacity-60 transition-transform group-hover:-translate-x-1`} aria-hidden="true" />
        </button>

        <button
          type="button"
          onClick={() => setMode("buy")}
          aria-pressed={mode === "buy"}
          className={`group flex items-center gap-4 rounded-2xl border-2 p-5 text-start transition-all ${
            mode === "buy"
              ? "border-[var(--color-navy)] bg-[var(--color-navy)]/5"
              : "border-[var(--color-border-soft)] bg-white hover:border-[var(--color-navy)]/50 hover:bg-[var(--color-bg-light)]"
          }`}
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-navy)]/10">
            <SearchCheck className="size-6 text-[var(--color-navy)]" aria-hidden="true" />
          </span>
          <span className="flex flex-1 flex-col">
            <span className="text-base font-bold text-[var(--color-navy)]">{t.buyTitle}</span>
            <span className="text-xs text-slate-500">{t.buySubtitle}</span>
          </span>
          <ArrowRight
            className={`size-5 ${arrowFlip} text-[var(--color-navy)] opacity-50 transition-transform group-hover:-translate-x-1`}
            aria-hidden="true"
          />
        </button>
      </div>

      {mode === "sell" && (
        <div className="rounded-2xl border border-[var(--color-border-soft)] bg-white p-5 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300 sm:p-7">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[var(--color-navy)]">{t.sellPanelTitle}</h2>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-xs font-semibold text-slate-400 transition-colors hover:text-[var(--color-navy)]"
            >
              {t.back}
            </button>
          </div>
          <SellForm />
        </div>
      )}

      {mode === "buy" && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-[var(--color-navy)]">{t.buyPanelTitle}</h2>
            <button
              type="button"
              onClick={() => setMode(null)}
              className="text-xs font-semibold text-slate-400 transition-colors hover:text-[var(--color-navy)]"
            >
              {t.back}
            </button>
          </div>
          <BuySearch />
        </div>
      )}
    </div>
  )
}
