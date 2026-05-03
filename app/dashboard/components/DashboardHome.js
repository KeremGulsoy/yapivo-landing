'use client'

import { fmtAmount, thStyle, tdNum } from '../shared'

export default function DashboardHome({ stats, projects, transactions, cheques, fmt, fmtDate, C, navigate, isMobile }) {
  const kpis = [
    { label: 'TOPLAM GELİR', value: fmt(stats.income), color: C.green, bg: C.greenBg, icon: '↑' },
    { label: 'TOPLAM GİDER', value: fmt(stats.expense), color: C.red, bg: C.redBg, icon: '↓' },
    { label: 'NET KAR', value: fmt(stats.net), color: stats.net >= 0 ? C.dark : C.red, bg: C.cream, icon: '◈', highlight: true },
    { label: 'AKTİF PROJE', value: stats.projects, color: C.amber, bg: C.amberBg, icon: '◫' },
    { label: 'CARİ', value: stats.contacts, color: C.blue, bg: C.blueBg, icon: '◎' },
  ]
  
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '10px', marginBottom: '16px' }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: k.highlight ? C.dark : C.cream, borderRadius: '10px', padding: '14px', border: `1px solid ${k.highlight ? 'transparent' : C.border}`, gridColumn: isMobile && i === 2 ? '1 / -1' : undefined }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '10px', letterSpacing: '0.05em', color: k.highlight ? 'rgba(248,247,244,0.45)' : C.text3 }}>{k.label}</span>
              <div style={{ width: '24px', height: '24px', background: k.highlight ? 'rgba(232,135,10,0.2)' : k.bg, borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: k.highlight ? C.amber : k.color }}>{k.icon}</div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: k.highlight ? '#F8F7F4' : k.color, fontVariantNumeric: 'tabular-nums' }}>{k.value}</div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>
        <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Son Projeler</span>
            <span style={{ fontSize: '11px', color: C.amber, cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('projects')}>Tümü →</span>
          </div>
          {projects.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: C.text3, fontSize: '13px', marginBottom: '8px' }}>Henüz proje yok</p>
              <span style={{ color: C.amber, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('projects')}>+ Proje Ekle</span>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '340px' }}>
                <thead><tr>{['Proje','Durum','Bütçe'].map((h,i) => <th key={h} style={{ ...thStyle, textAlign: i===2?'right':'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {projects.slice(0,5).map((p,i) => (
                    <tr key={p.id} style={{ borderBottom: i<4?`1px solid ${C.border}`:'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px' }}><div style={{ fontWeight: '600', color: C.dark }}>{p.name}</div></td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: p.status==='active'?C.greenBg:'rgba(136,135,128,0.1)', color: p.status==='active'?C.green:C.text3 }}>
                          {p.status==='active'?'Aktif':p.status==='completed'?'Tamamlandı':'Beklemede'}
                        </span>
                      </td>
                      <td style={tdNum()}>{fmt(p.budget)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Son İşlemler</span>
            <span style={{ fontSize: '11px', color: C.amber, cursor: 'pointer', fontWeight: '600' }} onClick={() => navigate('transactions')}>Tümü →</span>
          </div>
          {transactions.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <p style={{ color: C.text3, fontSize: '13px', marginBottom: '8px' }}>Henüz işlem yok</p>
              <span style={{ color: C.amber, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={() => navigate('transactions')}>+ İşlem Ekle</span>
            </div>
          ) : transactions.slice(0,6).map((t,i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: i<5?`1px solid ${C.border}`:'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type==='income'?C.greenBg:C.redBg, fontSize: '13px', color: t.type==='income'?C.green:C.red, flexShrink: 0 }}>{t.type==='income'?'↑':'↓'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                <div style={{ fontSize: '11px', color: C.text3 }}>{t.projects?.name||'Genel'} · {fmtDate(t.date)}</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: t.type==='income'?C.green:C.red, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {t.type==='income'?'+':'-'}{fmtAmount(t.amount,t.currency)}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {cheques.length > 0 && (
        <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', background: C.red, borderRadius: '50%', display: 'inline-block' }}/>
            <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Vadesi Yaklaşan Çekler</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
              <thead><tr>{['Tutar','Vade','Tür','Durum'].map((h,i)=><th key={h} style={{...thStyle,textAlign:i===0?'right':'left'}}>{h}</th>)}</tr></thead>
              <tbody>
                {cheques.map((c,i)=>(
                  <tr key={c.id} style={{ borderBottom: i<cheques.length-1?`1px solid ${C.border}`:'none' }}>
                    <td style={tdNum()}>{fmt(c.amount)}</td>
                    <td style={{ padding:'10px 14px', color:C.text2 }}>{fmtDate(c.due_date)}</td>
                    <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'20px', background:c.type==='incoming'?C.greenBg:C.redBg, color:c.type==='incoming'?C.green:C.red }}>{c.type==='incoming'?'Alacak':'Borç'}</span></td>
                    <td style={{ padding:'10px 14px' }}><span style={{ fontSize:'10px', fontWeight:'600', padding:'2px 8px', borderRadius:'20px', background:C.amberBg, color:C.amber }}>Bekliyor</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}