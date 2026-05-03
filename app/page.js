'use client'

import { useState } from 'react'
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

// Şık SVG İkonlar
const CheckIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
const FeatureIcon1 = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
const FeatureIcon2 = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
const FeatureIcon3 = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.amber} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
const MenuIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.cream} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
const CloseIcon = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={C.cream} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>

export default function Home() {
  const [isYearly, setIsYearly] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Özellikler', href: '#features' },
    { name: 'Nasıl Çalışır?', href: '#how-it-works' },
    { name: 'Fiyatlandırma', href: '#pricing' },
  ]

  return (
    <>
      <SplashScreen />

      {/* --- NAVBAR (KOYU ARKA PLAN) --- */}
      <header style={{ position: 'fixed', top: 0, width: '100%', background: C.dark, borderBottom: `1px solid rgba(255,255,255,0.1)`, zIndex: 100 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo - Çerçeveli */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => window.scrollTo(0,0)}>
            <div style={{ width: '38px', height: '38px', border: `2px solid ${C.amber}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogoIcon size={24} variant="light" />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '900', color: C.cream }}>yap<span style={{ color: C.amber }}>ivo</span></span>
          </div>

          {/* Desktop Nav */}
          <nav className="desktop-only" style={{ alignItems: 'center', gap: '32px' }}>
            {navLinks.map(link => (
              <a key={link.name} href={link.href} style={{ color: 'rgba(248,247,244,0.7)', textDecoration: 'none', fontWeight: '500', fontSize: '15px', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = C.amber} onMouseLeave={e => e.target.style.color = 'rgba(248,247,244,0.7)'}>
                {link.name}
              </a>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', borderLeft: '1px solid rgba(255,255,255,0.2)', paddingLeft: '32px' }}>
              <a href="/login" style={{ color: C.cream, textDecoration: 'none', fontWeight: '700', fontSize: '15px', padding: '8px 16px', border: `1px solid ${C.amber}`, borderRadius: '8px', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = C.amber; e.currentTarget.style.color = C.dark; }} onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = C.cream; }}>
                Sisteme Giriş Yap
              </a>
            </div>
          </nav>

          {/* Mobile Nav Button */}
          <button className="mobile-only" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}>
            {isMobileMenuOpen ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
          <div className="mobile-only" style={{ flexDirection: 'column', background: C.dark, borderBottom: `1px solid rgba(255,255,255,0.1)`, padding: '16px 24px', gap: '16px', position: 'absolute', width: '100%', boxShadow: '0 10px 20px rgba(0,0,0,0.2)' }}>
            {navLinks.map(link => (
              <a key={link.name} href={link.href} onClick={() => setIsMobileMenuOpen(false)} style={{ color: C.cream, textDecoration: 'none', fontWeight: '600', fontSize: '18px', padding: '8px 0', borderBottom: `1px solid rgba(255,255,255,0.1)` }}>{link.name}</a>
            ))}
            <a href="/login" style={{ color: C.dark, background: C.amber, textDecoration: 'none', fontWeight: '700', fontSize: '18px', padding: '12px 0', textAlign: 'center', borderRadius: '8px', marginTop: '8px' }}>Sisteme Giriş Yap</a>
          </div>
        )}
      </header>

      <main style={{ paddingTop: '73px' }}>
        
        {/* --- HERO SECTION (KOYU ARKA PLAN) --- */}
        <section style={{ background: C.dark, padding: '80px 24px', display: 'flex', alignItems: 'center', minHeight: '60vh' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto', textAlign: 'center', width: '100%' }}>
            
            <h1 className="hero-title" style={{ fontSize: '56px', fontWeight: '900', color: C.cream, lineHeight: '1.2', marginBottom: '24px', letterSpacing: '-1px', maxWidth: '800px', margin: '0 auto 24px auto' }}>
              İnşaatınızın <span style={{ color: C.amber }}>Dijital Defteri.</span>
            </h1>
            
            <p style={{ fontSize: '18px', color: 'rgba(248,247,244,0.7)', lineHeight: '1.6', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px auto' }}>
              Karmaşık Excel tablolarından ve WhatsApp gruplarından kurtulun. Çek takibinizi, taşeron hakedişlerinizi ve şantiye maliyetlerinizi tek bir güvenli ekrandan yönetin.
            </p>
            
            <div>
              <a href="/login" style={{ background: C.amber, color: C.dark, padding: '16px 32px', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', fontSize: '18px', display: 'inline-block' }}>
                14 Gün Ücretsiz Denemeye Başla
              </a>
            </div>
            
          </div>
        </section>

        {/* --- NASIL ÇALIŞIR (STATİK VE HİZALI) --- */}
        <section id="how-it-works" style={{ background: C.cream, padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '800', color: C.dark, marginBottom: '16px' }}>Karmaşıklığa Son Veren 3 Adım</h2>
              <p style={{ fontSize: '16px', color: C.text2 }}>Sistemi kullanmaya başlamak ve rapor almak dakikalar sürer.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              
              <div style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '32px', borderRadius: '12px' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: 'rgba(232,135,10,0.2)', marginBottom: '16px', lineHeight: '1' }}>01</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: C.dark, marginBottom: '12px' }}>Şantiyenizi Oluşturun</h3>
                <p style={{ color: C.text2, fontSize: '15px', lineHeight: '1.6' }}>Sisteme projenizi ekleyin. Başlangıç bütçenizi ve çalışacağınız taşeronları saniyeler içinde sisteme tanımlayın.</p>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '32px', borderRadius: '12px' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: 'rgba(232,135,10,0.2)', marginBottom: '16px', lineHeight: '1' }}>02</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: C.dark, marginBottom: '12px' }}>Verileri Sisteme Girin</h3>
                <p style={{ color: C.text2, fontSize: '15px', lineHeight: '1.6' }}>Saha ekipleri masrafları, muhasebe birimi çek ve ödemeleri eş zamanlı olarak kendi yetkileri dahilinde girsin.</p>
              </div>

              <div style={{ background: '#fff', border: `1px solid ${C.border}`, padding: '32px', borderRadius: '12px' }}>
                <div style={{ fontSize: '48px', fontWeight: '900', color: 'rgba(232,135,10,0.2)', marginBottom: '16px', lineHeight: '1' }}>03</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: C.dark, marginBottom: '12px' }}>Anlık Raporlar Alın</h3>
                <p style={{ color: C.text2, fontSize: '15px', lineHeight: '1.6' }}>Bekleyen tahsilatlar, yaklaşan ödemeler ve projenin o anki kar/zarar durumu otomatik olarak önünüze gelsin.</p>
              </div>

            </div>
          </div>
        </section>

        {/* --- ÖZELLİKLER (FEATURES) --- */}
        <section id="features" style={{ background: C.cream2, padding: '80px 24px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '800', color: C.dark, marginBottom: '16px' }}>Neden Yapivo?</h2>
              <p style={{ fontSize: '16px', color: C.text2, maxWidth: '600px', margin: '0 auto' }}>Standart muhasebe programlarının aksine, inşaat sektörünün dinamiklerine özel geliştirildi.</p>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              {[
                { icon: <FeatureIcon1 />, title: 'Çoklu Şantiye Yönetimi', desc: 'Farklı illerdeki veya ilçelerdeki şantiyelerinizin kasalarını tek bir merkezden, birbirine karıştırmadan yönetin.' },
                { icon: <FeatureIcon2 />, title: 'Detaylı Çek Takibi', desc: 'Alınan, verilen veya cirolanan çekleri takip edin. Günü yaklaşan çekler için sistem sizi önceden uyarsın.' },
                { icon: <FeatureIcon3 />, title: 'Taşeron Hakedişleri', desc: 'Sözleşme bedellerini sisteme girin, yapılan imalatlar üzerinden otomatik hakediş dökümleri oluşturun.' }
              ].map((f, i) => (
                <div key={i} style={{ background: '#fff', padding: '32px', borderRadius: '12px', border: `1px solid ${C.border}` }}>
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

        {/* --- FIYATLANDIRMA (PRICING) --- */}
        <section id="pricing" style={{ padding: '80px 24px', background: C.cream }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '48px' }}>
              <h2 className="section-title" style={{ fontSize: '32px', fontWeight: '800', color: C.dark, marginBottom: '16px' }}>Sade ve Şeffaf Fiyatlandırma</h2>
              <p style={{ fontSize: '16px', color: C.text2 }}>Gizli maliyetler yok. Şirketinizin hacmine uygun paketi seçin.</p>
            </div>

            {/* Aylık / Yıllık Toggle */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '48px' }}>
              <span style={{ fontWeight: isYearly ? '500' : '800', color: isYearly ? C.text3 : C.dark, fontSize: '16px' }}>Aylık Ödeme</span>
              <div onClick={() => setIsYearly(!isYearly)} style={{ width: '56px', height: '30px', background: C.dark, borderRadius: '20px', position: 'relative', cursor: 'pointer' }}>
                <div style={{ position: 'absolute', top: '3px', left: isYearly ? '29px' : '3px', width: '24px', height: '24px', background: C.amber, borderRadius: '50%', transition: 'left 0.2s' }} />
              </div>
              <span style={{ fontWeight: isYearly ? '800' : '500', color: isYearly ? C.dark : C.text3, fontSize: '16px' }}>
                Yıllık Ödeme <span style={{ color: C.amber, fontSize: '14px', fontWeight: '700' }}>(Avantajlı)</span>
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px', alignItems: 'flex-start' }}>
              {[
                { 
                  name: 'Başlangıç', target: 'Küçük İşletmeler', priceM: '1.250', priceY: '999', 
                  features: ['Cari ve Kasa Takibi', 'Temel Gelir/Gider Yönetimi', '2 Kullanıcı Erişimi', 'E-mail Desteği'] 
                },
                { 
                  name: 'Profesyonel', target: 'Taşeron ve Şantiyeler', priceM: '3.000', priceY: '2.499', isPopular: true,
                  features: ['Başlangıç\'taki her şey', 'Çek ve Senet Takibi', 'Taşeron Hakedişleri', '5 Kullanıcı Erişimi', 'Öncelikli Destek'] 
                },
                { 
                  name: 'Kurumsal', target: 'Büyük Yapı Firmaları', priceM: '7.500', priceY: '5.999', 
                  features: ['Profesyonel\'deki her şey', 'Sınırsız Şantiye Yönetimi', 'Banka Entegrasyonları', 'Sınırsız Kullanıcı', 'Özel Müşteri Temsilcisi'] 
                }
              ].map((plan, i) => (
                <div key={i} style={{ 
                  background: plan.isPopular ? C.dark : '#fff', color: plan.isPopular ? C.cream : C.dark, 
                  padding: '40px 32px', borderRadius: '12px',
                  border: plan.isPopular ? 'none' : `1px solid ${C.border}`,
                  position: 'relative'
                }}>
                  {plan.isPopular && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', background: C.amber, color: C.dark, padding: '8px', fontSize: '13px', fontWeight: '800', textAlign: 'center', borderRadius: '12px 12px 0 0' }}>
                      EN ÇOK TERCİH EDİLEN
                    </div>
                  )}
                  <div style={{ marginTop: plan.isPopular ? '24px' : '0' }}>
                    <h3 style={{ fontSize: '24px', fontWeight: '800', marginBottom: '4px' }}>{plan.name}</h3>
                    <p style={{ fontSize: '14px', color: plan.isPopular ? 'rgba(248,247,244,0.6)' : C.text3, marginBottom: '24px' }}>{plan.target}</p>
                    <div style={{ marginBottom: '32px' }}>
                      <span style={{ fontSize: '40px', fontWeight: '900' }}>₺{isYearly ? plan.priceY : plan.priceM}</span>
                      <span style={{ fontSize: '16px', color: plan.isPopular ? 'rgba(248,247,244,0.6)' : C.text3 }}> / ay</span>
                      {isYearly && <div style={{ fontSize: '13px', color: C.amber, marginTop: '4px', fontWeight: '600' }}>Yıllık peşin faturalandırılır</div>}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 32px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {plan.features.map((f, j) => (
                        <li key={j} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '15px', fontWeight: '500' }}>
                          <CheckIcon /> {f}
                        </li>
                      ))}
                    </ul>
                    <a href="/login" style={{ display: 'block', textAlign: 'center', background: plan.isPopular ? C.amber : C.cream2, color: C.dark, padding: '16px', borderRadius: '8px', textDecoration: 'none', fontWeight: '800', fontSize: '15px' }}>
                      Hemen Başla
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* --- FOOTER (KOYU ARKA PLAN) --- */}
      <footer style={{ background: C.dark, borderTop: `1px solid rgba(255,255,255,0.1)`, padding: '64px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: '48px', justifyContent: 'space-between' }}>
          
          <div style={{ flex: '1 1 300px' }}>
            {/* Logo - Çerçeveli */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', border: `2px solid ${C.amber}`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LogoIcon size={22} variant="light" />
              </div>
              <span style={{ fontSize: '22px', fontWeight: '900', color: C.cream }}>yap<span style={{ color: C.amber }}>ivo</span></span>
            </div>
            <p style={{ color: 'rgba(248,247,244,0.6)', fontSize: '14px', lineHeight: '1.6' }}>
              Müteahhitler, taşeronlar ve yapı firmaları için özel olarak tasarlanmış, bulut tabanlı yeni nesil inşaat finans ve yönetim platformu.
            </p>
          </div>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '64px' }}>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: C.cream, marginBottom: '16px' }}>Ürün</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <a href="#features" style={{ color: 'rgba(248,247,244,0.6)', textDecoration: 'none', fontSize: '14px' }}>Özellikler</a>
                <a href="#how-it-works" style={{ color: 'rgba(248,247,244,0.6)', textDecoration: 'none', fontSize: '14px' }}>Nasıl Çalışır?</a>
                <a href="#pricing" style={{ color: 'rgba(248,247,244,0.6)', textDecoration: 'none', fontSize: '14px' }}>Fiyatlar</a>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '700', color: C.cream, marginBottom: '16px' }}>İletişim</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <span style={{ color: 'rgba(248,247,244,0.6)', fontSize: '14px' }}>destek@yapivo.com</span>
                <span style={{ color: 'rgba(248,247,244,0.6)', fontSize: '14px' }}>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

        </div>
        
        <div style={{ maxWidth: '1200px', margin: '48px auto 0 auto', paddingTop: '24px', borderTop: `1px solid rgba(255,255,255,0.1)`, textAlign: 'center', color: 'rgba(248,247,244,0.4)', fontSize: '13px' }}>
          © {new Date().getFullYear()} Yapivo Yazılım Teknolojileri. Tüm hakları saklıdır.
        </div>
      </footer>
    </>
  )
}