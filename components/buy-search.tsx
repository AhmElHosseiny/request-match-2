"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Sparkles, Send, Bot, User, Loader2, Search } from "lucide-react"
import { PropertyCard } from "@/components/property-card"
import { searchProperties, getAllProperties, type Property } from "@/lib/listings"
import { getSessionId, N8N_WEBHOOKS } from "@/lib/config"
import { useLanguage } from "@/lib/i18n"

type ChatMessage = {
  id: string
  role: "user" | "assistant"
  text: string
}

const PAGE_SIZE = 4

export function BuySearch() {
  const { t } = useLanguage()
  const [sessionId, setSessionId] = useState("")
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "welcome", role: "assistant", text: t.chatWelcome },
  ])
  const [input, setInput] = useState("")
  const [isThinking, setIsThinking] = useState(false)
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [results, setResults] = useState<Property[]>([])
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [hasSearched, setHasSearched] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  // Generate/restore a stable session id for conversational memory.
  useEffect(() => {
    setSessionId(getSessionId())
  }, [])

  // Fetch initial properties from Supabase on component mount
  useEffect(() => {
    async function loadInitialProperties() {
      const initialProperties = await getAllProperties()
      setAllProperties(initialProperties)
      setResults(initialProperties)
    }
    loadInitialProperties()
  }, [])

  // Keep the welcome message in sync with the active language until the user
  // has started a conversation.
  useEffect(() => {
    if (!hasSearched) {
      setMessages([{ id: "welcome", role: "assistant", text: t.chatWelcome }])
    }
  }, [t, hasSearched])

  // Scroll to bottom of message list on new message
  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages, isThinking])

  const runSearch = async (query: string) => {
    const q = query.trim()
    if (!q || isThinking) return

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: "user", text: q }])
    setInput("")
    setIsThinking(true)

    const currentSessionId = sessionId || getSessionId()

    // Payload sent to n8n Webhook
    const searchPayload = {
      action: "search_property",
      session_id: currentSessionId,
      query: q,
      message: q,
    }
    console.log("[v0] Sending request to n8n webhook:", N8N_WEBHOOKS.SEARCH_PROPERTY, searchPayload)

    try {
      const response = await fetch(N8N_WEBHOOKS.SEARCH_PROPERTY, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(searchPayload),
      })

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Received response from n8n:", data)

      // Extract response text and property matches from n8n output
      const replyText =
        data.reply ||
        data.output ||
        data.text ||
        data.message ||
        data.response ||
        ""

      const matchedIds: string[] = (
        data.matched_ids ||
        data.matched_uuids ||
        data.properties ||
        []
      ).map((id: any) => String(id).trim())

      let matchedProps: Property[] = []

      // تحديث قائمة العقارات بـ getAllProperties للتأكد من وجود أحدث العقارات المنشورة
      const latestProperties = await getAllProperties()
      setAllProperties(latestProperties)

      if (Array.isArray(matchedIds) && matchedIds.length > 0) {
        // المطابقة عبر المقارنة مع نص الـ ID لضمان مطابقة الـ UUIDs الدقيقة
        const propsMap = new Map(
          latestProperties.map((item) => [String(item.id).trim(), item])
        )
        matchedProps = matchedIds
          .map((id) => propsMap.get(id))
          .filter((item): item is Property => item !== undefined)
      }

      // إذا لم يتم العثور على مطابقة بالـ IDs، نلجأ للبحث المحلي
      if (matchedProps.length === 0) {
        matchedProps = await searchProperties(q)
      }

      setResults(matchedProps)
      setVisible(PAGE_SIZE)
      setHasSearched(true)

      const finalReply =
        replyText ||
        (matchedProps.length === 0 ? t.replyNone : t.replyFound(matchedProps.length, q))

      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: finalReply,
        },
      ])
    } catch (error) {
      console.error("[v0] Failed to send webhook request to n8n:", error)

      // Fallback local search on network or webhook error
      const matched = await searchProperties(q)
      setResults(matched)
      setVisible(PAGE_SIZE)
      setHasSearched(true)
      setMessages((prev) => [
        ...prev,
        {
          id: `a-${Date.now()}`,
          role: "assistant",
          text: matched.length === 0 ? t.replyNone : t.replyFound(matched.length, q),
        },
      ])
    } finally {
      setIsThinking(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    runSearch(input)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      if (e.nativeEvent.isComposing || e.keyCode === 229) return
      e.preventDefault()
      runSearch(input)
    }
  }

  const shown = results.slice(0, visible)

  return (
    <div className="flex flex-col gap-6">
      <section className="overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-white">
        <header className="flex items-center gap-3 border-b border-[var(--color-border-soft)] bg-[var(--color-navy)] px-4 py-3.5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 text-white">
            <Sparkles className="size-5" aria-hidden="true" />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-extrabold text-white">{t.assistantTitle}</span>
            <span className="text-xs text-white/70">{t.assistantSubtitle}</span>
          </div>
        </header>

        <div
          ref={listRef}
          className="flex max-h-72 flex-col gap-4 overflow-y-auto px-4 py-4"
          aria-live="polite"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <span
                className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "user"
                    ? "bg-[var(--color-navy)] text-white"
                    : "bg-[var(--color-navy)]/10 text-[var(--color-navy)]"
                }`}
              >
                {msg.role === "user" ? (
                  <User className="size-4" aria-hidden="true" />
                ) : (
                  <Bot className="size-4" aria-hidden="true" />
                )}
              </span>
              <p
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "rounded-tr-sm bg-[var(--color-navy)] text-white"
                    : "rounded-tl-sm bg-[var(--color-bg-light)] text-[var(--color-navy)]"
                }`}
              >
                {msg.text}
              </p>
            </div>
          ))}

          {isThinking && (
            <div className="flex items-start gap-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-navy)]/10 text-[var(--color-navy)]">
                <Bot className="size-4" aria-hidden="true" />
              </span>
              <p className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-[var(--color-bg-light)] px-3.5 py-2.5 text-sm text-slate-500">
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                {t.searching}
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-[var(--color-border-soft)] px-4 pb-4 pt-3">
          <div className="mb-3 flex flex-wrap gap-2">
            {t.suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => runSearch(s)}
                disabled={isThinking}
                className="rounded-full border border-[var(--color-border-soft)] bg-[var(--color-bg-light)] px-3 py-1.5 text-xs font-medium text-[var(--color-navy)] transition-colors hover:border-[var(--color-navy)]/50 hover:bg-white disabled:opacity-60"
              >
                {s}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
              placeholder={t.searchPlaceholder}
              className="max-h-28 min-h-[46px] w-full resize-none rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-light)] px-4 py-3 text-sm leading-relaxed text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition focus:border-[var(--color-navy)] focus:bg-white focus:ring-4 focus:ring-[var(--color-navy)]/10"
            />
            <button
              type="submit"
              disabled={isThinking || !input.trim()}
              aria-label={t.send}
              className="flex size-[46px] shrink-0 items-center justify-center rounded-2xl bg-[var(--color-navy)] text-white transition-colors hover:bg-[var(--color-navy-hover)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="size-5" aria-hidden="true" />
            </button>
          </form>
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-[var(--color-navy)]">
            <Search className="size-4" aria-hidden="true" />
            {hasSearched ? t.resultsSearched : t.resultsLatest}
          </h2>
          <span className="text-xs font-medium text-slate-500">{t.unitCount(results.length)}</span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {shown.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>

        {visible < results.length && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-2xl border-2 border-[var(--color-border-soft)] bg-white px-6 py-3 text-sm font-bold text-[var(--color-navy)] transition-colors hover:border-[var(--color-navy)]/50 hover:bg-[var(--color-bg-light)]"
            >
              {t.loadMore}
            </button>
          </div>
        )}
      </section>
    </div>
  )
}