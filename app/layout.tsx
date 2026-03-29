import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import SupabaseProvider from '@/components/providers/supabase-provider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AuraOS - Personal Operating System',
  description: 'A futuristic, minimalist productivity hub with Glassmorphism aesthetic',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <SupabaseProvider>
          {children}
        </SupabaseProvider>
      </body>
    </html>
  )
}
