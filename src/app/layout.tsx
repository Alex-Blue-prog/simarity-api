import '@/styles/globals.css'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import { cn } from '@/lib/utils'
import { Toaster } from '@/components/ui/Toast';
import Navbar from '@/components/Navbar'
import MobileMenu from '@/components/MobilieMenu'

const inter = Inter({ subsets: ['latin'] })

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Similarity API | Home',
  description: 'Free & open-source text similarity API',
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang='en' suppressHydrationWarning className={cn('bg-white text-slate-900 antialiased', inter.className)}>
        <body className={'min-h-screen bg-slate-50 dark:bg-slate-900 antialiased'}>
          <Providers>
            <Toaster position='bottom-right' />
            
            <Navbar />
            <MobileMenu />
            {children}

            {/* Allow more height on mobile devices */}
            <div className='h-40 md:hidden' />
          </Providers>
        </body>
    </html>
  )
}
