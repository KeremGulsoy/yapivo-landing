import { Outfit } from 'next/font/google'
import './globals.css'

// Outfit fontunu tüm kalınlıklarıyla projeye dahil ediyoruz
const outfit = Outfit({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-outfit', // CSS değişkeni olarak da tanımlıyoruz
})

export const metadata = {
  title: 'Yapivo | İnşaatınızın Dijital Defteri',
  description: 'Müteahhitler için tasarlanmış proje, finans ve şantiye yönetim sistemi.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr" className={outfit.variable}>
      {/* className={outfit.className} sayesinde altındaki TÜM sayfalara bu font miras kalır */}
      <body className={outfit.className}>
        {children}
      </body>
    </html>
  )
}