'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    const handleAuth = async () => {
      const hash = window.location.hash
      if (hash && hash.includes('access_token')) {
        await new Promise(r => setTimeout(r, 1000))
        const { data } = await supabase.auth.getSession()
        if (data?.session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', data.session.user.id)
            .single()
          if (profile?.company_id) {
            window.location.href = '/dashboard'
          } else {
            window.location.href = '/setup'
          }
          return
        }
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single()
        if (profile?.company_id) {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/setup'
        }
      }
    }

    handleAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', session.user.id)
          .single()
        if (profile?.company_id) {
          window.location.href = '/dashboard'
        } else {
          window.location.href = '/setup'
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogin = async () => {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError('Email veya şifre hatalı.')
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    if (!fullName || !companyName || !email || !password) {
      setError('Tüm alanları doldurun.')
      return
    }
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, company_name: companyName }
      }
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Kayıt başarılı! Email adresinize doğrulama linki gönderildi.')
    }
    setLoading(false)
  }

  const handleForgot = async () => {
    if (!email) { setError('Email adresinizi girin.'); return }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`
    })
    if (error) {
      setError(error.message)
    } else {
      setMessage('Şifre sıfırlama linki emailinize gönderildi.')
    }
    setLoading(false)
  }

  const handleSubmit = () => {
    if (mode === 'login') handleLogin()
    else if (mode === 'register') handleRegister()
    else handleForgot()
  }

  return (
    <div style={{
      minHeight: '100vh', backgroundColor: '#1B2E5E',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', fontFamily: 'Outfit, sans-serif'
    }}>
      <div style={{
        position: 'fixed', inset: 0, opacity: 0.03,
        backgroundImage: 'radial-gradient(circle, #E8870A 1px, transparent 1px)',
        backgroundSize: '32px 32px'
      }}/>

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '44px', height: '44px', backgroundColor: '#E8870A',
              borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <svg width="26" height="26" viewBox="0 0 40 40" fill="none">
                <line x1="8" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="32" y1="8" x2="20" y2="22" stroke="#1B2E5E" strokeWidth="3.5" strokeLinecap="round"/>
                <line x1="20" y1="22" x2="20" y2="36" stroke="#1B2E5E" strokeWidth="3.5" strokeLinecap="round"/>
                <rect x="13" y="27" width="5" height="5" fill="#F8F7F4" rx="1"/>
                <rect x="22" y="27" width="5" height="5" fill="#F8F7F4" rx="1"/>
              </svg>
            </div>
            <span style={{ fontSize: '28px', fontWeight: '800', color: '#F8F7F4' }}>
              yap<span style={{ color: '#E8870A' }}>ivo</span>
            </span>
          </div>
          <p style={{ color: 'rgba(248,247,244,0.45)', fontSize: '13px', marginTop: '8px' }}>
            İnşaatınızın Dijital Defteri
          </p>
        </div>

        <div style={{ backgroundColor: '#F8F7F4', borderRadius: '20px', padding: '36px' }}>
          {mode !== 'forgot' && (
            <div style={{
              display: 'flex', backgroundColor: '#E5E0D8',
              borderRadius: '10px', padding: '4px', marginBottom: '28px'
            }}>
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setError(null); setMessage(null) }}
                  style={{
                    flex: 1, padding: '8px', borderRadius: '8px', border: 'none',
                    cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontSize: '14px',
                    fontWeight: '600', backgroundColor: mode === m ? '#1B2E5E' : 'transparent',
                    color: mode === m ? '#F8F7F4' : '#888780'
                  }}>
                  {m === 'login' ? 'Giriş Yap' : 'Kayıt Ol'}
                </button>
              ))}
            </div>
          )}

          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1B2E5E', marginBottom: '6px' }}>
            {mode === 'login' ? 'Hesabınıza Giriş Yapın' :
             mode === 'register' ? 'Yeni Hesap Oluşturun' : 'Şifrenizi Sıfırlayın'}
          </h2>
          <p style={{ fontSize: '13px', color: '#888780', marginBottom: '24px' }}>
            {mode === 'login' ? 'Email ve şifrenizle devam edin.' :
             mode === 'register' ? '14 gün ücretsiz, kart gerekmez.' :
             'Email adresinize sıfırlama linki göndereceğiz.'}
          </p>

          {error && (
            <div style={{
              backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.2)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
              fontSize: '13px', color: '#dc2626'
            }}>{error}</div>
          )}

          {message && (
            <div style={{
              backgroundColor: 'rgba(21,128,61,0.08)', border: '1px solid rgba(21,128,61,0.2)',
              borderRadius: '8px', padding: '12px 14px', marginBottom: '16px',
              fontSize: '13px', color: '#15803d'
            }}>{message}</div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mode === 'register' && (
              <>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>Ad Soyad</label>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ali Yılmaz"
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E5E0D8', fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>Şirket Adı</label>
                  <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="ABC İnşaat Ltd. Şti."
                    style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E5E0D8', fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>Email Adresi</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="ali@sirket.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E5E0D8', fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label style={{ fontSize: '12px', fontWeight: '600', color: '#5F5E5A', display: 'block', marginBottom: '6px' }}>Şifre</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'En az 6 karakter' : '••••••••'}
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #E5E0D8', fontSize: '14px', fontFamily: 'Outfit, sans-serif', outline: 'none', backgroundColor: '#fff', color: '#1B2E5E', boxSizing: 'border-box' }}
                />
              </div>
            )}
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginTop: '8px' }}>
              <button onClick={() => { setMode('forgot'); setError(null); setMessage(null) }}
                style={{ background: 'none', border: 'none', color: '#E8870A', fontSize: '12px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif' }}>
                Şifremi Unuttum
              </button>
            </div>
          )}

          <button onClick={handleSubmit} disabled={loading}
            style={{
              width: '100%', padding: '14px', marginTop: '20px',
              backgroundColor: loading ? '#B4B2A9' : '#E8870A',
              color: '#1B2E5E', fontWeight: '700', fontSize: '15px',
              border: 'none', borderRadius: '10px', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Outfit, sans-serif'
            }}>
            {loading ? 'Lütfen bekleyin...' :
             mode === 'login' ? 'Giriş Yap →' :
             mode === 'register' ? 'Hesap Oluştur →' : 'Sıfırlama Linki Gönder →'}
          </button>

          {mode === 'forgot' && (
            <button onClick={() => { setMode('login'); setError(null); setMessage(null) }}
              style={{
                width: '100%', padding: '12px', marginTop: '10px',
                backgroundColor: 'transparent', color: '#888780',
                border: '1.5px solid #E5E0D8', borderRadius: '10px',
                cursor: 'pointer', fontSize: '14px', fontFamily: 'Outfit, sans-serif'
              }}>
              ← Giriş Ekranına Dön
            </button>
          )}

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#B4B2A9', marginTop: '20px', lineHeight: '1.6' }}>
            {mode === 'register' ? 'Kayıt olarak Kullanım Koşulları\'nı kabul etmiş olursunuz.' : 'Hesabınız yok mu? '}
            {mode === 'login' && (
              <button onClick={() => setMode('register')}
                style={{ background: 'none', border: 'none', color: '#E8870A', fontSize: '12px', cursor: 'pointer', fontFamily: 'Outfit, sans-serif', fontWeight: '600' }}>
                Hemen Kayıt Olun
              </button>
            )}
          </p>
        </div>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px' }}>
          <a href="/" style={{ color: 'rgba(248,247,244,0.4)', textDecoration: 'none' }}>← Ana Sayfaya Dön</a>
        </p>
      </div>
    </div>
  )
}