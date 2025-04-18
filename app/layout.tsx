import './globals.css'
import type { Metadata } from 'next'
// import { Inter } from 'next/font/google'
// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OOTD Rate by AI',
  description: 'AI-powered outfit rating platform',
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      {/* 移除 inter.className */}
      <body className="">{children}</body>
    </html>
  )
} 