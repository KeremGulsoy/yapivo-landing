'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../../lib/supabase'
import {
  CURRENCY_META, DEFAULT_CURRENCY_CODES, fmtAmount,
  validate, PrimaryBtn, Modal, FRow, FField, NumberInput, inp,
  thStyle, tdNum
} from '../shared'

export default function AccountsPage({ company, fmt, fmtDate, C, isMobile }) {
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