'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  CURRENCY_META, DEFAULT_CURRENCY_CODES, fmtAmount,
  validate, FilterBar, PrimaryBtn, ScrollTable, thStyle, thRight, tdNum,
  Modal, FField, FRow, NumberInput, inp
} from '../shared'

export default function ProjectsPage({ company, fmt, fmtDate, C, isMobile }) {
  const [projects, setProjects] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [detailModal, setDetailModal] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [projectTxs, setProjectTxs] = useState([])
  const [projectTxLoading, setProjectTxLoading] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const emptyForm = { name: '', address: '', budget: 0, budget_currency: 'TRY', start_date: '', end_date: '', status: 'active', description: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [mapAddress, setMapAddress] = useState('')
  const mapTimer = useRef(null)

  useEffect(() => {
    if (!company) return
    Promise.all([
      supabase.from('projects').select('*').eq('company_id', company.id).order('created_at', { ascending: false }),
      supabase.from('categories').select('name').eq('company_id', company.id).eq('type', 'currency').eq('is_active', true),
    ]).then(([p, cur]) => {
      setProjects(p.data || [])
      setCurrencies(cur.data?.map(c => c.name) || DEFAULT_CURRENCY_CODES)
      setLoading(false)
    })
  }, [company])

  const openDetail = async (p) => {
    setSelectedProject(p); setDetailModal(true); setProjectTxLoading(true)
    const { data } = await supabase.from('transactions').select('*, categories(name), contacts(name)').eq('company_id', company.id).eq('project_id', p.id).order('date', { ascending: false })
    setProjectTxs(data || []); setProjectTxLoading(false)
  }
  const openNew = () => {
    setEditItem(null)
    setForm({ ...emptyForm, budget_currency: currencies[0] || 'TRY' })
    setErrors({}); setMapAddress(''); setModal(true)
  }
  const openEdit = (p, e) => {
    e?.stopPropagation()
    setEditItem(p)
    setForm({ name: p.name, address: p.address||'', budget: p.budget||0, budget_currency: p.budget_currency||'TRY', start_date: p.start_date||'', end_date: p.end_date||'', status: p.status, description: p.description||'' })
    setErrors({}); setMapAddress(p.address || ''); setModal(true)
  }

  const handleAddressChange = (val) => {
    setForm(f => ({ ...f, address: val }))
    clearTimeout(mapTimer.current)
    if (val.length > 5) {
      mapTimer.current = setTimeout(() => setMapAddress(val), 1200)
    } else {
      setMapAddress('')
    }
  }

  const save = async () => {
    const errs = validate({ name: { required: true, message: 'Proje adı zorunludur' } }, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const payload = { company_id: company.id, name: form.name, address: form.address, budget: Number(form.budget)||0, budget_currency: form.budget_currency, start_date: form.start_date||null, end_date: form.end_date||null, status: form.status, description: form.description }
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
      <FilterBar
        options={[['all','Tümü'],['active','Aktif'],['paused','Beklemede'],['completed','Tamamlandı']]}
        value={filter}
        onChange={setFilter}
        right={<PrimaryBtn onClick={openNew}>+ Yeni Proje</PrimaryBtn>}
      />

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
                <th style={thStyle}/><th style={thStyle}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => {
                const budgetMeta = CURRENCY_META[p.budget_currency] || CURRENCY_META.TRY
                return (
                  <tr key={p.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
                    onClick={() => openDetail(p)}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: '700', color: C.dark }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: '11px', color: C.text3 }}>{p.description.slice(0,30)}</div>}
                    </td>
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{p.address||'—'}</td>}
                    <td style={tdNum()}>
                      {budgetMeta.symbol}{new Intl.NumberFormat('tr-TR', { maximumFractionDigits: budgetMeta.decimals }).format(p.budget || 0)}
                      {p.budget_currency && p.budget_currency !== 'TRY' && <span style={{ fontSize: '10px', color: C.text3, marginLeft: '4px' }}>{p.budget_currency}</span>}
                    </td>
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{fmtDate(p.start_date)}</td>}
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{fmtDate(p.end_date)}</td>}
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: p.status==='active'?C.greenBg:p.status==='completed'?'rgba(27,46,94,0.1)':'rgba(156,163,175,0.12)', color: p.status==='active'?C.green:p.status==='completed'?C.dark:C.text3, whiteSpace: 'nowrap' }}>
                        {p.status==='active'?'Aktif':p.status==='completed'?'Tamamlandı':'Beklemede'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}><span style={{ fontSize: '12px', color: C.amber, fontWeight: '600', whiteSpace: 'nowrap' }}>Detay →</span></td>
                    <td style={{ padding: '11px 14px' }} onClick={e => e.stopPropagation()}>
                      <button onClick={(e) => openEdit(p, e)} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', textAlign: 'left' }}>Düzenle</button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ScrollTable>
        )}
      </div>

      {detailModal && selectedProject && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: '780px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, margin: 0 }}>{selectedProject.name}</h3>
                <p style={{ fontSize: '12px', color: C.text3, margin: '3px 0 0' }}>{selectedProject.address||''} {selectedProject.budget>0?`· Bütçe: ${fmtAmount(selectedProject.budget, selectedProject.budget_currency||'TRY')}`:''}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={(e) => { setDetailModal(false); openEdit(selectedProject, e) }}
                  style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: `1px solid ${C.amber}`, borderRadius: '6px', padding: '6px 12px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                <button onClick={() => setDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer' }}>×</button>
              </div>
            </div>
            {!projectTxLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: isMobile?'repeat(2,1fr)':'repeat(4,1fr)', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                {(() => {
                  const income = projectTxs.filter(t => t.type==='income').reduce((s,t) => s+Number(t.amount), 0)
                  const expense = projectTxs.filter(t => t.type==='expense').reduce((s,t) => s+Number(t.amount), 0)
                  const net = income - expense
                  const budget = selectedProject.budget || 0
                  const budgetUsed = budget > 0 ? Math.round((expense/budget)*100) : null
                  return [
                    [fmt(income),'Toplam Gelir',C.green,C.greenBg],
                    [fmt(expense),'Toplam Gider',C.red,C.redBg],
                    [fmt(net),'Net Kar/Zarar',net>=0?C.green:C.red,net>=0?C.greenBg:C.redBg],
                    [budgetUsed!==null?`%${budgetUsed}`:'—','Bütçe Kullanımı',budgetUsed>90?C.red:budgetUsed>70?C.amber:C.dark,C.cream],
                  ].map(([val,label,color,bg]) => (
                    <div key={label} style={{ background:bg, borderRadius:'8px', padding:'12px', border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:'10px', color:C.text3, marginBottom:'4px', letterSpacing:'0.04em' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize:'17px', fontWeight:'800', color, fontVariantNumeric:'tabular-nums' }}>{val}</div>
                    </div>
                  ))
                })()}
              </div>
            )}

            {selectedProject.address && (
              <div style={{ padding: '0 20px 14px', borderBottom: `1px solid ${C.border}` }}>
                <div style={{ marginTop: '14px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
                  <iframe
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedProject.address + ' Türkiye')}&output=embed&hl=tr&z=15`}
                    width="100%" height="180" style={{ border: 'none', display: 'block' }}
                    loading="lazy" title="Proje Konumu"
                  />
                </div>
              </div>
            )}

            <div style={{ padding: '14px 20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '700', color: C.dark, marginBottom: '10px' }}>İşlem Geçmişi</h4>
              {projectTxLoading ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
              projectTxs.length === 0 ? <div style={{ padding: '30px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Bu projeye ait işlem bulunmuyor.</div> : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: '480px' }}>
                    <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{['Açıklama','Cari','Kategori','Tarih','Tutar'].map((h,i)=><th key={h} style={{...thStyle,textAlign:i===4?'right':'left'}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {projectTxs.map((t,i) => (
                        <tr key={t.id} style={{ borderBottom:i<projectTxs.length-1?`1px solid ${C.border}`:'none' }}>
                          <td style={{ padding:'9px 12px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                              <div style={{ width:'20px', height:'20px', borderRadius:'5px', display:'flex', alignItems:'center', justifyContent:'center', background:t.type==='income'?C.greenBg:C.redBg, color:t.type==='income'?C.green:C.red, fontSize:'11px', flexShrink:0 }}>{t.type==='income'?'↑':'↓'}</div>
                              <span style={{ fontWeight:'600', color:C.dark }}>{t.title}</span>
                            </div>
                          </td>
                          <td style={{ padding:'9px 12px', color:C.text2 }}>{t.contacts?.name||'—'}</td>
                          <td style={{ padding:'9px 12px' }}>{t.categories?<span style={{ fontSize:'11px', padding:'2px 6px', borderRadius:'4px', background:'rgba(27,46,94,0.08)', color:C.dark2 }}>{t.categories.name}</span>:<span style={{ color:C.text3 }}>—</span>}</td>
                          <td style={{ padding:'9px 12px', color:C.text2, whiteSpace:'nowrap' }}>{fmtDate(t.date)}</td>
                          <td style={tdNum(t.type==='income'?C.green:C.red)}>{t.type==='income'?'+':'-'}{fmtAmount(t.amount,t.currency)}</td>
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
          <FField label="Proje Adı" required C={C} error={errors.name}>
            <input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: ''}) }}
              placeholder="Kadıköy Konut Projesi" style={inp(C, errors.name)}/>
          </FField>
          <FRow>
            <FField label="Durum" C={C}>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inp(C)}>
                <option value="active">Aktif</option><option value="paused">Beklemede</option><option value="completed">Tamamlandı</option>
              </select>
            </FField>
            <FField label="Bütçe" C={C}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <NumberInput value={form.budget} onChange={v => setForm({...form, budget: v})} style={{ ...inp(C), flex: 1 }}/>
                <select value={form.budget_currency} onChange={e => setForm({...form, budget_currency: e.target.value})} style={{ ...inp(C), width: '90px', flexShrink: 0 }}>
                  {currencies.map(code => {
                    const meta = CURRENCY_META[code] || { symbol: code }
                    return <option key={code} value={code}>{meta.symbol} {code}</option>
                  })}
                </select>
              </div>
            </FField>
          </FRow>
          <FField label="Adres" C={C}>
            <input value={form.address} onChange={e => handleAddressChange(e.target.value)}
              placeholder="İstanbul, Kadıköy, Moda Cad. No:1" style={inp(C)}/>
          </FField>
          {mapAddress && (
            <div style={{ marginTop: '-8px', marginBottom: '14px', borderRadius: '8px', overflow: 'hidden', border: `1px solid ${C.border}` }}>
              <iframe
                src={`https://maps.google.com/maps?q=${encodeURIComponent(mapAddress + ' Türkiye')}&output=embed&hl=tr&z=15`}
                width="100%" height="180" style={{ border: 'none', display: 'block' }}
                loading="lazy" title="Konum"
              />
            </div>
          )}
          <FRow>
            <FField label="Başlangıç" C={C}><input type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} style={inp(C)}/></FField>
            <FField label="Bitiş" C={C}><input type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} style={inp(C)}/></FField>
          </FRow>
          <FField label="Açıklama" C={C}><textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Notlar..." rows={3} style={{...inp(C), resize:'vertical'}}/></FField>
        </Modal>
      )}
    </div>
  )
}