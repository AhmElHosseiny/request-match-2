import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Tajawal } from 'next/font/google'
import { LanguageProvider } from '@/lib/i18n'
import './globals.css'

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-tajawal',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ريكوست ماتش | Request Match - منصة العقارات الذكية',
  description:
    'ريكوست ماتش: أضف وحدتك للبيع أو ابحث عن العقار المناسب لك في ثوانٍ. منصة عقارية ذكية تربط البائعين بالمشترين.',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  themeColor: '#0F223D',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-sans antialiased">
        <LanguageProvider>{children}</LanguageProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
