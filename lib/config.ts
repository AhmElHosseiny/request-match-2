// n8n Webhook Endpoints
export const N8N_WEBHOOKS = {
  SELL_PROPERTY: "https://n8n.srv1285921.hstgr.cloud/webhook/sell-property",
  SEARCH_PROPERTY: "https://n8n.srv1285921.hstgr.cloud/webhook/chat-search", // 👈 شلنا كلمة test
} as const

// WhatsApp contact number in international format, no "+" or spaces.
export const WHATSAPP_NUMBER = "201000000000"

// Strips everything except digits so the value can be used in a wa.me link.
export function normalizePhone(input: string): string {
  return input.replace(/\D/g, "")
}

// Accepts common phone formats: optional leading "+", digits, spaces, dashes,
// parentheses and dots. Requires 8–15 actual digits (E.164-friendly range).
export function isValidPhone(input: string): boolean {
  const trimmed = input.trim()
  if (!/^\+?[\d\s\-().]+$/.test(trimmed)) return false
  const digits = normalizePhone(trimmed)
  return digits.length >= 8 && digits.length <= 15
}

// Builds a wa.me contact link from a raw phone number.
export function buildWhatsappLink(phone: string, message?: string): string {
  const digits = normalizePhone(phone)
  const base = `https://wa.me/${digits}`
  return message ? `${base}?text=${encodeURIComponent(message)}` : base
}

// Returns a stable per-browser session id, generating and persisting one on
// first use. Used to give the buyer search conversational memory.
const SESSION_KEY = "request-match-session-id"

export function getSessionId(): string {
  if (typeof window === "undefined") return ""
  let id = window.localStorage.getItem(SESSION_KEY)
  if (!id) {
    id =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `sess-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(SESSION_KEY, id)
  }
  return id
}