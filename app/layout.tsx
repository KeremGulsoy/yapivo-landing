import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Yapivo — İnşaatınızın Dijital Defteri',
  description: 'Proje yönetimi, masraf takibi, finans kontrolü. İnşaat şirketleri için dijital çözüm.',
  keywords: 'yapı yönetimi, inşaat projesi, masraf takibi, harita programı',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body className="bg-yapivo-cream text-yapivo-dark">
        {children}
      </body>
    </html>
  )
}