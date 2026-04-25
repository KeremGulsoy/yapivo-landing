'use client'

import { useEffect, useRef } from 'react'

export default function Home() {
  const sectionsRef = useRef([])

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
      {/* Header */}
      <header style={{position:'fixed',top:0,width:'100%',backgroundColor:'rgba(248,247,244,0.9)',backdropFilter:'blur(8px)',zIndex:50,borderBottom:'1px solid #e5e7eb'}}>
        <nav style={{maxWidth:'1152px',margin:'0 auto',padding:'16px 24px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
            <div style={{width:'32px',height:'32px',backgroundColor:'#1B2E5E',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <line x1="8" y1="8" x2="20" y2="22" stroke="#F8F7F4" strokeWidth="3" strokeLinecap="round"/>
                <line x1="32" y1="8" x2="20" y2="22" stroke="#E8870A" strokeWidth="3" strokeLinecap="round"/>
                <line x1="20" y1="22" x2="20" y2="36" stroke="#F8F7F4" strokeWidth="3" strokeLinecap="round"/>
                <rect x="14" y="27" width="4" height="4" fill="#E8870A" rx="1"/>
                <rect x="22" y="27" width="4" height="4" fill="#E8870A" rx="1"/>
              </svg>
            </div>
            <span style={{fontSize:'20px',fontWeight:'800',fontFamily:'Outfit,sans-serif'}}>
              <span style={{color:'#1B2E5E'}}>yap</span>
              <span style={{color:'#E8870A'}}>ivo</span>
            </span>
          </div>
          <div style={{display:'flex',gap:'32px'}}>
            <a href="#ozellikler" style={{fontSize:'14px',fontWeight:'500',color:'#1B2E5E',textDecoration:'none'}}>Özellikler</a>
            <a href="#fiyatlar" style={{fontSize:'14px',fontWeight:'500',color:'#1B2E5E',textDecoration:'none'}}>Fiyatlar</a>
          </div>
          <button style={{backgroundColor:'#E8870A',color:'#1B2E5E',fontWeight:'700',padding:'8px 24px',borderRadius:'8px',border:'none',cursor:'pointer',fontFamily:'Outfit,sans-serif',fontSize:'14px'}}>
            Başla
          </button>
        </nav>
      </header>

      {/* Hero */}
      <section style={{paddingTop:'128px',paddingBottom:'80px',paddingLeft:'24px',paddingRight:'24px',backgroundColor:'#F8F7F4',minHeight:'100vh',display:'flex',alignItems:'center'}}>
        <div style={{maxWidth:'1152px',margin:'0 auto',width:'100%'}}>
          <div style={{textAlign:'center',marginBottom:'48px'}}>
            <div style={{display:'inline-block',backgroundColor:'rgba(232,135,10,0.1)',border:'1px solid rgba(232,135,10,0.3)',borderRadius:'8px',padding:'8px 16px',marginBottom:'24px'}}>
              <p style={{fontSize:'14px',fontWeight:'600',color:'#E8870A',margin:0}}>✨ 14 Gün Ücretsiz Dene</p>
            </div>
            <h1 style={{fontSize:'64px',fontWeight:'900',lineHeight:'1.1',marginBottom:'24px',fontFamily:'Outfit,sans-serif',color:'#1B2E5E'}}>
              İnşaatınızın<br/>
              <span style={{color:'#E8870A'}}>Dijital Defteri</span>
            </h1>
            <p style={{fontSize:'20px',color:'#6b7280',marginBottom:'40px',maxWidth:'600px',margin:'0 auto 40px'}}>
              Proje yönetimi, masraf takibi, finans kontrolü. Müteahhitler için tasarlanan, kullanması kolay çözüm.
            </p>
            <div style={{display:'flex',gap:'16px',justifyContent:'center',flexWrap:'wrap'}}>
              <button style={{backgroundColor:'#E8870A',color:'#1B2E5E',fontWeight:'700',padding:'16px 32px',borderRadius:'8px',border:'none',cursor:'pointer',fontSize:'16px',fontFamily:'Outfit,sans-serif'}}>
                14 Gün Ücretsiz Dene →
              </button>
              <button style={{backgroundColor:'transparent',color:'#1B2E5E',fontWeight:'700',padding:'16px 32px',borderRadius:'8px',border:'2px solid #1B2E5E',cursor:'pointer',fontSize:'16px',fontFamily:'Outfit,sans-serif'}}>
                Daha Fazla Bilgi
              </button>
            </div>
          </div>

          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'24px',marginTop:'80px',paddingTop:'40px',borderTop:'1px solid #d1d5db'}}>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'36px',fontWeight:'900',color:'#E8870A',margin:'0 0 8px'}}>500+</p>
              <p style={{fontSize:'14px',color:'#6b7280',margin:0}}>İnşaat Şirketi</p>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'36px',fontWeight:'900',color:'#E8870A',margin:'0 0 8px'}}>₺1B+</p>
              <p style={{fontSize:'14px',color:'#6b7280',margin:0}}>Yönetilen Bütçe</p>
            </div>
            <div style={{textAlign:'center'}}>
              <p style={{fontSize:'36px',fontWeight:'900',color:'#E8870A',margin:'0 0 8px'}}>99.9%</p>
              <p style={{fontSize:'14px',color:'#6b7280',margin:0}}>Sistem Çalışma Süresi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="ozellikler" style={{padding:'80px 24px',backgroundColor:'#ffffff'}}>
        <div style={{maxWidth:'1152px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <h2 style={{fontSize:'40px',fontWeight:'900',color:'#1B2E5E',margin:'0 0 16px',fontFamily:'Outfit,sans-serif'}}>Ne Sunuyoruz?</h2>
            <p style={{fontSize:'18px',color:'#6b7280',margin:0}}>İnşaat sektörünün ihtiyaç duyduğu her şey.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:'32px'}}>
            {[
              {title:'Proje Yönetimi', desc:'Projelerinizi organize edin, ilerlemeyi takip edin, tahminleri yapın.', emoji:'🏗️'},
              {title:'Masraf Takibi', desc:'Her maliyeti kaydedin, kategoriyle düzenleyin, bütçeyi kontrol edin.', emoji:'💰'},
              {title:'Finansal Kontrol', desc:'Nakit akışını izleyin, çekleri takip edin, raporlar alın.', emoji:'📊'},
            ].map((f, i) => (
              <div key={i} style={{backgroundColor:'#F8F7F4',borderRadius:'16px',padding:'32px',border:'1px solid #e5e7eb'}}>
                <div style={{fontSize:'32px',marginBottom:'16px'}}>{f.emoji}</div>
                <h3 style={{fontSize:'20px',fontWeight:'700',color:'#1B2E5E',margin:'0 0 12px',fontFamily:'Outfit,sans-serif'}}>{f.title}</h3>
                <p style={{fontSize:'15px',color:'#6b7280',margin:0,lineHeight:'1.6'}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="fiyatlar" style={{padding:'80px 24px',backgroundColor:'#1B2E5E'}}>
        <div style={{maxWidth:'1152px',margin:'0 auto'}}>
          <div style={{textAlign:'center',marginBottom:'64px'}}>
            <h2 style={{fontSize:'40px',fontWeight:'900',color:'#F8F7F4',margin:'0 0 16px',fontFamily:'Outfit,sans-serif'}}>Basit Fiyatlandırma</h2>
            <p style={{fontSize:'18px',color:'rgba(248,247,244,0.6)',margin:0}}>Hiçbir gizli ücret. İstediğiniz zaman iptal edin.</p>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:'24px',alignItems:'center'}}>
            {[
              {name:'Başlangıç', price:'₺399', desc:'Küçük projeler için', features:['2 kullanıcı','5 proje','Masraf Takibi'], highlighted: false},
              {name:'Profesyonel', price:'₺899', desc:'Büyüyen işletmeler için', features:['5 kullanıcı','Sınırsız proje','Finans Modülü','Hakediş Yönetimi'], highlighted: true},
              {name:'Kurumsal', price:'₺1999', desc:'Büyük organizasyonlar', features:['15+ kullanıcı','Tüm özellikler','API erişimi','Öncelikli destek'], highlighted: false},
            ].map((plan, i) => (
              <div key={i} style={{backgroundColor: plan.highlighted ? '#E8870A' : '#2A4580', borderRadius:'16px', padding:'32px', transform: plan.highlighted ? 'scale(1.05)' : 'scale(1)', position:'relative'}}>
                {plan.highlighted && (
                  <div style={{position:'absolute',top:'-16px',left:'50%',transform:'translateX(-50%)',backgroundColor:'#E8870A',border:'2px solid #1B2E5E',color:'#1B2E5E',padding:'4px 16px',borderRadius:'999px',fontSize:'12px',fontWeight:'700',whiteSpace:'nowrap'}}>
                    En Popüler
                  </div>
                )}
                <h3 style={{fontSize:'20px',fontWeight:'700',color: plan.highlighted ? '#1B2E5E' : '#F8F7F4',margin:'0 0 8px',fontFamily:'Outfit,sans-serif'}}>{plan.name}</h3>
                <p style={{fontSize:'13px',color: plan.highlighted ? 'rgba(27,46,94,0.7)' : 'rgba(248,247,244,0.5)',margin:'0 0 24px'}}>{plan.desc}</p>
                <div style={{marginBottom:'24px'}}>
                  <span style={{fontSize:'40px',fontWeight:'900',color: plan.highlighted ? '#1B2E5E' : '#F8F7F4',fontFamily:'Outfit,sans-serif'}}>{plan.price}</span>
                  <span style={{fontSize:'13px',color: plan.highlighted ? 'rgba(27,46,94,0.6)' : 'rgba(248,247,244,0.5)'}}>/ay</span>
                </div>
                <button style={{width:'100%',backgroundColor: plan.highlighted ? '#1B2E5E' : '#E8870A',color: plan.highlighted ? '#F8F7F4' : '#1B2E5E',fontWeight:'700',padding:'12px',borderRadius:'8px',border:'none',cursor:'pointer',marginBottom:'24px',fontFamily:'Outfit,sans-serif',fontSize:'15px'}}>
                  Başla
                </button>
                <ul style={{listStyle:'none',padding:0,margin:0}}>
                  {plan.features.map((f, j) => (
                    <li key={j} style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px',fontSize:'14px',color: plan.highlighted ? '#1B2E5E' : 'rgba(248,247,244,0.8)'}}>
                      <span style={{color:'#E8870A',fontWeight:'bold'}}>✓</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{backgroundColor:'#1B2E5E',borderTop:'1px solid rgba(255,255,255,0.1)',padding:'48px 24px'}}>
        <div style={{maxWidth:'1152px',margin:'0 auto',textAlign:'center'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'8px',marginBottom:'16px'}}>
            <div style={{width:'32px',height:'32px',backgroundColor:'#E8870A',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
              <svg width="20" height="20" viewBox="0 0 40 40" fill="none">
                <line x1="8" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="3" strokeLinecap="round"/>
                <line x1="32" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="3" strokeLinecap="round"/>
                <line x1="20" y1="22" x2="20" y2="36" stroke="#1B2E5E" strokeWidth="3" strokeLinecap="round"/>
              </svg>
            </div>
            <span style={{fontSize:'20px',fontWeight:'800',fontFamily:'Outfit,sans-serif'}}>
              <span style={{color:'#F8F7F4'}}>yap</span>
              <span style={{color:'#E8870A'}}>ivo</span>
            </span>
          </div>
          <p style={{color:'rgba(248,247,244,0.4)',fontSize:'14px',margin:'0 0 8px'}}>İnşaatınızın Dijital Defteri</p>
          <p style={{color:'rgba(248,247,244,0.25)',fontSize:'12px',margin:0}}>© 2025 Yapivo. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </>
  )
}