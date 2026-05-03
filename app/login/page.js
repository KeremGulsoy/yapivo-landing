'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase' // Yol farklıysa '../../lib/supabase' kısmını kendi projene göre düzelt
import { LogoIcon, C } from '../dashboard/shared'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true) // true: Giriş Yap, false: Kayıt Ol
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else window.location.href = '/dashboard'
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Kayıt başarılı! Lütfen email adresinizi doğrulayın.')
    }
    setLoading(false)
  }

  // Ortak input stili
  const inputStyle = {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${C.border}`,
    backgroundColor: 'rgba(27,46,94,0.04)', // Tasarımdaki o hafif mavimsi gri arka plan
    fontSize: '14px',
    fontFamily: 'Outfit, sans-serif',
    outline: 'none',
    color: C.dark,
    marginBottom: '16px'
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: C.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', fontFamily: 'Outfit, sans-serif' }}>
      
      {/* HEADER & LOGO */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LogoIcon size={46} variant="dark" />
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#F8F7F4' }}>
            yap<span style={{ color: C.amber }}>ivo</span>
          </div>
        </div>
        <p style={{ color: 'rgba(248,247,244,0.6)', fontSize: '15px', marginTop: '6px', fontWeight: '500' }}>
          İnşaatınızın Dijital Defteri
        </p>
      </div>

      {/* FORM KARTI */}
      <div style={{ background: C.cream, borderRadius: '16px', width: '100%', maxWidth: '440px', padding: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
        
        {/* SEKMELER (Giriş / Kayıt) */}
        <div style={{ display: 'flex', background: 'rgba(27,46,94,0.06)', borderRadius: '10px', padding: '4px', marginBottom: '32px' }}>
          <button 
            type="button"
            onClick={() => { setIsLogin(true); setError(null); setMessage(null) }}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', background: isLogin ? C.dark : 'transparent', color: isLogin ? C.cream : C.text2 }}
          >
            Giriş Yap
          </button>
          <button 
            type="button"
            onClick={() => { setIsLogin(false); setError(null); setMessage(null) }}
            style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', fontSize: '14px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', background: !isLogin ? C.dark : 'transparent', color: !isLogin ? C.cream : C.text2 }}
          >
            Kayıt Ol
          </button>
        </div>

        {/* BAŞLIKLAR */}
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: C.dark, marginBottom: '6px' }}>
          {isLogin ? 'Hesabınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
        </h2>
        <p style={{ fontSize: '14px', color: C.text2, marginBottom: '24px' }}>
          {isLogin ? 'Email ve şifrenizle devam edin.' : 'Saniyeler içinde Yapivo\'ya katılın.'}
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.text2, marginBottom: '6px' }}>Email Adresi</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ornek@firma.com" 
            required
            style={inputStyle} 
          />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', color: C.text2, marginBottom: '6px' }}>Şifre</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••" 
            required
            style={inputStyle} 
          />

          {isLogin && (
            <div style={{ textAlign: 'right', marginTop: '-8px', marginBottom: '24px' }}>
              <a href="#" style={{ fontSize: '13px', fontWeight: '600', color: C.amber, textDecoration: 'none' }}>Şifremi Unuttum</a>
            </div>
          )}
          {!isLogin && <div style={{ height: '24px' }}></div>}

          {/* Hata & Başarı Mesajları */}
          {error && <div style={{ color: C.red, fontSize: '13px', marginBottom: '16px', background: C.redBg, padding: '10px', borderRadius: '8px' }}>{error}</div>}
          {message && <div style={{ color: C.green, fontSize: '13px', marginBottom: '16px', background: C.greenBg, padding: '10px', borderRadius: '8px' }}>{message}</div>}

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: '100%', background: C.amber, color: C.dark, fontWeight: '800', padding: '14px', borderRadius: '10px', border: 'none', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', transition: 'transform 0.2s', opacity: loading ? 0.7 : 1 }}
            onMouseEnter={e => { if(!loading) e.currentTarget.style.transform = 'scale(1.02)' }}
            onMouseLeave={e => { if(!loading) e.currentTarget.style.transform = 'scale(1)' }}
          >
            {loading ? 'Bekleniyor...' : (isLogin ? 'Giriş Yap →' : 'Kayıt Ol →')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: C.text2 }}>
          {isLogin ? (
            <>Hesabınız yok mu? <span onClick={() => setIsLogin(false)} style={{ color: C.amber, fontWeight: '700', cursor: 'pointer' }}>Hemen Kayıt Olun</span></>
          ) : (
            <>Zaten hesabınız var mı? <span onClick={() => setIsLogin(true)} style={{ color: C.amber, fontWeight: '700', cursor: 'pointer' }}>Giriş Yapın</span></>
          )}
        </div>
      </div>

      {/* GERİ DÖN LİNKİ */}
      <div style={{ marginTop: '32px' }}>
        <a href="/" style={{ color: 'rgba(248,247,244,0.5)', fontSize: '14px', fontWeight: '500', textDecoration: 'none', transition: 'color 0.2s' }}
          onMouseEnter={e => e.target.style.color = C.amber}
          onMouseLeave={e => e.target.style.color = 'rgba(248,247,244,0.5)'}>
          ← Ana Sayfaya Dön
        </a>
      </div>
    </div>
  )
}