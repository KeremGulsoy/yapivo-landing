'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const sectionsRef = useRef<HTMLElement[]>([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
        }
      })
    }, { threshold: 0.1 })

    sectionsRef.current.forEach((section) => {
      if (section) observer.observe(section)
    })

    return () => observer.disconnect()
  }, [])

  return (
    <>
      {/* Header / Navigation */}
      <header className="fixed top-0 w-full bg-yapivo-cream/80 backdrop-blur z-50 border-b border-gray-200">
        <nav className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-yapivo-dark rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                <line x1="8" y1="8" x2="20" y2="22" stroke="#F8F7F4" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="32" y1="8" x2="20" y2="22" stroke="#E8870A" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="20" y1="22" x2="20" y2="36" stroke="#F8F7F4" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="15" y="26" width="3" height="3" fill="#E8870A" rx="0.5" />
                <rect x="22" y="26" width="3" height="3" fill="#E8870A" rx="0.5" />
              </svg>
            </div>
            <span className="text-xl font-bold">
              <span className="text-yapivo-dark">yap</span>
              <span className="text-yapivo-amber">ivo</span>
            </span>
          </div>

          {/* Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#ozellikler" className="text-sm font-medium hover:text-yapivo-amber transition">Özellikler</a>
            <a href="#fiyatlar" className="text-sm font-medium hover:text-yapivo-amber transition">Fiyatlar</a>
            <a href="#iletisim" className="text-sm font-medium hover:text-yapivo-amber transition">Hakkımızda</a>
          </div>

          {/* CTA */}
          <button className="bg-yapivo-amber hover:bg-opacity-90 text-yapivo-dark font-bold px-6 py-2 rounded-lg transition">
            Başla
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-yapivo-cream via-yapivo-cream to-blue-50 min-h-screen flex items-center">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left: Text */}
            <div className="fade-in-up">
              <div className="inline-block bg-yapivo-amber/10 border border-yapivo-amber/30 rounded-lg px-4 py-2 mb-6">
                <p className="text-sm font-semibold text-yapivo-amber">✨ Yeni Başlayanlar için Ücretsiz</p>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-900 leading-tight mb-6">
                İnşaatınızın
                <span className="block text-yapivo-amber">Dijital Defteri</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg">
                Proje yönetimi, masraf takibi, finans kontrolü. Müteahhitler için tasarlanan, kullanması kolay çözüm.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="bg-yapivo-amber hover:bg-opacity-90 text-yapivo-dark font-bold px-8 py-4 rounded-lg transition transform hover:scale-105">
                  14 Gün Ücretsiz Dene →
                </button>
                <button className="border-2 border-yapivo-dark text-yapivo-dark font-bold px-8 py-4 rounded-lg hover:bg-yapivo-dark/5 transition">
                  Tanıtım İzle
                </button>
              </div>

              <p className="text-sm text-gray-500">Hiç Kart Gerekmez. 14 gün sonra iptal et.</p>
            </div>

            {/* Right: Visual */}
            <div className="slide-in-left relative hidden md:block">
              <div className="bg-yapivo-dark rounded-2xl p-8 shadow-2xl">
                <div className="bg-yapivo-blue rounded-lg p-6 mb-4">
                  <div className="h-6 bg-white/10 rounded mb-3 w-2/3"></div>
                  <div className="h-4 bg-white/5 rounded mb-2 w-1/2"></div>
                  <div className="h-4 bg-white/5 rounded w-3/4"></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 h-24"></div>
                  <div className="bg-white/5 rounded-lg p-4 h-24"></div>
                  <div className="bg-yapivo-amber/20 rounded-lg p-4 h-24"></div>
                  <div className="bg-white/5 rounded-lg p-4 h-24"></div>
                </div>
              </div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yapivo-amber/10 rounded-full blur-3xl"></div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-20 pt-12 border-t border-gray-300">
            <div>
              <p className="text-3xl font-bold text-yapivo-amber">500+</p>
              <p className="text-sm text-gray-600 mt-2">İnşaat Şirketi</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yapivo-amber">₺1B+</p>
              <p className="text-sm text-gray-600 mt-2">Yönetilen Bütçe</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yapivo-amber">99.9%</p>
              <p className="text-sm text-gray-600 mt-2">Sistem Çalışma Süresi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        id="ozellikler"
        ref={(el) => el && sectionsRef.current.push(el)}
        className="py-20 px-6 bg-white scroll-fade"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-900 mb-4">Ne Sunuyoruz?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              İnşaat sektörünün ihtiyaç duyduğu her şey. Basit, etkili, kullanımı kolay.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-yapivo-cream rounded-xl p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-yapivo-amber/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yapivo-amber" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Proje Yönetimi</h3>
              <p className="text-gray-600">Projelerinizi organize edin, ilerlemeyi takip edin, tahminleri yapın.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-yapivo-cream rounded-xl p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-yapivo-amber/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yapivo-amber" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Masraf Takibi</h3>
              <p className="text-gray-600">Her maliyeti kaydedin, kategoriyle düzenleyin, bütçeyi kontrol edin.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-yapivo-cream rounded-xl p-8 border border-gray-200 hover:shadow-lg transition">
              <div className="w-12 h-12 bg-yapivo-amber/20 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-yapivo-amber" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zm-5.04-6.71l-2.75 3.54-2.96-3.83c-.3-.39-.92-.39-1.22 0-.3.39-.3 1.02 0 1.41l2.5 3.22c. 1.21.59 1.21 0l3.54-4.6c.29-.39.29-1.02 0-1.41-.3-.4-.93-.39-1.23.01z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Finansal Kontrol</h3>
              <p className="text-gray-600">Banka hesaplarını bağlayın, nakit akışını izleyin, raporlar alın.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section 
        id="fiyatlar"
        ref={(el) => el && sectionsRef.current.push(el)}
        className="py-20 px-6 bg-yapivo-dark text-white scroll-fade"
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-900 mb-4">Basit Fiyatlandırma</h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              İhtiyacınıza göre seçin. Hiçbir gizli ücret. İstediğiniz zaman iptal edin.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Plan 1 */}
            <div className="bg-yapivo-blue rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Başlangıç</h3>
              <p className="text-sm text-gray-300 mb-6">Küçük projeler için</p>
              <div className="mb-6">
                <span className="text-4xl font-900">₺399</span>
                <span className="text-sm text-gray-300">/ay</span>
              </div>
              <button className="w-full bg-yapivo-amber text-yapivo-dark font-bold py-3 rounded-lg hover:bg-opacity-90 transition mb-8">
                Başla
              </button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>2 kullanıcı</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>5 proje</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>Masraf Takibi</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-gray-500">✗</span>
                  <span className="text-gray-500">Finans Modülü</span>
                </li>
              </ul>
            </div>

            {/* Plan 2 - Featured */}
            <div className="bg-yapivo-amber text-yapivo-dark rounded-xl p-8 border-2 border-yapivo-amber transform scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-yapivo-amber px-4 py-1 rounded-full text-sm font-bold">
                En Popüler
              </div>
              <h3 className="text-xl font-bold mb-2">Profesyonel</h3>
              <p className="text-sm text-opacity-75 mb-6">Büyüyen işletmeler için</p>
              <div className="mb-6">
                <span className="text-4xl font-900">₺899</span>
                <span className="text-sm text-opacity-75">/ay</span>
              </div>
              <button className="w-full bg-yapivo-dark text-white font-bold py-3 rounded-lg hover:bg-opacity-90 transition mb-8">
                Başla
              </button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-dark">✓</span>
                  <span>5 kullanıcı</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-dark">✓</span>
                  <span>Sınırsız proje</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-dark">✓</span>
                  <span>Finans Modülü</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-dark">✓</span>
                  <span>Hakediş Yönetimi</span>
                </li>
              </ul>
            </div>

            {/* Plan 3 */}
            <div className="bg-yapivo-blue rounded-xl p-8 border border-white/10">
              <h3 className="text-xl font-bold mb-2">Kurumsal</h3>
              <p className="text-sm text-gray-300 mb-6">Büyük organizasyonlar</p>
              <div className="mb-6">
                <span className="text-4xl font-900">₺1999</span>
                <span className="text-sm text-gray-300">/ay</span>
              </div>
              <button className="w-full bg-yapivo-amber text-yapivo-dark font-bold py-3 rounded-lg hover:bg-opacity-90 transition mb-8">
                İletişime Geç
              </button>
              <ul className="space-y-4">
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>15+ kullanıcı</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>Tüm özellikler</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>API erişimi</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-yapivo-amber">✓</span>
                  <span>Öncelikli destek</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-900 mb-6">Hazır mısınız?</h2>
          <p className="text-xl text-gray-600 mb-10">
            14 gün ücretsiz. Kredi kartı gerekmez. Şimdi başlayın.
          </p>
          <button className="bg-yapivo-amber hover:bg-opacity-90 text-yapivo-dark font-bold px-10 py-4 rounded-lg transition transform hover:scale-105 text-lg">
            Ücretsiz Denemeye Başla →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="iletisim" className="bg-yapivo-dark text-white py-12 px-6 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-yapivo-amber rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 40 40" fill="none">
                    <line x1="8" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="32" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="20" y1="22" x2="20" y2="36" stroke="#1B2E5E" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <span className="text-lg font-bold">
                  <span>yap</span>
                  <span className="text-yapivo-amber">ivo</span>
                </span>
              </div>
              <p className="text-sm text-gray-400">İnşaatınızın dijital defteri.</p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Ürün</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-yapivo-amber transition">Özellikler</a></li>
                <li><a href="#" className="hover:text-yapivo-amber transition">Fiyatlar</a></li>
                <li><a href="#" className="hover:text-yapivo-amber transition">Güvenlik</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Şirket</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-yapivo-amber transition">Hakkımızda</a></li>
                <li><a href="#" className="hover:text-yapivo-amber transition">Blog</a></li>
                <li><a href="#" className="hover:text-yapivo-amber transition">Kariyer</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">İletişim</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="mailto:hello@yapivo.com.tr" className="hover:text-yapivo-amber transition">hello@yapivo.com.tr</a></li>
                <li><a href="#" className="hover:text-yapivo-amber transition">Twitter</a></li>
                <li><a href="#" className="hover:text-yapivo-amber transition">LinkedIn</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
              <p>© 2025 Yapivo. Tüm hakları saklıdır.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-yapivo-amber transition">Gizlilik</a>
                <a href="#" className="hover:text-yapivo-amber transition">Şartlar</a>
                <a href="#" className="hover:text-yapivo-amber transition">Çerez Politikası</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
