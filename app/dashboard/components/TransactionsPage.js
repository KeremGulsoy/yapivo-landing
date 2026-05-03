'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  CURRENCY_META, DEFAULT_CURRENCY_CODES, fmtAmount,
  validate, FilterBar, PrimaryBtn, ScrollTable, thStyle, thRight, tdNum,
  Modal, FField, FRow, NumberInput, inp
} from '../shared'

export default function TransactionsPage({ company, fmt, fmtDate, C, isMobile }) {
  const [txs, setTxs] = useState([])
  const [cats, setCats] = useState([])
  const [currencies, setCurrencies] = useState([])
  const [projs, setProjs] = useState([])
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const emptyForm = { title: '', type: 'expense', amount: 0, currency: 'TRY', category_id: '', project_id: '', contact_id: '', payment_type: 'cash', date: new Date().toISOString().split('T')[0], notes: '' }
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!company) return
    Promise.all([
      supabase.from('transactions').select('*, projects(name), categories(name,color), contacts(name)').eq('company_id', company.id).order('date', { ascending: false }),
      supabase.from('categories').select('*').eq('company_id', company.id).eq('is_active', true).neq('type','currency'),
      supabase.from('categories').select('name').eq('company_id', company.id).eq('type', 'currency').eq('is_active', true),
      supabase.from('projects').select('id,name').eq('company_id', company.id).eq('status', 'active'),
      supabase.from('contacts').select('id,name').eq('company_id', company.id).eq('is_active', true).order('name'),
    ]).then(([t, c, cur, p, ct]) => {
      setTxs(t.data || [])
      setCats(c.data || [])
      const codes = cur.data?.map(x => x.name) || DEFAULT_CURRENCY_CODES
      setCurrencies(codes)
      setForm(f => ({ ...f, currency: codes[0] || 'TRY' }))
      setProjs(p.data || [])
      setContacts(ct.data || [])
      setLoading(false)
    })
  }, [company])

  const openNew = () => { setEditItem(null); setForm({ ...emptyForm, currency: currencies[0] || 'TRY' }); setErrors({}); setModal(true) }
  const openEdit = (t) => {
    setEditItem(t)
    setForm({ title: t.title, type: t.type, amount: t.amount, currency: t.currency || 'TRY', category_id: t.category_id||'', project_id: t.project_id||'', contact_id: t.contact_id||'', payment_type: t.payment_type||'cash', date: t.date, notes: t.notes||'' })
    setErrors({}); setModal(true)
  }

  const save = async () => {
    const errs = validate({
      title: { required: true, message: 'Açıklama zorunludur' },
      amount: { required: true, min: 0.001, message: 'Tutar zorunludur', minMessage: 'Tutar 0\'dan büyük olmalıdır' },
    }, form)
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSaving(true)
    const payload = { company_id: company.id, title: form.title, type: form.type, amount: Number(form.amount), currency: form.currency, category_id: form.category_id||null, project_id: form.project_id||null, contact_id: form.contact_id||null, payment_type: form.payment_type, date: form.date, notes: form.notes }
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

      <FilterBar
        options={[['all','Tümü'],['income','Gelir'],['expense','Gider']]}
        value={filter}
        onChange={setFilter}
        right={<PrimaryBtn onClick={openNew}>+ Yeni İşlem</PrimaryBtn>}
      />

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
                <tr key={t.id} style={{ borderBottom: i < filtered.length-1 ? `1px solid ${C.border}` : 'none' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                      <div style={{ width: '24px', height: '24px', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.type==='income'?C.greenBg:C.redBg, color: t.type==='income'?C.green:C.red, fontSize: '12px', flexShrink: 0 }}>{t.type==='income'?'↑':'↓'}</div>
                      <span style={{ fontWeight: '600', color: C.dark }}>{t.title}</span>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px', color: C.text2 }}>{t.projects?.name||'—'}</td>
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{t.contacts?.name||'—'}</td>}
                  {!isMobile && <td style={{ padding: '11px 14px' }}>{t.categories?<span style={{ fontSize:'11px', fontWeight:'500', padding:'2px 7px', borderRadius:'4px', background:'rgba(27,46,94,0.08)', color:C.dark2 }}>{t.categories.name}</span>:<span style={{ color:C.text3 }}>—</span>}</td>}
                  {!isMobile && <td style={{ padding: '11px 14px', color: C.text2 }}>{{ cash:'Nakit', transfer:'Havale', cheque:'Çek', card:'Kart' }[t.payment_type]||'—'}</td>}
                  <td style={{ padding: '11px 14px', color: C.text2, whiteSpace: 'nowrap' }}>{fmtDate(t.date)}</td>
                  <td style={tdNum(t.type==='income'?C.green:C.red)}>{t.type==='income'?'+':'-'}{fmtAmount(t.amount,t.currency)}</td>
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
              <button key={v} onClick={() => setForm({...form, type: v})} style={{ padding: '10px', borderRadius: '8px', border: `2px solid`, borderColor: form.type===v?col:C.border, background: form.type===v?bg:'#fff', color: form.type===v?col:C.text3, fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>{l}</button>
            ))}
          </div>
          <FField label="Proje" C={C}>
            <select value={form.project_id} onChange={e => setForm({...form, project_id: e.target.value})} style={inp(C)}>
              <option value="">Proje seç (opsiyonel)</option>
              {projs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </FField>
          <FField label="Açıklama" required C={C} error={errors.title}>
            <input value={form.title} onChange={e => { setForm({...form, title: e.target.value}); setErrors({...errors, title: ''}) }} placeholder="Beton alımı, Daire satışı..." style={inp(C, errors.title)}/>
          </FField>
          <FRow>
            <FField label="Tutar" required C={C} error={errors.amount}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <NumberInput value={form.amount} onChange={v => { setForm({...form, amount: v}); setErrors({...errors, amount: ''}) }} style={{ ...inp(C, errors.amount), flex: 1 }} error={errors.amount}/>
                <select value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} style={{ ...inp(C), width: '90px', flexShrink: 0 }}>
                  {currencies.map(code => {
                    const meta = CURRENCY_META[code] || { symbol: code }
                    return <option key={code} value={code}>{meta.symbol} {code}</option>
                  })}
                </select>
              </div>
              <FieldError msg={errors.amount} />
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
                {cats.filter(c => c.type === form.type).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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