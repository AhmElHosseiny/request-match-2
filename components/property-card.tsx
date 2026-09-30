"use client"

import Link from "next/link"
import { MapPin, BedDouble, Maximize, MessageCircle, ArrowLeft } from "lucide-react"
import { formatPrice, type Property } from "@/lib/listings"
import { WHATSAPP_NUMBER, buildWhatsappLink } from "@/lib/config"
import { useLanguage } from "@/lib/i18n"

export function PropertyCard({ property }: { property: any }) {
  const { t, lang } = useLanguage()
  const price = formatPrice(property.price, lang)
  const message = t.waMessage(property.title, property.location, price)
  const waLink = buildWhatsappLink(WHATSAPP_NUMBER, message)

  // تنظيف الـ ID وتأمين وجود رابط صحيح
  const propertyId = String(property.id || '').trim()
  const propertyDetailsUrl = `/property/${propertyId}`

  // قراءة القيم بمرونة من المسميات الجديدة في الجدول أو المسميات القديمة
  const areaValue = property.area_sqm ?? property.area ?? "غير محدد"
  const roomsValue = property.rooms ?? property.bedrooms ?? "غير محدد"
  const finishingValue = property.finishing_type ?? (property.finished ? t.finished : t.semiFinished) ?? "غير محدد"

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-[var(--color-border-soft)] bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* الضغط على الصورة يفتح صفحة التفاصيل */}
      <Link href={propertyDetailsUrl} className="relative aspect-[4/3] overflow-hidden bg-[var(--color-bg-light)]">
        <img
          src={property.image || "/placeholder.svg"}
          alt={property.title || "عقار"}
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 rounded-full bg-[var(--color-navy)] px-3 py-1.5 text-xs font-bold text-white shadow-lg">
          {price}
        </span>
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[var(--color-navy)] backdrop-blur">
          {property.type || "عقار"}
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {/* الضغط على العنوان يفتح صفحة التفاصيل */}
        <Link href={propertyDetailsUrl}>
          <h3 className="text-pretty text-base font-bold leading-snug text-[var(--color-navy)] hover:text-emerald-600 transition-colors">
            {property.title || "بدون عنوان"}
          </h3>
        </Link>

        <div className="mt-2 flex items-start gap-1.5 text-xs text-slate-500">
          <MapPin className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>{property.location || "غير محدد"}</span>
        </div>

        <div className="mt-3 flex items-center gap-4 text-xs font-medium text-slate-600">
          {/* 1. المساحة من area_sqm */}
          <span className="inline-flex items-center gap-1.5">
            <Maximize className="size-3.5 text-slate-400" aria-hidden="true" />
            {areaValue !== "غير محدد" ? `${areaValue} ${t.areaUnit}` : "غير محدد"}
          </span>

          {/* 2. الغرف من rooms */}
          <span className="inline-flex items-center gap-1.5">
            <BedDouble className="size-3.5 text-slate-400" aria-hidden="true" />
            {roomsValue !== "غير محدد" ? (t.rooms ? t.rooms(roomsValue) : `${roomsValue} غرف`) : "غير محدد"}
          </span>

          {/* 3. التشطيب من finishing_type */}
          <span
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
              finishingValue !== "غير محدد" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
            }`}
          >
            {finishingValue}
          </span>
        </div>

        {/* أزرار التواصل والتفاصيل */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href={propertyDetailsUrl}
            className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100"
          >
            <span>التفاصيل</span>
            <ArrowLeft className="size-3.5" aria-hidden="true" />
          </Link>

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700"
          >
            <MessageCircle className="size-3.5" aria-hidden="true" />
            <span>واتساب</span>
          </a>
        </div>
      </div>
    </article>
  )
}