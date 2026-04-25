'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '⊞' },
  { id: 'projects', label: 'Projeler', icon: '🏗️' },
  { id: 'transactions', label: 'İşlemler', icon: '💰' },
  { id: 'contacts', label: 'Cariler', icon: '👥' },
  { id: 'cheques', label: 'Çek / Senet', icon: '🏦' },
  { id: 'progress', label: 'Hakedişler', icon: '📋' },
  { id: 'reports', label: 'Raporlar', icon: '📊' },
  { id: 'settings', label: 'Ayarlar', icon: '⚙️' },
]

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const [company, setCompany] = useState(null)
  const [profile, setProfile] = useState(null)
  const [activeMenu, setActiveMenu] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState({ income: 0, expense: 0, projects: 0, contacts: 0 })
  const [projects, setProjects] = useState([])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) { window.location.href = '/login'; return }
      setUser(session.user)

      const { data: prof } = await supabase
        .from('profiles')
        .select('*, companies(*)')
        .eq('id', session.user.id)
        .single()

      if (!prof?.company_id) { window.location.href = '/setup'; return }
      setProfile(prof)
      setCompany(prof.companies)

      // İstatistikleri çek
      const companyId = prof.company_id

      const [incomeRes, expenseRes, projectsRes, contactsRes, recentTx] = await Promise.all([
        supabase.from('transactions').select('amount').eq('company_id', companyId).eq('type', 'income'),
        supabase.from('transactions').select('amount').eq('company_id', companyId).eq('type', 'expense'),
        supabase.from('projects').select('*').eq('company_id', companyId).order('created_at', { ascending: false }),
        supabase.from('contacts').select('id').eq('company_id', companyId),
        supabase.from('transactions').select('*, projects(name), categories(name)').eq('company_id', companyId).order('created_at', { ascending: false }).limit(8)
      ])

      const totalIncome = incomeRes.data?.reduce((s, r) => s + Number(r.amount), 0) || 0
      const totalExpense = expenseRes.data?.reduce((s, r) => s + Number(r.amount), 0) || 0

      setStats({
        income: totalIncome,
        expense: totalExpense,
        net: totalIncome - totalExpense,
        projects: projectsRes.data?.length || 0,
        contacts: contactsRes.data?.length || 0
      })
      setProjects(projectsRes.data || [])
      setTransactions(recentTx.data || [])
      setLoading(false)
    }
    init()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  const fmt = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)

  if (loading) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1B2E5E', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Outfit, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '32px', fontWeight: '800', color: '#F8F7F4', marginBottom: '8px' }}>yap<span style={{ color: '#E8870A' }}>ivo</span></div>
        <p style={{ color: 'rgba(248,247,244,0.4)', fontSize: '14px' }}>Yükleniyor...</p>
      </div>
    </div>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#F0EEE9', fontFamily: 'Outfit, sans-serif' }}>

      {/* SIDEBAR */}
      <div style={{
        width: sidebarOpen ? '240px' : '64px', flexShrink: 0,
        backgroundColor: '#1B2E5E', transition: 'width 0.3s ease',
        display: 'flex', flexDirection: 'column', position: 'fixed',
        top: 0, left: 0, bottom: 0, zIndex: 100, overflow: 'hidden'
      }}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => setSidebarOpen(!sidebarOpen)}>
          <div style={{ width: '32px', height: '32px', backgroundColor: '#E8870A', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="18" height="18" viewBox="0 0 40 40" fill="none">
              <line x1="8" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="32" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="3.5" strokeLinecap="round"/>
              <line x1="20" y1="22" x2="20" y2="36" stroke="#1B2E5E" strokeWidth="3.5" strokeLinecap="round"/>
            </svg>
          </div>
          {sidebarOpen && <span style={{ fontSize: '18px', fontWeight: '800', color: '#F8F7F4', whiteSpace: 'nowrap' }}>yap<span style={{ color: '#E8870A' }}>ivo</span></span>}
        </div>

        {/* Şirket adı */}
        {sidebarOpen && company && (
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <p style={{ fontSize: '11px', color: 'rgba(248,247,244,0.35)', marginBottom: '2px' }}>Şirket</p>
            <p style={{ fontSize: '13px', fontWeight: '600', color: '#F8F7F4', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{company.name}</p>
          </div>
        )}

        {/* Menü */}
        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {menuItems.map((item) => (
            <button key={item.id} onClick={() => setActiveMenu(item.id)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 10px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', marginBottom: '2px', textAlign: 'left',
                backgroundColor: activeMenu === item.id ? 'rgba(232,135,10,0.15)' : 'transparent',
                color: activeMenu === item.id ? '#E8870A' : 'rgba(248,247,244,0.6)',
                transition: 'all 0.15s', fontFamily: 'Outfit, sans-serif'
              }}>
              <span style={{ fontSize: '16px', flexShrink: 0, width: '20px', textAlign: 'center' }}>{item.icon}</span>
              {sidebarOpen && <span style={{ fontSize: '13px', fontWeight: activeMenu === item.id ? '600' : '400', whiteSpace: 'nowrap' }}>{item.label}</span>}
              {sidebarOpen && activeMenu === item.id && <div style={{ marginLeft: 'auto', width: '4px', height: '4px', borderRadius: '50%', backgroundColor: '#E8870A' }}/>}
            </button>
          ))}
        </nav>

        {/* Alt kullanıcı */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleLogout}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
              padding: '10px', borderRadius: '8px', border: 'none',
              cursor: 'pointer', backgroundColor: 'transparent',
              color: 'rgba(248,247,244,0.4)', fontFamily: 'Outfit, sans-serif'
            }}>
            <span style={{ fontSize: '16px' }}>→</span>
            {sidebarOpen && <span style={{ fontSize: '13px' }}>Çıkış Yap</span>}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, marginLeft: sidebarOpen ? '240px' : '64px', transition: 'margin-left 0.3s ease', minHeight: '100vh' }}>

        {/* Top bar */}
        <div style={{
          backgroundColor: '#F8F7F4', borderBottom: '1px solid #E5E0D8',
          padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          position: 'sticky', top: 0, zIndex: 50
        }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: '700', color: '#1B2E5E', margin: 0 }}>
              {menuItems.find(m => m.id === activeMenu)?.label}
            </h1>
            <p style={{ fontSize: '12px', color: '#888780', margin: 0 }}>
              {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B2E5E', margin: 0 }}>{profile?.full_name || user?.email}</p>
              <p style={{ fontSize: '11px', color: '#888780', margin: 0, textTransform: 'capitalize' }}>{profile?.role}</p>
            </div>
            <div style={{ width: '36px', height: '36px', backgroundColor: '#1B2E5E', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#F8F7F4', fontSize: '14px', fontWeight: '700' }}>
                {(profile?.full_name || user?.email || 'U')[0].toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* İÇERİK */}
        <div style={{ padding: '24px' }}>

          {activeMenu === 'dashboard' && (
            <DashboardHome stats={stats} projects={projects} transactions={transactions} fmt={fmt} />
          )}

          {activeMenu === 'projects' && (
            <ProjectsPage company={company} fmt={fmt} />
          )}

          {activeMenu === 'transactions' && (
            <TransactionsPage company={company} fmt={fmt} />
          )}

          {activeMenu !== 'dashboard' && activeMenu !== 'projects' && activeMenu !== 'transactions' && (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1B2E5E', marginBottom: '8px' }}>Yakında Geliyor</h2>
              <p style={{ color: '#888780', fontSize: '14px' }}>Bu modül geliştirme aşamasında.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── DASHBOARD HOME ──
function DashboardHome({ stats, projects, transactions, fmt }) {
  return (
    <div>
      {/* KPI Kartlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {[
          { label: 'Toplam Gelir', value: fmt(stats.income), color: '#15803d', bg: 'rgba(21,128,61,0.08)', icon: '↑' },
          { label: 'Toplam Gider', value: fmt(stats.expense), color: '#dc2626', bg: 'rgba(220,38,38,0.08)', icon: '↓' },
          { label: 'Net Kar', value: fmt(stats.net || 0), color: stats.net >= 0 ? '#1B2E5E' : '#dc2626', bg: '#F8F7F4', icon: '◈', bold: true },
          { label: 'Aktif Proje', value: stats.projects, color: '#E8870A', bg: 'rgba(232,135,10,0.08)', icon: '🏗️' },
          { label: 'Cari Sayısı', value: stats.contacts, color: '#2A4580', bg: 'rgba(42,69,128,0.08)', icon: '👥' },
        ].map((kpi, i) => (
          <div key={i} style={{
            backgroundColor: kpi.bold ? '#1B2E5E' : '#F8F7F4',
            borderRadius: '12px', padding: '20px',
            border: kpi.bold ? 'none' : '1px solid #E5E0D8'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <p style={{ fontSize: '12px', color: kpi.bold ? 'rgba(248,247,244,0.5)' : '#888780', margin: 0 }}>{kpi.label}</p>
              <div style={{ width: '28px', height: '28px', backgroundColor: kpi.bold ? 'rgba(232,135,10,0.2)' : kpi.bg, borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px' }}>
                {kpi.icon}
              </div>
            </div>
            <p style={{ fontSize: '22px', fontWeight: '800', color: kpi.bold ? '#F8F7F4' : kpi.color, margin: 0 }}>{kpi.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* Projeler */}
        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #E5E0D8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1B2E5E', margin: 0 }}>Son Projeler</h3>
            <span style={{ fontSize: '11px', color: '#E8870A', cursor: 'pointer', fontWeight: '600' }}>Tümü →</span>
          </div>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#B4B2A9', fontSize: '13px' }}>Henüz proje yok</p>
              <p style={{ color: '#E8870A', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>+ Proje Ekle</p>
            </div>
          ) : projects.slice(0, 5).map((p) => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0EEE9' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B2E5E', margin: '0 0 2px' }}>{p.name}</p>
                <p style={{ fontSize: '11px', color: '#888780', margin: 0 }}>{p.address || '—'}</p>
              </div>
              <span style={{
                fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px',
                backgroundColor: p.status === 'active' ? 'rgba(21,128,61,0.1)' : 'rgba(136,135,128,0.1)',
                color: p.status === 'active' ? '#15803d' : '#888780'
              }}>
                {p.status === 'active' ? 'Aktif' : p.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
              </span>
            </div>
          ))}
        </div>

        {/* Son İşlemler */}
        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #E5E0D8' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#1B2E5E', margin: 0 }}>Son İşlemler</h3>
            <span style={{ fontSize: '11px', color: '#E8870A', cursor: 'pointer', fontWeight: '600' }}>Tümü →</span>
          </div>
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <p style={{ color: '#B4B2A9', fontSize: '13px' }}>Henüz işlem yok</p>
              <p style={{ color: '#E8870A', fontSize: '12px', cursor: 'pointer', fontWeight: '600' }}>+ İşlem Ekle</p>
            </div>
          ) : transactions.map((t) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0EEE9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: t.type === 'income' ? 'rgba(21,128,61,0.1)' : 'rgba(220,38,38,0.1)'
                }}>
                  <span style={{ fontSize: '14px' }}>{t.type === 'income' ? '↑' : '↓'}</span>
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B2E5E', margin: '0 0 2px' }}>{t.title}</p>
                  <p style={{ fontSize: '11px', color: '#888780', margin: 0 }}>{t.projects?.name || 'Genel'}</p>
                </div>
              </div>
              <p style={{ fontSize: '13px', fontWeight: '700', color: t.type === 'income' ? '#15803d' : '#dc2626', margin: 0 }}>
                {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('tr-TR').format(t.amount)} ₺
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── PROJELER ──
function ProjectsPage({ company, fmt }) {
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', address: '', budget: '', start_date: '', end_date: '', status: 'active' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    supabase.from('projects').select('*').eq('company_id', company.id).order('created_at', { ascending: false })
      .then(({ data }) => { setProjects(data || []); setLoading(false) })
  }, [company])

  const handleSave = async () => {
    if (!form.name) return
    setSaving(true)
    const { data, error } = await supabase.from('projects').insert({
      company_id: company.id,
      name: form.name,
      address: form.address,
      budget: form.budget ? Number(form.budget) : 0,
      start_date: form.start_date || null,
      end_date: form.end_date || null,
      status: form.status
    }).select().single()

    if (!error) {
      setProjects([data, ...projects])
      setShowForm(false)
      setForm({ name: '', address: '', budget: '', start_date: '', end_date: '', status: 'active' })
    }
    setSaving(false)
  }

  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E5E0D8', fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '5px' }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <p style={{ color: '#888780', fontSize: '13px', margin: 0 }}>{projects.length} proje</p>
        <button onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#E8870A', color: '#1B2E5E', fontWeight: '700', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px' }}>
          + Yeni Proje
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #E5E0D8', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1B2E5E', marginBottom: '16px' }}>Yeni Proje</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Proje Adı *</label>
              <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Kadıköy Konut Projesi" style={inputStyle}/>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Adres</label>
              <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Proje adresi" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Bütçe (₺)</label>
              <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} placeholder="0" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Durum</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inputStyle}>
                <option value="active">Aktif</option>
                <option value="paused">Beklemede</option>
                <option value="completed">Tamamlandı</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Başlangıç Tarihi</label>
              <input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Bitiş Tarihi</label>
              <input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={inputStyle}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: '#E8870A', color: '#1B2E5E', fontWeight: '700', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ backgroundColor: 'transparent', color: '#888780', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: '1px solid #E5E0D8', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? <p style={{ color: '#888780', fontSize: '14px' }}>Yükleniyor...</p> : (
        <div style={{ display: 'grid', gap: '12px' }}>
          {projects.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', backgroundColor: '#F8F7F4', borderRadius: '12px', border: '1px dashed #E5E0D8' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>🏗️</p>
              <p style={{ color: '#888780', fontSize: '14px', marginBottom: '4px' }}>Henüz proje yok</p>
              <p style={{ color: '#E8870A', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} onClick={() => setShowForm(true)}>+ İlk projeyi ekle</p>
            </div>
          ) : projects.map(p => (
            <div key={p.id} style={{ backgroundColor: '#F8F7F4', borderRadius: '12px', padding: '16px 20px', border: '1px solid #E5E0D8', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#1B2E5E', margin: 0 }}>{p.name}</h4>
                  <span style={{
                    fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                    backgroundColor: p.status === 'active' ? 'rgba(21,128,61,0.1)' : p.status === 'completed' ? 'rgba(27,46,94,0.1)' : 'rgba(136,135,128,0.1)',
                    color: p.status === 'active' ? '#15803d' : p.status === 'completed' ? '#1B2E5E' : '#888780'
                  }}>
                    {p.status === 'active' ? 'Aktif' : p.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                  </span>
                </div>
                <p style={{ fontSize: '12px', color: '#888780', margin: 0 }}>{p.address || '—'} {p.start_date ? `· ${new Date(p.start_date).toLocaleDateString('tr-TR')}` : ''}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '15px', fontWeight: '700', color: '#1B2E5E', margin: '0 0 2px' }}>{fmt(p.budget || 0)}</p>
                <p style={{ fontSize: '11px', color: '#888780', margin: 0 }}>Bütçe</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── İŞLEMLER ──
function TransactionsPage({ company, fmt }) {
  const [transactions, setTransactions] = useState([])
  const [categories, setCategories] = useState([])
  const [projects, setProjects] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ title: '', type: 'expense', amount: '', category_id: '', project_id: '', payment_type: 'cash', date: new Date().toISOString().split('T')[0], notes: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    Promise.all([
      supabase.from('transactions').select('*, projects(name), categories(name, color)').eq('company_id', company.id).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('company_id', company.id).eq('is_active', true),
      supabase.from('projects').select('id, name').eq('company_id', company.id).eq('status', 'active')
    ]).then(([tx, cats, projs]) => {
      setTransactions(tx.data || [])
      setCategories(cats.data || [])
      setProjects(projs.data || [])
      setLoading(false)
    })
  }, [company])

  const handleSave = async () => {
    if (!form.title || !form.amount) return
    setSaving(true)
    const { data, error } = await supabase.from('transactions').insert({
      company_id: company.id,
      title: form.title,
      type: form.type,
      amount: Number(form.amount),
      category_id: form.category_id || null,
      project_id: form.project_id || null,
      payment_type: form.payment_type,
      date: form.date,
      notes: form.notes,
      currency: 'TRY'
    }).select('*, projects(name), categories(name, color)').single()

    if (!error) {
      setTransactions([data, ...transactions])
      setShowForm(false)
      setForm({ title: '', type: 'expense', amount: '', category_id: '', project_id: '', payment_type: 'cash', date: new Date().toISOString().split('T')[0], notes: '' })
    }
    setSaving(false)
  }

  const filtered = filter === 'all' ? transactions : transactions.filter(t => t.type === filter)
  const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1.5px solid #E5E0D8', fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }
  const labelStyle = { fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '5px' }

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)

  return (
    <div>
      {/* Özet */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Toplam Gelir', value: fmt(totalIncome), color: '#15803d', bg: 'rgba(21,128,61,0.08)' },
          { label: 'Toplam Gider', value: fmt(totalExpense), color: '#dc2626', bg: 'rgba(220,38,38,0.08)' },
          { label: 'Net', value: fmt(totalIncome - totalExpense), color: '#1B2E5E', bg: '#F8F7F4' },
        ].map((s, i) => (
          <div key={i} style={{ backgroundColor: s.bg, borderRadius: '10px', padding: '14px 16px', border: '1px solid #E5E0D8' }}>
            <p style={{ fontSize: '11px', color: '#888780', margin: '0 0 4px' }}>{s.label}</p>
            <p style={{ fontSize: '18px', fontWeight: '800', color: s.color, margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        {/* Filtre */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {[['all', 'Tümü'], ['income', 'Gelir'], ['expense', 'Gider']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{
                padding: '6px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: '600',
                backgroundColor: filter === val ? '#1B2E5E' : '#F8F7F4',
                color: filter === val ? '#F8F7F4' : '#888780',
                border: filter === val ? 'none' : '1px solid #E5E0D8'
              }}>{label}</button>
          ))}
        </div>
        <button onClick={() => setShowForm(!showForm)}
          style={{ backgroundColor: '#E8870A', color: '#1B2E5E', fontWeight: '700', padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px' }}>
          + Yeni İşlem
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '12px', padding: '20px', border: '1px solid #E5E0D8', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#1B2E5E', marginBottom: '16px' }}>Yeni İşlem</h3>

          {/* Tip seçimi */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            {[['expense', '↓ Gider', '#dc2626'], ['income', '↑ Gelir', '#15803d']].map(([val, label, color]) => (
              <button key={val} onClick={() => setForm({...form, type: val})}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid',
                  cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '700',
                  borderColor: form.type === val ? color : '#E5E0D8',
                  backgroundColor: form.type === val ? (val === 'expense' ? 'rgba(220,38,38,0.08)' : 'rgba(21,128,61,0.08)') : '#fff',
                  color: form.type === val ? color : '#888780'
                }}>{label}</button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Açıklama *</label>
              <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="Beton alımı, Daire satışı..." style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Tutar (₺) *</label>
              <input type="number" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} placeholder="0" style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Tarih</label>
              <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} style={inputStyle}/>
            </div>
            <div>
              <label style={labelStyle}>Kategori</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})} style={inputStyle}>
                <option value="">Seç...</option>
                {categories.filter(c => c.type === form.type || c.type === 'both').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Proje</label>
              <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={inputStyle}>
                <option value="">Genel</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Ödeme Şekli</label>
              <select value={form.payment_type} onChange={e => setForm({...form, payment_type: e.target.value})} style={inputStyle}>
                <option value="cash">Nakit</option>
                <option value="transfer">Havale / EFT</option>
                <option value="cheque">Çek</option>
                <option value="card">Kredi Kartı</option>
              </select>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Not</label>
              <input value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} placeholder="Opsiyonel..." style={inputStyle}/>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
            <button onClick={handleSave} disabled={saving}
              style={{ backgroundColor: '#E8870A', color: '#1B2E5E', fontWeight: '700', padding: '10px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              {saving ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
            <button onClick={() => setShowForm(false)}
              style={{ backgroundColor: 'transparent', color: '#888780', fontWeight: '600', padding: '10px 20px', borderRadius: '8px', border: '1px solid #E5E0D8', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
              İptal
            </button>
          </div>
        </div>
      )}

      {/* Liste */}
      {loading ? <p style={{ color: '#888780', fontSize: '14px' }}>Yükleniyor...</p> : (
        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '12px', border: '1px solid #E5E0D8', overflow: 'hidden' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px' }}>
              <p style={{ fontSize: '32px', marginBottom: '12px' }}>💰</p>
              <p style={{ color: '#888780', fontSize: '14px', marginBottom: '4px' }}>Henüz işlem yok</p>
              <p style={{ color: '#E8870A', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }} onClick={() => setShowForm(true)}>+ İlk işlemi ekle</p>
            </div>
          ) : filtered.map((t, i) => (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: i < filtered.length - 1 ? '1px solid #F0EEE9' : 'none' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  backgroundColor: t.type === 'income' ? 'rgba(21,128,61,0.1)' : 'rgba(220,38,38,0.1)',
                  fontSize: '16px'
                }}>
                  {t.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#1B2E5E', margin: '0 0 2px' }}>{t.title}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {t.categories && (
                      <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '4px', backgroundColor: 'rgba(27,46,94,0.08)', color: '#2A4580', fontWeight: '500' }}>
                        {t.categories.name}
                      </span>
                    )}
                    {t.projects && (
                      <span style={{ fontSize: '10px', color: '#888780' }}>{t.projects.name}</span>
                    )}
                    <span style={{ fontSize: '10px', color: '#B4B2A9' }}>
                      {new Date(t.date).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                </div>
              </div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: t.type === 'income' ? '#15803d' : '#dc2626', margin: 0 }}>
                {t.type === 'income' ? '+' : '-'}{new Intl.NumberFormat('tr-TR').format(t.amount)} ₺
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}