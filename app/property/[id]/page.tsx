"use client"

import { useEffect, useState, use } from "react"
import { getPropertyById, formatPrice, formatFinishingType, Property } from "@/lib/listings"
import Image from "next/image"
import Link from "next/link"

export default function PropertyPage(props: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(props.params)
  const propertyId = resolvedParams?.id

  const [property, setProperty] = useState<Property | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>("")
  
  // لغة الصفحة (يمكنك تغييرها بـ "en" عند تفعيل اللغة الإنجليزية)
  const lang: "ar" | "en" = "ar" 
  const isAr = lang === "ar"

  useEffect(() => {
    async function loadData() {
      if (!propertyId) return
      setLoading(true)
      const data = await getPropertyById(propertyId)
      if (data) {
        setProperty(data)
        setSelectedImage(data.image || (data.images && data.images[0]) || "")
      }
      setLoading(false)
    }
    loadData()
  }, [propertyId])

  if (loading) {
    return (
      <main className="container mx-auto max-w-4xl px-4 py-16 text-center" dir={isAr ? "rtl" : "ltr"}>
        <p className="text-slate-500 font-medium">{isAr ? "جاري تحميل تفاصيل العقار..." : "Loading property details..."}</p>
      </main>
    )
  }

  if (!property) {
    return (
      <main className="container mx-auto max-w-2xl px-4 py-16 text-center" dir={isAr ? "rtl" : "ltr"}>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4">
          <h1 className="text-xl font-bold text-slate-800">{isAr ? "لم يتم العثور على العقار" : "Property Not Found"}</h1>
          <Link href="/" className="inline-block mt-4 text-sm font-bold text-emerald-600 hover:underline">
            {isAr ? "العودة للصفحة الرئيسية" : "Back to Home"}
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className="container mx-auto max-w-4xl px-4 py-8" dir={isAr ? "rtl" : "ltr"}>
      <Link 
        href="/" 
        className="inline-block mb-6 text-sm font-medium text-emerald-600 hover:underline"
      >
        {isAr ? "← العودة للرئيسية" : "← Back to Home"}
      </Link>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
        
        {/* الصورة الرئيسية الكبيرة */}
        <div className="relative h-[420px] w-full bg-slate-100 transition-all duration-300">
          {selectedImage ? (
            <Image
              src={selectedImage}
              alt={property.title}
              fill
              className="object-cover"
              priority
              unoptimized
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              {isAr ? "لا توجد صورة متوفرة" : "No image available"}
            </div>
          )}
        </div>

        {/* المعرض */}
        {property.images && property.images.length > 0 && (
          <div className="p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 mb-3">
              {isAr ? `اضغط على أي صورة للمعاينة الكبيرة (${property.images.length}):` : `Click image to preview (${property.images.length}):`}
            </h3>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
              {property.images.map((imgUrl, index) => {
                const isSelected = selectedImage === imgUrl
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(imgUrl)}
                    className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      isSelected ? "border-emerald-600 scale-95 shadow-sm" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`صورة ${index + 1}`}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start gap-4">
            <div>
              <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full mb-2">
                {property.type}
              </span>
              <h1 className="text-2xl font-bold text-slate-900">{property.title}</h1>
              <p className="text-slate-500 text-sm mt-1">📍 {property.location}</p>
            </div>
            <div className="text-left shrink-0">
              <p className="text-2xl font-bold text-emerald-600">
                {formatPrice(property.price, lang, "full")}
              </p>
            </div>
          </div>

          {/* العرض الديناميكي للثلاث تفاصيل باللغة المطلوبة */}
          <div className="grid grid-cols-3 gap-4 border-y border-slate-100 py-4 text-center">
            <div>
              <p className="text-xs text-slate-400 mb-1">{isAr ? "المساحة" : "Area"}</p>
              <p className="font-bold text-slate-800">
                {property.area > 0 
                  ? (isAr ? `${property.area} م²` : `${property.area} sqm`) 
                  : (isAr ? "غير محدد" : "N/A")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">{isAr ? "الغرف" : "Bedrooms"}</p>
              <p className="font-bold text-slate-800">
                {property.bedrooms > 0 ? property.bedrooms : (isAr ? "غير محدد" : "N/A")}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-1">{isAr ? "التشطيب" : "Finishing"}</p>
              <p className="font-bold text-slate-800">
                {formatFinishingType(property.finishingTypeRaw, lang)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-base font-bold mb-2 text-slate-900">{isAr ? "التفاصيل والوصف" : "Description"}</h2>
            <p className="text-slate-600 leading-relaxed text-sm whitespace-pre-line">
              {property.description || (isAr ? "لا يوجد وصف إضافي متوفر لهذه الوحدة." : "No description available.")}
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}