import { SiteHeader } from "@/components/site-header"
import { RequestMatchApp } from "@/components/request-match-app"
import { ToastProvider } from "@/components/toast"
import { SiteFooter } from "@/components/site-footer"

export default function Page() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--color-bg-light)]">
        <SiteHeader />
        <main className="mx-auto max-w-3xl px-5 py-8 sm:py-12">
          <RequestMatchApp />
        </main>
        <SiteFooter />
      </div>
    </ToastProvider>
  )
}
