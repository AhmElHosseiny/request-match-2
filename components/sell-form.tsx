"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Send, FileText, MapPin, Images, Phone, User, Lightbulb } from "lucide-react"
import { MediaUpload, type UploadedMedia } from "@/components/media-upload"
import { DraftPreview } from "@/components/draft-preview"
import { useToast } from "@/components/toast"
import { N8N_WEBHOOKS, isValidPhone, buildWhatsappLink } from "@/lib/config"
import { type PropertyDraft, type DraftStatus } from "@/lib/draft"
import { useLanguage } from "@/lib/i18n"

export function SellForm() {
  const { showToast } = useToast()
  const { t } = useLanguage()
  const [sellerName, setSellerName] = useState("")
  const [details, setDetails] = useState("")
  const [address, setAddress] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [whatsappError, setWhatsappError] = useState(false)
  const [media, setMedia] = useState<UploadedMedia[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [draft, setDraft] = useState<PropertyDraft | null>(null)
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("preview")
  const [isPublishing, setIsPublishing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!details.trim()) {
      showToast(t.errNoDetails, "error")
      return
    }
    if (!whatsapp.trim()) {
      setWhatsappError(true)
      showToast(t.errNoWhatsapp, "error")
      return
    }
    if (!isValidPhone(whatsapp)) {
      setWhatsappError(true)
      showToast(t.errBadWhatsapp, "error")
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        action: "analyze_property",
        seller_name: sellerName.trim(),
        details: details.trim(),
        address: address.trim(),
        whatsapp: whatsapp.trim(),
        media_urls: media.map((m) => m.previewUrl || m.dataUrl).filter(Boolean),
      }

      const res = await fetch(N8N_WEBHOOKS.SELL_PROPERTY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`Server returned status ${res.status}`)

      const responseData = await res.json()

      const rawPrice =
        responseData.price ??
        responseData.total_price ??
        responseData.extracted_data?.price ??
        "غير محدد"

      const imageList = media.map((m) => m.previewUrl || m.dataUrl).filter((url): url is string => Boolean(url))

      const extractedDraft: PropertyDraft = {
        title: String(responseData.title || responseData.extracted_data?.title || "عقار جديد"),
        price: typeof rawPrice === "number" ? `${rawPrice.toLocaleString("ar-EG")} جنيه` : String(rawPrice),
        location: String(responseData.location || address.trim() || responseData.extracted_data?.location || "غير محدد"),
        description: String(responseData.description || details.trim()),
        whatsapp: String(responseData.whatsapp || whatsapp.trim()),
        sellerName: String(sellerName.trim() || responseData.seller_name || ""),
        images: imageList,
        coverImage: imageList[0] || "",
        missingFields: responseData.missingFields || responseData.missing_fields || [],
        isComplete: responseData.is_complete ?? (responseData.missingFields?.length === 0 || responseData.missing_fields?.length === 0),
        dbId: responseData.id || responseData.db_id,
      }

      setDraft(extractedDraft)
      setDraftStatus("preview")
    } catch (error) {
      console.error("n8n Webhook Error:", error)
      showToast("حدث خطأ أثناء معالجة العقار، يرجى المحاولة لاحقاً", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handlePublish = async (coverImage: string) => {
    if (!draft) return
    setIsPublishing(true)
    try {
      const payload = {
        action: "publish_property",
        status: "published",
        db_id: draft.dbId,
        seller_name: sellerName.trim() || draft.sellerName || "",
        title: draft.title,
        price: draft.price,
        location: draft.location,
        description: draft.description,
        whatsapp: draft.whatsapp,
        contact_link: buildWhatsappLink(draft.whatsapp),
        cover_image: coverImage,
        media_urls: media.map((m) => m.dataUrl || m.previewUrl),
      }

      const res = await fetch(N8N_WEBHOOKS.SELL_PROPERTY, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error(`Request failed: ${res.status}`)

      const responseData = await res.json()

      // تحديث رابط العقار في الـ draft وتعيين الحالة إلى published
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              publishedUrl: responseData.property_url || responseData.url || `/property/${draft.dbId}`,
            }
          : null
      )

      setDraftStatus("published")
    } catch {
      showToast(t.publishError, "error")
    } finally {
      setIsPublishing(false)
    }
  }

  const closeDraft = () => {
    const wasPublished = draftStatus === "published"
    setDraft(null)
    setDraftStatus("preview")
    if (wasPublished) {
      showToast(t.publishSuccess, "success")
      setSellerName("")
      setDetails("")
      setAddress("")
      setWhatsapp("")
      setWhatsappError(false)
      setMedia([])
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* تفاصيل العقار */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="sell-details" className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
            <FileText className="size-4" aria-hidden="true" />
            {t.detailsLabel}
          </label>
          <textarea
            id="sell-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            rows={5}
            placeholder={t.detailsPlaceholder}
            className="w-full resize-none rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-light)] p-4 text-sm leading-relaxed text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition focus:border-[var(--color-navy)] focus:bg-white focus:ring-4 focus:ring-[var(--color-navy)]/10"
          />
          <div className="flex items-start gap-2 rounded-2xl border border-amber-200/80 bg-amber-50/60 p-3.5 text-xs text-amber-900 shadow-sm">
            <Lightbulb className="size-4 text-amber-600 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="leading-relaxed">
              <strong className="font-bold">تلميح لظهور أفضل:</strong> كلما كانت تفاصيل عقارك شاملة كلما زادت فرصة ظهور إعلانك في نتائج البحث والترشيحات الذكية للعملاء.
            </p>
          </div>
        </div>

        {/* العنوان بالتفصيل */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="sell-address" className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
            <MapPin className="size-4" aria-hidden="true" />
            {t.addressLabel}
          </label>
          <input
            id="sell-address"
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={t.addressPlaceholder}
            className="w-full rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-light)] p-4 text-sm text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition focus:border-[var(--color-navy)] focus:bg-white focus:ring-4 focus:ring-[var(--color-navy)]/10"
          />
        </div>

        {/* الصور والفيديوهات والملفات */}
        <div className="flex flex-col gap-2.5">
          <span className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
            <Images className="size-4" aria-hidden="true" />
            {t.mediaLabel}
          </span>
          <MediaUpload files={media} onChange={setMedia} />
        </div>

        {/* الإسم */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="sell-name" className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
            <User className="size-4" aria-hidden="true" />
            <span>الإسم</span>
          </label>
          <input
            id="sell-name"
            type="text"
            value={sellerName}
            onChange={(e) => setSellerName(e.target.value)}
            placeholder="مثال: أحمد أسامة"
            className="w-full rounded-2xl border border-[var(--color-border-soft)] bg-[var(--color-bg-light)] p-4 text-sm text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition focus:border-[var(--color-navy)] focus:bg-white focus:ring-4 focus:ring-[var(--color-navy)]/10"
          />
        </div>

        {/* رقم الواتساب للتواصل */}
        <div className="flex flex-col gap-2.5">
          <label htmlFor="sell-whatsapp" className="flex items-center gap-2 text-sm font-bold text-[var(--color-navy)]">
            <Phone className="size-4" aria-hidden="true" />
            {t.whatsappLabel}
            <span className="text-[var(--color-accent,#ef4444)]" aria-hidden="true">
              *
            </span>
          </label>
          <input
            id="sell-whatsapp"
            type="tel"
            inputMode="tel"
            required
            dir="ltr"
            value={whatsapp}
            onChange={(e) => {
              setWhatsapp(e.target.value)
              if (whatsappError) setWhatsappError(false)
            }}
            aria-invalid={whatsappError}
            aria-describedby="sell-whatsapp-hint"
            placeholder={t.whatsappPlaceholder}
            className={`w-full rounded-2xl border bg-[var(--color-bg-light)] p-4 text-sm text-[var(--color-navy)] placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-4 ${
              whatsappError
                ? "border-red-400 focus:border-red-500 focus:ring-red-500/10"
                : "border-[var(--color-border-soft)] focus:border-[var(--color-navy)] focus:ring-[var(--color-navy)]/10"
            }`}
          />
          <p id="sell-whatsapp-hint" className="text-xs text-slate-400">
            {t.whatsappHint}
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 flex items-center justify-center gap-2.5 rounded-2xl bg-[var(--color-navy)] px-6 py-4 text-base font-bold text-white shadow-lg shadow-[var(--color-navy)]/20 transition-colors hover:bg-[var(--color-navy-hover)] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              {t.submitLoading}
            </>
          ) : (
            <>
              <Send className="size-5" aria-hidden="true" />
              {t.submitIdle}
            </>
          )}
        </button>
      </form>

      {draft && (
        <DraftPreview
          draft={draft}
          status={draftStatus}
          isPublishing={isPublishing}
          onPublish={handlePublish}
          onEdit={() => setDraftStatus((s) => (s === "editing" ? "preview" : "editing"))}
          onSaveEdit={(updated) => {
            setDraft(updated)
            setDraftStatus("preview")
          }}
          onClose={closeDraft}
        />
      )}
    </>
  )
}