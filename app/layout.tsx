import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://claude-exam-guide.vercel.app";
const SITE_NAME = "Claude Exam Guide ID";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Lulus CCAR-F Pakai Bahasa Santai`,
    template: `%s · ${SITE_NAME}`,
  },
  description:
    "Panduan belajar Claude Certified Architect (Foundations) dalam Bahasa Indonesia santai: 5 domain, 30 modul, exam traps, concept check interaktif, exam simulator, dan cheat sheet.",
  keywords: [
    "Claude Certified Architect",
    "CCAR-F",
    "Anthropic certification",
    "belajar Claude Code",
    "exam guide bahasa indonesia",
  ],
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Claude Exam Guide ID — Lulus CCAR-F Pakai Bahasa Santai",
    description:
      "5 domain · 30 modul · exam traps + kuis interaktif + exam simulator + cheat sheet. Dijelaskan pakai bahasa anak tongkrongan.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Claude Exam Guide ID",
    description: "Lulus Claude Certified Architect (Foundations) dengan bahasa santai.",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7ff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0916" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID;

  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        {/* Google Fonts via <link>: nggak ada dependency jaringan saat build. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Nunito:wght@700;800;900&family=JetBrains+Mono:wght@400;600&display=swap"
          rel="stylesheet"
        />
        {/* dark mode boot: baca preferensi sebelum paint biar nggak flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('ccar-theme');var d=t?t==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.classList.add('dark');}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-sans">
        {gtmId && (
          <Script id="gtm" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
          </Script>
        )}
        {gaId && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
            <Script id="ga4" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}');`}
            </Script>
          </>
        )}
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
