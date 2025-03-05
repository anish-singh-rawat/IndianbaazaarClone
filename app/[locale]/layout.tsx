import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import ClientProviders from '@/components/shared/client-providers'
import { getDirection } from '@/i18n-config'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { routing } from '@/i18n/routing'
import { notFound } from 'next/navigation'
import { getSetting } from '@/lib/actions/setting.actions'
import { cookies } from 'next/headers'
import ChatBot from '@/components/ChatBot/ChatBot'
import Script from 'next/script'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export async function generateMetadata() {
  const {
    site: { slogan, name, description, url },
  } = await getSetting()
  return {
    title: {
      template: `Indian Baazaar %s | ${name}`,
      default: `${name}. ${slogan}`,
    },
    description: `Discover top trends in fashion and lifestyle products at Indian Baazaar, also known as Indian Bazaar. Shop our exclusive collections of cosmetics, shoes, bags, toys, and clothing. || ${description}`,
    metadataBase: new URL(url),
    keywords: [
      'Indian Baazaar',
      'Indian Bazaar',
      'IndianBaazaar',
      'IndianBazaar',
      'Indianbazaar',
      'indianBazaar',
      'indianBazaar',
      'Indian Baazaar',
      'Indian Bazaar',
      'Indian bazaar',
      'indian Bazaar',
      'indian Baazaar',
      'e-commerce',
      'Online shopping',
      'internet shopping',
      'web shopping',
      'e-tailing',
      'online retailing',
      'web-based commerce',
      'electronic commerce',
      'digital commerce',
      'fashion',
      'beauty',
      'lifestyle',
      'cosmetics',
      'shoes',
      'bags',
      'toys',
      'clothing',
      'online shopping',
      'e-commerce',
      'style',
      'elegance',
      'play',
    ],
    viewport: 'width=device-width, initial-scale=1.0',
    openGraph: {
      title: 'Indian Baazaar: ultimate online destination for fashion, beauty, and lifestyle products',
      url: 'https://www.indianbaazaar.com/',
      description:
        'Indian Baazaar || Next Ecommerce is a sample Ecommerce website built with Next.js, Tailwind CSS, and MongoDB. Indian Baazaar, also known as Indian Bazaar, is your ultimate online destination for fashion, beauty, and lifestyle products. Explore a wide range of cosmetics, shoes, bags, toys, and clothing for women, men, and kids. (Indian Bazaar) | Style, Elegance, and Play - All in One Place!',
      type: 'website',
      images: [
        {
          url: 'https://www.indianbaazaar.com/icons/logo.svg',
          secureUrl: 'https://www.indianbaazaar.com/icons/logo.svg',
          width: 600,
          height: 315,
        },
      ],
    },
    icons: {
      icon: 'https://www.indianbaazaar.com/icons/logo.svg',
      shortcut: 'https://www.indianbaazaar.com/icons/logo.svg',
      apple: 'https://www.indianbaazaar.com/icons/logo.svg',
    },
  }
}

export default async function AppLayout({
  params,
  children,
}: {
  params: { locale: string }
  children: React.ReactNode
}) {
  const setting = await getSetting()
  const currencyCookie = (await cookies()).get('currency')
  const currency = currencyCookie ? currencyCookie.value : 'USD'

  const { locale } = await params
  if (!routing.locales.includes(locale)) {
    notFound()
  }
  const messages = await getMessages()

  return (
    <html
      lang={locale}
      dir={getDirection(locale) === 'rtl' ? 'rtl' : 'ltr'}
      suppressHydrationWarning
    >
      <body cz-shortcut-listen="true"
        className={`min-h-screen ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ClientProviders setting={{ ...setting, currency }}>
              {children}
            </ClientProviders>
          </NextIntlClientProvider>
          <div className="fixed bottom-10 right-5">
            <ChatBot />
          </div>
        </div>
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-13VDW9PYVP"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-13VDW9PYVP');
          `}
        </Script>
      </body>
    </html>
  )
}
