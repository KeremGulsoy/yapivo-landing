'use client'

import { useEffect, useRef, useState } from 'react'
import { LogoIcon } from './dashboard/shared'

const C = {
  dark: '#1B2E5E',
  amber: '#E8870A',
  cream: '#F8F7F4',
  cream2: '#F0EEE9',
  border: '#E5E0D8',
  text2: '#5F5E5A',
  text3: '#888780',
}

export default function Home() {
  const [billingCycle, setBillingCycle] = useState('monthly') // monthly | yearly
  const sectionsRef = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible')
      })
    }, { threshold: 0.08 })
    sectionsRef.current.forEach((s) => s && observer.observe(s))
    return () => observer.disconnect()
  }, [])

  const addRef = (el) => { if (el && !sectionsRef.current.includes(el)) sectionsRef.current.push(el) }

  const prices = {
    monthly: { starter: 399, pro: 899, enterprise: 1999 },
    yearly:  { starter: 332, pro: 749, enterprise: 1666 },
  }
  const p = prices[billingCycle]

  const plans = [
    {
      name: 'Başlangıç',
      price: p.starter,
      desc: 'Sistemi öğren, temeli kur.',
      color: C.dark,
      highlight: false,
      users: '2 kullanıcı',
      extra: '₺150/ek kullanıcı',
      features: [
        { text: 'Sınırsız proje', yes: true },
        { text: 'Gelir / Gider takibi', yes: true },
        { text: 'Cari yönetimi', yes: true },
        { text: 'Personel yönetimi', yes: true },
        { text: 'Görev yönetimi (proje başına 10)', yes: true },
        { text: 'Kategori yönetimi', yes: true },
        { text: 'Temel raporlar', yes: true },
        { text: 'Finans / Kasalar', yes: false },
        { text: 'Çek / Senet takibi', yes: false },
        { text: 'Hakediş yönetimi', yes: false },
        { text: 'Daire satış modülü', yes: false },
      ],
      cta: 'Ücretsiz Dene',
      ctaStyle: 'outline',
    },
    {
      name: 'Profesyonel',
      price: p.pro,
      desc: 'Günlük işi keyifli kılan her şey.',
      color: C.amber,
      highlight: true,
      badge: 'En Popüler',
      users: '5 kullanıcı',
      extra: '₺120/ek kullanıcı',
      features: [
        { text: 'Başlangıç\'taki her şey', yes: true },
        { text: 'Sınırsız görev yönetimi', yes: true },
        { text: 'Finans / Kasalar', yes: true },
        { text: 'Çek / Senet takibi', yes: true },
        { text: 'Hakediş yönetimi', yes: true },
        { text: 'Daire satış modülü', yes: true },
        { text: 'PDF çıktı (hakediş, teklif)', yes: true },
        { text: 'Gelişmiş raporlar', yes: true },
        { text: 'Teklif yönetimi', yes: false },
        { text: 'Sözleşme modülü', yes: false },
        { text: 'Çoklu şirket', yes: false },
      ],
      cta: 'Ücretsiz Dene',
      ctaStyle: 'filled',
    },
    {
      name: 'Kurumsal',
      price: p.enterprise,
      desc: 'Büyük firma, tam kontrol.',
      color: C.dark,
      highlight: false,
      users: '15 kullanıcı',
      extra: '₺100/ek kullanıcı',
      features: [
        { text: 'Profesyonel\'deki her şey', yes: true },
        { text: 'Teklif yönetimi', yes: true },
        { text: 'Sözleşme modülü', yes: true },
        { text: 'Çoklu şirket (2 firma)', yes: true },
        { text: 'Sınırsız görev ve belge', yes: true },
        { text: 'Öncelikli destek (4s SLA)', yes: true },
        { text: 'Özel onboarding görüşmesi', yes: true },
        { text: 'Özel eğitim ve kurulum', yes: true },
      ],
      cta: 'İletişime Geç',
      ctaStyle: 'outline',
    },
  ]

  const features = [
    {
      icon: '🏗️',
      title: 'Proje Yönetimi',
      desc: 'Her projenizi ayrı yönetin. İlerleme, bütçe, ekip — tek ekranda.',
    },
    {
      icon: '💰',
      title: 'Gelir & Gider Takibi',
      desc: 'Her kuruşu kaydedin. Projenin ne kazandırdığını, ne yaktığını görün.',
    },
    {
      icon: '📋',
      title: 'Görev Yönetimi',
      desc: 'Saha ekibine görev atayın, teslim tarihi koyun, anlık takip edin.',
    },
    {
      icon: '🏦',
      title: 'Çek / Senet Takibi',
      desc: 'Vade yaklaşınca sistem sizi uyarır. Karşılıksız çek sürprizi olmaz.',
    },
    {
      icon: '🏢',
      title: 'Daire Satış Modülü',
      desc: 'Hangi daire satıldı, hangisi boş? Müşteri bilgisi ve ödeme planı kayıt altında.',
    },
    {
      icon: '📊',
      title: 'Hakediş Yönetimi',
      desc: 'Aylık imalat bazlı tahakkuk. PDF ile müşteriye ilet, ödemeyi takip et.',
    },
  ]

  return (
    <>
      {/* NAV */}
      <header style={{ position: 'fixed', top: 0, width: '100%', background: 'rgba(248,247,244,0.85)', backdropFilter: 'blur(12px)', borderBottom: `1px solid ${C.border}`, zIndex: 100 }}>
        <nav style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* HEADER LOGO */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LogoIcon size={30} variant="light" />
            <span style={{ fontSize: '18px', fontWeight: '800' }}>yap<span style={{ color: C.amber }}>ivo</span></span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <div className="nav-links" style={{ display: 'flex', gap: '24px' }}>
              {[['#ozellikler','Özellikler'],['#fiyatlar','Fiyatlar'],['#hakkimizda','Hakkımızda']].map(([href, label]) => (
                <a key={href} href={href} style={{ fontSize: '14px', fontWeight: '500', color: C.text2 }}
                  onMouseEnter={e => e.target.style.color = C.amber}
                  onMouseLeave={e => e.target.style.color = C.text2}>
                  {label}
                </a>
              ))}
            </div>
            <a href="/login">
              <button style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '9px 22px', borderRadius: '8px', border: 'none', fontSize: '14px' }}>
                Başla →
              </button>
            </a>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ paddingTop: '120px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px', minHeight: '90vh', display: 'flex', alignItems: 'center' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
          <div style={{ maxWidth: '760px', margin: '0 auto', textAlign: 'center' }}>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(232,135,10,0.1)', border: `1px solid rgba(232,135,10,0.25)`, borderRadius: '20px', padding: '6px 16px', marginBottom: '28px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: C.amber, display: 'inline-block' }}/>
              <span style={{ fontSize: '13px', fontWeight: '600', color: C.amber }}>14 Gün Ücretsiz · Kart Gerekmez</span>
            </div>

            <h1 className="hero-title" style={{ fontSize: '64px', fontWeight: '900', lineHeight: '1.05', letterSpacing: '-2px', marginBottom: '24px', color: C.dark }}>
              İnşaatınızın<br/>
              <span style={{ color: C.amber }}>Dijital Defteri</span>
            </h1>

            <p style={{ fontSize: '20px', color: C.text2, lineHeight: '1.6', marginBottom: '40px', maxWidth: '560px', margin: '0 auto 40px' }}>
              Proje yönetimi, masraf takibi, hakediş, daire satışı. Müteahhitler için, müteahhitler tarafından tasarlandı.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <a href="/login">
                <button style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '16px 36px', borderRadius: '10px', border: 'none', fontSize: '16px', transition: 'transform 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
                  onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
                  14 Gün Ücretsiz Dene →
                </button>
              </a>
              <a href="#ozellikler">
                <button style={{ background: 'transparent', color: C.dark, fontWeight: '600', padding: '16px 32px', borderRadius: '10px', border: `2px solid ${C.border}`, fontSize: '16px' }}>
                  Özellikleri Gör
                </button>
              </a>
            </div>

            {/* Stats */}
            <div className="hero-stats" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '72px', paddingTop: '40px', borderTop: `1px solid ${C.border}` }}>
              {[['14 Gün','Ücretsiz deneme'],['₺0','Kurulum ücreti'],['2 dk','Kurulum süresi']].map(([val, label]) => (
                <div key={label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', fontWeight: '900', color: C.amber }}>{val}</div>
                  <div style={{ fontSize: '13px', color: C.text3, marginTop: '4px' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ÖZELLİKLER */}
      <section id="ozellikler" ref={addRef} className="fade-up"
        style={{ padding: '80px 24px', background: '#fff' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: C.amber, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>ÖZELLİKLER</p>
            <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1px', color: C.dark, marginBottom: '16px' }}>
              İnşaatın İhtiyacı Olan Her Şey
            </h2>
            <p style={{ fontSize: '17px', color: C.text2, maxWidth: '500px', margin: '0 auto' }}>
              Sektörün gerçek sorunlarına odaklandık. Başka yazılımların sunmadığı modüller burada.
            </p>
          </div>

          <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
            {features.map((f, i) => (
              <div key={i} style={{ background: C.cream, borderRadius: '12px', padding: '28px', border: `1px solid ${C.border}`, transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(27,46,94,0.08)'; e.currentTarget.style.borderColor = C.amber }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
                <div style={{ fontSize: '28px', marginBottom: '14px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: C.text2, lineHeight: '1.6' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FİYATLAR */}
      <section id="fiyatlar" ref={addRef} className="fade-up"
        style={{ padding: '80px 24px', background: C.dark }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <p style={{ fontSize: '12px', fontWeight: '700', color: C.amber, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>FİYATLAR</p>
            <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1px', color: '#F8F7F4', marginBottom: '16px' }}>
              Sade Fiyatlandırma
            </h2>
            <p style={{ fontSize: '17px', color: 'rgba(248,247,244,0.5)', marginBottom: '32px' }}>
              Gizli ücret yok. İstediğiniz zaman iptal edin.
            </p>

            {/* Toggle */}
            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', padding: '4px', gap: '4px' }}>
              {[['monthly','Aylık'],['yearly','Yıllık']].map(([key, label]) => (
                <button key={key} onClick={() => setBillingCycle(key)}
                  style={{ padding: '8px 24px', borderRadius: '7px', border: 'none', fontSize: '13px', fontWeight: '600', transition: 'all 0.2s', background: billingCycle === key ? '#F8F7F4' : 'transparent', color: billingCycle === key ? C.dark : 'rgba(248,247,244,0.5)' }}>
                  {label} {key === 'yearly' && <span style={{ fontSize: '11px', color: C.amber, marginLeft: '4px' }}>-2 ay</span>}
                </button>
              ))}
            </div>
          </div>

          {/* Paketler */}
          <div className="pricing-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', alignItems: 'start' }}>
            {plans.map((plan, i) => (
              <div key={i} className={plan.highlight ? 'pricing-card-pro' : ''} style={{
                background: plan.highlight ? C.amber : 'rgba(255,255,255,0.05)',
                borderRadius: '16px',
                padding: '32px',
                border: plan.highlight ? 'none' : '1px solid rgba(255,255,255,0.1)',
                transform: plan.highlight ? 'scale(1.03)' : 'scale(1)',
                position: 'relative',
              }}>
                {plan.badge && (
                  <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: C.amber, border: `2px solid ${C.dark}`, color: C.dark, padding: '3px 14px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap' }}>
                    {plan.badge}
                  </div>
                )}

                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '700', color: plan.highlight ? C.dark : '#F8F7F4', marginBottom: '6px' }}>{plan.name}</h3>
                  <p style={{ fontSize: '13px', color: plan.highlight ? 'rgba(27,46,94,0.65)' : 'rgba(248,247,244,0.45)' }}>{plan.desc}</p>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <span style={{ fontSize: '44px', fontWeight: '900', color: plan.highlight ? C.dark : '#F8F7F4', letterSpacing: '-1px' }}>₺{plan.price}</span>
                  <span style={{ fontSize: '13px', color: plan.highlight ? 'rgba(27,46,94,0.5)' : 'rgba(248,247,244,0.4)' }}>/ay</span>
                  {billingCycle === 'yearly' && <div style={{ fontSize: '11px', color: plan.highlight ? 'rgba(27,46,94,0.5)' : 'rgba(248,247,244,0.35)', marginTop: '2px' }}>yıllık faturalandırılır</div>}
                </div>

                <div style={{ background: plan.highlight ? 'rgba(27,46,94,0.1)' : 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: plan.highlight ? C.dark : '#F8F7F4' }}>{plan.users}</div>
                  <div style={{ fontSize: '11px', color: plan.highlight ? 'rgba(27,46,94,0.5)' : 'rgba(248,247,244,0.4)', marginTop: '2px' }}>{plan.extra}</div>
                </div>

                <a href="/login" style={{ display: 'block', marginBottom: '24px' }}>
                  <button style={{
                    width: '100%', padding: '13px', borderRadius: '9px', fontSize: '14px', fontWeight: '700', border: plan.highlight ? 'none' : `1.5px solid rgba(255,255,255,0.25)`,
                    background: plan.highlight ? C.dark : 'transparent',
                    color: plan.highlight ? '#F8F7F4' : '#F8F7F4',
                    transition: 'opacity 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}>
                    {plan.cta}
                  </button>
                </a>

                <div style={{ borderTop: plan.highlight ? '1px solid rgba(27,46,94,0.15)' : '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
                  {plan.features.map((f, j) => (
                    <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <span style={{ fontSize: '13px', flexShrink: 0, color: f.yes ? (plan.highlight ? C.dark : C.amber) : 'rgba(255,255,255,0.2)', fontWeight: '700' }}>
                        {f.yes ? '✓' : '—'}
                      </span>
                      <span style={{ fontSize: '13px', color: f.yes ? (plan.highlight ? C.dark : 'rgba(248,247,244,0.85)') : 'rgba(255,255,255,0.25)' }}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p style={{ textAlign: 'center', marginTop: '32px', fontSize: '13px', color: 'rgba(248,247,244,0.3)' }}>
            Tüm paketlerde 14 gün ücretsiz deneme · KDV dahil değildir
          </p>
        </div>
      </section>

      {/* HAKKIMIZDA / NEDEN YAPIVO */}
      <section id="hakkimizda" ref={addRef} className="fade-up"
        style={{ padding: '80px 24px', background: C.cream }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="why-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '64px', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '12px', fontWeight: '700', color: C.amber, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>NEDEN YAPIVO</p>
              <h2 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-1px', color: C.dark, marginBottom: '20px', lineHeight: '1.1' }}>
                İnşaatçının Dilini Konuşan Yazılım
              </h2>
              <p style={{ fontSize: '16px', color: C.text2, lineHeight: '1.7', marginBottom: '32px' }}>
                Logo çok karmaşık. Genel muhasebe programları inşaatı anlamıyor. Yapivo sıfırdan inşaat sektörü için kurgulandı.
              </p>
              {[
                ['Çek takibi', 'Vade gelince sistem sizi uyarır, sürpriz olmaz.'],
                ['Proje kar/zarar', 'Her projenin geliri, gideri ve net karı tek ekranda.'],
                ['Hakediş', 'Aylık imalat bazlı tahakkuk, PDF çıktısı, taşeron takibi.'],
                ['Türk standartları', 'TL, USD, EUR, vergi numarası, vergi dairesi — hepsi hazır.'],
              ].map(([title, desc]) => (
                <div key={title} style={{ display: 'flex', gap: '14px', marginBottom: '20px' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: C.amber, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <span style={{ color: C.dark, fontSize: '11px', fontWeight: '700' }}>✓</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark, marginBottom: '3px' }}>{title}</div>
                    <div style={{ fontSize: '13px', color: C.text2 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mock-dashboard" style={{ background: C.dark, borderRadius: '16px', padding: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {/* KÜÇÜK MOCKUP LOGOSU */}
                  <LogoIcon size={24} variant="dark" />
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#F8F7F4' }}>yap<span style={{ color: C.amber }}>ivo</span></span>
                </div>
                <span style={{ fontSize: '11px', color: 'rgba(248,247,244,0.3)' }}>Dashboard</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
                {[
                  ['Toplam Gelir', '₺2.450.000', '#15803d'],
                  ['Toplam Gider', '₺1.820.000', '#dc2626'],
                  ['Net Kar', '₺630.000', C.amber],
                  ['Aktif Proje', '4', '#F8F7F4'],
                ].map(([label, val, color]) => (
                  <div key={label} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '12px' }}>
                    <div style={{ fontSize: '10px', color: 'rgba(248,247,244,0.35)', marginBottom: '6px', letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color }}>{val}</div>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontSize: '11px', color: 'rgba(248,247,244,0.35)', marginBottom: '10px', letterSpacing: '0.04em' }}>SON İŞLEMLER</div>
                {[
                  ['3+1 Daire Satışı', '+₺850.000', '#15803d'],
                  ['Beton İşçiliği', '-₺120.000', '#dc2626'],
                  ['Demir Alımı', '-₺85.000', '#dc2626'],
                ].map(([title, amount, color]) => (
                  <div key={title} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(248,247,244,0.7)' }}>{title}</span>
                    <span style={{ fontSize: '13px', fontWeight: '700', color }}>{amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section ref={addRef} className="fade-up"
        style={{ padding: '80px 24px', background: '#fff', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '40px', fontWeight: '900', letterSpacing: '-1px', color: C.dark, marginBottom: '16px' }}>
            Hazır mısınız?
          </h2>
          <p style={{ fontSize: '18px', color: C.text2, marginBottom: '36px' }}>
            14 gün ücretsiz deneyin. Kart bilgisi gerekmez.
          </p>
          <a href="/login">
            <button style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '18px 48px', borderRadius: '12px', border: 'none', fontSize: '18px', transition: 'transform 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}>
              Ücretsiz Denemeye Başla →
            </button>
          </a>
          <p style={{ fontSize: '13px', color: C.text3, marginTop: '16px' }}>
            Kredi kartı gerekmez · İstediğiniz zaman iptal edin
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ background: C.dark, padding: '48px 24px', borderTop: `1px solid rgba(255,255,255,0.06)` }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div className="footer-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '40px', marginBottom: '48px' }}>
            <div>
              
              {/* FOOTER LOGO */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <LogoIcon size={32} variant="dark" />
                <span style={{ fontSize: '17px', fontWeight: '800', color: '#F8F7F4' }}>yap<span style={{ color: C.amber }}>ivo</span></span>
              </div>

              <p style={{ fontSize: '13px', color: 'rgba(248,247,244,0.4)', lineHeight: '1.6', maxWidth: '220px' }}>
                İnşaatınızın Dijital Defteri. Müteahhitler için, müteahhitler tarafından.
              </p>
            </div>

            {[
              ['Ürün', [['#ozellikler','Özellikler'],['#fiyatlar','Fiyatlar'],['/login','Giriş Yap']]],
              ['Şirket', [['#hakkimizda','Hakkımızda'],['mailto:hello@yapivo.com.tr','İletişim']]],
              ['Yasal', [['#','Gizlilik Politikası'],['#','Kullanım Koşulları']]],
            ].map(([title, links]) => (
              <div key={title}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: '#F8F7F4', marginBottom: '16px' }}>{title}</h4>
                <ul style={{ listStyle: 'none' }}>
                  {links.map(([href, label]) => (
                    <li key={label} style={{ marginBottom: '10px' }}>
                      <a href={href} style={{ fontSize: '13px', color: 'rgba(248,247,244,0.4)', transition: 'color 0.15s' }}
                        onMouseEnter={e => e.target.style.color = C.amber}
                        onMouseLeave={e => e.target.style.color = 'rgba(248,247,244,0.4)'}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: '12px', color: 'rgba(248,247,244,0.25)' }}>© 2025 Yapivo. Tüm hakları saklıdır.</p>
            <p style={{ fontSize: '12px', color: 'rgba(248,247,244,0.25)' }}>yapivo.com.tr</p>
          </div>
        </div>
      </footer>
    </>
  )
}