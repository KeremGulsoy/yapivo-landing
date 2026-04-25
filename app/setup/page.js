'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Setup() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [form, setForm] = useState({
    companyName: '',
    taxNumber: '',
    taxOffice: '',
    phone: '',
    address: ''
  })

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        window.location.href = '/login'
      } else {
        setUser(data.user)
        // Zaten şirketi varsa dashboard'a gönder
        checkExistingCompany(data.user.id)
      }
    })
  }, [])

  const checkExistingCompany = async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single()

    if (data?.company_id) {
      window.location.href = '/dashboard'
    }
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    if (!form.companyName) {
      setError('Şirket adı zorunludur.')
      return
    }
    setLoading(true)
    setError(null)

    try {
      // 1. Şirketi oluştur
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .insert({
          name: form.companyName,
          tax_number: form.taxNumber,
          tax_office: form.taxOffice,
          phone: form.phone,
          address: form.address,
          plan: 'starter'
        })
        .select()
        .single()

      if (companyError) throw companyError

      // 2. Profili güncelle — şirkete bağla
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          company_id: company.id,
          role: 'owner',
          full_name: user.user_metadata?.full_name || ''
        })
        .eq('id', user.id)

      if (profileError) throw profileError

      // 3. Varsayılan kategorileri oluştur
      const { error: catError } = await supabase.rpc('create_default_categories', {
        p_company_id: company.id
      })

      if (catError) throw catError

      // 4. Varsayılan kasa oluştur
      await supabase.from('accounts').insert({
        company_id: company.id,
        name: 'Ana Kasa',
        type: 'cash',
        currency: 'TRY',
        balance: 0
      })

      // 5. Dashboard'a yönlendir
      window.location.href = '/dashboard'

    } catch (err) {
      setError('Bir hata oluştu: ' + err.message)
    }

    setLoading(false)
  }

  if (!user) return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1B2E5E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#F8F7F4', fontFamily: 'Outfit, sans-serif' }}>Yükleniyor...</p>
    </div>
  )

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#1B2E5E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{ position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle, #E8870A 1px, transparent 1px)',
        backgroundSize: '32px 32px' }}/>

      <div style={{ width: '100%', maxWidth: '480px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <span style={{ fontSize: '28px', fontWeight: '800', color: '#F8F7F4' }}>
            yap<span style={{ color: '#E8870A' }}>ivo</span>
          </span>
          <p style={{ color: 'rgba(248,247,244,0.45)', fontSize: '13px', marginTop: '6px' }}>
            İnşaatınızın Dijital Defteri
          </p>
        </div>

        {/* Kart */}
        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '20px', padding: '36px' }}>

          {/* Adım göstergesi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontSize: '13px' }}>✓</span>
            </div>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#E8870A' }}/>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E8870A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#1B2E5E', fontSize: '13px', fontWeight: '700' }}>2</span>
            </div>
            <div style={{ flex: 1, height: '2px', backgroundColor: '#E5E0D8' }}/>
            <div style={{ width: '28px', height: '28px', borderRadius: '50%', backgroundColor: '#E5E0D8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#888780', fontSize: '13px', fontWeight: '700' }}>3</span>
            </div>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1B2E5E', marginBottom: '4px' }}>
            Şirketinizi Kurun
          </h2>
          <p style={{ fontSize: '13px', color: '#888780', marginBottom: '24px' }}>
            Bu bilgiler tekliflerinizde ve sözleşmelerinizde kullanılacak.
          </p>

          {error && (
            <div style={{
              backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
              fontSize: '13px', color: '#dc2626'
            }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Şirket Adı */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>
                Şirket Adı <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <input name="companyName" value={form.companyName}
                onChange={handleChange} placeholder="ABC İnşaat Ltd. Şti."
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1.5px solid #E5E0D8', fontSize: '14px',
                  fontFamily: 'Outfit, sans-serif', outline: 'none',
                  backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
              />
            </div>

            {/* Vergi No + Dairesi */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>
                  Vergi Numarası
                </label>
                <input name="taxNumber" value={form.taxNumber}
                  onChange={handleChange} placeholder="1234567890"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #E5E0D8', fontSize: '14px',
                    fontFamily: 'Outfit, sans-serif', outline: 'none',
                    backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
                />
              </div>
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>
                  Vergi Dairesi
                </label>
                <input name="taxOffice" value={form.taxOffice}
                  onChange={handleChange} placeholder="Kadıköy"
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #E5E0D8', fontSize: '14px',
                    fontFamily: 'Outfit, sans-serif', outline: 'none',
                    backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
                />
              </div>
            </div>

            {/* Telefon */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>
                Telefon
              </label>
              <input name="phone" value={form.phone}
                onChange={handleChange} placeholder="0532 111 22 33"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1.5px solid #E5E0D8', fontSize: '14px',
                  fontFamily: 'Outfit, sans-serif', outline: 'none',
                  backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
              />
            </div>

            {/* Adres */}
            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>
                Adres
              </label>
              <textarea name="address" value={form.address}
                onChange={handleChange} placeholder="Şirket adresi..."
                rows={3}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px',
                  border: '1.5px solid #E5E0D8', fontSize: '14px',
                  fontFamily: 'Outfit, sans-serif', outline: 'none', resize: 'vertical',
                  backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Buton */}
          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '14px', marginTop: '20px',
              backgroundColor: loading ? '#B4B2A9' : '#E8870A',
              color: '#1B2E5E', fontWeight: '700', fontSize: '15px',
              border: 'none', borderRadius: '10px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif'
            }}>
            {loading ? 'Kuruluyor...' : 'Şirketi Kur ve Başla →'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#B4B2A9', marginTop: '16px' }}>
            Bu bilgileri daha sonra Ayarlar bölümünden değiştirebilirsiniz.
          </p>
        </div>
      </div>
    </div>
  )
}