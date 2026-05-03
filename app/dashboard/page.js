'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import {
  C, CURRENCY_META, AVAILABLE_CURRENCIES, DEFAULT_CURRENCY_CODES,
  fmtAmount, fmt, fmtDate, navGroups, useIsMobile,
  NumberInput, FilterBar, PrimaryBtn, Modal, FRow, FField, inp,
  ScrollTable, thStyle, thRight, tdNum, validate
} from './shared'
import ProjectsPage from './components/ProjectsPage'
import TransactionsPage from './components/TransactionsPage'
import ContactsPage from './components/ContactsPage'
import CategoriesPage from './components/CategoriesPage'

// ══════════════════════════════════════════
// ANA DASHBOARD
// ══════════════════════════════════════════
export default function Dashboard() {
  const isMobile = useIsMobile()
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ income: 0, expense: 0, net: 0, projects: 0, contacts: 0, pendingCheques: 0 })
  const [projects, setProjects] = useState([])
  const [transactions, setTransactions] = useState([])
  const [cheques, setCheques] = useState([])
  const [refreshKey, setRefreshKey] = useState(0)
  const notifRef = useRef(null)

  const pageTitle = navGroups.flatMap(g => g.items).find(i => i.id === activeMenu)?.label || 'Dashboard'

  const handleMenuClick = (id) => {
    setActiveMenu(id); setRefreshKey(k => k + 1)
    if (isMobile) setSidebarOpen(false)
  }

  const loadStats = useCallback(async (cid) => {
    const [inc, exp, projs, conts, recentTx, chqs] = await Promise.all([
      supabase.from('transactions').select('amount').eq('company_id', cid).eq('type', 'income'),
      supabase.from('transactions').select('amount').eq('company_id', cid).eq('type', 'expense'),
      supabase.from('projects').select('*').eq('company_id', cid).order('created_at', { ascending: false }),
      supabase.from('contacts').select('id').eq('company_id', cid),
      supabase.from('transactions').select('*, projects(name), categories(name,color)').eq('company_id', cid).order('date', { ascending: false }).limit(10),
      supabase.from('cheques').select('*').eq('company_id', cid).eq('status', 'pending').order('due_date', { ascending: true }).limit(5),
    ])
    const totalInc = inc.data?.reduce((s, r) => s + Number(r.amount), 0) || 0
    const totalExp = exp.data?.reduce((s, r) => s + Number(r.amount), 0) || 0
    setStats({ income: totalInc, expense: totalExp, net: totalInc - totalExp, projects: projs.data?.length || 0, contacts: conts.data?.length || 0, pendingCheques: chqs.data?.length || 0 })
    setProjects(projs.data || [])
    setTransactions(recentTx.data || [])
    setCheques(chqs.data || [])
  }, [])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUser(session.user)
      const { data: prof } = await supabase.from('profiles').select('*, companies(*)').eq('id', session.user.id).single()
      if (!prof?.company_id) { window.location.href = '/setup'; return }
      setProfile(prof); setCompany(prof.companies)
      await loadStats(prof.company_id)
      setLoading(false)
    }
    init()
    const handleClick = (e) => { if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false) }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (company && refreshKey > 0) loadStats(company.id)
  }, [refreshKey, company])

  const handleLogout = async () => { await supabase.auth.signOut(); window.location.href = '/login' }

  if (loading) return (
    <div style={{ minHeight: '100vh', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', color: C.cream }}>yap<span style={{ color: C.amber }}>ivo</span></div>
        <p style={{ color: 'rgba(248,247,244,0.4)', fontSize: '13px', marginTop: '8px' }}>Yükleniyor...</p>
      </div>
    </div>
  )

  const initials = (profile?.full_name || user?.email || 'U').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Outfit, sans-serif', backgroundColor: C.cream2 }}>
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.5)', zIndex: 90 }} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: isMobile ? '260px' : sidebarCollapsed ? '60px' : '240px',
        flexShrink: 0, background: C.dark,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, transform 0.25s ease',
        overflow: 'hidden', zIndex: 100,
        position: isMobile ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      }}>
        <div style={{ padding: '18px 14px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flexShrink: 0 }}
          onClick={() => isMobile ? setSidebarOpen(false) : setSidebarCollapsed(!sidebarCollapsed)}>
          <div style={{ width: '30px', height: '30px', background: C.amber, borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="17" height="17" viewBox="0 0 40 40" fill="none">
              <line x1="8" y1="8" x2="20" y2="22" stroke={C.dark} strokeWidth="4" strokeLinecap="round"/>
              <line x1="32" y1="8" x2="20" y2="22" stroke={C.dark} strokeWidth="4" strokeLinecap="round"/>
              <line x1="20" y1="22" x2="20" y2="36" stroke={C.dark} strokeWidth="4" strokeLinecap="round"/>
            </svg>
          </div>
          {(!sidebarCollapsed || isMobile) && (
            <div>
              <div style={{ fontSize: '15px', fontWeight: '800', color: C.cream, whiteSpace: 'nowrap' }}>yap<span style={{ color: C.amber }}>ivo</span></div>
              <div style={{ fontSize: '9px', color: 'rgba(248,247,244,0.3)', letterSpacing: '0.08em' }}>İNŞAATINIZIN DİJİTAL DEFTERİ</div>
            </div>
          )}
        </div>

        {(!sidebarCollapsed || isMobile) && company && (
          <div style={{ margin: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: C.cream, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.name}</div>
            <div style={{ fontSize: '10px', color: C.amber, marginTop: '2px' }}>● {company.plan === 'starter' ? 'Başlangıç' : company.plan === 'pro' ? 'Profesyonel' : 'Kurumsal'}</div>
          </div>
        )}

        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 8px 8px' }}>
          {navGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '4px' }}>
              {group.label && (!sidebarCollapsed || isMobile) && (
                <div style={{ fontSize: '10px', color: 'rgba(248,247,244,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 3px' }}>{group.label}</div>
              )}
              {group.items.map((item) => {
                const isActive = activeMenu === item.id
                return (
                  <button key={item.id} onClick={() => handleMenuClick(item.id)}
                    title={sidebarCollapsed && !isMobile ? item.label : undefined}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '7px', border: `1px solid ${isActive ? 'rgba(232,135,10,0.25)' : 'transparent'}`, cursor: 'pointer', marginBottom: '1px', backgroundColor: isActive ? C.amberBg : 'transparent', color: isActive ? C.amber : 'rgba(248,247,244,0.55)', fontFamily: 'Outfit, sans-serif', transition: 'all 0.12s', textAlign: 'left' }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.cream } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(248,247,244,0.55)' } }}>
                    <span style={{ fontSize: '16px', flexShrink: 0, width: '18px', textAlign: 'center' }}>{item.icon}</span>
                    {(!sidebarCollapsed || isMobile) && (
                      <>
                        <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', flex: 1 }}>{item.label}</span>
                        {item.id === 'cheques' && stats.pendingCheques > 0 && (
                          <span style={{ fontSize: '10px', background: C.red, color: '#fff', borderRadius: '10px', padding: '1px 6px' }}>{stats.pendingCheques}</span>
                        )}
                      </>
                    )}
                  </button>
                )
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* TOPBAR */}
        <div style={{ height: '54px', background: C.cream, borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', padding: '0 16px', gap: '10px', flexShrink: 0, position: 'sticky', top: 0, zIndex: 50 }}>
          <div style={{ fontSize: '15px', fontWeight: '700', color: C.dark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitle}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {!isMobile && (
              <input placeholder="🔍  Ara..." style={{ background: C.cream2, border: `1px solid ${C.border}`, borderRadius: '7px', padding: '6px 12px', color: C.text, fontSize: '13px', width: '160px', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = C.amber} onBlur={e => e.target.style.borderColor = C.border} />
            )}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)}
                style={{ width: '34px', height: '34px', borderRadius: '7px', background: C.cream2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', position: 'relative' }}>
                🔔
                {stats.pendingCheques > 0 && <div style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: C.red, borderRadius: '50%' }}/>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: '42px', right: 0, width: '300px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', boxShadow: '0 8px 32px rgba(27,46,94,0.12)', zIndex: 200 }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}><span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Bildirimler</span></div>
                  {cheques.length > 0 ? cheques.map((c, i) => (
                    <div key={i} style={{ padding: '11px 16px', borderBottom: i < cheques.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: C.dark, marginBottom: '3px' }}>⚠️ Çek Vadesi Yaklaşıyor</div>
                      <div style={{ fontSize: '12px', color: C.text2 }}>{fmt(c.amount)} — {fmtDate(c.due_date)}</div>
                    </div>
                  )) : <div style={{ padding: '24px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Bildirim yok</div>}
                </div>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: `1px solid ${C.border}` }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: C.cream }}>{initials}</div>
              {!isMobile && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: C.dark }}>{profile?.full_name || user?.email}</div>
                  <div style={{ fontSize: '10px', color: C.text3 }}>{{ owner: 'Patron', admin: 'Yönetici', accountant: 'Muhasebeci', field: 'Saha', viewer: 'Görüntüleyici' }[profile?.role] || profile?.role}</div>
                </div>
              )}
              <button onClick={handleLogout} title="Çıkış"
                style={{ width: '30px', height: '30px', borderRadius: '7px', background: C.cream2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', color: C.text3 }}>⏻</button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '14px 14px 80px' : '20px' }}>
          {activeMenu === 'dashboard' && <DashboardHome stats={stats} projects={projects} transactions={transactions} cheques={cheques} fmt={fmt} fmtDate={fmtDate} C={C} navigate={handleMenuClick} isMobile={isMobile} />}
          {activeMenu === 'projects' && <ProjectsPage key={refreshKey} company={company} fmt={fmt} fmtDate={fmtDate} C={C} isMobile={isMobile} />}
          {activeMenu === 'transactions' && <TransactionsPage key={refreshKey} company={company} fmt={fmt} fmtDate={fmtDate} C={C} isMobile={isMobile} />}
          {activeMenu === 'contacts' && <ContactsPage key={refreshKey} company={company} fmt={fmt} C={C} isMobile={isMobile} />}
          {activeMenu === 'categories' && <CategoriesPage key={refreshKey} company={company} C={C} isMobile={isMobile} />}
          {activeMenu === 'accounts' && <AccountsPage key={refreshKey} company={company} fmt={fmt} fmtDate={fmtDate} C={C} isMobile={isMobile} />}
          {!['dashboard','projects','transactions','contacts','categories','accounts'].includes(activeMenu) && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '42px', marginBottom: '14px' }}>🚧</div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: C.dark, marginBottom: '6px' }}>Yakında Geliyor</h2>
              <p style={{ fontSize: '13px', color: C.text3 }}>Bu modül geliştirme aşamasında.</p>
            </div>
          )}
        </div>

        {/* ── MOBİL ALT MENÜ ── */}
        {isMobile && (
          <MobileBottomNav
            activeMenu={activeMenu}
            onNavigate={handleMenuClick}
            onMorePress={() => setSidebarOpen(true)}
            company={company}
            C={C}
            pendingCheques={stats.pendingCheques}
          />
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════
// DASHBOARD HOME
// ══════════════════════════════════════════
function DashboardHome({ stats, projects, transactions, cheques, fmt, fmtDate, C, navigate, isMobile }) {
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

// ══════════════════════════════════════════
// KASALAR
// ══════════════════════════════════════════
function AccountsPage({ company, fmt, fmtDate, C, isMobile }) {
  const [accounts, setAccounts] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [accountTxs, setAccountTxs] = useState([])
  const [accountTxLoading, setAccountTxLoading] = useState(false)
  const [txModal, setTxModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { name: '', type: 'cash', currency: 'TRY', balance: 0, bank_name: '', iban: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const emptyTxForm = { title: '', type: 'expense', amount: 0, date: new Date().toISOString().split('T')[0], notes: '' }
  const [txForm, setTxForm] = useState(emptyTxForm)
  const [txErrors, setTxErrors] = useState({})
  const [txSaving, setTxSaving] = useState(false)
  const [transferForm, setTransferForm] = useState({ from_id: '', to_id: '', amount: 0, note: '' })
  const [transferErrors, setTransferErrors] = useState({})
  const [transferSaving, setTransferSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    Promise.all([
      supabase.from('accounts').select('*').eq('company_id', company.id).eq('is_active', true).order('created_at'),
      supabase.from('categories').select('name').eq('company_id', company.id).eq('type', 'currency').eq('is_active', true),
    ]).then(([acc, cur]) => {
      setAccounts(acc.data || [])
      const codes = cur.data?.map(c => c.name) || DEFAULT_CURRENCY_CODES
      setCurrencies(codes)
      setLoading(false)
    })
  }, [company])

  const openDetail = async (a) => {
    setSelectedAccount(a); setDetailModal(true); setAccountTxLoading(true)
    const { data } = await supabase.from('transactions').select('*, projects(name), categories(name)').eq('company_id', company.id).eq('account_id', a.id).order('date', { ascending: false })
    setAccountTxs(data || [])
    setAccountTxLoading(false)
  }

  const openNew = () => { setEditItem(null); setForm(emptyForm); setErrors({}); setModal(true) }
  const openEdit = (a) => { setEditItem(a); setForm({ name: a.name, type: a.type, currency: a.currency, balance: a.balance, bank_name: a.bank_name || '', iban: a.iban || '' }); setErrors({}); setModal(true) }

  const save = async () => {
    const errs = validate({ name: { required: true, message: 'Hesap adı zorunludur' } }, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const payload = { company_id: company.id, name: form.name, type: form.type, currency: form.currency, balance: Number(form.balance) || 0, bank_name: form.bank_name || null, iban: form.iban || null, is_active: true }
    if (editItem) {
      const { data } = await supabase.from('accounts').update(payload).eq('id', editItem.id).select().single()
      if (data) setAccounts(accounts.map(a => a.id === editItem.id ? data : a))
    } else {
      const { data } = await supabase.from('accounts').insert(payload).select().single()
      if (data) setAccounts([...accounts, data])
    }
    setModal(false); setSaving(false)
  }

  const saveTx = async () => {
    const errs = validate({
      title: { required: true, message: 'Açıklama zorunludur' },
      amount: { required: true, min: 0.001, message: 'Tutar zorunludur', minMessage: 'Tutar 0\'dan büyük olmalıdır' },
    }, txForm)
    if (Object.keys(errs).length > 0) { setTxErrors(errs); return }
    setTxSaving(true)
    const acc = selectedAccount
    const amount = Number(txForm.amount)
    const newBalance = txForm.type === 'income' ? Number(acc.balance||0) + amount : Number(acc.balance||0) - amount
    const [txRes] = await Promise.all([
      supabase.from('transactions').insert({
        company_id: company.id, account_id: acc.id,
        title: txForm.title, type: txForm.type, amount,
        currency: acc.currency, date: txForm.date, notes: txForm.notes,
      }).select('*, projects(name), categories(name)').single(),
      supabase.from('accounts').update({ balance: newBalance }).eq('id', acc.id),
    ])
    if (txRes.data) {
      setAccountTxs([txRes.data, ...accountTxs])
      setAccounts(accounts.map(a => a.id === acc.id ? { ...a, balance: newBalance } : a))
      setSelectedAccount({ ...acc, balance: newBalance })
    }
    setTxModal(false); setTxForm(emptyTxForm); setTxSaving(false)
  }

  const handleTransfer = async () => {
    const errs = validate({
      from_id: { required: true, message: 'Kaynak hesap seçiniz' },
      to_id: { required: true, message: 'Hedef hesap seçiniz' },
      amount: { required: true, min: 0.001, message: 'Tutar zorunludur', minMessage: 'Tutar 0\'dan büyük olmalıdır' },
    }, transferForm)
    if (transferForm.from_id === transferForm.to_id) errs.to_id = 'Kaynak ve hedef farklı olmalıdır'
    if (Object.keys(errs).length > 0) { setTransferErrors(errs); return }
    setTransferSaving(true)
    const from = accounts.find(a => a.id === transferForm.from_id)
    const to = accounts.find(a => a.id === transferForm.to_id)
    const amount = Number(transferForm.amount)
    await Promise.all([
      supabase.from('accounts').update({ balance: Number(from.balance||0) - amount }).eq('id', from.id),
      supabase.from('accounts').update({ balance: Number(to.balance||0) + amount }).eq('id', to.id),
    ])
    setAccounts(accounts.map(a => {
      if (a.id === from.id) return { ...a, balance: Number(a.balance||0) - amount }
      if (a.id === to.id) return { ...a, balance: Number(a.balance||0) + amount }
      return a
    }))
    setTransferModal(false); setTransferForm({ from_id: '', to_id: '', amount: 0, note: '' }); setTransferSaving(false)
  }

  const typeLabel = { cash: 'Nakit', bank: 'Banka', credit_card: 'Kredi Kartı' }
  const typeIcon = { cash: '💵', bank: '🏦', credit_card: '💳' }

  const currencyTotals = accounts.reduce((acc, a) => {
    if (a.type === 'credit_card') return acc
    acc[a.currency] = (acc[a.currency] || 0) + Number(a.balance || 0)
    return acc
  }, {})

  return (
    <div>
      {!loading && Object.keys(currencyTotals).length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(Object.keys(currencyTotals).length, isMobile ? 2 : 4)}, 1fr)`, gap: '10px', marginBottom: '16px' }}>
          {Object.entries(currencyTotals).map(([code, total]) => {
            const meta = CURRENCY_META[code] || { symbol: code, label: code }
            const isNeg = total < 0
            return (
              <div key={code} style={{ background: C.cream, borderRadius: '10px', padding: '14px', border: `1px solid ${C.border}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', color: C.text3, letterSpacing: '0.05em' }}>{meta.label.toUpperCase()}</span>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: isNeg ? C.red : C.dark }}>{meta.symbol}</span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: '800', color: isNeg ? C.red : C.dark, fontVariantNumeric: 'tabular-nums' }}>{fmtAmount(total, code)}</div>
              </div>
            )
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: C.text3 }}>{accounts.length} hesap</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {accounts.length >= 2 && (
            <button onClick={() => { setTransferErrors({}); setTransferModal(true) }}
              style={{ background: C.cream, color: C.dark, fontWeight: '600', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px' }}>⇄ Transfer</button>
          )}
          <PrimaryBtn onClick={openNew}>+ Yeni Hesap</PrimaryBtn>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div>
      ) : accounts.length === 0 ? (
        <div style={{ background: C.cream, borderRadius: '10px', border: `1px dashed ${C.border}`, padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏦</div>
          <p style={{ color: C.text3, fontSize: '14px', marginBottom: '16px' }}>Henüz hesap yok</p>
          <PrimaryBtn onClick={openNew}>+ İlk Hesabı Ekle</PrimaryBtn>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
          {accounts.map(a => {
            const isNeg = Number(a.balance || 0) < 0
            return (
              <div key={a.id} style={{ background: C.cream, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.2s, border-color 0.2s' }}
                onClick={() => openDetail(a)}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,46,94,0.1)'; e.currentTarget.style.borderColor = C.amber }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = C.border }}>
                <div style={{ padding: '16px 18px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: C.cream2, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{typeIcon[a.type]}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{a.name}</div>
                        <div style={{ fontSize: '11px', color: C.text3 }}>{typeLabel[a.type]} · {a.currency}</div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); openEdit(a) }}
                      style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: isNeg ? C.red : C.dark, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {fmtAmount(a.balance || 0, a.currency)}
                  </div>
                </div>
                {(a.bank_name || a.iban) && (
                  <div style={{ padding: '10px 18px', borderTop: `1px solid ${C.border}` }}>
                    {a.bank_name && <div style={{ fontSize: '12px', color: C.text2 }}>🏛 {a.bank_name}</div>}
                    {a.iban && <div style={{ fontSize: '11px', color: C.text3, fontFamily: 'monospace' }}>{a.iban}</div>}
                  </div>
                )}
                <div style={{ padding: '8px 18px', background: C.cream2, borderTop: `1px solid ${C.border}` }}>
                  <span style={{ fontSize: '11px', color: C.amber, fontWeight: '600' }}>İşlem geçmişini gör →</span>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailModal && selectedAccount && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, margin: 0 }}>{selectedAccount.name}</h3>
                <p style={{ fontSize: '12px', color: C.text3, margin: '3px 0 0' }}>
                  {typeLabel[selectedAccount.type]} · {selectedAccount.currency}
                  {selectedAccount.bank_name && ` · ${selectedAccount.bank_name}`}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{ fontSize: '20px', fontWeight: '900', color: Number(selectedAccount.balance||0) < 0 ? C.red : C.dark, fontVariantNumeric: 'tabular-nums' }}>
                  {fmtAmount(selectedAccount.balance || 0, selectedAccount.currency)}
                </div>
                <button onClick={() => setDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer', marginLeft: '8px' }}>×</button>
              </div>
            </div>

            {!accountTxLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                {(() => {
                  const inc = accountTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
                  const exp = accountTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
                  return [
                    [fmtAmount(inc, selectedAccount.currency), 'Toplam Giren', C.green, C.greenBg],
                    [fmtAmount(exp, selectedAccount.currency), 'Toplam Çıkan', C.red, C.redBg],
                    [String(accountTxs.length), 'İşlem Sayısı', C.dark, C.cream],
                  ].map(([val, label, color, bg]) => (
                    <div key={label} style={{ background: bg, borderRadius: '8px', padding: '12px', border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '10px', color: C.text3, marginBottom: '4px', letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800', color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                    </div>
                  ))
                })()}
              </div>
            )}

            <div style={{ padding: '14px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h4 style={{ fontSize: '13px', fontWeight: '700', color: C.dark, margin: 0 }}>İşlem Geçmişi</h4>
                <PrimaryBtn small onClick={() => { setTxForm({ ...emptyTxForm, currency: selectedAccount.currency }); setTxErrors({}); setTxModal(true) }}>+ İşlem Ekle</PrimaryBtn>
              </div>
              {accountTxLoading ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
              accountTxs.length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Bu hesaba ait işlem bulunmuyor.</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                        {['Açıklama','Proje','Tarih','Tutar'].map((h, i) => <th key={h} style={{ ...thStyle, textAlign: i===3?'right':'left' }}>{h}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {accountTxs.map((t, i) => (
                        <tr key={t.id} style={{ borderBottom: i < accountTxs.length-1 ? `1px solid ${C.border}` : 'none' }}
                          onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                          <td style={{ padding: '10px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type==='income'?C.greenBg:C.redBg, color: t.type==='income'?C.green:C.red, fontSize: '11px', flexShrink: 0 }}>{t.type==='income'?'↑':'↓'}</div>
                              <span style={{ fontWeight: '600', color: C.dark }}>{t.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px 12px', color: C.text2 }}>{t.projects?.name || '—'}</td>
                          <td style={{ padding: '10px 12px', color: C.text2, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                          <td style={tdNum(t.type==='income'?C.green:C.red)}>{t.type==='income'?'+':'-'}{fmtAmount(t.amount, t.currency||selectedAccount.currency)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {txModal && (
        <Modal title="Kasaya İşlem Ekle" onClose={() => setTxModal(false)} onSave={saveTx} saving={txSaving} C={C}>
          <div style={{ background: C.cream2, borderRadius: '8px', padding: '10px 14px', marginBottom: '14px', fontSize: '13px', color: C.text2 }}>
            Hesap: <strong style={{ color: C.dark }}>{selectedAccount?.name}</strong> · Para birimi: <strong>{selectedAccount?.currency}</strong>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {[['expense','↓ Gider',C.red,C.redBg],['income','↑ Gelir',C.green,C.greenBg]].map(([v,l,col,bg]) => (
              <button key={v} onClick={() => setTxForm({...txForm, type: v})}
                style={{ padding: '10px', borderRadius: '8px', border: `2px solid`, borderColor: txForm.type===v?col:C.border, background: txForm.type===v?bg:'#fff', color: txForm.type===v?col:C.text3, fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <FField label="Açıklama" required C={C} error={txErrors.title}>
            <input value={txForm.title} onChange={e => { setTxForm({...txForm, title: e.target.value}); setTxErrors({...txErrors, title: ''}) }}
              placeholder="Nakit para girişi, gider ödemesi..." style={inp(C, txErrors.title)}/>
          </FField>
          <FRow>
            <FField label="Tutar" required C={C} error={txErrors.amount}>
              <NumberInput value={txForm.amount} onChange={v => { setTxForm({...txForm, amount: v}); setTxErrors({...txErrors, amount: ''}) }} style={inp(C, txErrors.amount)} error={txErrors.amount}/>
            </FField>
            <FField label="Tarih" C={C}>
              <input type="date" value={txForm.date} onChange={e => setTxForm({...txForm, date: e.target.value})} style={inp(C)}/>
            </FField>
          </FRow>
          <FField label="Not" C={C}>
            <input value={txForm.notes} onChange={e => setTxForm({...txForm, notes: e.target.value})} placeholder="Opsiyonel..." style={inp(C)}/>
          </FField>
        </Modal>
      )}

      {modal && (
        <Modal title={editItem ? 'Hesabı Düzenle' : 'Yeni Hesap'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Hesap Adı" required C={C} error={errors.name}>
            <input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: ''}) }}
              placeholder="Ana Kasa, Ziraat Bankası..." style={inp(C, errors.name)}/>
          </FField>
          <FRow>
            <FField label="Hesap Tipi" C={C}>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inp(C)}>
                <option value="cash">💵 Nakit Kasa</option>
                <option value="bank">🏦 Banka Hesabı</option>
                <option value="credit_card">💳 Kredi Kartı</option>
              </select>
            </FField>
            <FField label="Para Birimi" C={C}>
              <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={inp(C)}>
                {currencies.map(code => {
                  const meta = CURRENCY_META[code] || { symbol: code, label: code }
                  return <option key={code} value={code}>{meta.symbol} {meta.label} ({code})</option>
                })}
              </select>
            </FField>
          </FRow>
          <FField label="Mevcut Bakiye" C={C}>
            <NumberInput value={form.balance} onChange={v => setForm({...form, balance: v})} style={inp(C)}/>
          </FField>
          {form.type === 'bank' && (
            <>
              <FField label="Banka Adı" C={C}><input value={form.bank_name} onChange={e => setForm({...form, bank_name: e.target.value})} placeholder="Ziraat Bankası" style={inp(C)}/></FField>
              <FField label="IBAN" C={C}><input value={form.iban} onChange={e => setForm({...form, iban: e.target.value})} placeholder="TR00 0000 0000 0000 0000 0000 00" style={inp(C)}/></FField>
            </>
          )}
        </Modal>
      )}

      {transferModal && (
        <Modal title="Hesaplar Arası Transfer" onClose={() => setTransferModal(false)} onSave={handleTransfer} saving={transferSaving} C={C}>
          <FField label="Kaynak Hesap" required C={C} error={transferErrors.from_id}>
            <select value={transferForm.from_id} onChange={e => { setTransferForm({...transferForm, from_id: e.target.value}); setTransferErrors({...transferErrors, from_id: ''}) }} style={inp(C, transferErrors.from_id)}>
              <option value="">Seç...</option>
              {accounts.filter(a => a.id !== transferForm.to_id).map(a => <option key={a.id} value={a.id}>{a.name} ({fmtAmount(a.balance||0, a.currency)})</option>)}
            </select>
          </FField>
          <FField label="Hedef Hesap" required C={C} error={transferErrors.to_id}>
            <select value={transferForm.to_id} onChange={e => { setTransferForm({...transferForm, to_id: e.target.value}); setTransferErrors({...transferErrors, to_id: ''}) }} style={inp(C, transferErrors.to_id)}>
              <option value="">Seç...</option>
              {accounts.filter(a => a.id !== transferForm.from_id).map(a => <option key={a.id} value={a.id}>{a.name} ({fmtAmount(a.balance||0, a.currency)})</option>)}
            </select>
          </FField>
          <FField label="Tutar" required C={C} error={transferErrors.amount}>
            <NumberInput value={transferForm.amount} onChange={v => { setTransferForm({...transferForm, amount: v}); setTransferErrors({...transferErrors, amount: ''}) }} style={inp(C, transferErrors.amount)} error={transferErrors.amount}/>
          </FField>
          <FField label="Not" C={C}><input value={transferForm.note} onChange={e => setTransferForm({...transferForm, note: e.target.value})} placeholder="Opsiyonel..." style={inp(C)}/></FField>
        </Modal>
      )}
    </div>
  )
}

// ══════════════════════════════════════════
// MOBİL ALT MENÜ
// ══════════════════════════════════════════
function MobileBottomNav({ activeMenu, onNavigate, onMorePress, company, C, pendingCheques }) {
  const [quickModal, setQuickModal] = useState(false)
  const [projs, setProjs] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [form, setForm] = useState({ title: '', type: 'expense', amount: 0, currency: 'TRY', project_id: '', date: new Date().toISOString().split('T')[0] })
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  const navItems = [
    { id: 'dashboard', icon: '⊞', label: 'Özet' },
    { id: 'projects',  icon: '◫', label: 'Projeler' },
    { id: '__add__',   icon: '+', label: 'Ekle', isCenter: true },
    { id: 'transactions', icon: '↕', label: 'İşlemler' },
    { id: '__more__',  icon: '☰', label: 'Menü' },
  ]

  const openQuick = async () => {
    if (!company) return
    const [p, cur] = await Promise.all([
      supabase.from('projects').select('id,name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('categories').select('name').eq('company_id', company.id).eq('type', 'currency').eq('is_active', true),
    ])
    setProjs(p.data || [])
    const codes = cur.data?.map(c => c.name) || DEFAULT_CURRENCY_CODES
    setCurrencies(codes)
    setForm({ title: '', type: 'expense', amount: 0, currency: codes[0] || 'TRY', project_id: '', date: new Date().toISOString().split('T')[0] })
    setErrors({})
    setQuickModal(true)
  }

  const saveQuick = async () => {
    const errs = validate({
      title: { required: true, message: 'Açıklama zorunludur' },
      amount: { required: true, min: 0.001, message: 'Tutar zorunludur', minMessage: '0\'dan büyük olmalıdır' },
    }, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    await supabase.from('transactions').insert({
      company_id: company.id,
      title: form.title,
      type: form.type,
      amount: Number(form.amount),
      currency: form.currency,
      project_id: form.project_id || null,
      date: form.date,
    })
    setQuickModal(false)
    setSaving(false)
    onNavigate('transactions')
  }

  return (
    <>
      {/* Alt çubuk */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 80,
        background: C.cream,
        borderTop: `1px solid ${C.border}`,
        display: 'flex', alignItems: 'stretch',
        paddingBottom: 'env(safe-area-inset-bottom)',
        boxShadow: '0 -4px 20px rgba(27,46,94,0.08)',
      }}>
        {navItems.map((item) => {
          const isActive = activeMenu === item.id
          const isCenter = item.isCenter

          if (isCenter) return (
            <button key={item.id}
              onClick={openQuick}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '6px 4px 10px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
                position: 'relative',
              }}>
              <div style={{
                width: '50px', height: '50px',
                borderRadius: '50%',
                background: C.amber,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '26px', fontWeight: '300', color: C.dark,
                boxShadow: '0 4px 14px rgba(232,135,10,0.4)',
                marginTop: '-18px',
                border: `3px solid ${C.cream}`,
                lineHeight: '1',
              }}>+</div>
              <span style={{ fontSize: '10px', color: C.text3, marginTop: '4px', fontWeight: '500' }}>{item.label}</span>
            </button>
          )

          const handlePress = () => {
            if (item.id === '__more__') onMorePress()
            else onNavigate(item.id)
          }

          return (
            <button key={item.id}
              onClick={handlePress}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
                justifyContent: 'center', padding: '8px 4px 10px', border: 'none',
                background: 'transparent', cursor: 'pointer', fontFamily: 'Outfit, sans-serif',
              }}>
              <span style={{
                fontSize: '20px',
                color: isActive ? C.amber : C.text3,
                lineHeight: '1.2',
                position: 'relative',
              }}>
                {item.icon}
                {item.id === '__more__' && pendingCheques > 0 && (
                  <span style={{ position: 'absolute', top: '-4px', right: '-6px', width: '8px', height: '8px', background: C.red, borderRadius: '50%', display: 'block' }}/>
                )}
              </span>
              <span style={{
                fontSize: '10px', marginTop: '3px', fontWeight: isActive ? '700' : '500',
                color: isActive ? C.amber : C.text3,
              }}>{item.label}</span>
              {isActive && (
                <div style={{ position: 'absolute', top: 0, width: '28px', height: '2px', background: C.amber, borderRadius: '0 0 2px 2px' }}/>
              )}
            </button>
          )
        })}
      </div>

      {quickModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.6)', zIndex: 1000, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div style={{
            background: '#FAFAF8', borderRadius: '20px 20px 0 0', width: '100%',
            maxHeight: '90vh', overflowY: 'auto',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 16px)',
            animation: 'slideUp 0.3s ease',
          }}>
            <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: C.border }}/>
            </div>

            <div style={{ padding: '0 20px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, margin: 0 }}>Hızlı İşlem</h3>
              <button onClick={() => setQuickModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer' }}>×</button>
            </div>

            <div style={{ padding: '16px 20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '16px' }}>
                {[['expense','↓ Gider',C.red,'rgba(220,38,38,0.08)'],['income','↑ Gelir',C.green,'rgba(21,128,61,0.08)']].map(([v,l,col,bg]) => (
                  <button key={v} onClick={() => setForm({...form, type: v})}
                    style={{ padding: '12px', borderRadius: '10px', border: `2px solid`, borderColor: form.type===v?col:C.border, background: form.type===v?bg:'#fff', color: form.type===v?col:C.text3, fontFamily: 'Outfit, sans-serif', fontSize: '14px', fontWeight: '700', cursor: 'pointer' }}>
                    {l}
                  </button>
                ))}
              </div>

              <FField label="Açıklama" required C={{ ...C, text2: C.text2 }} error={errors.title}>
                <input value={form.title} onChange={e => { setForm({...form, title: e.target.value}); setErrors({...errors, title: ''}) }}
                  placeholder="Beton alımı, Daire satışı..." autoFocus
                  style={inp(C, errors.title)}/>
              </FField>

              <FField label="Tutar" required C={C} error={errors.amount}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <NumberInput value={form.amount} onChange={v => { setForm({...form, amount: v}); setErrors({...errors, amount: ''}) }}
                    style={{ ...inp(C, errors.amount), flex: 1 }} error={errors.amount}/>
                  <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})}
                    style={{ ...inp(C), width: '90px', flexShrink: 0 }}>
                    {currencies.map(code => {
                      const meta = CURRENCY_META[code] || { symbol: code }
                      return <option key={code} value={code}>{meta.symbol} {code}</option>
                    })}
                  </select>
                </div>
              </FField>

              {projs.length > 0 && (
                <FField label="Proje" C={C}>
                  <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={inp(C)}>
                    <option value="">Proje seç (opsiyonel)</option>
                    {projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </FField>
              )}

              <button onClick={saveQuick} disabled={saving}
                style={{ width: '100%', padding: '14px', marginTop: '8px', borderRadius: '10px', border: 'none', background: saving ? C.text3 : C.amber, color: C.dark, fontWeight: '700', fontSize: '15px', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                {saving ? 'Kaydediliyor...' : form.type === 'income' ? '↑ Gelir Kaydet' : '↓ Gider Kaydet'}
              </button>
            </div>
          </div>
          <style>{`
            @keyframes slideUp {
              from { transform: translateY(100%); }
              to { transform: translateY(0); }
            }
          `}</style>
        </div>
      )}
    </>
  )
}