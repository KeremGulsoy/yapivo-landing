import './globals.css'

export const metadata = {
  title: 'Yapivo — İnşaatınızın Dijital Defteri',
  description: 'Proje yönetimi, masraf takibi, finans kontrolü.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="tr">
      <body>
        {children}
      </body>
    </html>
  )
}