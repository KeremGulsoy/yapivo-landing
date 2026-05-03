'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  FilterBar, PrimaryBtn, ScrollTable, thStyle, Modal, FField, inp, validate,
  CURRENCY_META, DEFAULT_CURRENCY_CODES, AVAILABLE_CURRENCIES
} from '../shared'

export default function CategoriesPage({ company, C, isMobile }) {
  const [cats, setCats] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(false)
  const [editItem, setEditItem] = useState(null)
  const [filter, setFilter] = useState('all')
  const [form, setForm] = useState({ name: '', type: 'expense', color: '#888780' })
  const [selectedCurrencyCode, setSelectedCurrencyCode] = useState('')
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (!company) return
    loadCats()
  }, [company])

  const loadCats = async () => {
    const { data } = await supabase.from('categories').select('*').eq('company_id', company.id).order('order_index')
    const all = data || []
    const hasCurrency = all.some(c => c.type === 'currency')
    if (!hasCurrency) {
      const currencies = DEFAULT_CURRENCY_CODES.map((code, i) => ({
        company_id: company.id, name: code, type: 'currency',
        color: ['#E8870A','#15803d','#2A4580','#b45309'][i], order_index: i + 1, is_active: true
      }))
      const { data: inserted } = await supabase.from('categories').insert(currencies).select()
      setCats([...all, ...(inserted || [])])
    } else {
      setCats(all)
    }
    setLoading(false)
  }

  const openNew = () => {
    setEditItem(null)
    const defaultType = filter === 'currency' ? 'currency' : filter === 'income' ? 'income' : 'expense'
    setForm({ name: '', type: defaultType, color: '#888780' })
    setSelectedCurrencyCode('')
    setErrors({})
    setModal(true)
  }

  const openEdit = (c) => {
    setEditItem(c)
    setForm({ name: c.name, type: c.type, color: c.color || '#888780' })
    setSelectedCurrencyCode(c.type === 'currency' ? c.name : '')
    setErrors({})
    setModal(true)
  }

  const save = async () => {
    if (form.type === 'currency') {
      if (!selectedCurrencyCode) { setErrors({ currency: 'Para birimi seçiniz' }); return }
      const alreadyExists = cats.some(c => c.type === 'currency' && c.name === selectedCurrencyCode && c.id !== editItem?.id)
      if (alreadyExists) { setErrors({ currency: 'Bu para birimi zaten eklenmiş' }); return }
    } else {
      const errs = validate({ name: { required: true, message: 'Kategori adı zorunludur' } }, form)
      if (Object.keys(errs).length > 0) { setErrors(errs); return }
    }
    setSaving(true)
    const name = form.type === 'currency' ? selectedCurrencyCode : form.name
    const meta = CURRENCY_META[selectedCurrencyCode]
    const color = form.type === 'currency' ? (meta ? C.amber : '#888780') : form.color
    const payload = { company_id: company.id, name, type: form.type, color }
    if (editItem) {
      const { data } = await supabase.from('categories').update(payload).eq('id', editItem.id).select().single()
      if (data) setCats(cats.map(c => c.id === editItem.id ? data : c))
    } else {
      const { data } = await supabase.from('categories').insert(payload).select().single()
      if (data) setCats([...cats, data])
    }
    setModal(false); setSaving(false)
  }

  const toggle = async (id, is_active) => {
    const { data } = await supabase.from('categories').update({ is_active: !is_active }).eq('id', id).select().single()
    if (data) setCats(cats.map(c => c.id === id ? { ...c, is_active: !is_active } : c))
  }

  const handleDelete = async (cat) => {
    setDeleteError('')
    const { count } = await supabase.from('transactions').select('id', { count: 'exact', head: true }).eq('category_id', cat.id)
    if (count && count > 0) {
      setDeleteError(`"${cat.type === 'currency' ? CURRENCY_META[cat.name]?.label || cat.name : cat.name}" kategorisi ${count} işlemde kullanılıyor. Silinemez, pasif yapabilirsiniz.`)
      return
    }
    await supabase.from('categories').delete().eq('id', cat.id)
    setCats(cats.filter(c => c.id !== cat.id))
  }

  const addedCurrencyCodes = cats.filter(c => c.type === 'currency').map(c => c.name)
  const availableToAdd = AVAILABLE_CURRENCIES.map(group => ({
    ...group,
    items: group.items.filter(item => !addedCurrencyCodes.includes(item.code) || editItem?.name === item.code)
  })).filter(group => group.items.length > 0)

  const filtered = filter === 'all' ? cats : filter === 'currency' ? cats.filter(c => c.type === 'currency') : cats.filter(c => c.type === filter)

  const getCurrencyDisplayName = (code) => {
    const meta = CURRENCY_META[code]
    if (!meta) return code
    return `${meta.symbol} ${meta.label} (${code})`
  }

  return (
    <div>
      <FilterBar
        options={[['all','Tümü'],['expense','Gider'],['income','Gelir'],['currency','Para Birimleri']]}
        value={filter}
        onChange={setFilter}
        right={<PrimaryBtn onClick={openNew}>+ Yeni</PrimaryBtn>}
      />

      {deleteError && (
        <div style={{ background: C.redBg, border: `1px solid ${C.red}`, borderRadius: '8px', padding: '12px 14px', marginBottom: '12px', fontSize: '13px', color: C.red, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>⚠ {deleteError}</span>
          <button onClick={() => setDeleteError('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.red, fontSize: '18px', lineHeight: 1 }}>×</button>
        </div>
      )}

      <div style={{ background: C.cream, borderRadius: '10px', border: `1px solid ${C.border}` }}>
        {loading ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Yükleniyor...</div> :
        filtered.length === 0 ? <div style={{ padding: '40px', textAlign: 'center', color: C.text3, fontSize: '13px' }}>Kategori bulunamadı</div> : (
          <ScrollTable minWidth="400px">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                <th style={thStyle}>Ad</th>
                <th style={thStyle}>Tür</th>
                <th style={thStyle}>Durum</th>
                <th style={thStyle}/>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const isCurrency = c.type === 'currency'
                const displayName = isCurrency ? getCurrencyDisplayName(c.name) : c.name
                return (
                  <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? `1px solid ${C.border}` : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.cream2}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {isCurrency ? (
                          <div style={{ width: '28px', height: '28px', borderRadius: '6px', background: c.color || C.amberBg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                            {CURRENCY_META[c.name]?.symbol || c.name.slice(0,2)}
                          </div>
                        ) : (
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: c.color || '#888', flexShrink: 0 }}/>
                        )}
                        <div>
                          <div style={{ fontWeight: '600', color: C.dark }}>{displayName}</div>
                          {isCurrency && <div style={{ fontSize: '11px', color: C.text3 }}>Kod: {c.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '20px',
                        background: isCurrency ? 'rgba(27,46,94,0.08)' : c.type==='income' ? C.greenBg : C.redBg,
                        color: isCurrency ? C.dark2 : c.type==='income' ? C.green : C.red }}>
                        {isCurrency ? '💱 Para Birimi' : c.type==='income' ? 'Gelir' : 'Gider'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <button onClick={() => toggle(c.id, c.is_active)}
                        style={{ fontSize: '11px', fontWeight: '600', padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', transition: 'all 0.15s',
                          background: c.is_active ? C.greenBg : 'rgba(156,163,175,0.15)',
                          color: c.is_active ? C.green : C.text3 }}>
                        {c.is_active ? '● Aktif' : '○ Pasif'}
                      </button>
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        <button onClick={() => openEdit(c)} style={{ fontSize: '12px', color: C.amber, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Düzenle</button>
                        {!DEFAULT_CURRENCY_CODES.includes(c.name) && (
                          <button onClick={() => handleDelete(c)} style={{ fontSize: '12px', color: C.red, fontWeight: '600', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>Sil</button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </ScrollTable>
        )}
      </div>

      {modal && (
        <Modal title={editItem ? 'Kategoriyi Düzenle' : 'Yeni Kategori'} onClose={() => setModal(false)} onSave={save} saving={saving} C={C}>
          <FField label="Tür" C={C}>
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})} style={inp(C)}>
              <option value="expense">Gider Kategorisi</option>
              <option value="income">Gelir Kategorisi</option>
              <option value="currency">Para Birimi</option>
            </select>
          </FField>
          {form.type === 'currency' ? (
            <FField label="Para Birimi Seç" required C={C} error={errors.currency}>
              <select
                value={selectedCurrencyCode}
                onChange={e => { setSelectedCurrencyCode(e.target.value); setErrors({}) }}
                style={inp(C, errors.currency)}>
                <option value="">-- Seçiniz --</option>
                {availableToAdd.map(group => (
                  <optgroup key={group.group} label={group.group}>
                    {group.items.map(item => {
                      const meta = CURRENCY_META[item.code] || { symbol: item.code, label: item.code }
                      return <option key={item.code} value={item.code}>{meta.symbol} {meta.label} ({item.code})</option>
                    })}
                  </optgroup>
                ))}
              </select>
              {selectedCurrencyCode && CURRENCY_META[selectedCurrencyCode] && (
                <div style={{ marginTop: '8px', padding: '10px 12px', background: C.cream2, borderRadius: '8px', fontSize: '13px', color: C.text2 }}>
                  <strong style={{ color: C.dark }}>{CURRENCY_META[selectedCurrencyCode].symbol}</strong> · {CURRENCY_META[selectedCurrencyCode].label} · {selectedCurrencyCode} · Ondalık: {CURRENCY_META[selectedCurrencyCode].decimals} hane
                </div>
              )}
            </FField>
          ) : (
            <>
              <FField label="Kategori Adı" required C={C} error={errors.name}>
                <input value={form.name} onChange={e => { setForm({...form, name: e.target.value}); setErrors({...errors, name: ''}) }}
                  placeholder="Malzeme, İşçilik, Daire Satışı..." style={inp(C, errors.name)}/>
              </FField>
              <FField label="Renk" C={C}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                    style={{ width: '48px', height: '36px', borderRadius: '6px', border: `1px solid ${C.border}`, cursor: 'pointer' }}/>
                  <span style={{ fontSize: '12px', color: C.text3 }}>{form.color}</span>
                </div>
              </FField>
            </>
          )}
        </Modal>
      )}
    </div>
  )
}