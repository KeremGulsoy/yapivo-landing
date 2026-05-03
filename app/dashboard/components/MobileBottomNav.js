'use client'

import { useState } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  validate, NumberInput, FField, inp,
  CURRENCY_META, DEFAULT_CURRENCY_CODES
} from '../shared'

export default function MobileBottomNav({ activeMenu, onNavigate, onMorePress, company, C, pendingCheques }) {
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

      {/* Hızlı İşlem Modal */}
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