'use client'

import { useState, useEffect } from 'react'

export const C = {
  dark: '#1B2E5E', dark2: '#2A4580', amber: '#E8870A', amberBg: 'rgba(232,135,10,0.1)',
  cream: '#F8F7F4', cream2: '#F0EEE9', border: '#E5E0D8',
  text: '#1B2E5E', text2: '#5F5E5A', text3: '#9A9890',
  green: '#15803d', greenBg: 'rgba(21,128,61,0.1)',
  red: '#dc2626', redBg: 'rgba(220,38,38,0.1)',
  blue: '#0891b2', blueBg: 'rgba(8,145,178,0.1)',
}

export const CURRENCY_META = {
  TRY:  { symbol: '₺',  label: 'Türk Lirası',        decimals: 0 },
  USD:  { symbol: '$',  label: 'Amerikan Doları',     decimals: 2 },
  EUR:  { symbol: '€',  label: 'Euro',                decimals: 2 },
  GBP:  { symbol: '£',  label: 'İngiliz Sterlini',   decimals: 2 },
  CHF:  { symbol: 'Fr', label: 'İsviçre Frangı',     decimals: 2 },
  JPY:  { symbol: '¥',  label: 'Japon Yeni',          decimals: 0 },
  AED:  { symbol: 'د.إ',label: 'BAE Dirhemi',         decimals: 2 },
  SAR:  { symbol: '﷼',  label: 'Suudi Riyali',        decimals: 2 },
  CAD:  { symbol: 'C$', label: 'Kanada Doları',       decimals: 2 },
  AUD:  { symbol: 'A$', label: 'Avustralya Doları',   decimals: 2 },
  CNY:  { symbol: '¥',  label: 'Çin Yuanı',           decimals: 2 },
  RUB:  { symbol: '₽',  label: 'Rus Rublesi',         decimals: 2 },
  DKK:  { symbol: 'kr', label: 'Danimarka Kronu',     decimals: 2 },
  NOK:  { symbol: 'kr', label: 'Norveç Kronu',        decimals: 2 },
  SEK:  { symbol: 'kr', label: 'İsveç Kronu',         decimals: 2 },
  KWD:  { symbol: 'د.ك',label: 'Kuveyt Dinarı',       decimals: 3 },
  QAR:  { symbol: 'ر.ق',label: 'Katar Riyali',        decimals: 2 },
  RON:  { symbol: 'lei',label: 'Romen Leyi',          decimals: 2 },
  BGN:  { symbol: 'лв', label: 'Bulgar Levası',       decimals: 2 },
  GOLD:      { symbol: 'gr', label: 'Altın',          decimals: 3 },
  SILVER:    { symbol: 'gr', label: 'Gümüş',          decimals: 3 },
  PLATINUM:  { symbol: 'gr', label: 'Platin',         decimals: 3 },
  PALLADIUM: { symbol: 'gr', label: 'Paladyum',       decimals: 3 },
}

export const AVAILABLE_CURRENCIES = [
  { group: 'Ana Para Birimleri', items: [
    { code: 'TRY' }, { code: 'USD' }, { code: 'EUR' }, { code: 'GBP' },
    { code: 'CHF' }, { code: 'JPY' }, { code: 'CAD' }, { code: 'AUD' },
  ]},
  { group: 'Orta Doğu & Asya', items: [
    { code: 'AED' }, { code: 'SAR' }, { code: 'KWD' }, { code: 'QAR' },
    { code: 'CNY' }, { code: 'RUB' },
  ]},
  { group: 'Avrupa', items: [
    { code: 'DKK' }, { code: 'NOK' }, { code: 'SEK' }, { code: 'RON' }, { code: 'BGN' },
  ]},
  { group: 'Değerli Madenler', items: [
    { code: 'GOLD' }, { code: 'SILVER' }, { code: 'PLATINUM' }, { code: 'PALLADIUM' },
  ]},
]

export const DEFAULT_CURRENCY_CODES = ['TRY','USD','EUR','GOLD']

export const getCurrencySymbol = (code) => CURRENCY_META[code]?.symbol || code
export const fmtAmount = (amount, currency = 'TRY') => {
  const meta = CURRENCY_META[currency] || { symbol: currency, decimals: 2 }
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(amount || 0)
  return `${meta.symbol}${formatted}`
}
export const fmt = (n) => new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n || 0)
export const fmtNum = (n) => new Intl.NumberFormat('tr-TR').format(n || 0)
export const fmtDate = (d) => d ? new Date(d).toLocaleDateString('tr-TR') : '—'

export const navGroups = [
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

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])
  return isMobile
}

export function NumberInput({ value, onChange, placeholder, style, error }) {
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
    const formatted = parts.length > 1 ? intPart + ',' + parts[1].slice(0, 3) : intPart
    setDisplay(formatted)
    const numericStr = parts[0].replace(/\./g, '') + (parts[1] !== undefined ? '.' + parts[1] : '')
    onChange(parseFloat(numericStr) || 0)
  }
  return (
    <input
      value={display}
      onChange={handleChange}
      placeholder={placeholder || '0'}
      style={{ ...style, textAlign: 'right', borderColor: error ? '#dc2626' : style?.borderColor }}
      inputMode="decimal"
    />
  )
}

export function FieldError({ msg }) {
  if (!msg) return null
  return <span style={{ fontSize: '11px', color: '#dc2626', marginTop: '4px', display: 'block' }}>⚠ {msg}</span>
}

export function FilterBar({ options, value, onChange, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {options.map(([v, l]) => (
          <button key={v} onClick={() => onChange(v)}
            style={{ padding: '5px 12px', borderRadius: '20px', border: value === v ? 'none' : `1px solid ${C.border}`, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '12px', fontWeight: '600', background: value === v ? C.dark : C.cream, color: value === v ? C.cream : C.text3, whiteSpace: 'nowrap' }}>
            {l}
          </button>
        ))}
      </div>
      {right}
    </div>
  )
}

export function PrimaryBtn({ onClick, children, small }) {
  return (
    <button onClick={onClick}
      style={{ background: C.amber, color: C.dark, fontWeight: '700', padding: small ? '7px 14px' : '9px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: small ? '12px' : '13px', whiteSpace: 'nowrap' }}>
      {children}
    </button>
  )
}

export function Modal({ title, onClose, onSave, saving, saveLabel, children, C, wide }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(27,46,94,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ background: '#FAFAF8', borderRadius: '14px', width: '100%', maxWidth: wide ? '680px' : '560px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: `1px solid ${C.border}` }}>
          <h3 style={{ fontSize: '15px', fontWeight: '700', color: C.dark, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '22px', color: C.text3, cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: '16px 20px' }}>{children}</div>
        {onSave && (
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', padding: '14px 20px', borderTop: `1px solid ${C.border}` }}>
            <button onClick={onClose} style={{ padding: '9px 18px', borderRadius: '8px', border: `1px solid ${C.border}`, background: 'transparent', color: C.text2, cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '600' }}>İptal</button>
            <button onClick={onSave} disabled={saving} style={{ padding: '9px 20px', borderRadius: '8px', border: 'none', background: saving ? C.text3 : C.amber, color: C.dark, cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '13px', fontWeight: '700' }}>
              {saving ? 'Kaydediliyor...' : (saveLabel || 'Kaydet')}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export function FRow({ children }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : [children]
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${items.length}, 1fr)`, gap: '12px', marginBottom: '14px' }}>{children}</div>
}

export function FField({ label, children, full, required, C, error }) {
  return (
    <div style={{ gridColumn: full ? '1 / -1' : undefined, marginBottom: '14px' }}>
      <label style={{ fontSize: '12px', fontWeight: '600', color: C.text2, display: 'block', marginBottom: '5px' }}>
        {label}{required && <span style={{ color: C.red, marginLeft: '3px' }}>*</span>}
      </label>
      {children}
      <FieldError msg={error} />
    </div>
  )
}

export const inp = (C, error) => ({
  width: '100%', padding: '10px 12px', borderRadius: '8px',
  border: `1.5px solid ${error ? C.red : C.border}`,
  fontSize: '13px', fontFamily: 'Outfit, sans-serif', outline: 'none',
  backgroundColor: '#fff', color: C.dark, boxSizing: 'border-box'
})

export const ScrollTable = ({ children, minWidth }) => (
  <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', minWidth: minWidth || '600px' }}>
      {children}
    </table>
  </div>
)
export const thStyle = { padding: '10px 14px', color: '#9A9890', fontSize: '11px', letterSpacing: '0.05em', textTransform: 'uppercase', borderBottom: '1px solid #E5E0D8', textAlign: 'left', fontWeight: '500', whiteSpace: 'nowrap' }
export const thRight = { ...thStyle, textAlign: 'right' }
export const tdNum = (color) => ({ padding: '11px 14px', fontWeight: '700', color: color || '#1B2E5E', fontVariantNumeric: 'tabular-nums', textAlign: 'right', whiteSpace: 'nowrap' })

export function validate(rules, form) {
  const errors = {}
  for (const [field, rule] of Object.entries(rules)) {
    if (rule.required && !form[field] && form[field] !== 0) {
      errors[field] = rule.message || 'Bu alan zorunludur'
    }
    if (rule.min && Number(form[field]) < rule.min) {
      errors[field] = rule.minMessage || `En az ${rule.min} olmalıdır`
    }
  }
  return errors
}