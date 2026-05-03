'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  fmtDate, fmtAmount, validate, FilterBar, PrimaryBtn, ScrollTable, thStyle, tdNum,
  Modal, FField, FRow, inp
} from '../shared'

export default function ContactsPage({ company, fmt, C, isMobile }) {
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
  const [errors, setErrors] = useState({})
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
  const openNew = () => { setEditItem(null); setForm(emptyForm); setErrors({}); setModal(true) }
  const openEdit = (c, e) => { e?.stopPropagation(); setEditItem(c); setForm({ name: c.name, type: c.type, tax_number: c.tax_number||'', tax_office: c.tax_office||'', phone: c.phone||'', email: c.email||'', address: c.address||'' }); setErrors({}); setModal(true) }

  const save = async () => {
    const errs = validate({ name: { required: true, message: 'Cari adı zorunludur' } }, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const payload = { company_id: company.id, ...form }
    if (editItem) {
      const { data } = await supabase.from('contacts').update(payload).eq('id', editItem.id).select().single()
      if (data) setContacts(contacts.map(c => c.id === editItem.id ? data : c))
    } else {
      const { data } = await supabase.from('contacts').insert(payload).select().single()
      if (data) setContacts([...contacts, data].sort((a,b) => a.name.localeCompare(b.name)))
    }
    setModal(false); setSaving(false)
  }

  const filtered = filter === 'all' ? contacts : contacts.filter(c => c.type === filter)
  const typeLabel = { customer: 'Müşteri', supplier: 'Tedarikçi', subcontractor: 'Taşeron' }
  const typeColor = { customer: [C.greenBg, C.green], supplier: [C.blueBg, C.blue], subcontractor: [C.amberBg, C.amber] }

  return (
    <div>
      <FilterBar
        options={[['all','Tümü'],['customer','Müşteri'],['supplier','Tedarikçi'],['subcontractor','Taşeron']]}
        value={filter}
        onChange={setFilter}
        right={<PrimaryBtn onClick={openNew}>+ Yeni Cari</PrimaryBtn>}
      />

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
                <th style={thStyle}/><th style={thStyle}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const [bg, col] = typeColor[c.type] || [C.amberBg, C.amber]
                return (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : 'none', cursor: 'pointer' }}
                    onClick={() => openDetail(c)}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ fontWeight: '700', color: C.dark }}>{c.name}</div>
                      {c.email && <div style={{ fontSize: '11px', color: C.text3 }}>{c.email}</div>}
                    </td>
                    <td style={{ padding: '11px 14px' }}><span style={{ fontSize: '11px', fontWeight: '600', padding: '3px 8px', borderRadius: '20px', background: bg, color: col }}>{typeLabel[c.type]}</span></td>
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{c.tax_number?`${c.tax_number}${c.tax_office?` / ${c.tax_office}`:''}`:'—'}</td>}
                    {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{c.phone||'—'}</td>}
                    <td style={{ padding: '11px 14px' }}><span style={{ fontSize: '12px', color: C.amber, fontWeight: '600' }}>Gör →</span></td>
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

      {detailModal && selectedContact && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: C.dark, margin: 0 }}>{selectedContact.name}</h3>
                <p style={{ fontSize: '12px', color: C.text3, margin: '3px 0 0' }}>{typeLabel[selectedContact.type]}{selectedContact.tax_number&&` · ${selectedContact.tax_number}`}{selectedContact.phone&&` · ${selectedContact.phone}`}</p>
              </div>
              <button onClick={() => setDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer' }}>×</button>
            </div>
            {!contactTxLoading && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', padding: '14px 20px', borderBottom: `1px solid ${C.border}` }}>
                {(() => {
                  const income = contactTxs.filter(t=>t.type==='income').reduce((s,t)=>s+Number(t.amount),0)
                  const expense = contactTxs.filter(t=>t.type==='expense').reduce((s,t)=>s+Number(t.amount),0)
                  const balance = income - expense
                  return [[fmt(income),'Toplam Gelir',C.green,C.greenBg],[fmt(expense),'Toplam Gider',C.red,C.redBg],[fmt(balance),'Net Bakiye',balance>=0?C.green:C.red,balance>=0?C.greenBg:C.redBg]].map(([val,label,color,bg]) => (
                    <div key={label} style={{ background:bg, borderRadius:'8px', padding:'12px', border:`1px solid ${C.border}` }}>
                      <div style={{ fontSize:'10px', color:C.text3, marginBottom:'4px', letterSpacing:'0.04em' }}>{label.toUpperCase()}</div>
                      <div style={{ fontSize:'17px', fontWeight:'800', color, fontVariantNumeric:'tabular-nums' }}>{val}</div>
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
                    <thead><tr style={{ borderBottom: `1px solid ${C.border}` }}>{['Açıklama','Proje','Kategori','Tarih','Tutar'].map((h,i)=><th key={h} style={{...thStyle,textAlign:i===4?'right':'left'}}>{h}</th>)}</tr></thead>
                    <tbody>
                      {contactTxs.map((t,i)=>(
                        <tr key={t.id} style={{ borderBottom:i<contactTxs.length-1?`1px solid ${C.border}`:'none' }}>
                          <td style={{ padding:'9px 12px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'7px' }}>
                              <div style={{ width:'20px', height:'20px', borderRadius:'5px', display:'flex', alignItems:'center', justifyContent:'center', background:t.type==='income'?C.greenBg:C.redBg, color:t.type==='income'?C.green:C.red, fontSize:'11px', flexShrink:0 }}>{t.type==='income'?'↑':'↓'}</div>
                              <span style={{ fontWeight:'600', color:C.dark }}>{t.title}</span>
                            </div>
                          </td>
                          <td style={{ padding:'9px 12px', color:C.text2 }}>{t.projects?.name||'—'}</td>
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
        <Modal title={editItem ? 'Cariyi Düzenle' : 'Yeni Cari'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Ad / Unvan" required C={C} error={errors.name}>
            <input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: ''}) }} placeholder="Ahmet Yılmaz veya ABC Ltd." style={inp(C, errors.name)}/>
          </FField>
          <FField label="Tür" C={C}><select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inp(C)}><option value="customer">Müşteri</option><option value="supplier">Tedarikçi</option><option value="subcontractor">Taşeron</option></select></FField>
          <FRow>
            <FField label="Vergi No" C={C}><input value={form.tax_number} onChange={e => setForm({...form, tax_number: e.target.value})} placeholder="1234567890" style={inp(C)}/></FField>
            <FField label="Vergi Dairesi" C={C}><input value={form.tax_office} onChange={e => setForm({...form, tax_office: e.target.value})} placeholder="Kadıköy" style={inp(C)}/></FField>
          </FRow>
          <FRow>
            <FField label="Telefon" C={C}><input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="0532 111 22 33" style={inp(C)}/></FField>
            <FField label="Email" C={C}><input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="ornek@firma.com" style={inp(C)}/></FField>
          </FRow>
          <FField label="Adres" C={C}><textarea value={form.address} onChange={e => setForm({...form, address: e.target.value})} placeholder="Adres..." rows={2} style={{...inp(C), resize:'vertical'}}/></FField>
        </Modal>
      )}
    </div>
  )
}