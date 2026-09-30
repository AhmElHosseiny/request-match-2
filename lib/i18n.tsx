"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"

export type Lang = "ar" | "en"

export type Dict = {
  dir: "rtl" | "ltr"

  // Header / brand
  brand: string
  switchToArabic: string
  switchToEnglish: string
  languageLabel: string

  // Mode selector
  sellTitle: string
  sellSubtitle: string
  buyTitle: string
  buySubtitle: string
  sellPanelTitle: string
  buyPanelTitle: string
  back: string

  // Sell form
  detailsLabel: string
  detailsPlaceholder: string
  addressLabel: string
  addressPlaceholder: string
  mediaLabel: string
  whatsappLabel: string
  whatsappPlaceholder: string
  whatsappHint: string
  submitIdle: string
  submitLoading: string
  errNoDetails: string
  errNoWhatsapp: string
  errBadWhatsapp: string
  publishError: string
  publishSuccess: string

  // Media upload
  mediaProcessing: string
  mediaDropHere: string
  mediaOrClick: string
  mediaRemove: (name: string) => string

  // Draft preview
  previewBadge: string
  publishedBadge: string
  dialogLabel: string
  close: string
  coverAlt: string
  coverBadge: string
  chooseCover: string
  setCover: (i: number) => string
  imageAlt: (i: number) => string
  coverShort: string
  contactLabel: string
  publishing: string
  publishNow: string
  wantEdit: string
  editTitle: string
  cancelEdit: string
  fieldTitle: string
  fieldPrice: string
  pricePlaceholder: string
  fieldLocation: string
  fieldDesc: string
  fieldWhatsapp: string
  saveContinue: string
  publishedDesc: string
  done: string

  // Buy search
  chatWelcome: string
  suggestions: string[]
  assistantTitle: string
  assistantSubtitle: string
  searching: string
  searchPlaceholder: string
  send: string
  resultsSearched: string
  resultsLatest: string
  unitCount: (n: number) => string
  loadMore: string
  replyNone: string
  replyFound: (count: number, query: string) => string

  // Property card
  finished: string
  semiFinished: string
  rooms: (n: number) => string
  areaUnit: string
  contactWhatsapp: string
  waMessage: (title: string, location: string, price: string) => string

  // Footer
  rights: string

  // Price formatting
  millionUnit: string
  currency: string
}

const ar: Dict = {
  dir: "rtl",

  brand: "Request Match",
  switchToArabic: "العربية",
  switchToEnglish: "English",
  languageLabel: "تغيير اللغة",

  sellTitle: "إضافة وحدة للبيع",
  sellSubtitle: "اعرض عقارك أمام آلاف المشترين",
  buyTitle: "البحث عن وحدة للشراء",
  buySubtitle: "صف مواصفات العقار المطلوب",
  sellPanelTitle: "بيانات الوحدة المعروضة للبيع",
  buyPanelTitle: "ابحث عن وحدتك المثالية",
  back: "رجوع",

  detailsLabel: "تفاصيل العقار",
  detailsPlaceholder: "شقة للبيع، 180 متر، 3 نوم و2 حمام، تشطيب سوبر لوكس، مطلوب 4.5 مليون",
  addressLabel: "العنوان بالتفصيل",
  addressPlaceholder: "مثال: القاهرة الجديدة - التجمع الخامس - حي الأندلس - شارع 15",
  mediaLabel: "الصور والفيديوهات والملفات",
  whatsappLabel: "رقم الواتساب للتواصل",
  whatsappPlaceholder: "مثال: 201000000000",
  whatsappHint: "سيظهر هذا الرقم كوسيلة تواصل مع المشترين عبر واتساب.",
  submitIdle: "معاينة الوحدة قبل النشر",
  submitLoading: "جاري تجهيز المعاينة...",
  errNoDetails: "من فضلك اكتب تفاصيل العقار أولًا",
  errNoWhatsapp: "من فضلك أدخل رقم الواتساب للتواصل",
  errBadWhatsapp: "من فضلك أدخل رقم واتساب صحيح",
  publishError: "تعذّر نشر الوحدة، تأكد من اتصالك وحاول مرة أخرى.",
  publishSuccess: "تم نشر وحدتك بنجاح!",

  mediaProcessing: "جاري معالجة الملفات...",
  mediaDropHere: "اسحب وأفلت الملفات هنا",
  mediaOrClick: "أو اضغط للاختيار — صور، فيديوهات، وملفات (يتم ضغط الصور تلقائيًا)",
  mediaRemove: (name) => `إزالة ${name}`,

  previewBadge: "معاينة مسودة العقار",
  publishedBadge: "تم النشر بنجاح",
  dialogLabel: "معاينة مسودة العقار",
  close: "إغلاق",
  coverAlt: "صورة غلاف العقار",
  coverBadge: "صورة الغلاف",
  chooseCover: "اختر صورة الغلاف",
  setCover: (i) => `تعيين الصورة ${i} كغلاف`,
  imageAlt: (i) => `صورة العقار ${i}`,
  coverShort: "الغلاف",
  contactLabel: "رقم التواصل (واتساب)",
  publishing: "جاري النشر...",
  publishNow: "التفاصيل صحيحة - انشر الآن",
  wantEdit: "أرغب في التعديل",
  editTitle: "تعديل بيانات العقار",
  cancelEdit: "إلغاء التعديل",
  fieldTitle: "عنوان العقار",
  fieldPrice: "السعر",
  pricePlaceholder: "مثال: 4.5 مليون جنيه",
  fieldLocation: "الموقع",
  fieldDesc: "الوصف",
  fieldWhatsapp: "رقم الواتساب للتواصل",
  saveContinue: "حفظ ومتابعة المعاينة",
  publishedDesc: "أصبحت وحدتك الآن معروضة أمام آلاف المشترين المهتمين. سنخطرك فور وصول أي طلب تواصل.",
  done: "تم",

  chatWelcome:
    "أهلاً بك! أنا مساعد البحث الذكي. صف لي العقار الذي تبحث عنه بلغتك الطبيعية — النوع، المنطقة، الميزانية، وحالة التشطيب.",
  suggestions: [
    "فيلا في التجمع متشطبة حوالي 25 مليون",
    "شقة في الشيخ زايد ميزانية 4 مليون",
    "شاليه على البحر في الساحل الشمالي",
    "دوبلكس بحديقة نص تشطيب",
  ],
  assistantTitle: "مساعد البحث الذكي",
  assistantSubtitle: "اكتب طلبك كما تتحدث تمامًا",
  searching: "جاري البحث عن أفضل المطابقات...",
  searchPlaceholder: "مثال: عايز فيلا في التجمع متشطبة رينج 25 مليون",
  send: "إرسال",
  resultsSearched: "نتائج مطابقة لطلبك",
  resultsLatest: "أحدث الوحدات المتاحة",
  unitCount: (n) => `${n} وحدة`,
  loadMore: "تحميل المزيد",
  replyNone: "لم أجد وحدات مطابقة تمامًا، لكن إليك أقرب العروض المتاحة. جرّب توسيع الميزانية أو تغيير المنطقة.",
  replyFound: (count, query) =>
    `وجدت ${count} وحدة تناسب طلبك "${query}". يمكنك تصفح النتائج بالأسفل والتواصل مباشرة عبر واتساب.`,

  finished: "متشطب",
  semiFinished: "نصف تشطيب",
  rooms: (n) => `${n} غرف`,
  areaUnit: "م²",
  contactWhatsapp: "تواصل عبر واتساب",
  waMessage: (title, location, price) => `مرحبًا، أنا مهتم بـ ${title} في ${location} (${price}).`,

  rights: "جميع الحقوق محفوظة",

  millionUnit: "مليون جنيه",
  currency: "جنيه",
}

const en: Dict = {
  dir: "ltr",

  brand: "Request Match",
  switchToArabic: "العربية",
  switchToEnglish: "English",
  languageLabel: "Change language",

  sellTitle: "List a unit for sale",
  sellSubtitle: "Showcase your property to thousands of buyers",
  buyTitle: "Search for a unit to buy",
  buySubtitle: "Describe the property you're looking for",
  sellPanelTitle: "Details of the unit for sale",
  buyPanelTitle: "Find your ideal unit",
  back: "Back",

  detailsLabel: "Property details",
  detailsPlaceholder:
    "Apartment for sale, 180 m², 3 beds and 2 baths, super lux finishing, asking 4.5 million",
  addressLabel: "Full address",
  addressPlaceholder: "e.g. New Cairo - Fifth Settlement - Andalus District - Street 15",
  mediaLabel: "Photos, videos & files",
  whatsappLabel: "WhatsApp contact number",
  whatsappPlaceholder: "e.g. 201000000000",
  whatsappHint: "This number will be shown to buyers as the WhatsApp contact.",
  submitIdle: "Preview unit before publishing",
  submitLoading: "Preparing preview...",
  errNoDetails: "Please enter the property details first",
  errNoWhatsapp: "Please enter a WhatsApp contact number",
  errBadWhatsapp: "Please enter a valid WhatsApp number",
  publishError: "Couldn't publish the unit. Check your connection and try again.",
  publishSuccess: "Your unit has been published successfully!",

  mediaProcessing: "Processing files...",
  mediaDropHere: "Drag and drop files here",
  mediaOrClick: "or click to select — images, videos, and files (images are compressed automatically)",
  mediaRemove: (name) => `Remove ${name}`,

  previewBadge: "Property draft preview",
  publishedBadge: "Published successfully",
  dialogLabel: "Property draft preview",
  close: "Close",
  coverAlt: "Property cover image",
  coverBadge: "Cover image",
  chooseCover: "Choose cover image",
  setCover: (i) => `Set image ${i} as cover`,
  imageAlt: (i) => `Property image ${i}`,
  coverShort: "Cover",
  contactLabel: "Contact number (WhatsApp)",
  publishing: "Publishing...",
  publishNow: "Details are correct — publish now",
  wantEdit: "I want to edit",
  editTitle: "Edit property details",
  cancelEdit: "Cancel editing",
  fieldTitle: "Property title",
  fieldPrice: "Price",
  pricePlaceholder: "e.g. 4.5 million EGP",
  fieldLocation: "Location",
  fieldDesc: "Description",
  fieldWhatsapp: "WhatsApp contact number",
  saveContinue: "Save and continue preview",
  publishedDesc:
    "Your unit is now visible to thousands of interested buyers. We'll notify you as soon as a contact request arrives.",
  done: "Done",

  chatWelcome:
    "Welcome! I'm your smart search assistant. Describe the property you're looking for in your own words — type, area, budget, and finishing status.",
  suggestions: [
    "Villa in Tagamoa, finished, around 25 million",
    "Apartment in Sheikh Zayed, budget 4 million",
    "Chalet by the sea in the North Coast",
    "Duplex with a garden, semi-finished",
  ],
  assistantTitle: "Smart Search Assistant",
  assistantSubtitle: "Type your request just as you'd say it",
  searching: "Searching for the best matches...",
  searchPlaceholder: "e.g. I want a finished villa in Tagamoa around 25 million",
  send: "Send",
  resultsSearched: "Results matching your request",
  resultsLatest: "Latest available units",
  unitCount: (n) => `${n} ${n === 1 ? "unit" : "units"}`,
  loadMore: "Load more",
  replyNone:
    "I couldn't find an exact match, but here are the closest available options. Try widening your budget or changing the area.",
  replyFound: (count, query) =>
    `I found ${count} ${count === 1 ? "unit" : "units"} matching your request "${query}". Browse the results below and contact sellers directly via WhatsApp.`,

  finished: "Finished",
  semiFinished: "Semi-finished",
  rooms: (n) => `${n} ${n === 1 ? "room" : "rooms"}`,
  areaUnit: "m²",
  contactWhatsapp: "Contact via WhatsApp",
  waMessage: (title, location, price) => `Hi, I'm interested in ${title} in ${location} (${price}).`,

  rights: "All rights reserved",

  millionUnit: "million EGP",
  currency: "EGP",
}

const DICTS: Record<Lang, Dict> = { ar, en }

const STORAGE_KEY = "request-match-lang"

type LanguageContextValue = {
  lang: Lang
  dir: "rtl" | "ltr"
  t: Dict
  setLang: (lang: Lang) => void
  toggle: () => void
}

const LanguageContext = createContext<LanguageContextValue | null>(null)

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider")
  return ctx
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("ar")

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as Lang | null
    if (stored === "ar" || stored === "en") setLangState(stored)
  }, [])

  useEffect(() => {
    const dir = DICTS[lang].dir
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    window.localStorage.setItem(STORAGE_KEY, lang)
  }, [lang])

  const setLang = useCallback((next: Lang) => setLangState(next), [])
  const toggle = useCallback(() => setLangState((prev) => (prev === "ar" ? "en" : "ar")), [])

  const value = useMemo<LanguageContextValue>(
    () => ({ lang, dir: DICTS[lang].dir, t: DICTS[lang], setLang, toggle }),
    [lang, setLang, toggle],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
