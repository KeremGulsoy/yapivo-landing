'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const C = {
  dark: '#1B2E5E', dark2: '#2A4580', amber: '#E8870A', amberBg: 'rgba(232,135,10,0.1)',
  cream: '#F8F7F4', cream2: '#F0EEE9', border: '#E5E0D8',
  text: '#1B2E5E', text2: '#5F5E5A', text3: '#9A9890',
  green: '#15803d', greenBg: 'rgba(21,128,61,0.1)',
  red: '#dc2626', redBg: 'rgba(220,38,38,0.1)',
  blue: '#0891b2', blueBg: 'rgba(8,145,178,0.1)',
}

const navGroups = [
  { items: [{ id: 'dashboard', label: 'Özet', icon: '⊞' }] },
  { label: 'Projeler', items: [
    { id: 'projects', label: 'Projeler', icon: '◫' },
    { id: 'progress', label: 'Hakediş', icon: '◧' },
    { id: 'quotes', label: 'Teklifler', icon: '◨' },
    { id: 'contracts', label: 'Sözleşmeler', icon: '◱' },
  ]},
  { label: 'Finans', items: [
    { id: 'transactions', label: 'İşlemler', icon: '↕' },
    { id: 'accounts', label: 'Kasalar', icon: '⊟' },
    { id: 'cheques', label: 'Çek / Senet', icon: '⊡' },
  ]},
  { label: 'Bağlantılar', items: [
    { id: 'contacts', label: 'Cari Yönetimi', icon: '◎' },
    { id: 'documents', label: 'Belgeler', icon: '◳' },
  ]},
  { label: 'Analitik', items: [
    { id: 'reports', label: 'Raporlar', icon: '△' },
  ]},
  { label: 'Yönetim', items: [
    { id: 'users', label: 'Kullanıcılar', icon: '◉' },
    { id: 'categories', label: 'Kategoriler', icon: '◈' },
    { id: 'settings', label: 'Ayarlar', icon: '⊙' },
  ]},
]

// ── YARDIMCI ──
const fmt = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n || 0)
const fmtNum = (n) => new Intl.NumberFormat('tr-TR').format(n || 0)
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—'
const CURRENCIES = [
  { code: 'TRY', symbol: '₺', label: 'Türk Lirası (₺)' },
  { code: 'USD', symbol: '$', label: 'Amerikan Doları ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GOLD', symbol: 'gr', label: 'Altın (gr)' },
]
const getCurrencySymbol = (code) => CURRENCIES.find(c => c.code === code)?.symbol || '₺'
const fmtAmount = (amount, currency = 'TRY') => {
  const sym = getCurrencySymbol(currency)
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: currency === 'GOLD' ? 2 : 0,
    maximumFractionDigits: currency === 'TRY' ? 0 : 2
  }).format(amount || 0)
  return `${sym}${formatted}`
}

// ── MOBİL HOOK ──
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

// ── NUMBER INPUT ──
function NumberInput({ value, onChange, placeholder, style }) {
  const inputRef = useRef(null)
  const [display, setDisplay] = useState('')
  useEffect(() => {
    if (value && value !== 0) setDisplay(fmtNum(value))
    else setDisplay('')
  }, [])
  const handleChange = (e) => {
    const raw = e.target.value
    const digitsOnly = raw.replace(/[^\d,]/g, '')
    const parts = digitsOnly.split(',')
    const intPart = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.')
    const formatted = parts.length > 1 ? intPart + ',' + parts[1].slice(0, 2) : intPart
    setDisplay(formatted)
    const numericStr = parts[0].replace(/\./g, '') + (parts[1] !== undefined ? '.' + parts[1] : '')
    onChange(parseFloat(numericStr) || 0)
  }
  return <input ref={inputRef} value={display} onChange={handleChange} placeholder={placeholder || '0'} style={{ ...style, textAlign: 'right' }} inputMode="decimal" />
}

// ── MODAL ──
function Modal({ title, onClose, onSave, saving, children, C, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: wide ? '680px' : '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: C.dark, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>{children}</div>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
          <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '600' }}>İptal</button>
          <button onClick={onSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: saving ? C.text3 : C.amber, color: C.dark, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '700' }}>
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  )
}

function FRow({ children }) {
  const count = Array.isArray(children) ? children.filter(Boolean).length : 1
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${count}, 1fr)`, gap: '12px', marginBottom: '14px' }}>{children}</div>
}

function FField({ label, children, full, C }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined, marginBottom: '14px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: C.text2, display: 'block', marginBottom: '5px' }}>{label}</label>
      {children}
    </div>
  )
}

const inp = (C) => ({ width: '100%', padding: '10px 12px', borderRadius: '8px', border: `1.5px solid ${C.border}`, fontSize: '13px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: C.dark, boxSizing: 'border-box' })

// Tablo sarmalayıcı — yatay scroll
const ScrollTable = ({ children }) => (
  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '600px' }}>
      {children}
    </table>
  </div>
)

const thStyle = { padding: '10px 14px', color: '#9A9890', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #E5E0D8', textAlign: 'left', fontWeight: '500', whiteSpace: 'nowrap' }
const thRight = { ...thStyle, textAlign: 'right' }
const tdNum = (color) => ({ padding: '12px 14px', fontWeight: '700', color: color || '#1B2E5E', fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' })

// ── ANA DASHBOARD ──
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
    setActiveMenu(id)
    setRefreshKey(k => k + 1)
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
      setProfile(prof)
      setCompany(prof.companies)
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

  // Sidebar genişliği
  const sidebarW = isMobile ? 0 : sidebarCollapsed ? 60 : 240

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', fontFamily: 'Outfit, sans-serif', backgroundColor: C.cream2 }}>

      {/* MOBİL BACKDROP */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.5)', zIndex: 90 }} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: isMobile ? '260px' : sidebarCollapsed ? '60px' : '240px',
        flexShrink: 0,
        background: C.dark,
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.25s ease, transform 0.25s ease',
        overflow: 'hidden', zIndex: 100,
        position: isMobile ? 'fixed' : 'relative',
        top: 0, left: 0, bottom: 0,
        transform: isMobile ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)') : 'none',
      }}>
        {/* Logo */}
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

        {/* Şirket badge */}
        {(!sidebarCollapsed || isMobile) && company && (
          <div style={{ margin: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: C.cream, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{company.name}</div>
            <div style={{ fontSize: '10px', color: C.amber, marginTop: '2px' }}>● {company.plan === 'starter' ? 'Başlangıç' : company.plan === 'pro' ? 'Profesyonel' : 'Kurumsal'}</div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '6px 8px 8px' }}>
          {navGroups.map((group, gi) => (
            <div key={gi} style={{ marginBottom: '4px' }}>
              {group.label && (!sidebarCollapsed || isMobile) && (
                <div style={{ fontSize: '10px', color: 'rgba(248,247,244,0.25)', letterSpacing: '0.08em', textTransform: 'uppercase', padding: '6px 8px 3px', whiteSpace: 'nowrap' }}>{group.label}</div>
              )}
              {group.items.map((item) => {
                const isActive = activeMenu === item.id
                return (
                  <button key={item.id} onClick={() => handleMenuClick(item.id)}
                    title={sidebarCollapsed && !isMobile ? item.label : undefined}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '7px', border: `1px solid ${isActive ? 'rgba(232,135,10,0.25)' : 'transparent'}`, cursor: 'pointer', marginBottom: '1px', textAlign: 'left', backgroundColor: isActive ? C.amberBg : 'transparent', color: isActive ? C.amber : 'rgba(248,247,244,0.55)', fontFamily: 'Outfit, sans-serif', transition: 'all 0.12s' }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = C.cream } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(248,247,244,0.55)' } }}>
                    <span style={{ fontSize: '16px', flexShrink: 0, width: '18px', textAlign: 'center' }}>{item.icon}</span>
                    {(!sidebarCollapsed || isMobile) && (
                      <>
                        <span style={{ fontSize: '13px', fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap', flex: 1 }}>{item.label}</span>
                        {item.id === 'cheques' && stats.pendingCheques > 0 && (
                          <span style={{ fontSize: '10px', background: C.red, color: '#fff', borderRadius: '10px', padding: '1px 6px', flexShrink: 0 }}>{stats.pendingCheques}</span>
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

          {/* Mobil hamburger */}
          {isMobile && (
            <button onClick={() => setSidebarOpen(true)}
              style={{ width: '36px', height: '36px', borderRadius: '7px', background: C.cream2, border: `1px solid ${C.border}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', flexShrink: 0 }}>
              <span style={{ width: '16px', height: '2px', background: C.dark, borderRadius: '1px' }}/>
              <span style={{ width: '16px', height: '2px', background: C.dark, borderRadius: '1px' }}/>
              <span style={{ width: '16px', height: '2px', background: C.dark, borderRadius: '1px' }}/>
            </button>
          )}

          <div style={{ fontSize: '15px', fontWeight: '700', color: C.dark, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitle}</div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            {/* Arama — masaüstünde */}
            {!isMobile && (
              <input placeholder="🔍  Ara..." style={{ background: C.cream2, border: `1px solid ${C.border}`, borderRadius: '7px', padding: '6px 12px', color: C.text, fontSize: '13px', width: '160px', fontFamily: 'Outfit, sans-serif', outline: 'none' }}
                onFocus={e => e.target.style.borderColor = C.amber} onBlur={e => e.target.style.borderColor = C.border} />
            )}

            {/* Bildirim */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ width: '34px', height: '34px', borderRadius: '7px', background: C.cream2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '15px', color: C.text2, position: 'relative' }}>
                🔔
                {stats.pendingCheques > 0 && <div style={{ position: 'absolute', top: '5px', right: '5px', width: '7px', height: '7px', background: C.red, borderRadius: '50%' }}/>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: '42px', right: 0, width: isMobile ? '280px' : '300px', background: C.cream, border: `1px solid ${C.border}`, borderRadius: '10px', boxShadow: '0 8px 32px rgba(27,46,94,0.12)', zIndex: 200 }}>
                  <div style={{ padding: '12px 16px', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Bildirimler</span>
                  </div>
                  {cheques.length > 0 ? cheques.map((c, i) => (
                    <div key={i} style={{ padding: '11px 16px', borderBottom: i < cheques.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: C.dark, marginBottom: '3px' }}>⚠️ Çek Vadesi Yaklaşıyor</div>
                      <div style={{ fontSize: '12px', color: C.text2 }}>{fmt(c.amount)} — {fmtDate(c.due_date)}</div>
                    </div>
                  )) : <div style={{ padding: '24px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Bildirim yok</div>}
                </div>
              )}
            </div>

            {/* Kullanıcı */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '8px', borderLeft: `1px solid ${C.border}` }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: '700', color: C.cream, flexShrink: 0 }}>{initials}</div>
              {!isMobile && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: C.dark }}>{profile?.full_name || user?.email}</div>
                  <div style={{ fontSize: '10px', color: C.text3 }}>{{ owner: 'Patron', admin: 'Yönetici', accountant: 'Muhasebeci', field: 'Saha', viewer: 'Görüntüleyici' }[profile?.role] || profile?.role}</div>
                </div>
              )}
              <button onClick={handleLogout} title="Çıkış" style={{ width: '30px', height: '30px', borderRadius: '7px', background: C.cream2, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '13px', color: C.text3 }}>⏻</button>
            </div>
          </div>
        </div>

        {/* CONTENT */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '14px' : '20px' }}>
          {activeMenu === 'dashboard' && <DashboardHome stats={stats} projects={projects} transactions={transactions} cheques={cheques} fmt={fmt} fmtDate={fmtDate} C={C} navigate={handleMenuClick} isMobile={isMobile} />}
          {activeMenu === 'projects' && <ProjectsPage key={refreshKey} company={company} fmt={fmt} fmtDate={fmtDate} C={C} isMobile={isMobile} />}
          {activeMenu === 'transactions' && <TransactionsPage key={refreshKey} company={company} fmt={fmt} fmtDate={fmtDate} C={C} isMobile={isMobile} />}
          {activeMenu === 'contacts' && <ContactsPage key={refreshKey} company={company} fmt={fmt} C={C} isMobile={isMobile} />}
          {activeMenu === 'categories' && <CategoriesPage key={refreshKey} company={company} C={C} />}
          {activeMenu === 'accounts' && <AccountsPage key={refreshKey} company={company} fmt={fmt} C={C} isMobile={isMobile} />}
          {!['dashboard','projects','transactions','contacts','categories','accounts'].includes(activeMenu) && (
            <div style={{ textAlign: 'center', padding: '80px 0' }}>
              <div style={{ fontSize: '42px', marginBottom: '14px' }}>🚧</div>
              <h2 style={{ fontSize: '18px', fontWeight: '700', color: C.dark, marginBottom: '6px' }}>Yakında Geliyor</h2>
              <p style={{ fontSize: '13px', color: C.text3 }}>Bu modül geliştirme aşamasında.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── DASHBOARD HOME ──
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
      {/* KPI */}
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

      {/* Son Projeler + İşlemler */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '14px', marginBottom: '14px' }}>

        {/* Projeler */}
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
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '380px' }}>
                <thead><tr>{['Proje','Durum','Bütçe'].map((h, i) => <th key={h} style={{ ...thStyle, textAlign: i === 2 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
                <tbody>
                  {projects.slice(0, 5).map((p, i) => (
                    <tr key={p.id} style={{ borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '10px 14px' }}>
                        <div style={{ fontWeight: '600', color: C.dark }}>{p.name}</div>
                        <div style={{ fontSize: '11px', color: C.text3 }}>{p.address || '—'}</div>
                      </td>
                      <td style={{ padding: '10px 14px' }}>
                        <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: p.status === 'active' ? C.greenBg : 'rgba(136,135,128,0.1)', color: p.status === 'active' ? C.green : C.text3, whiteSpace: 'nowrap' }}>
                          {p.status === 'active' ? 'Aktif' : p.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
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

        {/* Son İşlemler */}
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
          ) : transactions.slice(0, 6).map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', borderBottom: i < 5 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: '28px', height: '28px', borderRadius: '7px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'income' ? C.greenBg : C.redBg, fontSize: '13px', color: t.type === 'income' ? C.green : C.red, flexShrink: 0 }}>{t.type === 'income' ? '↑' : '↓'}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: C.dark, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                <div style={{ fontSize: '11px', color: C.text3 }}>{t.projects?.name || 'Genel'} · {fmtDate(t.date)}</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: t.type === 'income' ? C.green : C.red, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>
                {t.type === 'income' ? '+' : '-'}{fmtAmount(t.amount, t.currency)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Vade yaklaşan çekler */}
      {cheques.length > 0 && (
        <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
          <div style={{ padding: '13px 16px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '7px', height: '7px', background: C.red, borderRadius: '50%', display: 'inline-block' }}/>
            <span style={{ fontSize: '13px', fontWeight: '700', color: C.dark }}>Vadesi Yaklaşan Çekler</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '400px' }}>
              <thead><tr>{['Tutar','Vade','Tür','Durum'].map((h, i) => <th key={h} style={{ ...thStyle, textAlign: i === 0 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
              <tbody>
                {cheques.map((c, i) => (
                  <tr key={c.id} style={{ borderBottom: i < cheques.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                    <td style={tdNum()}>{fmt(c.amount)}</td>
                    <td style={{ padding: '10px 14px', color: C.text2 }}>{fmtDate(c.due_date)}</td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: c.type === 'incoming' ? C.greenBg : C.redBg, color: c.type === 'incoming' ? C.green : C.red }}>{c.type === 'incoming' ? 'Alacak' : 'Borç'}</span></td>
                    <td style={{ padding: '10px 14px' }}><span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: C.amberBg, color: C.amber }}>Bekliyor</span></td>
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

// ── PROJELER ──
function ProjectsPage({ company, fmt, fmtDate, C, isMobile }) {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectTxs, setProjectTxs] = useState([])
  const [projectTxLoading, setProjectTxLoading] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ name: '', address: '', budget: 0, start_date: '', end_date: '', status: 'active', description: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    supabase.from('projects').select('*').eq('company_id', company.id).order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [company])

  const openDetail = async (p) => {
    setSelectedProject(p); setDetailModal(true); setProjectTxLoading(true)
    const { data } = await supabase.from('transactions').select('*, categories(name), contacts(name)').eq('company_id', company.id).eq('project_id', p.id).order('date', { ascending: false })
    setProjectTxs(data || []); setProjectTxLoading(false)
  }

  const openNew = () => { setEditItem(null); setForm({ name: '', address: '', budget: 0, start_date: '', end_date: '', status: 'active', description: '' }); setModal(true) }
  const openEdit = (p, e) => { e?.stopPropagation(); setEditItem(p); setForm({ name: p.name, address: p.address || '', budget: p.budget || 0, start_date: p.start_date || '', end_date: p.end_date || '', status: p.status, description: p.description || '' }); setModal(true) }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const payload = { company_id: company.id, name: form.name, address: form.address, budget: Number(form.budget) || 0, start_date: form.start_date || null, end_date: form.end_date || null, status: form.status, description: form.description }
    if (editItem) {
      const { data } = await supabase.from('projects').update(payload).eq('id', editItem.id).select().single()
      if (data) setProjects(projects.map(p => p.id === editItem.id ? data : p))
    } else {
      const { data } = await supabase.from('projects').insert(payload).select().single()
      if (data) setProjects([data, ...projects])
    }
    setModal(false); setSaving(false)
  }

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[['all','Tümü'],['active','Aktif'],['paused','Beklemede'],['completed','Tamamlandı']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 12px', borderRadius: '20px', border: filter === v ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: '600', background: filter === v ? C.dark : C.cream, color: filter === v ? C.cream : C.text3 }}>{l}</button>
          ))}
        </div>
        <button onClick={openNew} style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Yeni Proje</button>
      </div>

      <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
        filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: C.text3, fontSize: '13px', marginBottom: '8px' }}>Proje bulunamadı</p>
            <span style={{ color: C.amber, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={openNew}>+ İlk projeyi ekle</span>
          </div>
        ) : (
          <ScrollTable>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>Proje</th>
                {!isMobile && <th style={thStyle}>Adres</th>}
                <th style={thRight}>Bütçe</th>
                {!isMobile && <th style={thStyle}>Başlangıç</th>}
                {!isMobile && <th style={thStyle}>Bitiş</th>}
                <th style={thStyle}>Durum</th>
                <th style={thStyle}/>
                <th style={thStyle}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
                  onClick={() => openDetail(p)}
                  onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ fontWeight: '700', color: C.dark }}>{p.name}</div>
                    {p.description && <div style={{ fontSize: '11px', color: C.text3 }}>{p.description.slice(0,30)}</div>}
                  </td>
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{p.address || '—'}</td>}
                  <td style={tdNum()}>{fmt(p.budget)}</td>
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{fmtDate(p.start_date)}</td>}
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{fmtDate(p.end_date)}</td>}
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: p.status === 'active' ? C.greenBg : p.status === 'completed' ? 'rgba(27,46,94,0.1)' : 'rgba(156,163,175,0.12)', color: p.status === 'active' ? C.green : p.status === 'completed' ? C.dark : C.text3, whiteSpace: 'nowrap' }}>
                      {p.status === 'active' ? 'Aktif' : p.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px' }}><span style={{ fontSize: '12px', color: C.amber, fontWeight: '600', whiteSpace: 'nowrap' }}>Detay →</span></td>
                  <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                    <button onClick={(e) => openEdit(p, e)} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        )}
      </div>

      {/* Detay Modal */}
      {detailModal && selectedProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, margin: 0 }}>{selectedProject.name}</h3>
                <p style={{ fontSize: '12px', color: C.text3, margin: '3px 0 0' }}>{selectedProject.address || ''} {selectedProject.budget > 0 ? `· Bütçe: ${fmt(selectedProject.budget)}` : ''}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={(e) => { setDetailModal(false); openEdit(selectedProject, e) }} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: `1px solid ${C.amber}`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                <button onClick={() => setDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer' }}>×</button>
              </div>
            </div>
            {!projectTxLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                {(() => {
                  const income = projectTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
                  const expense = projectTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
                  const net = income - expense
                  const budget = selectedProject.budget || 0
                  const budgetUsed = budget > 0 ? Math.round((expense / budget) * 100) : null
                  return [
                    [fmt(income), 'Toplam Gelir', C.green, C.greenBg],
                    [fmt(expense), 'Toplam Gider', C.red, C.redBg],
                    [fmt(net), 'Net Kar/Zarar', net >= 0 ? C.green : C.red, net >= 0 ? C.greenBg : C.redBg],
                    [budgetUsed !== null ? `%${budgetUsed}` : '—', 'Bütçe Kullanımı', budgetUsed > 90 ? C.red : budgetUsed > 70 ? C.amber : C.dark, C.cream],
                  ].map(([val, label, color, bg]) => (
                    <div key={label} style={{ background: bg, borderRadius: '8px', padding: '12px', border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '10px', color: C.text3, marginBottom: '4px', letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
            <div style={{ padding: '14px 20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: C.dark, marginBottom: '10px' }}>İşlem Geçmişi</h4>
              {projectTxLoading ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
              projectTxs.length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Bu projeye ait işlem bulunmuyor.</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
                    <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{['Açıklama','Cari','Kategori','Tarih','Tutar'].map((h, i) => <th key={h} style={{ ...thStyle, textAlign: i === 4 ? 'right' : 'left' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {projectTxs.map((t, i) => (
                        <tr key={t.id} style={{ borderBottom: i < projectTxs.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'income' ? C.greenBg : C.redBg, color: t.type === 'income' ? C.green : C.red, fontSize: '11px', flexShrink: 0 }}>{t.type === 'income' ? '↑' : '↓'}</div>
                              <span style={{ fontWeight: '600', color: C.dark }}>{t.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', color: C.text2 }}>{t.contacts?.name || '—'}</td>
                          <td style={{ padding: '9px 12px' }}>{t.categories ? <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(27,46,94,0.08)', color: C.dark2 }}>{t.categories.name}</span> : <span style={{ color: C.text3 }}>—</span>}</td>
                          <td style={{ padding: '9px 12px', color: C.text2, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                          <td style={tdNum(t.type === 'income' ? C.green : C.red)}>{t.type === 'income' ? '+' : '-'}{fmtAmount(t.amount, t.currency)}</td>
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

      {modal && (
        <Modal title={editItem ? 'Projeyi Düzenle' : 'Yeni Proje'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Proje Adı *" C={C}><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Kadıköy Konut Projesi" style={inp(C)}/></FField>
          <FRow>
            <FField label="Durum" C={C}><select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inp(C)}><option value="active">Aktif</option><option value="paused">Beklemede</option><option value="completed">Tamamlandı</option></select></FField>
            <FField label="Bütçe (₺)" C={C}><NumberInput value={form.budget} onChange={v => setForm({...form, budget: v})} style={inp(C)}/></FField>
          </FRow>
          <FField label="Adres" C={C}><input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Proje adresi" style={inp(C)}/></FField>
          <FRow>
            <FField label="Başlangıç" C={C}><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={inp(C)}/></FField>
            <FField label="Bitiş" C={C}><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={inp(C)}/></FField>
          </FRow>
          <FField label="Açıklama" C={C}><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Notlar..." rows={3} style={{...inp(C), resize: 'vertical'}}/></FField>
        </Modal>
      )}
    </div>
  )
}

// ── İŞLEMLER ──
function TransactionsPage({ company, fmt, fmtDate, C, isMobile }) {
  const [txs, setTxs] = useState([])
  const [cats, setCats] = useState([])
  const [projs, setProjs] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const emptyForm = { title: '', type: 'expense', amount: 0, currency: 'TRY', category_id: '', project_id: '', contact_id: '', payment_type: 'cash', date: new Date().toISOString().split('T')[0], notes: '' }
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    Promise.all([
      supabase.from('transactions').select('*, projects(name), categories(name,color), contacts(name)').eq('company_id', company.id).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('company_id', company.id).eq('is_active', true),
      supabase.from('projects').select('id,name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('contacts').select('id,name,type').eq('company_id', company.id).eq('is_active', true).order('name'),
    ]).then(([t, c, p, ct]) => { setTxs(t.data || []); setCats(c.data || []); setProjs(p.data || []); setContacts(ct.data || []); setLoading(false) })
  }, [company])

  const openNew = () => { setEditItem(null); setForm(emptyForm); setModal(true) }
  const openEdit = (t) => { setEditItem(t); setForm({ title: t.title, type: t.type, amount: t.amount, currency: t.currency || 'TRY', category_id: t.category_id || '', project_id: t.project_id || '', contact_id: t.contact_id || '', payment_type: t.payment_type || 'cash', date: t.date, notes: t.notes || '' }); setModal(true) }

  const save = async () => {
    if (!form.title || !form.amount) return
    setSaving(true)
    const payload = { company_id: company.id, title: form.title, type: form.type, amount: Number(form.amount), currency: form.currency || 'TRY', category_id: form.category_id || null, project_id: form.project_id || null, contact_id: form.contact_id || null, payment_type: form.payment_type, date: form.date, notes: form.notes }
    if (editItem) {
      const { data } = await supabase.from('transactions').update(payload).eq('id', editItem.id).select('*, projects(name), categories(name,color), contacts(name)').single()
      if (data) setTxs(txs.map(t => t.id === editItem.id ? data : t))
    } else {
      const { data } = await supabase.from('transactions').insert(payload).select('*, projects(name), categories(name,color), contacts(name)').single()
      if (data) setTxs([data, ...txs])
    }
    setModal(false); setSaving(false)
  }

  const filtered = filter === 'all' ? txs : txs.filter(t => t.type === filter)
  const totalInc = txs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExp = txs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {[[fmt(totalInc),'Toplam Gelir',C.green,C.greenBg],[fmt(totalExp),'Toplam Gider',C.red,C.redBg],[fmt(totalInc-totalExp),'Net',C.dark,C.cream]].map(([v,l,col,bg],i) => (
          <div key={i} style={{ background: bg, borderRadius: '8px', padding: '11px 14px', border: `1px solid ${C.border}` }}>
            <div style={{ fontSize: '10px', color: C.text3, marginBottom: '3px', letterSpacing: '0.04em' }}>{l.toUpperCase()}</div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: col, fontVariantNumeric: 'tabular-nums' }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all','Tümü'],['income','Gelir'],['expense','Gider']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 12px', borderRadius: '20px', border: filter === v ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: '600', background: filter === v ? C.dark : C.cream, color: filter === v ? C.cream : C.text3 }}>{l}</button>
          ))}
        </div>
        <button onClick={openNew} style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Yeni İşlem</button>
      </div>

      <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
        filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: C.text3, fontSize: '13px', marginBottom: '8px' }}>Henüz işlem yok</p>
            <span style={{ color: C.amber, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={openNew}>+ İlk işlemi ekle</span>
          </div>
        ) : (
          <ScrollTable>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>Açıklama</th>
                <th style={thStyle}>Proje</th>
                {!isMobile && <th style={thStyle}>Cari</th>}
                {!isMobile && <th style={thStyle}>Kategori</th>}
                {!isMobile && <th style={thStyle}>Ödeme</th>}
                <th style={thStyle}>Tarih</th>
                <th style={thRight}>Tutar</th>
                <th style={thStyle}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, i) => (
                <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'income' ? C.greenBg : C.redBg, color: t.type === 'income' ? C.green : C.red, fontSize: '12px', flexShrink: 0 }}>{t.type === 'income' ? '↑' : '↓'}</div>
                      <span style={{ fontWeight: '600', color: C.dark }}>{t.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', color: C.text2 }}>{t.projects?.name || '—'}</td>
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{t.contacts?.name || '—'}</td>}
                  {!isMobile && <td style={{ padding: '11px 14px' }}>{t.categories ? <span style={{ fontSize: '11px', fontWeight: '500', padding: '2px 7px', borderRadius: '4px', background: 'rgba(27,46,94,0.08)', color: C.dark2 }}>{t.categories.name}</span> : <span style={{ color: C.text3 }}>—</span>}</td>}
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{{ cash:'Nakit', transfer:'Havale', cheque:'Çek', card:'Kart' }[t.payment_type] || '—'}</td>}
                  <td style={{ padding: '11px 14px', color: C.text2, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                  <td style={tdNum(t.type === 'income' ? C.green : C.red)}>{t.type === 'income' ? '+' : '-'}{fmtAmount(t.amount, t.currency)}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <button onClick={() => openEdit(t)} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        )}
      </div>

      {modal && (
        <Modal title={editItem ? 'İşlemi Düzenle' : 'Yeni İşlem'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C} wide>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
            {[['expense','↓ Gider',C.red,C.redBg],['income','↑ Gelir',C.green,C.greenBg]].map(([v,l,col,bg]) => (
              <button key={v} onClick={() => setForm({...form, type: v})} style={{ padding: '10px', borderRadius: '8px', border: `2px solid`, borderColor: form.type === v ? col : C.border, background: form.type === v ? bg : '#fff', color: form.type === v ? col : C.text3, fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <FField label="Proje *" C={C}>
            <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={inp(C)}>
              <option value="">Proje seç...</option>
              {projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FField>
          <FField label="Açıklama *" C={C}>
            <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Beton alımı, Daire satışı..." style={inp(C)}/>
          </FField>
          <FRow>
            <FField label="Tutar *" C={C}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <NumberInput value={form.amount} onChange={v => setForm({...form, amount: v})} style={{...inp(C), flex: 1}}/>
                <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={{...inp(C), width: '90px', flexShrink: 0}}>
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
                </select>
              </div>
            </FField>
            <FField label="Tarih" C={C}>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inp(C)}/>
            </FField>
          </FRow>
          <FRow>
            <FField label="Cari" C={C}>
              <select value={form.contact_id} onChange={e => setForm({...form, contact_id: e.target.value})} style={inp(C)}>
                <option value="">Cari seç...</option>
                {contacts.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FField>
            <FField label="Kategori" C={C}>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} style={inp(C)}>
                <option value="">Seç...</option>
                {cats.filter(c => c.type === form.type || c.type === 'both').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </FField>
            <FField label="Ödeme" C={C}>
              <select value={form.payment_type} onChange={e => setForm({...form, payment_type: e.target.value})} style={inp(C)}>
                <option value="cash">Nakit</option>
                <option value="transfer">Havale / EFT</option>
                <option value="cheque">Çek</option>
                <option value="card">Kart</option>
              </select>
            </FField>
          </FRow>
          <FField label="Not" C={C}><input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Opsiyonel..." style={inp(C)}/></FField>
        </Modal>
      )}
    </div>
  )
}

// ── CARİLER ──
function ContactsPage({ company, fmt, C, isMobile }) {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [selectedContact, setSelectedContact] = useState(null)
  const [contactTxs, setContactTxs] = useState([])
  const [contactTxLoading, setContactTxLoading] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const emptyForm = { name: '', type: 'supplier', tax_number: '', tax_office: '', phone: '', email: '', address: '' }
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    supabase.from('contacts').select('*').eq('company_id', company.id).order('name')
      .then(({ data }) => { setContacts(data || []); setLoading(false) })
  }, [company])

  const openDetail = async (c) => {
    setSelectedContact(c); setDetailModal(true); setContactTxLoading(true)
    const { data } = await supabase.from('transactions').select('*, projects(name), categories(name)').eq('company_id', company.id).eq('contact_id', c.id).order('date', { ascending: false })
    setContactTxs(data || []); setContactTxLoading(false)
  }
  const openNew = () => { setEditItem(null); setForm(emptyForm); setModal(true) }
  const openEdit = (c, e) => { e?.stopPropagation(); setEditItem(c); setForm({ name: c.name, type: c.type, tax_number: c.tax_number || '', tax_office: c.tax_office || '', phone: c.phone || '', email: c.email || '', address: c.address || '' }); setModal(true) }

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const payload = { company_id: company.id, ...form }
    if (editItem) {
      const { data } = await supabase.from('contacts').update(payload).eq('id', editItem.id).select().single()
      if (data) setContacts(contacts.map(c => c.id === editItem.id ? data : c))
    } else {
      const { data } = await supabase.from('contacts').insert(payload).select().single()
      if (data) setContacts([...contacts, data].sort((a, b) => a.name.localeCompare(b.name)))
    }
    setModal(false); setSaving(false)
  }

  const filtered = filter === 'all' ? contacts : contacts.filter(c => c.type === filter)
  const typeLabel = { customer: 'Müşteri', supplier: 'Tedarikçi', subcontractor: 'Taşeron' }
  const typeColor = { customer: [C.greenBg, C.green], supplier: [C.blueBg, C.blue], subcontractor: [C.amberBg, C.amber] }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {[['all','Tümü'],['customer','Müşteri'],['supplier','Tedarikçi'],['subcontractor','Taşeron']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 12px', borderRadius: '20px', border: filter === v ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: '600', background: filter === v ? C.dark : C.cream, color: filter === v ? C.cream : C.text3 }}>{l}</button>
          ))}
        </div>
        <button onClick={openNew} style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Yeni Cari</button>
      </div>

      <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
        filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ color: C.text3, fontSize: '13px', marginBottom: '8px' }}>Cari bulunamadı</p>
            <span style={{ color: C.amber, fontSize: '12px', fontWeight: '600', cursor: 'pointer' }} onClick={openNew}>+ Cari ekle</span>
          </div>
        ) : (
          <ScrollTable>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>Ad / Unvan</th>
                <th style={thStyle}>Tür</th>
                {!isMobile && <th style={thStyle}>Vergi No</th>}
                {!isMobile && <th style={thStyle}>Telefon</th>}
                <th style={thStyle}>Geçmiş</th>
                <th style={thStyle}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const [bg, col] = typeColor[c.type] || [C.amberBg, C.amber]
                return (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
                    onClick={() => openDetail(c)}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: '700', color: C.dark }}>{c.name}</div>
                      {c.email && <div style={{ fontSize: '11px', color: C.text3 }}>{c.email}</div>}
                    </td>
                    <td style={{ padding: '11px 14px' }}><span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: bg, color: col, whiteSpace: 'nowrap' }}>{typeLabel[c.type]}</span></td>
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{c.tax_number ? `${c.tax_number}${c.tax_office ? ` / ${c.tax_office}` : ''}` : '—'}</td>}
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{c.phone || '—'}</td>}
                    <td style={{ padding: '11px 14px' }}><span style={{ fontSize: '12px', color: C.amber, fontWeight: '600', whiteSpace: 'nowrap' }}>Gör →</span></td>
                    <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => openEdit(c, e)} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ScrollTable>
        )}
      </div>

      {/* Cari detay modal */}
      {detailModal && selectedContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, margin: 0 }}>{selectedContact.name}</h3>
                <p style={{ fontSize: '12px', color: C.text3, margin: '3px 0 0' }}>{typeLabel[selectedContact.type]}{selectedContact.tax_number && ` · ${selectedContact.tax_number}`}{selectedContact.phone && ` · ${selectedContact.phone}`}</p>
              </div>
              <button onClick={() => setDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer' }}>×</button>
            </div>
            {!contactTxLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                {(() => {
                  const income = contactTxs.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
                  const expense = contactTxs.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
                  const balance = income - expense
                  return [[fmt(income),'Toplam Gelir',C.green,C.greenBg],[fmt(expense),'Toplam Gider',C.red,C.redBg],[fmt(balance),'Net Bakiye',balance>=0?C.green:C.red,balance>=0?C.greenBg:C.redBg]].map(([val,label,color,bg]) => (
                    <div key={label} style={{ background: bg, borderRadius: '8px', padding: '12px', border: `1px solid ${C.border}` }}>
                      <div style={{ fontSize: '10px', color: C.text3, marginBottom: '4px', letterSpacing: '0.04em' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize: '17px', fontWeight: '800', color, fontVariantNumeric: 'tabular-nums' }}>{val}</div>
                    </div>
                  ))
                })()}
              </div>
            )}
            <div style={{ padding: '14px 20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: C.dark, marginBottom: '10px' }}>İşlem Geçmişi</h4>
              {contactTxLoading ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
              contactTxs.length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Bu cariye ait işlem bulunmuyor.</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
                    <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{['Açıklama','Proje','Kategori','Tarih','Tutar'].map((h,i) => <th key={h} style={{ ...thStyle, textAlign: i===4?'right':'left' }}>{h}</th>)}</tr></thead>
                    <tbody>
                      {contactTxs.map((t, i) => (
                        <tr key={t.id} style={{ borderBottom: i < contactTxs.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                          <td style={{ padding: '9px 12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                              <div style={{ width: '20px', height: '20px', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type === 'income' ? C.greenBg : C.redBg, color: t.type === 'income' ? C.green : C.red, fontSize: '11px', flexShrink: 0 }}>{t.type === 'income' ? '↑' : '↓'}</div>
                              <span style={{ fontWeight: '600', color: C.dark }}>{t.title}</span>
                            </div>
                          </td>
                          <td style={{ padding: '9px 12px', color: C.text2 }}>{t.projects?.name || '—'}</td>
                          <td style={{ padding: '9px 12px' }}>{t.categories ? <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', background: 'rgba(27,46,94,0.08)', color: C.dark2 }}>{t.categories.name}</span> : <span style={{ color: C.text3 }}>—</span>}</td>
                          <td style={{ padding: '9px 12px', color: C.text2, whiteSpace: 'nowrap' }}>{t.date}</td>
                          <td style={tdNum(t.type === 'income' ? C.green : C.red)}>{t.type === 'income' ? '+' : '-'}{fmtAmount(t.amount, t.currency)}</td>
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

      {modal && (
        <Modal title={editItem ? 'Cariyi Düzenle' : 'Yeni Cari'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Ad / Unvan *" C={C}><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ahmet Yılmaz veya ABC Ltd." style={inp(C)}/></FField>
          <FField label="Tür" C={C}><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inp(C)}><option value="customer">Müşteri</option><option value="supplier">Tedarikçi</option><option value="subcontractor">Taşeron</option></select></FField>
          <FRow>
            <FField label="Vergi No" C={C}><input value={form.tax_number} onChange={e => setForm({...form, tax_number: e.target.value})} placeholder="1234567890" style={inp(C)}/></FField>
            <FField label="Vergi Dairesi" C={C}><input value={form.tax_office} onChange={e => setForm({...form, tax_office: e.target.value})} placeholder="Kadıköy" style={inp(C)}/></FField>
          </FRow>
          <FRow>
            <FField label="Telefon" C={C}><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0532 111 22 33" style={inp(C)}/></FField>
            <FField label="Email" C={C}><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ornek@firma.com" style={inp(C)}/></FField>
          </FRow>
          <FField label="Adres" C={C}><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Adres..." rows={2} style={{...inp(C), resize: 'vertical'}}/></FField>
        </Modal>
      )}
    </div>
  )
}

// ── KATEGORİLER ──
function CategoriesPage({ company, C }) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#888780' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    supabase.from('categories').select('*').eq('company_id', company.id).order('order_index')
      .then(({ data }) => { setCats(data || []); setLoading(false) })
  }, [company])

  const save = async () => {
    if (!form.name) return
    setSaving(true)
    const { data } = await supabase.from('categories').insert({ company_id: company.id, ...form }).select().single()
    if (data) setCats([...cats, data])
    setModal(false); setSaving(false)
  }

  const toggle = async (id, is_active) => {
    await supabase.from('categories').update({ is_active: !is_active }).eq('id', id)
    setCats(cats.map(c => c.id === id ? {...c, is_active: !is_active} : c))
  }

  const filtered = filter === 'all' ? cats : cats.filter(c => c.type === filter)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all','Tümü'],['expense','Gider'],['income','Gelir'],['both','Her İkisi']].map(([v,l]) => (
            <button key={v} onClick={() => setFilter(v)} style={{ padding: '5px 12px', borderRadius: '20px', border: filter === v ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: '600', background: filter === v ? C.dark : C.cream, color: filter === v ? C.cream : C.text3 }}>{l}</button>
          ))}
        </div>
        <button onClick={() => { setForm({ name: '', type: 'expense', color: '#888780' }); setModal(true) }} style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Yeni Kategori</button>
      </div>
      <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Kategori bulunamadı</div> : (
          <ScrollTable>
            <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{['Kategori','Tür','Durum'].map(h => <th key={h} style={thStyle}>{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map((c, i) => (
                <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none', opacity: c.is_active ? 1 : 0.45 }}>
                  <td style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color || '#888', flexShrink: 0 }}/>
                      <span style={{ fontWeight: '600', color: C.dark }}>{c.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px', background: c.type === 'income' ? C.greenBg : c.type === 'expense' ? C.redBg : C.amberBg, color: c.type === 'income' ? C.green : c.type === 'expense' ? C.red : C.amber }}>
                      {c.type === 'income' ? 'Gelir' : c.type === 'expense' ? 'Gider' : 'Her İkisi'}
                    </span>
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <button onClick={() => toggle(c.id, c.is_active)} style={{ fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', border: 'none', cursor: 'pointer', background: c.is_active ? C.greenBg : 'rgba(156,163,175,0.15)', color: c.is_active ? C.green : C.text3, fontFamily: 'Outfit, sans-serif' }}>
                      {c.is_active ? 'Aktif' : 'Pasif'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </ScrollTable>
        )}
      </div>
      {modal && (
        <Modal title="Yeni Kategori" onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Kategori Adı *" C={C}><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Malzeme, İşçilik..." style={inp(C)}/></FField>
          <FField label="Tür" C={C}>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inp(C)}>
              <option value="expense">Gider</option>
              <option value="income">Gelir</option>
              <option value="both">Her İkisi</option>
            </select>
          </FField>
          <FField label="Renk" C={C}>
            <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})} style={{ width: '60px', height: '36px', borderRadius: '6px', border: `1px solid ${C.border}`, cursor: 'pointer' }}/>
          </FField>
        </Modal>
      )}
    </div>
  )
}

// ── KASALAR ──
function AccountsPage({ company, fmt, C, isMobile }) {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [transferModal, setTransferModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const emptyForm = { name: '', type: 'cash', currency: 'TRY', balance: 0, bank_name: '', iban: '' }
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [transferForm, setTransferForm] = useState({ from_id: '', to_id: '', amount: 0, note: '' })
  const [transferSaving, setTransferSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    supabase.from('accounts').select('*').eq('company_id', company.id).eq('is_active', true).order('created_at')
      .then(({ data }) => { setAccounts(data || []); setLoading(false) })
  }, [company])

  const openNew = () => { setEditItem(null); setForm(emptyForm); setModal(true) }
  const openEdit = (a) => { setEditItem(a); setForm({ name: a.name, type: a.type, currency: a.currency, balance: a.balance, bank_name: a.bank_name || '', iban: a.iban || '' }); setModal(true) }

  const save = async () => {
    if (!form.name) return
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

  const handleTransfer = async () => {
    if (!transferForm.from_id || !transferForm.to_id || !transferForm.amount) return
    if (transferForm.from_id === transferForm.to_id) return
    setTransferSaving(true)
    const from = accounts.find(a => a.id === transferForm.from_id)
    const to = accounts.find(a => a.id === transferForm.to_id)
    const amount = Number(transferForm.amount)
    await Promise.all([
      supabase.from('accounts').update({ balance: (from.balance || 0) - amount }).eq('id', from.id),
      supabase.from('accounts').update({ balance: (to.balance || 0) + amount }).eq('id', to.id),
    ])
    setAccounts(accounts.map(a => {
      if (a.id === from.id) return { ...a, balance: (a.balance || 0) - amount }
      if (a.id === to.id) return { ...a, balance: (a.balance || 0) + amount }
      return a
    }))
    setTransferModal(false)
    setTransferForm({ from_id: '', to_id: '', amount: 0, note: '' })
    setTransferSaving(false)
  }

  const typeLabel = { cash: 'Nakit', bank: 'Banka', credit_card: 'Kredi Kartı' }
  const typeIcon = { cash: '💵', bank: '🏦', credit_card: '💳' }
  const typeColor = { cash: [C.greenBg, C.green], bank: [C.blueBg, C.blue], credit_card: [C.redBg, C.red] }

  const totalByType = accounts.reduce((acc, a) => {
    if (a.currency !== 'TRY') return acc
    acc.total = (acc.total || 0) + Number(a.balance || 0)
    return acc
  }, {})

  return (
    <div>
      {/* Toplam bakiye kartları */}
      {!loading && accounts.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: '10px', marginBottom: '16px' }}>
          {[
            [accounts.filter(a => a.type === 'cash').reduce((s, a) => s + Number(a.balance || 0), 0), 'Nakit Toplam', '💵', C.greenBg, C.green],
            [accounts.filter(a => a.type === 'bank').reduce((s, a) => s + Number(a.balance || 0), 0), 'Banka Toplam', '🏦', C.blueBg, C.blue],
            [accounts.filter(a => a.type !== 'credit_card').reduce((s, a) => s + Number(a.balance || 0), 0), 'Toplam Bakiye', '◈', 'rgba(27,46,94,0.05)', C.dark],
          ].map(([val, label, icon, bg, color]) => (
            <div key={label} style={{ background: bg, borderRadius: '10px', padding: '14px', border: `1px solid ${C.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '10px', color: C.text3, letterSpacing: '0.05em' }}>{label.toUpperCase()}</span>
                <span style={{ fontSize: '16px' }}>{icon}</span>
              </div>
              <div style={{ fontSize: '18px', fontWeight: '800', color, fontVariantNumeric: 'tabular-nums' }}>{fmt(val)}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '13px', color: C.text3 }}>{accounts.length} hesap</span>
        <div style={{ display: 'flex', gap: '8px' }}>
          {accounts.length >= 2 && (
            <button onClick={() => setTransferModal(true)} style={{ background: C.cream, color: C.dark, fontWeight: '600', padding: '9px 14px', borderRadius: '8px', border: `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>⇄ Transfer</button>
          )}
          <button onClick={openNew} style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', whiteSpace: 'nowrap' }}>+ Yeni Hesap</button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div>
      ) : accounts.length === 0 ? (
        <div style={{ background: C.cream, borderRadius: '10px', border: `1px dashed ${C.border}`, padding: '60px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏦</div>
          <p style={{ color: C.text3, fontSize: '14px', marginBottom: '8px' }}>Henüz hesap yok</p>
          <p style={{ color: C.text2, fontSize: '13px', marginBottom: '16px' }}>Nakit kasa, banka hesabı veya kredi kartı ekle</p>
          <button onClick={openNew} style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>+ İlk Hesabı Ekle</button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
          {accounts.map(a => {
            const [bg, col] = typeColor[a.type] || [C.amberBg, C.amber]
            const isNegative = Number(a.balance || 0) < 0
            return (
              <div key={a.id} style={{ background: C.cream, borderRadius: '12px', border: `1px solid ${C.border}`, overflow: 'hidden', transition: 'box-shadow 0.2s' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(27,46,94,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}>
                {/* Kart başlık */}
                <div style={{ padding: '16px 18px 12px', borderBottom: `1px solid ${C.border}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>{typeIcon[a.type]}</div>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: '700', color: C.dark }}>{a.name}</div>
                        <div style={{ fontSize: '11px', color: C.text3 }}>
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '1px 6px', borderRadius: '4px', background: bg, color: col }}>{typeLabel[a.type]}</span>
                          <span style={{ marginLeft: '6px' }}>{a.currency}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => openEdit(a)} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: '900', color: isNegative ? C.red : C.dark, fontVariantNumeric: 'tabular-nums', textAlign: 'right' }}>
                    {fmtAmount(a.balance || 0, a.currency)}
                  </div>
                </div>
                {/* Banka detayı */}
                {(a.bank_name || a.iban) && (
                  <div style={{ padding: '10px 18px' }}>
                    {a.bank_name && <div style={{ fontSize: '12px', color: C.text2, marginBottom: '3px' }}>🏛 {a.bank_name}</div>}
                    {a.iban && <div style={{ fontSize: '11px', color: C.text3, fontFamily: 'monospace', letterSpacing: '0.5px' }}>{a.iban}</div>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Hesap Formu */}
      {modal && (
        <Modal title={editItem ? 'Hesabı Düzenle' : 'Yeni Hesap'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Hesap Adı *" C={C}><input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Ana Kasa, Ziraat Bankası..." style={inp(C)}/></FField>
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
                {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>)}
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

      {/* Transfer Modal */}
      {transferModal && (
        <Modal title="Hesaplar Arası Transfer" onClose={() => setTransferModal(false)} onSave={handleTransfer} saving={transferSaving} C={C}>
          <FField label="Kaynak Hesap" C={C}>
            <select value={transferForm.from_id} onChange={e => setTransferForm({...transferForm, from_id: e.target.value})} style={inp(C)}>
              <option value="">Seç...</option>
              {accounts.filter(a => a.id !== transferForm.to_id).map(a => <option key={a.id} value={a.id}>{a.name} ({fmtAmount(a.balance || 0, a.currency)})</option>)}
            </select>
          </FField>
          <FField label="Hedef Hesap" C={C}>
            <select value={transferForm.to_id} onChange={e => setTransferForm({...transferForm, to_id: e.target.value})} style={inp(C)}>
              <option value="">Seç...</option>
              {accounts.filter(a => a.id !== transferForm.from_id).map(a => <option key={a.id} value={a.id}>{a.name} ({fmtAmount(a.balance || 0, a.currency)})</option>)}
            </select>
          </FField>
          <FField label="Transfer Tutarı" C={C}>
            <NumberInput value={transferForm.amount} onChange={v => setTransferForm({...transferForm, amount: v})} style={inp(C)}/>
          </FField>
          <FField label="Not" C={C}>
            <input value={transferForm.note} onChange={e => setTransferForm({...transferForm, note: e.target.value})} placeholder="Opsiyonel..." style={inp(C)}/>
          </FField>
        </Modal>
      )}
    </div>
  )
}
