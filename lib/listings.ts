import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
)

export type Property = {
  id: string
  title: string
  type: "فيلا" | "شقة" | "دوبلكس" | "شاليه" | "بنتهاوس" | "تاون هاوس"
  price: number
  location: string
  area: number
  bedrooms: number
  finished: boolean
  finishingTypeRaw: string
  image: string
  images: string[]
  description: string
}

function parseArabicNumber(val: any): number {
  if (val === null || val === undefined) return 0
  if (typeof val === 'number') return val

  let str = String(val)
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩']
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(arabicDigits[i], 'g'), String(i))
  }

  const cleaned = str.replace(/[^\d.]/g, '')
  return parseFloat(cleaned) || 0
}

function mapPropertyData(data: any): Property {
  if (!data) return null as any

  // 1. استخراج السعر
  const rawPrice = data.price ?? data.asking_price ?? data.total_price ?? data.unit_price ?? 0
  const numericPrice = parseArabicNumber(rawPrice)

  // 2. استخراج المساحة من area_sqm أو area
  const rawArea = data.area_sqm ?? data.area ?? 0
  const numericArea = parseArabicNumber(rawArea)

  // 3. استخراج عدد الغرف من rooms أو bedrooms
  const rawBedrooms = data.rooms ?? data.bedrooms ?? 0
  const numericBedrooms = parseArabicNumber(rawBedrooms)

  // 4. استخراج نوع التشطيب من finishing_type أو finishing
  const rawFinishingType = String(data.finishing_type || data.finishing || '').trim()
  
  let isFinished = false
  if (typeof data.finished === 'boolean') {
    isFinished = data.finished
  } else if (rawFinishingType) {
    const fStr = rawFinishingType.toLowerCase()
    isFinished = !fStr.includes("core") && !fStr.includes("shell") && !fStr.includes("semi") && !fStr.includes("unfurnished") && !fStr.includes("بدون")
  }

  // 5. استخراج الصور
  let allImages: string[] = []
  if (Array.isArray(data.media_urls) && data.media_urls.length > 0) {
    allImages = data.media_urls
  } else if (Array.isArray(data.images) && data.images.length > 0) {
    allImages = data.images
  } else if (Array.isArray(data.photos) && data.photos.length > 0) {
    allImages = data.photos
  } else if (data.cover_image) {
    allImages = [data.cover_image]
  } else if (data.image) {
    allImages = [data.image]
  }

  return {
    id: String(data.id || ''),
    title: data.title || data.name || "عقار بدون عنوان",
    type: data.type || data.property_type || "شقة",
    price: numericPrice,
    // جلب المكان من compound_name أو location كبديل
    location: data.compound_name || data.location || "غير محدد",
    area: numericArea,
    bedrooms: numericBedrooms,
    finished: isFinished,
    finishingTypeRaw: rawFinishingType,
    image: allImages[0] || '',
    images: allImages,
    // جلب الوصف والتفاصيل من raw_text أو description كبديل
    description: data.raw_text || data.description || "",
  }
}

export function formatFinishingType(finishingType: string, lang: "ar" | "en" = "ar"): string {
  if (!finishingType) return lang === "ar" ? "غير محدد" : "Not Specified"

  const f = finishingType.toLowerCase()

  if (f.includes("super lux") || f.includes("super_lux") || f.includes("ultra lux") || f.includes("سوبر لوكس")) {
    return lang === "ar" ? "سوبر لوكس" : "Super Lux"
  }
  if (f.includes("extra super lux") || f.includes("luxury") || f.includes("الترا")) {
    return lang === "ar" ? "ألترا سوبر لوكس" : "Ultra Super Lux"
  }
  if (f.includes("full") || f.includes("finished") || f.includes("fully") || f.includes("كامل")) {
    return lang === "ar" ? "تشطيب كامل" : "Fully Finished"
  }
  if (f.includes("semi") || f.includes("half") || f.includes("نصف") || f.includes("نص")) {
    return lang === "ar" ? "نصف تشطيب" : "Semi Finished"
  }
  if (f.includes("core") || f.includes("shell") || f.includes("red brick") || f.includes("محارة") || f.includes("طوب")) {
    return lang === "ar" ? "على المحارة / طوب أحمر" : "Core & Shell"
  }

  return finishingType
}

export function formatPrice(
  price: number, 
  lang: "ar" | "en" = "ar", 
  mode: "compact" | "full" = "compact"
): string {
  const isAr = lang === "ar"
  if (!price || isNaN(price)) return isAr ? "السعر عند الطلب" : "Price on Request"

  if (mode === "full") {
    return isAr 
      ? `${price.toLocaleString("ar-EG")} جنيه` 
      : `${price.toLocaleString("en-US")} EGP`
  }

  if (price >= 1000000) {
    const millions = price / 1000000
    const value = Number.isInteger(millions) ? millions : millions.toFixed(1)
    return isAr ? `${value} مليون جنيه` : `${value} million EGP`
  }

  return isAr ? `${price.toLocaleString("ar-EG")} جنيه` : `${price.toLocaleString("en-US")} EGP`
}

const TYPE_KEYWORDS: Record<string, Property["type"]> = {
  فيلا: "فيلا",
  فله: "فيلا",
  شقة: "شقة",
  شقه: "شقة",
  دوبلكس: "دوبلكس",
  شاليه: "شاليه",
  بنتهاوس: "بنتهاوس",
  "تاون": "تاون هاوس",
}

const LOCATION_KEYWORDS = [
  "التجمع",
  "زايد",
  "الساحل",
  "العاصمة",
  "مدينتي",
  "المعادي",
]

function extractBudget(query: string): number | null {
  const match = query.match(/(\d+(?:[.,]\d+)?)\s*(مليون|م)?/)
  if (!match) return null
  const value = Number.parseFloat(match[1].replace(",", "."))
  if (Number.isNaN(value)) return null
  if (match[2] || value < 1000) return value * 1000000
  return value
}

// اسم الجدول الأصلي الصحيح
const TARGET_TABLE = 'published'

export async function getAllProperties(): Promise<Property[]> {
  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching properties:', error)
    return []
  }

  return (data || []).map(mapPropertyData)
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (!id) return null
  const cleanId = id.trim()

  const { data, error } = await supabase
    .from(TARGET_TABLE)
    .select('*')
    .eq('id', cleanId)
    .maybeSingle()

  if (error) {
    console.error(`Error fetching property with id ${cleanId}:`, error)
    return null
  }

  if (!data) return null

  return mapPropertyData(data)
}

export async function searchProperties(query: string): Promise<Property[]> {
  const q = query.trim()
  if (!q) return await getAllProperties()

  let dbQuery = supabase.from(TARGET_TABLE).select('*')

  const matchedType = Object.keys(TYPE_KEYWORDS).find((k) => q.includes(k))
  if (matchedType) {
    dbQuery = dbQuery.eq('type', TYPE_KEYWORDS[matchedType])
  }

  const matchedLocation = LOCATION_KEYWORDS.find((k) => q.includes(k))
  if (matchedLocation) {
    dbQuery = dbQuery.ilike('location', `%${matchedLocation}%`)
  }

  if (q.includes("متشطب") || q.includes("تشطيب كامل") || q.includes("سوبر لوكس")) {
    dbQuery = dbQuery.eq('finished', true)
  } else if (q.includes("نص تشطيب") || q.includes("نصف تشطيب")) {
    dbQuery = dbQuery.eq('finished', false)
  }

  const budget = extractBudget(q)
  if (budget) {
    dbQuery = dbQuery.lte('price', budget * 1.1)
  }

  const { data, error } = await dbQuery
  if (error) return await getAllProperties()

  return (data || []).map(mapPropertyData)
}