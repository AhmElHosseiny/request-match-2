"use client"

import { useState } from "react"
import {
  X,
  Check,
  Pencil,
  AlertTriangle,
  MapPin,
  Tag,
  Phone,
  User,
  ExternalLink,
  CheckCircle2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { type PropertyDraft, type DraftStatus } from "@/lib/draft"

interface DraftPreviewProps {
  draft: PropertyDraft
  status: DraftStatus
  isPublishing: boolean
  onPublish: (coverImage: string) => void
  onEdit: () => void
  onSaveEdit: (updatedDraft: PropertyDraft) => void
  onClose: () => void
}

export function DraftPreview({
  draft,
  status,
  isPublishing,
  onPublish,
  onEdit,
  onSaveEdit,
  onClose,
}: DraftPreviewProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  // حالات نموذج التعديل المحلي (Editing Mode)
  const [editTitle, setEditTitle] = useState(draft.title)
  const [editPrice, setEditPrice] = useState(draft.price)
  const [editLocation, setEditLocation] = useState(draft.location)
  const [editDescription, setEditDescription] = useState(draft.description)
  const [editWhatsapp, setEditWhatsapp] = useState(draft.whatsapp)
  const [editSellerName, setEditSellerName] = useState(draft.sellerName || "")

  const hasImages = draft.images && draft.images.length > 0
  const currentCoverImage = hasImages ? draft.images[selectedImageIndex] : draft.coverImage || ""

  const handleSaveLocalEdit = () => {
    onSaveEdit({
      ...draft,
      title: editTitle,
      price: editPrice,
      location: editLocation,
      description: editDescription,
      whatsapp: editWhatsapp,
      sellerName: editSellerName,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col rounded-3xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* الهيدر */}
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700 border border-amber-200/60">
            <span className="size-2 rounded-full bg-amber-500 animate-pulse" />
            معاينة مسودة العقار
          </span>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* محتوى الشاشة بناءً على الحالة */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* حالة النجاح بعد النشر Published */}
          {status === "published" ? (
            <div className="flex flex-col items-center justify-center text-center py-8 px-4 gap-4">
              <div className="size-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner animate-bounce">
                <CheckCircle2 className="size-12" />
              </div>

              <h3 className="text-2xl font-black text-[var(--color-navy)]">
                تم نشر إعلانك بنجاح! 🎉
              </h3>
              <p className="text-sm text-slate-600 max-w-md leading-relaxed">
                إعلانك الآن متاح لجميع زوار الموقع ويمكن للمشترين التواصل معك مباشرة عبر الواتساب.
              </p>

              {draft.publishedUrl && (
                <a
                  href={draft.publishedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 flex items-center gap-2.5 rounded-2xl bg-emerald-600 px-6 py-4 text-base font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition transform active:scale-95"
                >
                  <span>يمكنك الاطلاع على إعلانك من هنا</span>
                  <ExternalLink className="size-5" />
                </a>
              )}

              <button
                onClick={onClose}
                className="mt-4 text-xs font-bold text-slate-400 hover:text-slate-600 underline"
              >
                إغلاق النافذة
              </button>
            </div>
          ) : status === "editing" ? (

            /* حالة التعديل Editing Mode */
            <div className="space-y-4">
              <h4 className="font-bold text-base text-[var(--color-navy)] border-b pb-2">
                تعديل بيانات المسودة
              </h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">العنوان الرئيسي</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--color-navy)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">السعر المعروض</label>
                <input
                  type="text"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--color-navy)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">الموقع / المنطقة</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--color-navy)] outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-600">الوصف الشامل</label>
                <textarea
                  rows={4}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--color-navy)] outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">رقم الواتساب</label>
                  <input
                    type="text"
                    value={editWhatsapp}
                    onChange={(e) => setEditWhatsapp(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--color-navy)] outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-600">اسم المعلن</label>
                  <input
                    type="text"
                    value={editSellerName}
                    onChange={(e) => setEditSellerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm focus:border-[var(--color-navy)] outline-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleSaveLocalEdit}
                  className="flex-1 rounded-xl bg-[var(--color-navy)] py-3 text-sm font-bold text-white hover:bg-[var(--color-navy-hover)]"
                >
                  حفظ التعديلات
                </button>
                <button
                  onClick={onEdit}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-600 hover:bg-slate-50"
                >
                  إلغاء
                </button>
              </div>
            </div>
          ) : (

            /* حالة المعاينة العادية Preview Mode */
            <>
              {/* معرض الصور مع إمكانية تحديد غلاف */}
              {hasImages && (
                <div className="space-y-2">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                    <img
                      src={currentCoverImage}
                      alt="صورة العقار"
                      className="h-full w-full object-cover"
                    />
                    {draft.images.length > 1 && (
                      <>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev > 0 ? prev - 1 : draft.images.length - 1))
                          }
                          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                          <ChevronLeft className="size-5" />
                        </button>
                        <button
                          onClick={() =>
                            setSelectedImageIndex((prev) => (prev < draft.images.length - 1 ? prev + 1 : 0))
                          }
                          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
                        >
                          <ChevronRight className="size-5" />
                        </button>
                      </>
                    )}
                    <span className="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-bold text-white backdrop-blur-sm">
                      الصورة المختارة للغلاف ({selectedImageIndex + 1}/{draft.images.length})
                    </span>
                  </div>

                  {draft.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {draft.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`relative h-16 w-20 shrink-0 rounded-xl overflow-hidden border-2 transition ${
                            selectedImageIndex === idx
                              ? "border-emerald-600 ring-2 ring-emerald-600/20"
                              : "border-transparent opacity-70 hover:opacity-100"
                          }`}
                        >
                          <img src={img} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* تنبيه النواقص Missing Fields */}
              {draft.missingFields && draft.missingFields.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600" />
                    <span>ملاحظة: تنقص بعض البيانات لإكمال الإعلان بأفضل صورة:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {draft.missingFields.map((field, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center rounded-lg bg-amber-100/80 px-2.5 py-1 text-xs font-semibold text-amber-900 border border-amber-200/60"
                      >
                        • {field}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* تفاصيل العقار المعروضة */}
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="text-xl font-black text-[var(--color-navy)] leading-tight">
                    {draft.title}
                  </h3>
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-2xl bg-slate-100 px-3.5 py-2 text-sm font-black text-[var(--color-navy)]">
                    <Tag className="size-4 text-emerald-600" />
                    {draft.price.trim() || "غير محدد"}
                  </span>
                </div>

                {draft.location && (
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <MapPin className="size-4 text-slate-400" />
                    <span>{draft.location}</span>
                  </div>
                )}

                <div className="rounded-2xl bg-slate-50 p-4 border border-slate-100">
                  <p className="text-sm leading-relaxed text-slate-700 whitespace-pre-line">
                    {draft.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold text-slate-500">
                  {draft.sellerName && (
                    <div className="flex items-center gap-1.5">
                      <User className="size-3.5" />
                      <span>المعلن: {draft.sellerName}</span>
                    </div>
                  )}
                  {draft.whatsapp && (
                    <div className="flex items-center gap-1.5" dir="ltr">
                      <Phone className="size-3.5" />
                      <span>{draft.whatsapp}</span>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* الفوتر وأزرار التحكم (يظهر فقط أثناء حالة المعاينة Preview) */}
        {status === "preview" && (
          <div className="flex items-center gap-3 border-t border-slate-100 p-5 bg-slate-50/50">
            <button
              onClick={() => onPublish(currentCoverImage)}
              disabled={isPublishing}
              className="flex-1 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition disabled:opacity-60"
            >
              {isPublishing ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <Check className="size-5" />
                  <span>التفاصيل صحيحة - انشر الآن</span>
                </>
              )}
            </button>

            <button
              onClick={onEdit}
              disabled={isPublishing}
              className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-700 hover:bg-slate-50 transition"
            >
              <Pencil className="size-4" />
              <span>أرغب في التعديل</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}