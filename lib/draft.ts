export type PropertyDraft = {
  title: string
  price: string
  location: string
  description: string
  images: string[]
  coverImage: string
  whatsapp: string
  sellerName?: string
  missingFields?: string[]
  isComplete?: boolean
  dbId?: string | number
  publishedUrl?: string // <--- حقل رابط الإعلان المنشور
}

export type DraftStatus = "preview" | "editing" | "published"

// دالة فحص الـ Regex الشاملة للنقاط الخمس المعتمدة
export function checkMissingFields(
  details: string,
  address: string = "",
  sellerName: string = ""
): string[] {
  const missing: string[] = []
  const fullText = (details + " " + address).toLowerCase()

  // 1. البيانات الأساسية (Basic Info)
  if (!/(شقة|فيلا|تاون|توين|دوبلكس|بنتهاوس|مكتب|إداري|اداري|محل|تجاري|عيادة|أرض|ارض|شاليه|وحدة|عقار|villa|apartment|duplex|penthouse|office|clinic|land)/i.test(fullText)) {
    missing.push("نوع العقار")
  }
  if (!/(بيع|للبيع|إيجار|ايجار|للإيجار|للايجار|sale|rent)/i.test(fullText)) {
    missing.push("طبيعة العرض (بيع/إيجار)")
  }
  if (!/(تشطيب|متشطبة|متشطب|لوكس|محارة|عضم|نصف تشطيب|نص تشطيب|مفروش|finished|core)/i.test(fullText)) {
    missing.push("نوع التشطيب")
  }

  // 2. البيانات المادية والمالية (Financials)
  if (!/(سعر|مطلوب|مليون|ألف|الف|جنيه|جم|egp|price|\$|\b\d{6,}\b)/i.test(fullText)) {
    missing.push("السعر الإجمالي")
  }
  if (!/(كاش|تقسيط|مقدم|قسط|أقساط|اقساط|سنوات|سنين|دفعة|cash|installment)/i.test(fullText)) {
    missing.push("طريقة الدفع (كاش/تقسيط)")
  }
  if (!/(استلام|تاريخ الاستلام|سنة|فوري|فوريا|جاهز|ready|delivery|202\d)/i.test(fullText)) {
    missing.push("سنة / موعد الاستلام")
  }

  // 3. المواصفات الفنية والمساحات (Specs & Dimensions)
  if (!/(متر|م2|م²|متر مربع|\bم\b|area|sqm)/i.test(fullText)) {
    missing.push("المساحة بالمتر المربع")
  }
  if (!/(نوم|غرفة|غرف|غرفتين|نوم2|نوم3|rooms|bedrooms)/i.test(fullText)) {
    missing.push("عدد الغرف")
  }
  if (!/(حمام|حمامات|حمامين|bath|bathrooms)/i.test(fullText)) {
    missing.push("عدد الحمامات")
  }
  if (!/(دور|الأرضي|الارضي|أول|اول|ثاني|ثالث|رابع|خامس|سادس|سابع|ثامن|روف|طابق|floor)/i.test(fullText)) {
    missing.push("رقم الدور")
  }
  if (!/(بحري|قبلي|شرقي|غربي|فيو|لاند سكيب|شارع|حديقة|بحيرة|view)/i.test(fullText)) {
    missing.push("الاتجاه والفيو (بحري/قبلي/لاندسكيب)")
  }

  // 4. الموقع والجغرافيا (Location & Hierarchy)
  if (!/(قاهرة|تجمع|أكتوبر|زايد|عاصمة|شروق|عبور|معادي|مدينة|حي|منطقة|المحافظة|location|city)/i.test(fullText)) {
    missing.push("الموقع / المدينة")
  }

  // 5. بيانات التواصل الإضافية
  if (!sellerName.trim()) {
    missing.push("اسم صاحب الإعلان")
  }

  return missing
}

// Lightweight extraction from the seller's free-text description.
export function extractDraft(
  details: string,
  address: string,
  images: string[],
  whatsapp: string,
  sellerName: string = "",
): PropertyDraft {
  const text = details.trim()

  let price = ""
  // Prefer a number that carries a currency unit (e.g. "4.5 مليون").
  const unitMatch = text.match(/(\d+(?:[.,]\d+)?)\s*(مليون|م\b|ألف|الف|k|m)/i)
  // Otherwise, a number following a price keyword (مطلوب / السعر / بسعر / ثمن).
  const keywordMatch = text.match(/(?:مطلوب|السعر|سعر|بسعر|ثمن)\s*[:\-]?\s*(\d+(?:[.,]\d+)?)/)
  if (unitMatch) {
    const value = unitMatch[1]
    price = /مليون|^m$/i.test(unitMatch[2]) ? `${value} مليون جنيه` : `${value} ${unitMatch[2]}`.trim()
  } else if (keywordMatch) {
    price = `${keywordMatch[1]} جنيه`
  }

  const firstLine = text.split(/[.،\n]/)[0]?.trim() ?? ""
  const title = firstLine.length > 4 ? firstLine.slice(0, 60) : "عقار معروض للبيع"

  return {
    title,
    price,
    location: address.trim(),
    description: text,
    images,
    coverImage: images[0] ?? "",
    whatsapp: whatsapp.trim(),
    sellerName: sellerName.trim(),
  }
}