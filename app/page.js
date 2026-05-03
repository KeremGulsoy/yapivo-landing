'use client'

import { useEffect, useRef, useState } from 'react'
import { LogoIcon } from './dashboard/shared'
import SplashScreen from './components/SplashScreen'

const C = {
  dark: '#1B2E5E',
  amber: '#E8870A',
  cream: '#F8F7F4',
  cream2: '#F0EEE9',
  border: '#E5E0D8',
  text2: '#5F5E5A',
  text3: '#888780',
}

// --- ŞIK SVG İKONLAR (Emojiler yerine) ---
const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
)
const FeatureIcon1 = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
)
const FeatureIcon2 = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
)
const FeatureIcon3 = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
)
const MenuIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
)
const CloseIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.dark} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
)

export default function Home() {
  const [isYearly, setIsYearly] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Kaydırma animasyonları için Gözlemci (Observer)
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.1 })

    document.querySelectorAll('.fade-up').forEach(el => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const navLinks = [
    { name: 'Özellikler', href: '#features' },
    { name: 'Nasıl Çalışır?', href: '#how-it-works' },
    { name: 'Fiyatlandırma', href: '#pricing' },
  ]

  return (
    <>
      <SplashScreen />

      {/* --- NAVBAR --- */}
      <header style={{ position: 'fixed', top: 0, width: '100%', background: 'rgba(248,247,244,0.9)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
            <LogoIcon size={32} variant="dark" />
            <span style={{ fontSize: '24px', fontWeight: '900', color: C.dark }}>yap<span style={{ color: C.amber }}>ivo</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-only" style={{ alignItems: 'center', gap: '32px' }}>
            {navLinks.map(link => (
              <a key={link.name} href={link.href} style={{ color: C.text2, textDecoration: 'none', fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = C.amber} onMouseLeave={e => e.target.style.color = C.text2}>
                {link.name}
              </a>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <a href="/login" style={{ color: C.dark, textDecoration: 'none', fontWeight: '700', fontSize: '15px' }}>Giriş Yap</a>
              <a href="/login" style={{ background: C.dark, color: C.cream, padding: '10px 20px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600', fontSize: '15px', transition: 'transform 0.2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>Ücretsiz Başla</a>
            </div>
          </nav>

          {/* Mobile Nav Button */}
          <button className="mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-only" style={{ flexDirection: 'column', background: C.cream, borderBottom: `1px solid ${C.border}`, padding: '16px 24px', gap: '16px', position: 'absolute', width: '100%', boxShadow: '0 10px 20px rgba(0,0,0,0.05)' }}>
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} style={{ color: C.dark, textDecoration: 'none', fontWeight: '600', fontSize: '18px', padding: '8px 0', borderBottom: `1px solid ${C.border}` }}>{link.name}</a>
            ))}
            <a href="/login" style={{ color: C.dark, textDecoration: 'none', fontWeight: '700', fontSize: '18px', padding: '8px 0' }}>Giriş Yap</a>
            <a href="/login" style={{ background: C.amber, color: C.dark, padding: '12px', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', textAlign: 'center', marginTop: '8px' }}>Ücretsiz Başla</a>
          </div>
        )}
      </header>

      <main style={{ paddingTop: '80px' }}>
        
        {/* --- HERO SECTION --- */}
        <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '48px', minHeight: '85vh' }}>
          
          {/* Sol: Metinler */}
          <div className="fade-up" style={{ flex: '1 1 500px' }}>
            <div style={{ display: 'inline-block', padding: '6px 12px', background: 'rgba(232,135,10,0.1)', color: C.amber, borderRadius: '20px', fontSize: '13px', fontWeight: '700', marginBottom: '24px' }}>
              YENİ: Akıllı Şantiye Dönemi Başladı
            </div>
            <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', color: C.dark, lineHeight: '1.1', marginBottom: '24px', letterSpacing: '-1px' }}>
              İnşaatçının Dilini Konuşan <span style={{ color: C.amber }}>Yazılım.</span>
            </h1>
            <p style={{ fontSize: '18px', color: C.text2, lineHeight: '1.6', marginBottom: '40px', maxWidth: '480px' }}>
              Şantiyenizi ve ofisinizi tek bir ekrandan yönetin. Çek takibi, taşeron hakedişleri ve proje bazlı kar/zarar analizleriyle karmaşaya son verin.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
              <a href="/login" style={{ background: C.amber, color: C.dark, padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '800', fontSize: '16px', transition: 'transform 0.2s', display: 'inline-block' }} onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'} onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>14 Gün Ücretsiz Dene →</a>
              <a href="#how-it-works" style={{ background: C.cream2, color: C.dark, padding: '16px 32px', borderRadius: '12px', textDecoration: 'none', fontWeight: '700', fontSize: '16px', display: 'inline-block' }}>Nasıl Çalışır?</a>
            </div>
          </div>

          {/* Sağ: Mockup (Uygulama İçi Görseli Temsil Eden CSS Çizimi) */}
          <div className="fade-up" style={{ flex: '1 1 400px', position: 'relative' }}>
            <div style={{ background: '#fff', borderRadius: '20px', boxShadow: '0 24px 48px rgba(27,46,94,0.15)', overflow: 'hidden', border: `1px solid ${C.border}`, transform: 'perspective(1000px) rotateY(-5deg) rotateX(5deg)', transition: 'transform 0.5s' }} onMouseEnter={e => e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)'} onMouseLeave={e => e.currentTarget.style.transform = 'perspective(1000px) rotateY(-5deg) rotateX(5deg)'}>
              {/* Mockup Header */}
              <div style={{ background: C.dark, padding: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#10B981' }} />
                <div style={{ marginLeft: '16px', fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: '600' }}>yapivo.com/dashboard</div>
              </div>
              {/* Mockup Body */}
              <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: C.cream }}>
                <div style={{ display: 'flex', gap: '16px' }}>
                  <div style={{ flex: 1, background: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '12px', color: C.text3, fontWeight: '600' }}>Bekleyen Tahsilat</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: C.dark, marginTop: '4px' }}>₺ 1.250.000</div>
                  </div>
                  <div style={{ flex: 1, background: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: '12px', color: C.text3, fontWeight: '600' }}>Ödenecek Çekler</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#EF4444', marginTop: '4px' }}>₺ 450.000</div>
                  </div>
                </div>
                <div style={{ background: '#fff', padding: '16px', borderRadius: '12px', border: `1px solid ${C.border}`, height: '120px', display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
                  {/* Sahte Grafik Çubukları */}
                  {[40, 70, 45, 90, 65, 80].map((h, i) => (
                    <div key={i} style={{ flex: 1, height: `${h}%`, background: i === 3 ? C.amber : C.cream2, borderRadius: '4px 4px 0 0' }} />
                  ))}
                </div>
              </div>
            </div>
            {/* Arka plan süsü */}
            <div style={{ position: 'absolute', top: '-20px', right: '-20px', width: '100px', height: '100px', background: `radial-gradient(circle, ${C.amber} 0%, transparent 70%)`, opacity: 0.2, zIndex: -1, filter: 'blur(20px)' }} />
          </div>
        </section>

        {/* --- ÖZELLİKLER (FEATURES) --- */}
        <section id="features" style={{ background: C.cream2, padding: '100px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="fade-up" style={{ textAlign: 'center', marginBottom: '64px' }}>
              <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '800', color: C.dark, marginBottom: '16px' }}>Excel'i Unutun. Kontrolü Elinize Alın.</h2>
              <p style={{ fontSize: '16px', color: C.text2, maxWidth: '600px', margin: '0 auto' }}>Sektörün dinamiklerine özel geliştirilmiş araçlarla hata payını sıfıra indirin.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {[
                { icon: <FeatureIcon1 />, title: 'Kasa & Banka Senkronizasyonu', desc: 'Birden fazla firmanın veya şantiyenin kasasını tek ekranda anlık takip edin.' },
                { icon: <FeatureIcon2 />, title: 'Gelişmiş Çek & Senet', desc: 'Portföydeki, cirolanan veya tahsil edilen çekleri vadeleriyle birlikte kusursuz yönetin.' },
                { icon: <FeatureIcon3 />, title: 'Otomatik Hakediş Hesabı', desc: 'Taşeronların gerçekleştirdiği imalatları sisteme girin, hakediş raporları otomatik dökülsün.' }
              ].map((f, i) => (
                <div key={i} className="fade-up" style={{ background: C.cream, padding: '32px', borderRadius: '16px', border: `1px solid ${C.border}`, transition: 'transform 0.3s, boxShadow 0.3s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.05)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div style={{ width: '56px', height: '56px', background: 'rgba(232,135,10,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                    {f.icon}
                  </div>
                  <h3 style={{ fontSize: '20px', fontWeight: '700', color: C.dark, marginBottom: '12px' }}>{f.title}</h3>
                  <p style={{ color: C.text2, fontSize: '15px', lineHeight: '1.6' }}>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* --- NEDEN YAPİVO? --- */}
        <section id="how-it-works" style={{ padding: '100px 24px', background: C.dark, color: C.cream, position: 'relative', overflow: 'hidden' }}>
          {/* Arkaplan Deseni */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.03, backgroundImage: 'radial-gradient(circle, #E8870A 1px, transparent 1px)', backgroundSize: '32px 32px' }}/>
          
          <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '64px', position: 'relative', zIndex: 1 }}>
            <div className="fade-up" style={{ flex: '1 1 400px' }}>
              <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '800', marginBottom: '24px' }}>Neden Sıradan Bir Muhasebe Programı Değil?</h2>
              <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {[
                  { title: 'Şantiye Odaklı Mimari', desc: 'Standart programlar "Fatura" keser. Yapivo ise "Proje, Şantiye, Hakediş" mantığıyla çalışır.' },
                  { title: 'Mobil Uyumlu Saha Yönetimi', desc: 'Şantiye şefiniz cepten masraf girsin, siz ofisten tek tıkla onaylayın.' },
                  { title: 'Gerçek Zamanlı Kar/Zarar', desc: 'Projenin neresinde zarar ettiğinizi iş bitmeden önce görün, müdahale edin.' }
                ].map((item, i) => (
                  <li key={i} style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ marginTop: '4px' }}><CheckIcon /></div>
                    <div>
                      <h4 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>{item.title}</h4>
                      <p style={{ color: 'rgba(248,247,244,0.6)', fontSize: '15px', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Metin Yanı Süslü Bilgi Kartı */}
            <div className="fade-up" style={{ flex: '1 1 400px', background: 'rgba(248,247,244,0.05)', border: '1px solid rgba(248,247,244,0.1)', borderRadius: '24px', padding: '40px', textAlign: 'center' }}>
               <div style={{ fontSize: '64px', fontWeight: '900', color: C.amber, lineHeight: '1' }}>%40</div>
               <div style={{ fontSize: '20px', fontWeight: '700', marginTop: '12px', marginBottom: '16px' }}>Zaman Tasarrufu</div>
               <p style={{ color: 'rgba(248,247,244,0.6)', fontSize: '15px' }}>Yapivo kullanan firmalar, haftalık finansal mutabakat ve hakediş süreçlerinde harcadıkları zamanı ortalama %40 oranında azaltıyor.</p>
            </div>
          </div>
        </section>

        {/* --- FIYATLANDIRMA (PRICING) --- */}
        <section id="pricing" style={{ padding: '100px 24px', background: C.cream }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div className="fade-up" style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 className="section-title" style={{ fontSize: '36px', fontWeight: '800', color: C.dark, marginBottom: '16px' }}>Şirketinizin Boyutuna Uygun Paketler</h2>
              <p style={{ fontSize: '16px', color: C.text2 }}>Gizli ücret yok, sürpriz yok. Sadece ihtiyacınız olan özelliklere ödeme yapın.</p>
            </div>

            {/* Aylık / Yıllık Geçiş Düğmesi (Toggle) */}
            <div className="fade-up" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '64px' }}>
              <span style={{ fontWeight: isYearly ? '500' : '800', color: isYearly ? C.text3 : C.dark, fontSize: '16px' }}>Aylık Ödeme</span>
              <div onClick={() => setIsYearly(!isYearly)} style={{ width: '64px', height: '34px', background: isYearly ? C.amber : C.dark, borderRadius: '20px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s' }}>
                <div style={{ position: 'absolute', top: '3px', left: isYearly ? '33px' : '3px', width: '28px', height: '28px', background: C.cream, borderRadius: '50%', transition: 'left 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
              </div>
              <span style={{ fontWeight: isYearly ? '800' : '500', color: isYearly ? C.dark : C.text3, fontSize: '16px' }}>
                Yıllık Ödeme <span style={{ background: 'rgba(232,135,10,0.15)', color: C.amber, padding: '2px 8px', borderRadius: '10px', fontSize: '12px', marginLeft: '4px' }}>2 Ay Bizden</span>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'center' }}>
              {[
                { 
                  name: 'Başlangıç', target: 'Küçük İşletmeler İçin', priceM: '999', priceY: '9.990', 
                  features: ['Cari ve Kasa Takibi', 'Gelir / Gider Yönetimi', '2 Kullanıcı Erişimi', 'Temel Raporlama', 'E-mail Desteği'] 
                },
                { 
                  name: 'Profesyonel', target: 'Taşeron ve Şantiyeler İçin', priceM: '2.499', priceY: '24.990', isPopular: true,
                  features: ['Başlangıç\'taki her şey', 'Çek ve Senet Takibi (Kritik)', 'Taşeron Hakedişleri', 'Proje Bazlı Kar/Zarar', '5 Kullanıcı Erişimi'] 
                },
                { 
                  name: 'Kurumsal', target: 'Büyük Yapı Firmaları İçin', priceM: '5.999', priceY: '59.990', 
                  features: ['Profesyonel\'deki her şey', 'Çoklu Şantiye Yönetimi', 'Banka Entegrasyonları', 'Sınırsız Kullanıcı', 'Özel Müşteri Temsilcisi'] 
                }
              ].map((plan, i) => (
                <div key={i} className="fade-up" style={{ 
                  background: plan.isPopular ? C.dark : '#fff', color: plan.isPopular ? C.cream : C.dark, 
                  padding: '40px 32px', borderRadius: '24px', position: 'relative',
                  border: plan.isPopular ? 'none' : `1px solid ${C.border}`,
                  boxShadow: plan.isPopular ? '0 24px 48px rgba(27,46,94,0.2)' : 'none',
                  transform: plan.isPopular ? 'scale(1.02)' : 'scale(1)', zIndex: plan.isPopular ? 2 : 1
                }}>
                  {plan.isPopular && (
                    <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: C.amber, color: C.dark, padding: '6px 16px', borderRadius: '20px', fontSize: '13px', fontWeight: '800', letterSpacing: '0.5px' }}>
                      EN ÇOK TERCİH EDİLEN
                    </div>
                  )}
                  <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{plan.name}</h3>
                  <p style={{ fontSize: '14px', color: plan.isPopular ? 'rgba(248,247,244,0.6)' : C.text3, marginBottom: '24px' }}>{plan.target}</p>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '32px' }}>
                    <span style={{ fontSize: '48px', fontWeight: '900', lineHeight: '1' }}>₺{isYearly ? plan.priceY : plan.priceM}</span>
                    <span style={{ fontSize: '16px', color: plan.isPopular ? 'rgba(248,247,244,0.6)' : C.text3, marginBottom: '6px' }}>/{isYearly ? 'yıl' : 'ay'}</span>
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {plan.features.map((f, j) => (
                      <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '500' }}>
                        <CheckIcon /> {f}
                      </li>
                    ))}
                  </ul>
                  <a href="/login" style={{ display: 'block', textAlign: 'center', background: plan.isPopular ? C.amber : C.cream2, color: C.dark, padding: '16px', borderRadius: '12px', textDecoration: 'none', fontWeight: '800', fontSize: '15px', transition: 'filter 0.2s' }} onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'} onMouseLeave={e => e.currentTarget.style.filter = 'brightness(1)'}>
                    Hemen Başla
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer style={{ background: '#fff', borderTop: `1px solid ${C.border}`, padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
          <div style={{ flex: '1 1 300px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <LogoIcon size={28} variant="dark" />
              <span style={{ fontSize: '20px', fontWeight: '900', color: C.dark }}>yap<span style={{ color: C.amber }}>ivo</span></span>
            </div>
            <p style={{ color: C.text3, fontSize: '14px', lineHeight: '1.6' }}>Müteahhitler, taşeronlar ve yapı firmaları için özel olarak tasarlanmış, bulut tabanlı yeni nesil inşaat finans ve yönetim platformu.</p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '48px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, marginBottom: '16px' }}>Ürün</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#features" style={{ color: C.text2, textDecoration: 'none', fontSize: '14px' }}>Özellikler</a>
                <a href="#pricing" style={{ color: C.text2, textDecoration: 'none', fontSize: '14px' }}>Fiyatlar</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, marginBottom: '16px' }}>İletişim</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ color: C.text2, fontSize: '14px' }}>destek@yapivo.com</span>
                <span style={{ color: C.text2, fontSize: '14px' }}>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: '1200px', margin: '48px auto 0 auto', paddingTop: '24px', borderTop: `1px solid ${C.border}`, textAlign: 'center', color: C.text3, fontSize: '13px' }}>
          © 2024 Yapivo Yazılım Teknolojileri. Tüm hakları saklıdır.
        </div>
      </footer>
    </>
  )
}