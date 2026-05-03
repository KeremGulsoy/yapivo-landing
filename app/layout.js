import { Outfit } from 'next/font/google'
import SplashScreen from './components/SplashScreen'
import './globals.css'

const outfit = Outfit({ subsets: ['latin'], weight: ['300','400','500','600','700','800','900'] })

export const metadata = {
  title: 'Yapivo — İnşaatınızın Dijital Defteri',
  description: 'Müteahhitler için proje ve finans yönetim platformu',
  icons: { icon: '/icon.svg', apple: '/icon.svg' },
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body className={outfit.className}>
        <SplashScreen />
        {children}
      </body>
    </html>
  )
}